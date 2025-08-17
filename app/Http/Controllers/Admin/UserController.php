<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with('role')->latest()->get();
        $roles = Role::all();
        
        // Log users data for debugging
        \Log::info('Users index data:', [
            'users_count' => $users->count(),
            'users_sample' => $users->take(2)->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at,
                    'role' => $user->role ? $user->role->nama_role : null
                ];
            })
        ]);
        
        return Inertia::render('admin/users', [
            'users' => $users,
            'roles' => $roles
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'required|exists:roles,id',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id,
            'email_verified_at' => now(),
        ]);

        return redirect()->back()->with('success', 'User berhasil ditambahkan!');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'role_id' => 'required|exists:roles,id',
        ];

        // Only validate password if it's provided
        if ($request->filled('password')) {
            $rules['password'] = 'required|string|min:8|confirmed';
        }

        $request->validate($rules);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'role_id' => $request->role_id,
        ];

        // Only update password if provided
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        return redirect()->back()->with('success', 'User berhasil diperbarui!');
    }

    /**
     * Toggle email verification status
     */
    public function toggleVerification(string $id)
    {
        try {
            \Log::info('Toggle verification called for user ID: ' . $id);
            
            $user = User::findOrFail($id);
            \Log::info('User found:', ['user_id' => $user->id, 'current_verification' => $user->email_verified_at]);
            
            // Prevent changing current user's verification status
            if ($user->id === Auth::id()) {
                \Log::warning('Attempted to change own verification status', ['user_id' => $user->id, 'auth_id' => Auth::id()]);
                return redirect()->back()->with('error', 'Tidak dapat mengubah status verifikasi akun Anda sendiri.');
            }
            
            // Toggle verification status
            if ($user->email_verified_at) {
                $user->update(['email_verified_at' => null]);
                $message = 'Status verifikasi user berhasil dinonaktifkan!';
                \Log::info('User verification disabled', ['user_id' => $user->id]);
            } else {
                $user->update(['email_verified_at' => now()]);
                $message = 'Status verifikasi user berhasil diaktifkan!';
                \Log::info('User verification enabled', ['user_id' => $user->id]);
            }

            // Refresh user data to verify update
            $user->refresh();
            \Log::info('User after update:', ['user_id' => $user->id, 'new_verification' => $user->email_verified_at]);

            return redirect()->back()->with('success', $message);
            
        } catch (\Exception $e) {
            \Log::error('Error in toggleVerification:', [
                'user_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting current user
        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus akun Anda sendiri.');
        }
        
        $user->delete();

        return redirect()->back()->with('success', 'User berhasil dihapus!');
    }
}
