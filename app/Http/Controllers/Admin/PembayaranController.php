<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Siswa;
use App\Models\Rekening;
use App\Models\JenisPembayaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PembayaranController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pembayaran = Pembayaran::with(['siswa', 'rekening', 'details.jenisPembayaran'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        
        $siswa = Siswa::orderBy('nama', 'asc')->get();
        $rekening = Rekening::orderBy('nama_bank', 'asc')->get();
        $jenisPembayaran = JenisPembayaran::where('is_active', true)
            ->orderBy('nama_jenis', 'asc')
            ->get();
        
        return Inertia::render('admin/pembayaran', [
            'pembayaran' => $pembayaran,
            'siswa' => $siswa,
            'rekening' => $rekening,
            'jenisPembayaran' => $jenisPembayaran
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'siswa_id' => 'required|exists:siswa,id',
            'metode_pembayaran_id' => 'required|exists:rekening,id',
            'tanggal_pembayaran' => 'required|date',
            'status' => 'required|in:pending,disetujui,ditolak',
            'keterangan' => 'nullable|string',
            'bukti_transfer' => 'nullable|string|max:255',
            'details' => 'required|array|min:1',
            'details.*.jenis_pembayaran_id' => 'required|exists:jenis_pembayaran,id',
            'details.*.jumlah' => 'required|numeric|min:0',
            'details.*.keterangan' => 'nullable|string',
        ]);

        // Calculate total amount
        $totalJumlah = collect($validated['details'])->sum('jumlah');
        
        // Create pembayaran
        $pembayaranData = $validated;
        unset($pembayaranData['details']);
        $pembayaranData['jumlah'] = $totalJumlah;
        
        $pembayaran = Pembayaran::create($pembayaranData);
        
        // Create detail pembayaran
        foreach ($validated['details'] as $detail) {
            $detail['pembayaran_id'] = $pembayaran->id;
            \App\Models\DetailPembayaran::create($detail);
        }

        return redirect()->back()->with('success', 'Data pembayaran berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pembayaran $pembayaran)
    {
        $validated = $request->validate([
            'siswa_id' => 'required|exists:siswa,id',
            'metode_pembayaran_id' => 'required|exists:rekening,id',
            'tanggal_pembayaran' => 'required|date',
            'status' => 'required|in:pending,disetujui,ditolak',
            'keterangan' => 'nullable|string',
            'bukti_transfer' => 'nullable|string|max:255',
            'details' => 'required|array|min:1',
            'details.*.jenis_pembayaran_id' => 'required|exists:jenis_pembayaran,id',
            'details.*.jumlah' => 'required|numeric|min:0',
            'details.*.keterangan' => 'nullable|string',
        ]);

        // Calculate total amount
        $totalJumlah = collect($validated['details'])->sum('jumlah');

        // Set validation info if status changed to approved
        if ($validated['status'] === 'disetujui' && $pembayaran->status !== 'disetujui') {
            $validated['divalidasi_oleh'] = Auth::id();
            $validated['tanggal_validasi'] = now();
        }

        // Update pembayaran
        $pembayaranData = $validated;
        unset($pembayaranData['details']);
        $pembayaranData['jumlah'] = $totalJumlah;
        
        $pembayaran->update($pembayaranData);
        
        // Delete old details and create new ones
        $pembayaran->details()->delete();
        
        foreach ($validated['details'] as $detail) {
            $detail['pembayaran_id'] = $pembayaran->id;
            \App\Models\DetailPembayaran::create($detail);
        }

        return redirect()->back()->with('success', 'Data pembayaran berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pembayaran $pembayaran)
    {
        $pembayaran->delete();

        return redirect()->back()->with('success', 'Data pembayaran berhasil dihapus.');
    }

    /**
     * Update the status of the specified pembayaran.
     */
    public function updateStatus(Request $request, Pembayaran $pembayaran)
    {
        $request->validate([
            'status' => 'required|in:pending,disetujui,ditolak',
            'keterangan' => 'nullable|string|max:500',
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

        return redirect()->back()->with('success', "Status pembayaran berhasil {$statusText}.");
    }

    /**
     * Approve payment
     */
    public function approve(Pembayaran $pembayaran)
    {
        $pembayaran->update([
            'status' => 'disetujui',
            'divalidasi_oleh' => Auth::id(),
            'tanggal_validasi' => now(),
        ]);

        return redirect()->back()->with('success', 'Pembayaran berhasil disetujui.');
    }

    /**
     * Reject payment
     */
    public function reject(Request $request, Pembayaran $pembayaran)
    {
        $validated = $request->validate([
            'keterangan' => 'required|string|max:500',
        ]);

        $pembayaran->update([
            'status' => 'ditolak',
            'keterangan' => $validated['keterangan'],
            'divalidasi_oleh' => Auth::id(),
            'tanggal_validasi' => now(),
        ]);

        return redirect()->back()->with('success', 'Pembayaran berhasil ditolak.');
    }
}
