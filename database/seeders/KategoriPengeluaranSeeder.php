<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KategoriPengeluaranSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kategoriPengeluaran = [
            [
                'nama_kategori' => 'Gaji dan Tunjangan',
                'kode' => 'GAJI',
                'deskripsi' => 'Gaji guru, tunjangan, dan honorarium',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_kategori' => 'Operasional Sekolah',
                'kode' => 'OPS',
                'deskripsi' => 'Listrik, air, internet, dan operasional harian',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_kategori' => 'Pemeliharaan Fasilitas',
                'kode' => 'MAINTAIN',
                'deskripsi' => 'Perbaikan dan pemeliharaan gedung, peralatan',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_kategori' => 'Kegiatan Pembelajaran',
                'kode' => 'BELAJAR',
                'deskripsi' => 'Buku, alat tulis, media pembelajaran',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_kategori' => 'Kegiatan Ekstrakurikuler',
                'kode' => 'EKSKUL',
                'deskripsi' => 'Peralatan olahraga, kegiatan siswa',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_kategori' => 'Administrasi dan ATK',
                'kode' => 'ADM',
                'deskripsi' => 'Alat tulis kantor, dokumen, administrasi',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_kategori' => 'Konsumsi',
                'kode' => 'KONSUMSI',
                'deskripsi' => 'Konsumsi rapat, acara sekolah',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_kategori' => 'Lainnya',
                'kode' => 'LAIN',
                'deskripsi' => 'Pengeluaran lain yang tidak masuk kategori',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('kategori_pengeluaran')->insert($kategoriPengeluaran);
    }
}
