<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JenisPembayaranSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jenisPembayaran = [
            [
                'nama_jenis' => 'Penerimaan Siswa Baru',
                'kode' => 'PSB',
                'nominal_default' => 500000,
                'is_wajib' => true,
                'deskripsi' => 'Biaya pendaftaran dan administrasi siswa baru',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_jenis' => 'Sumbangan Pembinaan Pendidikan',
                'kode' => 'SPP',
                'nominal_default' => 200000,
                'is_wajib' => true,
                'deskripsi' => 'Biaya bulanan untuk kegiatan pembelajaran',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_jenis' => 'Seragam dan Perlengkapan',
                'kode' => 'GERAK',
                'nominal_default' => 300000,
                'is_wajib' => true,
                'deskripsi' => 'Biaya seragam, buku, dan perlengkapan sekolah',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_jenis' => 'Ujian Semester',
                'kode' => 'UJIAN',
                'nominal_default' => 150000,
                'is_wajib' => true,
                'deskripsi' => 'Biaya ujian tengah semester dan akhir semester',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('jenis_pembayaran')->insert($jenisPembayaran);
    }
}
