<?php

namespace App\Http\Controllers\Kepala;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Siswa;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LaporanPemasukanController extends Controller
{
    /**
     * Display income report
     */
    public function index(Request $request)
    {
        $tanggalDari = $request->input('tanggal_dari', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $tanggalSampai = $request->input('tanggal_sampai', Carbon::now()->endOfMonth()->format('Y-m-d'));
        $siswaId = $request->input('siswa_id');

        // Get pembayaran data from database
        $query = Pembayaran::with(['siswa', 'rekening', 'details.jenisPembayaran'])
            ->whereBetween('tanggal_pembayaran', [$tanggalDari, $tanggalSampai])
            ->where('status', 'disetujui');

        if ($siswaId) {
            $query->where('siswa_id', $siswaId);
        }

        $pembayaran = $query->orderBy('tanggal_pembayaran', 'desc')->paginate(15);

        // Get statistics
        $stats = $this->getIncomeStatistics($tanggalDari, $tanggalSampai, $siswaId);

        // Get monthly income data for chart
        $monthlyIncome = $this->getMonthlyIncomeData();

        // Get all students for filter
        $siswa = Siswa::orderBy('nama', 'asc')->get();

        // Get unique kelas list
        $kelasList = Siswa::distinct('kelas')->orderBy('kelas')->pluck('kelas')->toArray();

        // Get unique bank list
        $bankList = \App\Models\Rekening::distinct('nama_bank')->orderBy('nama_bank')->pluck('nama_bank')->toArray();

        return Inertia::render('admin/laporan-pemasukan', [
            'pemasukan' => $pembayaran,
            'siswa' => $siswa,
            'stats' => $stats,
            'monthlyIncome' => $monthlyIncome,
            'kelasList' => $kelasList,
            'bankList' => $bankList,
            'filters' => $request->only(['tanggal_dari', 'tanggal_sampai', 'siswa_id'])
        ]);
    }

    /**
     * Export income report
     */
    public function export(Request $request)
    {
        $tanggalDari = $request->input('tanggal_dari', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $tanggalSampai = $request->input('tanggal_sampai', Carbon::now()->endOfMonth()->format('Y-m-d'));
        $siswaId = $request->input('siswa_id');

        $query = Pembayaran::with(['siswa', 'rekening', 'details.jenisPembayaran'])
            ->whereBetween('tanggal_pembayaran', [$tanggalDari, $tanggalSampai])
            ->where('status', 'disetujui');

        if ($siswaId) {
            $query->where('siswa_id', $siswaId);
        }

        $pembayaran = $query->orderBy('tanggal_pembayaran', 'desc')->get();

        // Return CSV export
        $filename = 'laporan-pemasukan-' . now()->format('Y-m-d-H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($pembayaran) {
            $file = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($file, [
                'No',
                'Tanggal',
                'Nama Siswa',
                'NISN',
                'Kelas',
                'Jenis Pembayaran',
                'Jumlah',
                'Bank',
                'Status'
            ]);

            // CSV data
            foreach ($pembayaran as $index => $item) {
                $jenisPembayaran = $item->details->pluck('jenisPembayaran.nama_jenis')->implode(', ');
                
                fputcsv($file, [
                    $index + 1,
                    $item->tanggal_pembayaran->format('d/m/Y'),
                    $item->siswa->nama,
                    $item->siswa->nisn,
                    $item->siswa->kelas,
                    $jenisPembayaran,
                    number_format($item->jumlah, 0, ',', '.'),
                    $item->rekening->nama_bank,
                    ucfirst($item->status)
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get income statistics from database
     */
    private function getIncomeStatistics($tanggalDari, $tanggalSampai, $siswaId = null)
    {
        $baseQuery = Pembayaran::where('status', 'disetujui');

        // Filter by date range
        $periodQuery = (clone $baseQuery)->whereBetween('tanggal_pembayaran', [$tanggalDari, $tanggalSampai]);
        
        if ($siswaId) {
            $periodQuery->where('siswa_id', $siswaId);
        }

        // Total and count for period
        $totalPemasukan = $periodQuery->sum('jumlah');
        $jumlahTransaksi = $periodQuery->count();
        $rataRataPemasukan = $jumlahTransaksi > 0 ? $totalPemasukan / $jumlahTransaksi : 0;

        // Today's income
        $pemasukanHariIni = (clone $baseQuery)
            ->whereDate('tanggal_pembayaran', Carbon::today())
            ->sum('jumlah');

        // This month's income
        $pemasukanBulanIni = (clone $baseQuery)
            ->whereMonth('tanggal_pembayaran', Carbon::now()->month)
            ->whereYear('tanggal_pembayaran', Carbon::now()->year)
            ->sum('jumlah');

        // This year's income
        $pemasukanTahunIni = (clone $baseQuery)
            ->whereYear('tanggal_pembayaran', Carbon::now()->year)
            ->sum('jumlah');

        // Student with highest payment
        $siswaTermahal = Pembayaran::select('siswa_id', DB::raw('SUM(jumlah) as total'))
            ->with('siswa')
            ->where('status', 'disetujui')
            ->whereBetween('tanggal_pembayaran', [$tanggalDari, $tanggalSampai])
            ->groupBy('siswa_id')
            ->orderBy('total', 'desc')
            ->first();

        return [
            'total_pemasukan' => (float) $totalPemasukan,
            'jumlah_transaksi' => $jumlahTransaksi,
            'rata_rata_pemasukan' => (float) $rataRataPemasukan,
            'pemasukan_hari_ini' => (float) $pemasukanHariIni,
            'pemasukan_bulan_ini' => (float) $pemasukanBulanIni,
            'pemasukan_tahun_ini' => (float) $pemasukanTahunIni,
            'siswa_termahal' => $siswaTermahal ? [
                'nama' => $siswaTermahal->siswa->nama,
                'jumlah' => (float) $siswaTermahal->total
            ] : null
        ];
    }

    /**
     * Get monthly income data for chart
     */
    private function getMonthlyIncomeData()
    {
        $months = [];
        $income = [];

        // Get last 12 months
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthYear = $date->format('Y-m');
            $monthName = $date->format('M Y');

            $monthlyTotal = Pembayaran::where('status', 'disetujui')
                ->whereYear('tanggal_pembayaran', $date->year)
                ->whereMonth('tanggal_pembayaran', $date->month)
                ->sum('jumlah');

            $months[] = $monthName;
            $income[] = (float) $monthlyTotal;
        }

        return [
            'months' => $months,
            'income' => $income
        ];
    }
}
