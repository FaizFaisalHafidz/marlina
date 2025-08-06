<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Siswa;
use App\Exports\StatusPembayaranExport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

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
            'pembayaran_bulan_ini' => Pembayaran::whereDate('created_at', '>=', $thisMonth)->count(),
            'total_amount_disetujui' => Pembayaran::where('status', 'disetujui')->sum('jumlah'),
            'total_amount_pending' => Pembayaran::where('status', 'pending')->sum('jumlah'),
        ];
    }

    /**
     * Export data
     */
    public function export(Request $request)
    {
        $filters = [
            'status' => $request->status,
            'kelas' => $request->kelas,
            'tanggal_dari' => $request->tanggal_dari,
            'tanggal_sampai' => $request->tanggal_sampai,
            'search' => $request->search
        ];

        $format = $request->get('format', 'excel'); // Default Excel
        $filename = 'status-pembayaran-' . date('Y-m-d-His');

        if ($format === 'pdf') {
            return $this->exportToPdf($filters, $filename);
        }

        // Export to Excel
        return Excel::download(new StatusPembayaranExport($filters), $filename . '.xlsx');
    }

    private function exportToPdf($filters, $filename)
    {
        $query = Pembayaran::with(['siswa', 'rekening'])
            ->orderBy('created_at', 'desc');

        // Apply filters (same as Excel export)
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
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

        $data = [
            'title' => 'Laporan Status Pembayaran',
            'pembayaran_list' => $pembayaranList,
            'filters' => $filters,
            'export_date' => Carbon::now()->format('d/m/Y H:i'),
            'logo_url' => 'https://neoflash.sgp1.cdn.digitaloceanspaces.com/logo-sirnamiskin.png'
        ];

        $pdf = Pdf::loadView('exports.status-pembayaran-pdf', $data);
        $pdf->setPaper('a4', 'landscape');
        
        return $pdf->download($filename . '.pdf');
    }
}
