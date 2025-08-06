<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Exports\LaporanPemasukanExport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class LaporanPemasukanController extends Controller
{
    /**
     * Display income report
     */
    public function index(Request $request)
    {
        $query = Pembayaran::with(['siswa', 'rekening'])
            ->where('status', 'disetujui')
            ->orderBy('tanggal_pembayaran', 'desc');

        // Filter berdasarkan tanggal
        $tanggalDari = $request->input('tanggal_dari');
        $tanggalSampai = $request->input('tanggal_sampai');

        if ($tanggalDari && $tanggalSampai) {
            $query->whereBetween('tanggal_pembayaran', [$tanggalDari, $tanggalSampai]);
        }

        // Filter berdasarkan kelas
        if ($request->has('kelas') && $request->kelas !== '') {
            $query->whereHas('siswa', function($q) use ($request) {
                $q->where('kelas', $request->kelas);
            });
        }

        // Filter berdasarkan bank/rekening
        if ($request->has('bank') && $request->bank !== '') {
            $query->whereHas('rekening', function($q) use ($request) {
                $q->where('nama_bank', $request->bank);
            });
        }

        $pemasukan = $query->paginate(15);

        // Get statistics
        $stats = $this->getIncomeStatistics($tanggalDari, $tanggalSampai);

        // Get filter options
        $kelasList = \App\Models\Siswa::distinct()->pluck('kelas')->sort()->values();
        $bankList = \App\Models\Rekening::distinct()->pluck('nama_bank')->sort()->values();

        // Get monthly income data for chart
        $monthlyIncome = $this->getMonthlyIncomeData();

        return Inertia::render('admin/laporan-pemasukan', [
            'pemasukan' => $pemasukan,
            'stats' => $stats,
            'kelasList' => $kelasList,
            'bankList' => $bankList,
            'monthlyIncome' => $monthlyIncome,
            'filters' => $request->only(['tanggal_dari', 'tanggal_sampai', 'kelas', 'bank'])
        ]);
    }

    /**
     * Get income statistics
     */
    private function getIncomeStatistics($tanggalDari, $tanggalSampai)
    {
        $query = Pembayaran::where('status', 'disetujui');
        
        // Only apply date filter if both dates are provided
        if ($tanggalDari && $tanggalSampai) {
            $query->whereBetween('tanggal_pembayaran', [$tanggalDari, $tanggalSampai]);
            $periodLabel = "Periode yang dipilih";
        } else {
            $periodLabel = "Semua periode";
        }

        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $thisYear = Carbon::now()->startOfYear();

        return [
            'total_pemasukan' => $query->sum('jumlah'),
            'jumlah_transaksi' => $query->count(),
            'rata_rata_pembayaran' => $query->avg('jumlah') ?? 0,
            'pemasukan_hari_ini' => Pembayaran::where('status', 'disetujui')
                ->whereDate('tanggal_pembayaran', $today)
                ->sum('jumlah'),
            'pemasukan_bulan_ini' => Pembayaran::where('status', 'disetujui')
                ->whereBetween('tanggal_pembayaran', [$thisMonth, $today])
                ->sum('jumlah'),
            'pemasukan_tahun_ini' => Pembayaran::where('status', 'disetujui')
                ->whereBetween('tanggal_pembayaran', [$thisYear, $today])
                ->sum('jumlah'),
            'period_label' => $periodLabel,
        ];
    }

    /**
     * Get monthly income data for chart
     */
    private function getMonthlyIncomeData()
    {
        $months = [];
        $incomes = [];

        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthStart = $date->copy()->startOfMonth();
            $monthEnd = $date->copy()->endOfMonth();

            $income = Pembayaran::where('status', 'disetujui')
                ->whereBetween('tanggal_pembayaran', [$monthStart, $monthEnd])
                ->sum('jumlah');

            $months[] = $date->format('M Y');
            $incomes[] = (float) $income;
        }

        return [
            'months' => $months,
            'incomes' => $incomes
        ];
    }

    /**
     * Export income report
     */
    public function export(Request $request)
    {
        $filters = [
            'jenis_pembayaran' => $request->jenis_pembayaran,
            'kelas' => $request->kelas,
            'tanggal_dari' => $request->tanggal_dari,
            'tanggal_sampai' => $request->tanggal_sampai,
            'search' => $request->search
        ];

        $format = $request->get('format', 'excel'); // Default Excel
        $filename = 'laporan-pemasukan-' . date('Y-m-d-His');

        if ($format === 'pdf') {
            return $this->exportToPdf($filters, $filename);
        }

        // Export to Excel
        return Excel::download(new LaporanPemasukanExport($filters), $filename . '.xlsx');
    }

    private function exportToPdf($filters, $filename)
    {
        $query = Pembayaran::with(['siswa', 'rekening'])
            ->where('status', 'approved')
            ->orderBy('tanggal_pembayaran', 'desc');

        // Apply filters (same logic as main controller)
        if (!empty($filters['jenis_pembayaran'])) {
            $query->where('jenis_pembayaran', $filters['jenis_pembayaran']);
        }

        if (!empty($filters['kelas'])) {
            $query->whereHas('siswa', function($q) use ($filters) {
                $q->where('kelas', $filters['kelas']);
            });
        }

        if (!empty($filters['tanggal_dari'])) {
            $query->whereDate('tanggal_pembayaran', '>=', $filters['tanggal_dari']);
        }

        if (!empty($filters['tanggal_sampai'])) {
            $query->whereDate('tanggal_pembayaran', '<=', $filters['tanggal_sampai']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('siswa', function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nisn', 'like', "%{$search}%");
            });
        }

        $pembayaranList = $query->get();
        $totalPemasukan = $pembayaranList->sum('jumlah');

        $data = [
            'title' => 'Laporan Pemasukan',
            'pembayaran_list' => $pembayaranList,
            'total_pemasukan' => $totalPemasukan,
            'filters' => $filters,
            'export_date' => Carbon::now()->format('d/m/Y H:i'),
            'logo_url' => 'https://neoflash.sgp1.cdn.digitaloceanspaces.com/logo-sirnamiskin.png'
        ];

        $pdf = Pdf::loadView('exports.laporan-pemasukan-pdf', $data);
        $pdf->setPaper('a4', 'landscape');
        
        return $pdf->download($filename . '.pdf');
    }
}
