<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Siswa;
use App\Models\Rekening;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PembayaranController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pembayaran = Pembayaran::with(['siswa', 'rekening'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        $siswa = Siswa::orderBy('nama', 'asc')->get();
        $rekening = Rekening::orderBy('nama_bank', 'asc')->get();
        
        return Inertia::render('admin/pembayaran', [
            'pembayaran' => $pembayaran,
            'siswa' => $siswa,
            'rekening' => $rekening
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'siswa_id' => 'required|exists:siswa,id',
            'rekening_id' => 'required|exists:rekening,id',
            'jenis_pembayaran' => 'required|string|max:100',
            'jumlah_pembayaran' => 'required|numeric|min:0',
            'tanggal_pembayaran' => 'required|date',
            'status_pembayaran' => 'required|in:pending,berhasil,gagal',
            'keterangan' => 'nullable|string',
        ]);

        Pembayaran::create($validated);

        return redirect()->back()->with('success', 'Data pembayaran berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pembayaran $pembayaran)
    {
        $validated = $request->validate([
            'siswa_id' => 'required|exists:siswa,id',
            'rekening_id' => 'required|exists:rekening,id',
            'jenis_pembayaran' => 'required|string|max:100',
            'jumlah_pembayaran' => 'required|numeric|min:0',
            'tanggal_pembayaran' => 'required|date',
            'status_pembayaran' => 'required|in:pending,berhasil,gagal',
            'keterangan' => 'nullable|string',
        ]);

        $pembayaran->update($validated);

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

        $pembayaran->update([
            'status' => $request->status,
        ]);

        // Optional: Log the status change with keterangan
        // You can implement logging or audit trail here if needed
        
        $statusText = match($request->status) {
            'disetujui' => 'disetujui',
            'ditolak' => 'ditolak',
            'pending' => 'dikembalikan ke pending',
        };

        return redirect()->back()->with('success', "Status pembayaran berhasil {$statusText}.");
    }
}
