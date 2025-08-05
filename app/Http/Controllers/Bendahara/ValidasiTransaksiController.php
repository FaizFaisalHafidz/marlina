<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Siswa;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ValidasiTransaksiController extends Controller
{
    /**
     * Display a listing of payments for validation
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $tanggalDari = $request->input('tanggal_dari');
        $tanggalSampai = $request->input('tanggal_sampai');

        // Get payments that need validation
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

        if ($tanggalDari && $tanggalSampai) {
            $query->whereBetween('tanggal_pembayaran', [$tanggalDari, $tanggalSampai]);
        }

        $pembayaran = $query->paginate(15);

        // Get validation statistics
        $stats = $this->getValidationStatistics();

        // Get all students for filter
        $siswa = Siswa::orderBy('nama', 'asc')->get();

        return Inertia::render('bendahara/validasi-transaksi', [
            'pembayaran' => $pembayaran,
            'siswa' => $siswa,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'tanggal_dari', 'tanggal_sampai'])
        ]);
    }

    /**
     * Update payment validation status
     */
    public function updateStatus(Request $request, Pembayaran $pembayaran)
    {
        $request->validate([
            'status' => 'required|in:pending,disetujui,ditolak',
            'keterangan' => 'nullable|string|max:500'
        ]);

        $updateData = [
            'status' => $request->status,
        ];

        // Set validation info if status changed to approved or rejected
        if (in_array($request->status, ['disetujui', 'ditolak'])) {
            $updateData['divalidasi_oleh'] = Auth::id();
            $updateData['tanggal_validasi'] = now();
        }

        // Update keterangan if provided
        if ($request->keterangan) {
            $updateData['keterangan'] = $request->keterangan;
        }

        $pembayaran->update($updateData);

        $statusText = match($request->status) {
            'disetujui' => 'disetujui',
            'ditolak' => 'ditolak',
            'pending' => 'dikembalikan ke pending',
        };

        return back()->with('success', "Status pembayaran berhasil {$statusText}.");
    }

    /**
     * Bulk update payment status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:pembayaran,id',
            'status' => 'required|in:pending,disetujui,ditolak',
            'keterangan' => 'nullable|string|max:500'
        ]);

        $updateData = [
            'status' => $request->status,
        ];

        // Set validation info if status changed to approved or rejected
        if (in_array($request->status, ['disetujui', 'ditolak'])) {
            $updateData['divalidasi_oleh'] = Auth::id();
            $updateData['tanggal_validasi'] = now();
        }

        // Update keterangan if provided
        if ($request->keterangan) {
            $updateData['keterangan'] = $request->keterangan;
        }

        $updated = Pembayaran::whereIn('id', $request->ids)->update($updateData);

        return back()->with('success', "Berhasil mengubah status {$updated} pembayaran.");
    }

    /**
     * Get validation statistics
     */
    private function getValidationStatistics()
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

    /**
     * Export validation data
     */
    public function export(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $tanggalDari = $request->input('tanggal_dari');
        $tanggalSampai = $request->input('tanggal_sampai');

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

        if ($tanggalDari && $tanggalSampai) {
            $query->whereBetween('tanggal_pembayaran', [$tanggalDari, $tanggalSampai]);
        }

        $pembayaran = $query->get();

        // Return CSV export
        $filename = 'validasi-transaksi-' . now()->format('Y-m-d-H-i-s') . '.csv';
        
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
                'Divalidasi Oleh',
                'Tanggal Validasi',
                'Keterangan'
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
                    $validator,
                    $tanggalValidasi,
                    $item->keterangan ?? '-'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
