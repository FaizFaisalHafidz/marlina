<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Siswa as ModelSiswa;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RiwayatController extends Controller
{
    /**
     * Display student's payment history
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get student data based on logged in user
        $siswa = ModelSiswa::where('user_id', $user->id)->first();
        
        if (!$siswa) {
            return redirect()->route('dashboard')->with('error', 'Data siswa tidak ditemukan.');
        }

        $status = $request->input('status');
        $tanggalDari = $request->input('tanggal_dari');
        $tanggalSampai = $request->input('tanggal_sampai');

        // Get payment history for this student  
        $query = Pembayaran::with(['siswa', 'details.jenisPembayaran'])
            ->where('siswa_id', $siswa->id)
            ->orderBy('created_at', 'desc');

        // Load rekening relation based on metode_pembayaran_id
        $query->with(['rekening' => function($q) {
            $q->select('id', 'nama_bank', 'nomor_rekening', 'nama_penerima');
        }]);

        // Apply filters
        if ($status) {
            $query->where('status', $status);
        }

        if ($tanggalDari) {
            $query->whereDate('tanggal_pembayaran', '>=', $tanggalDari);
        }

        if ($tanggalSampai) {
            $query->whereDate('tanggal_pembayaran', '<=', $tanggalSampai);
        }

        $riwayat = $query->paginate(15);

        // Get payment statistics for this student
        $statistics = $this->getStudentHistoryStatistics($siswa->id, $tanggalDari, $tanggalSampai);

        // Get monthly payment data for chart
        $monthlyPayments = $this->getMonthlyPaymentData($siswa->id);

        return Inertia::render('siswa/riwayat', [
            'riwayat' => $riwayat,
            'siswa' => $siswa,
            'stats' => $statistics,
            'monthlyPayments' => $monthlyPayments,
            'filters' => $request->only(['status', 'tanggal_dari', 'tanggal_sampai'])
        ]);
    }

    /**
     * Export student payment history
     */
    public function export(Request $request)
    {
        $user = Auth::user();
        $siswa = ModelSiswa::where('user_id', $user->id)->first();
        
        if (!$siswa) {
            return redirect()->route('dashboard')->with('error', 'Data siswa tidak ditemukan.');
        }

        $status = $request->input('status');
        $tanggalDari = $request->input('tanggal_dari');
        $tanggalSampai = $request->input('tanggal_sampai');

        $query = Pembayaran::with(['siswa', 'rekening', 'details.jenisPembayaran', 'validator'])
            ->where('siswa_id', $siswa->id)
            ->orderBy('created_at', 'desc');

        // Apply same filters as index
        if ($status) {
            $query->where('status', $status);
        }

        if ($tanggalDari) {
            $query->whereDate('tanggal_pembayaran', '>=', $tanggalDari);
        }

        if ($tanggalSampai) {
            $query->whereDate('tanggal_pembayaran', '<=', $tanggalSampai);
        }

        $riwayat = $query->get();

        // Return CSV export
        $filename = 'riwayat-pembayaran-' . $siswa->nama . '-' . now()->format('Y-m-d-H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($riwayat) {
            $file = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($file, [
                'No',
                'Tanggal Pembayaran',
                'Jenis Pembayaran',
                'Jumlah',
                'Status',
                'Bank',
                'Divalidasi Oleh',
                'Tanggal Validasi'
            ]);

            // CSV data
            foreach ($riwayat as $index => $item) {
                $jenisPembayaran = $item->details->pluck('jenisPembayaran.nama_jenis')->implode(', ');
                $validator = $item->validator ? $item->validator->name : '-';
                $tanggalValidasi = $item->tanggal_validasi ? $item->tanggal_validasi->format('d/m/Y H:i') : '-';
                
                fputcsv($file, [
                    $index + 1,
                    $item->tanggal_pembayaran->format('d/m/Y'),
                    $jenisPembayaran,
                    number_format($item->jumlah, 0, ',', '.'),
                    ucfirst($item->status),
                    $item->rekening->nama_bank,
                    $validator,
                    $tanggalValidasi
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get student payment history statistics
     */
    private function getStudentHistoryStatistics($siswaId, $tanggalDari = null, $tanggalSampai = null)
    {
        $query = Pembayaran::where('siswa_id', $siswaId);

        if ($tanggalDari) {
            $query->whereDate('tanggal_pembayaran', '>=', $tanggalDari);
        }

        if ($tanggalSampai) {
            $query->whereDate('tanggal_pembayaran', '<=', $tanggalSampai);
        }

        $baseQuery = clone $query;

        return [
            'total_pembayaran' => $baseQuery->count(),
            'total_disetujui' => $query->where('status', 'disetujui')->count(),
            'total_pending' => $baseQuery->where('status', 'pending')->count(),
            'total_ditolak' => $baseQuery->where('status', 'ditolak')->count(),
            'total_amount_disetujui' => $query->where('status', 'disetujui')->sum('jumlah'),
            'total_amount_pending' => $baseQuery->where('status', 'pending')->sum('jumlah'),
        ];
    }

    /**
     * Show payment detail
     */
    public function show($id)
    {
        $user = Auth::user();
        $siswa = ModelSiswa::where('user_id', $user->id)->first();
        
        if (!$siswa) {
            return redirect()->route('dashboard')->with('error', 'Data siswa tidak ditemukan.');
        }

        $pembayaran = Pembayaran::where('id', $id)
            ->where('siswa_id', $siswa->id)
            ->with(['details.jenisPembayaran'])
            ->firstOrFail();

        return Inertia::render('siswa/riwayat-detail', [
            'siswaLogin' => $siswa,
            'pembayaran' => $pembayaran
        ]);
    }

    /**
     * Download payment receipt
     */
    public function downloadReceipt($id)
    {
        $user = Auth::user();
        $siswa = ModelSiswa::where('user_id', $user->id)->first();
        
        if (!$siswa) {
            return redirect()->route('dashboard')->with('error', 'Data siswa tidak ditemukan.');
        }

        $pembayaran = Pembayaran::where('id', $id)
            ->where('siswa_id', $siswa->id)
            ->where('status', 'disetujui')
            ->with(['details.jenisPembayaran'])
            ->firstOrFail();

        // Here you would generate a PDF receipt
        // For now, we'll just redirect back
        return redirect()->back()->with('info', 'Fitur download receipt akan segera tersedia.');
    }

    /**
     * Get monthly payment data for chart
     */
    private function getMonthlyPaymentData($siswaId)
    {
        $months = [];
        $data = [];

        // Get last 12 months
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months[] = $date->format('M Y');
            
            $amount = Pembayaran::where('siswa_id', $siswaId)
                ->where('status', 'disetujui')
                ->whereYear('tanggal_pembayaran', $date->year)
                ->whereMonth('tanggal_pembayaran', $date->month)
                ->sum('jumlah');
                
            $data[] = $amount;
        }

        return [
            'months' => $months,
            'data' => $data,
        ];
    }
}
