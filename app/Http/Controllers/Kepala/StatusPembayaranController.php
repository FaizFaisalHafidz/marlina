<?php

namespace App\Http\Controllers\Kepala;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Siswa;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StatusPembayaranController extends Controller
{
    /**
     * Display a listing of payments
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $siswaId = $request->input('siswa_id');

        // Get payments with related data
        $query = Pembayaran::with(['siswa', 'rekening', 'details.jenisPembayaran', 'validator'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($search) {
            $query->whereHas('siswa', function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nisn', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($siswaId) {
            $query->where('siswa_id', $siswaId);
        }

        $pembayaran = $query->paginate(15);

        // Get all students for filter dropdown
        $siswa = Siswa::orderBy('nama', 'asc')->get();

        // Get unique kelas list
        $kelasList = Siswa::distinct('kelas')->orderBy('kelas')->pluck('kelas')->toArray();

        // Get statistics
        $statistics = $this->getStatistics();

        return Inertia::render('admin/status-pembayaran', [
            'pembayaran' => $pembayaran,
            'siswa' => $siswa,
            'stats' => $statistics,
            'kelasList' => $kelasList,
            'filters' => $request->only(['search', 'status', 'siswa_id'])
        ]);
    }

    /**
     * Export payment status data
     */
    public function export(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $siswaId = $request->input('siswa_id');

        $query = Pembayaran::with(['siswa', 'rekening', 'details.jenisPembayaran', 'validator'])
            ->orderBy('created_at', 'desc');

        // Apply same filters as index
        if ($search) {
            $query->whereHas('siswa', function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nisn', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($siswaId) {
            $query->where('siswa_id', $siswaId);
        }

        $pembayaran = $query->get();

        // Return CSV export
        $filename = 'status-pembayaran-' . now()->format('Y-m-d-H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($pembayaran) {
            $file = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($file, [
                'No',
                'Nama Siswa',
                'NISN',
                'Kelas',
                'Jenis Pembayaran',
                'Jumlah',
                'Tanggal Pembayaran',
                'Status',
                'Bank',
                'Divalidasi Oleh',
                'Tanggal Validasi'
            ]);

            // CSV data
            foreach ($pembayaran as $index => $item) {
                $jenisPembayaran = $item->details->pluck('jenisPembayaran.nama_jenis')->implode(', ');
                $validator = $item->validator ? $item->validator->name : '-';
                $tanggalValidasi = $item->tanggal_validasi ? $item->tanggal_validasi->format('d/m/Y H:i') : '-';
                
                fputcsv($file, [
                    $index + 1,
                    $item->siswa->nama,
                    $item->siswa->nisn,
                    $item->siswa->kelas,
                    $jenisPembayaran,
                    number_format($item->jumlah, 0, ',', '.'),
                    $item->tanggal_pembayaran->format('d/m/Y'),
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
     * Get payment statistics
     */
    private function getStatistics()
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        return [
            'total_pembayaran' => Pembayaran::count(),
            'pending' => Pembayaran::where('status', 'pending')->count(),
            'disetujui' => Pembayaran::where('status', 'disetujui')->count(),
            'ditolak' => Pembayaran::where('status', 'ditolak')->count(),
            'pembayaran_hari_ini' => Pembayaran::whereDate('created_at', $today)->count(),
            'pembayaran_bulan_ini' => Pembayaran::whereBetween('created_at', [$thisMonth, $today])->count(),
            'total_amount_disetujui' => Pembayaran::where('status', 'disetujui')->sum('jumlah'),
            'total_amount_pending' => Pembayaran::where('status', 'pending')->sum('jumlah'),
        ];
    }
}
