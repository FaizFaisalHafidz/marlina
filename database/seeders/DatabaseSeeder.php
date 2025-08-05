<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            JenisPembayaranSeeder::class,
            KategoriPengeluaranSeeder::class,
            UserSeeder::class,
            SiswaSeeder::class,
            RekeningSeeder::class,
            PembayaranSeeder::class,
            PengeluaranSeeder::class,
        ]);
    }
}
