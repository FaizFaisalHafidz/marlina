<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\Pengeluaran;
use App\Models\KategoriPengeluaran;
use App\Exports\LaporanPengeluaranExport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class LaporanPengeluaranController extends Controller
{
    /**
     * Display expense report
     */
    public function index(Request $request)
    {
        $tanggalDari = $request->input('tanggal_dari');
        $tanggalSampai = $request->input('tanggal_sampai');
        $kategori = $request->input('kategori');

        // Get pengeluaran data from database
        $query = Pengeluaran::with(['kategori', 'pengaju', 'penyetuju'])
            ->where('status', 'disetujui');

        if ($tanggalDari && $tanggalSampai) {
            $query->whereBetween('tanggal_pengeluaran', [$tanggalDari, $tanggalSampai]);
        }

        if ($kategori) {
            $query->where('kategori_pengeluaran_id', $kategori);
        }

        $pengeluaran = $query->orderBy('tanggal_pengeluaran', 'desc')->paginate(15);

        // Get statistics
        $stats = $this->getExpenseStatistics($tanggalDari, $tanggalSampai, $kategori);

        // Get monthly expense data for chart
        $monthlyExpense = $this->getMonthlyExpenseData();

        // Get expense categories
        $categories = KategoriPengeluaran::active()->get();

        return Inertia::render('admin/laporan-pengeluaran', [
            'pengeluaran' => $pengeluaran,
            'stats' => $stats,
            'categories' => $categories,
            'monthlyExpense' => $monthlyExpense,
            'filters' => $request->only(['tanggal_dari', 'tanggal_sampai', 'kategori'])
        ]);
    }

    /**
     * Get expense statistics from database
     */
    private function getExpenseStatistics($tanggalDari, $tanggalSampai, $kategori = null)
    {
        $baseQuery = Pengeluaran::where('status', 'disetujui');

        // Filter by date range
        $periodQuery = (clone $baseQuery);
        
        if ($tanggalDari && $tanggalSampai) {
            $periodQuery->whereBetween('tanggal_pengeluaran', [$tanggalDari, $tanggalSampai]);
        }
        
        if ($kategori) {
            $periodQuery->where('kategori_pengeluaran_id', $kategori);
        }

        // Total and count for period
        $totalPengeluaran = $periodQuery->sum('jumlah');
        $jumlahTransaksi = $periodQuery->count();
        $rataRataPengeluaran = $jumlahTransaksi > 0 ? $totalPengeluaran / $jumlahTransaksi : 0;

        // Today's expenses
        $pengeluaranHariIni = (clone $baseQuery)
            ->whereDate('tanggal_pengeluaran', Carbon::today())
            ->sum('jumlah');

        // This month's expenses
        $pengeluaranBulanIni = (clone $baseQuery)
            ->whereMonth('tanggal_pengeluaran', Carbon::now()->month)
            ->whereYear('tanggal_pengeluaran', Carbon::now()->year)
            ->sum('jumlah');

        // This year's expenses
        $pengeluaranTahunIni = (clone $baseQuery)
            ->whereYear('tanggal_pengeluaran', Carbon::now()->year)
            ->sum('jumlah');

        // Category with highest expense
        $kategoriTerbesarQuery = Pengeluaran::select('kategori_pengeluaran_id', DB::raw('SUM(jumlah) as total'))
            ->with('kategori')
            ->where('status', 'disetujui');
            
        if ($tanggalDari && $tanggalSampai) {
            $kategoriTerbesarQuery->whereBetween('tanggal_pengeluaran', [$tanggalDari, $tanggalSampai]);
        }
            
        $kategoriTerbesar = $kategoriTerbesarQuery
            ->groupBy('kategori_pengeluaran_id')
            ->orderBy('total', 'desc')
            ->first();

        return [
            'total_pengeluaran' => (float) $totalPengeluaran,
            'jumlah_transaksi' => $jumlahTransaksi,
            'rata_rata_pengeluaran' => (float) $rataRataPengeluaran,
            'pengeluaran_hari_ini' => (float) $pengeluaranHariIni,
            'pengeluaran_bulan_ini' => (float) $pengeluaranBulanIni,
            'pengeluaran_tahun_ini' => (float) $pengeluaranTahunIni,
            'kategori_terbesar' => $kategoriTerbesar ? [
                'nama' => $kategoriTerbesar->kategori->nama_kategori,
                'jumlah' => (float) $kategoriTerbesar->total
            ] : null
        ];
    }

    /**
     * Get monthly expense data for chart from database
     */
    private function getMonthlyExpenseData()
    {
        $months = [];
        $expenses = [];

        // Get last 12 months data
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthName = $date->format('M Y');
            
            $monthlyTotal = Pengeluaran::where('status', 'disetujui')
                ->whereMonth('tanggal_pengeluaran', $date->month)
                ->whereYear('tanggal_pengeluaran', $date->year)
                ->sum('jumlah');

            $months[] = $monthName;
            $expenses[] = (float) $monthlyTotal;
        }

        return [
            'months' => $months,
            'expenses' => $expenses
        ];
    }

    /**
     * Export expense report
     */
    public function export(Request $request)
    {
        $filters = [
            'kategori' => $request->kategori,
            'tanggal_dari' => $request->tanggal_dari,
            'tanggal_sampai' => $request->tanggal_sampai,
            'search' => $request->search
        ];

        $format = $request->get('format', 'excel'); // Default Excel
        $filename = 'laporan-pengeluaran-' . date('Y-m-d-His');

        if ($format === 'pdf') {
            return $this->exportToPdf($filters, $filename);
        }

        // Export to Excel
        return Excel::download(new LaporanPengeluaranExport($filters), $filename . '.xlsx');
    }

    private function exportToPdf($filters, $filename)
    {
        $query = Pengeluaran::with(['kategori'])
            ->orderBy('tanggal_pengeluaran', 'desc');

        // Apply filters (same logic as main controller)
        if (!empty($filters['kategori'])) {
            $query->where('kategori_id', $filters['kategori']);
        }

        if (!empty($filters['tanggal_dari'])) {
            $query->whereDate('tanggal_pengeluaran', '>=', $filters['tanggal_dari']);
        }

        if (!empty($filters['tanggal_sampai'])) {
            $query->whereDate('tanggal_pengeluaran', '<=', $filters['tanggal_sampai']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('keterangan', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%");
            });
        }

        $pengeluaranList = $query->get();
        $totalPengeluaran = $pengeluaranList->sum('jumlah');

        $data = [
            'title' => 'Laporan Pengeluaran',
            'pengeluaran_list' => $pengeluaranList,
            'total_pengeluaran' => $totalPengeluaran,
            'filters' => $filters,
            'export_date' => Carbon::now()->format('d/m/Y H:i'),
            'logo_url' => 'https://neoflash.sgp1.cdn.digitaloceanspaces.com/logo-sirnamiskin.png'
        ];

        $pdf = Pdf::loadView('exports.laporan-pengeluaran-pdf', $data);
        $pdf->setPaper('a4', 'landscape');
        
        return $pdf->download($filename . '.pdf');
    }
}
