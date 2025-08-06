<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Siswa;
use App\Events\PaymentStatusUpdated;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class StatusPembayaranController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Pembayaran::with(['siswa', 'rekening'])
            ->orderBy('created_at', 'desc');

        // Filter berdasarkan status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan kelas siswa
        if ($request->has('kelas') && $request->kelas !== '') {
            $query->whereHas('siswa', function($q) use ($request) {
                $q->where('kelas', $request->kelas);
            });
        }

        // Filter berdasarkan tanggal
        if ($request->has('tanggal_dari') && $request->tanggal_dari !== '') {
            $query->whereDate('tanggal_pembayaran', '>=', $request->tanggal_dari);
        }

        if ($request->has('tanggal_sampai') && $request->tanggal_sampai !== '') {
            $query->whereDate('tanggal_pembayaran', '<=', $request->tanggal_sampai);
        }

        // Search berdasarkan nama siswa atau NISN
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->whereHas('siswa', function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nisn', 'like', "%{$search}%");
            });
        }

        $pembayaran = $query->paginate(10);

        // Get statistics
        $stats = $this->getStatistics();

        // Get unique classes for filter
        $kelasList = Siswa::distinct()->pluck('kelas')->sort()->values();

        return Inertia::render('admin/status-pembayaran', [
            'pembayaran' => $pembayaran,
            'stats' => $stats,
            'kelasList' => $kelasList,
            'filters' => $request->only(['status', 'kelas', 'tanggal_dari', 'tanggal_sampai', 'search'])
        ]);
    }

    /**
     * Update pembayaran status
     */
    public function updateStatus(Request $request, Pembayaran $pembayaran)
    {
        $request->validate([
            'status' => 'required|in:pending,disetujui,ditolak',
            'keterangan' => 'nullable|string|max:500'
        ]);

        $oldStatus = $pembayaran->status;

        $pembayaran->update([
            'status' => $request->status
        ]);

        // Trigger WhatsApp notification event
        PaymentStatusUpdated::dispatch($pembayaran, $oldStatus, $request->status);

        return back()->with('success', "Status pembayaran berhasil diubah menjadi {$request->status}");
    }

    /**
     * Bulk update status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:pembayaran,id',
            'status' => 'required|in:pending,disetujui,ditolak',
            'keterangan' => 'nullable|string|max:500'
        ]);

        $updated = Pembayaran::whereIn('id', $request->ids)
            ->update(['status' => $request->status]);

        return back()->with('success', "Berhasil mengubah status {$updated} pembayaran");
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
