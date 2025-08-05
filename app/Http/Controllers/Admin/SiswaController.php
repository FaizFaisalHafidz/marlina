<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SiswaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $siswa = Siswa::with('user')->orderBy('created_at', 'desc')->paginate(15);
        
        return Inertia::render('admin/siswa', [
            'siswa' => $siswa
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'nullable|date',
            'nisn' => 'required|string|unique:siswa,nisn|max:50',
            'kelas' => 'required|string|max:20',
            'nama_ayah' => 'nullable|string|max:255',
            'nama_ibu' => 'nullable|string|max:255',
            'alamat' => 'nullable|string',
            'no_hp' => 'nullable|string|max:20',
            'email' => 'required|email|unique:siswa,email|max:255',
            'foto' => 'nullable|string|max:255',
        ]);

        // Get role siswa
        $roleSiswa = Role::where('nama_role', 'Siswa')->first();

        // Create user account for student
        $user = User::create([
            'name' => $validated['nama'],
            'email' => $validated['email'],
            'password' => Hash::make('password123'), // Default password
            'role_id' => $roleSiswa->id,
            'email_verified_at' => now(),
        ]);

        // Create siswa with user_id
        $validated['user_id'] = $user->id;
        Siswa::create($validated);

        return redirect()->back()->with('success', 'Data siswa berhasil ditambahkan. Password default: password123');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Siswa $siswa)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'nullable|date',
            'nisn' => 'required|string|max:50|unique:siswa,nisn,' . $siswa->id,
            'kelas' => 'required|string|max:20',
            'nama_ayah' => 'nullable|string|max:255',
            'nama_ibu' => 'nullable|string|max:255',
            'alamat' => 'nullable|string',
            'no_hp' => 'nullable|string|max:20',
            'email' => 'required|email|max:255|unique:siswa,email,' . $siswa->id,
            'foto' => 'nullable|string|max:255',
        ]);

        // Update user account if exists
        if ($siswa->user) {
            $siswa->user->update([
                'name' => $validated['nama'],
                'email' => $validated['email'],
            ]);
        }

        $siswa->update($validated);

        return redirect()->back()->with('success', 'Data siswa berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Siswa $siswa)
    {
        // Check if siswa has pembayaran records
        if ($siswa->pembayaran()->exists()) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus siswa yang memiliki riwayat pembayaran.');
        }

        // Delete associated user account
        if ($siswa->user) {
            $siswa->user->delete();
        }

        $siswa->delete();

        return redirect()->back()->with('success', 'Data siswa dan akun login berhasil dihapus.');
    }
}
