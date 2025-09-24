<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil role Super Admin
        $superAdminRole = Role::where('nama_role', 'Super Admin')->first();
        
        if (!$superAdminRole) {
            $this->command->error('Role Super Admin tidak ditemukan. Pastikan RoleSeeder sudah dijalankan.');
            return;
        }

        // Cek apakah Super Admin sudah ada
        $existingSuperAdmin = User::whereHas('role', function ($query) {
            $query->where('nama_role', 'Super Admin');
        })->first();

        if ($existingSuperAdmin) {
            $this->command->info('Super Admin sudah ada: ' . $existingSuperAdmin->email);
            return;
        }

        // Buat akun Super Admin
        $superAdmin = User::create([
            'name' => 'Super Administrator',
            'email' => 'superadmin@madrasah.com',
            'password' => Hash::make('superadmin123'),
            'role_id' => $superAdminRole->id,
            'email_verified_at' => now(),
        ]);

        $this->command->info('Super Admin berhasil dibuat: ' . $superAdmin->email);
        $this->command->warn('Password: superadmin123');
        $this->command->warn('PENTING: Ganti password default setelah login pertama kali!');
    }
}