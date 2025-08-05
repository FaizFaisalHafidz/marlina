<?php

namespace App\Http\Controllers\Kepala;

use App\Http\Controllers\Controller;
use App\Models\Pengeluaran;
use App\Models\KategoriPengeluaran;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LaporanPengeluaranController extends Controller
{
    /**
     * Display expense report
     */
    public function index(Request $request)
    {
        $tanggalDari = $request->input('tanggal_dari', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $tanggalSampai = $request->input('tanggal_sampai', Carbon::now()->endOfMonth()->format('Y-m-d'));
        $kategori = $request->input('kategori');

        // Get pengeluaran data from database
        $query = Pengeluaran::with(['kategori', 'pengaju', 'penyetuju'])
            ->whereBetween('tanggal_pengeluaran', [$tanggalDari, $tanggalSampai])
            ->where('status', 'disetujui');

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
     * Export expense report
     */
    public function export(Request $request)
    {
        $tanggalDari = $request->input('tanggal_dari', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $tanggalSampai = $request->input('tanggal_sampai', Carbon::now()->endOfMonth()->format('Y-m-d'));
        $kategori = $request->input('kategori');

        $query = Pengeluaran::with(['kategori', 'pengaju', 'penyetuju'])
            ->whereBetween('tanggal_pengeluaran', [$tanggalDari, $tanggalSampai])
            ->where('status', 'disetujui');

        if ($kategori) {
            $query->where('kategori_pengeluaran_id', $kategori);
        }

        $pengeluaran = $query->orderBy('tanggal_pengeluaran', 'desc')->get();

        // Return CSV export
        $filename = 'laporan-pengeluaran-' . now()->format('Y-m-d-H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($pengeluaran) {
            $file = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($file, [
                'No',
                'Tanggal',
                'Kategori',
                'Deskripsi',
                'Jumlah',
                'Status',
                'Diajukan Oleh',
                'Disetujui Oleh'
            ]);

            // CSV data
            foreach ($pengeluaran as $index => $item) {
                fputcsv($file, [
                    $index + 1,
                    $item->tanggal_pengeluaran->format('d/m/Y'),
                    $item->kategori->nama_kategori,
                    $item->deskripsi,
                    number_format($item->jumlah, 0, ',', '.'),
                    ucfirst($item->status),
                    $item->pengaju->name ?? '-',
                    $item->penyetuju->name ?? '-'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get expense statistics from database
     */
    private function getExpenseStatistics($tanggalDari, $tanggalSampai, $kategori = null)
    {
        $baseQuery = Pengeluaran::where('status', 'disetujui');

        // Filter by date range
        $periodQuery = (clone $baseQuery)->whereBetween('tanggal_pengeluaran', [$tanggalDari, $tanggalSampai]);
        
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
        $kategoriTerbesar = Pengeluaran::select('kategori_pengeluaran_id', DB::raw('SUM(jumlah) as total'))
            ->with('kategori')
            ->where('status', 'disetujui')
            ->whereBetween('tanggal_pengeluaran', [$tanggalDari, $tanggalSampai])
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
     * Get monthly expense data for chart
     */
    private function getMonthlyExpenseData()
    {
        $months = [];
        $expenses = [];

        // Get last 12 months
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthYear = $date->format('Y-m');
            $monthName = $date->format('M Y');

            $monthlyTotal = Pengeluaran::where('status', 'disetujui')
                ->whereYear('tanggal_pengeluaran', $date->year)
                ->whereMonth('tanggal_pengeluaran', $date->month)
                ->sum('jumlah');

            $months[] = $monthName;
            $expenses[] = (float) $monthlyTotal;
        }

        return [
            'months' => $months,
            'expenses' => $expenses
        ];
    }
}
