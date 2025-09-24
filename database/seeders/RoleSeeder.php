<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['nama_role' => 'Super Admin'],
            ['nama_role' => 'Admin'],
            ['nama_role' => 'Bendahara'],
            ['nama_role' => 'Kepala Madrasah'],
            ['nama_role' => 'Orang Tua'],
            ['nama_role' => 'Siswa'],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}
