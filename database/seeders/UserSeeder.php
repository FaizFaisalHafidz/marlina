<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil role berdasarkan nama
        $adminRole = Role::where('nama_role', 'Admin')->first();
        $bendaharaRole = Role::where('nama_role', 'Bendahara')->first();
        $kepalaRole = Role::where('nama_role', 'Kepala Madrasah')->first();

        $users = [
            [
                'name' => 'Aliefya Ainul Fikri',
                'email' => 'admin@madrasah.com',
                'no_telepon' => '081234567890',
                'password' => Hash::make('password123'),
                'role_id' => $adminRole->id,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Nani Muharomah',
                'email' => 'bendahara@madrasah.com',
                'no_telepon' => '081234567891',
                'password' => Hash::make('password123'),
                'role_id' => $bendaharaRole->id,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Iik Abdul Chalik',
                'email' => 'kepala@madrasah.com',
                'no_telepon' => '081234567892',
                'password' => Hash::make('password123'),
                'role_id' => $kepalaRole->id,
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
