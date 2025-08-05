<?php

namespace Database\Seeders;

use App\Models\Pembayaran;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PembayaranSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pembayaranData = [
            [
                'siswa_id' => 1,
                'jenis_pembayaran_id' => 1, // PSB
                'metode_pembayaran_id' => 1,
                'jumlah' => 500000,
                'tanggal_pembayaran' => '2025-01-15',
                'status' => 'disetujui',
                'keterangan' => 'Pembayaran PSB tahun ajaran 2025/2026',
            ],
            [
                'siswa_id' => 2,
                'jenis_pembayaran_id' => 1, // PSB
                'metode_pembayaran_id' => 1,
                'jumlah' => 500000,
                'tanggal_pembayaran' => '2025-01-20',
                'status' => 'disetujui',
                'keterangan' => 'Pembayaran PSB tahun ajaran 2025/2026',
            ],
            [
                'siswa_id' => 3,
                'jenis_pembayaran_id' => 2, // SPP
                'metode_pembayaran_id' => 2,
                'jumlah' => 200000,
                'tanggal_pembayaran' => '2025-01-25',
                'status' => 'pending',
                'keterangan' => 'SPP bulan Januari 2025',
            ],
            [
                'siswa_id' => 1,
                'jenis_pembayaran_id' => 3, // GERAK
                'metode_pembayaran_id' => 1,
                'jumlah' => 300000,
                'tanggal_pembayaran' => '2024-08-10',
                'status' => 'disetujui',
                'keterangan' => 'Seragam dan perlengkapan sekolah',
            ],
            [
                'siswa_id' => 4,
                'jenis_pembayaran_id' => 1, // PSB
                'metode_pembayaran_id' => 3,
                'jumlah' => 500000,
                'tanggal_pembayaran' => '2025-01-10',
                'status' => 'disetujui',
                'keterangan' => 'Pembayaran PSB tahun ajaran 2025/2026',
            ],
            [
                'siswa_id' => 5,
                'jenis_pembayaran_id' => 2, // SPP
                'metode_pembayaran_id' => 2,
                'jumlah' => 200000,
                'tanggal_pembayaran' => '2024-07-15',
                'status' => 'disetujui',
                'keterangan' => 'SPP bulan Juli 2024',
            ],
            [
                'siswa_id' => 6,
                'jenis_pembayaran_id' => 4, // UJIAN
                'metode_pembayaran_id' => 1,
                'jumlah' => 150000,
                'tanggal_pembayaran' => '2024-12-05',
                'status' => 'disetujui',
                'keterangan' => 'Biaya ujian semester ganjil',
            ],
            [
                'siswa_id' => 7,
                'jenis_pembayaran_id' => 3, // GERAK
                'metode_pembayaran_id' => 4,
                'jumlah' => 300000,
                'tanggal_pembayaran' => '2024-07-20',
                'status' => 'disetujui',
                'keterangan' => 'Seragam dan perlengkapan sekolah',
            ],
            [
                'siswa_id' => 8,
                'jenis_pembayaran_id' => 2, // SPP
                'metode_pembayaran_id' => 2,
                'jumlah' => 200000,
                'tanggal_pembayaran' => '2025-01-28',
                'status' => 'ditolak',
                'keterangan' => 'SPP bulan Januari 2025 - bukti transfer tidak valid',
            ],
            [
                'siswa_id' => 9,
                'jenis_pembayaran_id' => 2, // SPP
                'metode_pembayaran_id' => 3,
                'jumlah' => 200000,
                'tanggal_pembayaran' => '2024-12-01',
                'status' => 'disetujui',
                'keterangan' => 'SPP bulan Desember 2024',
            ],
            [
                'siswa_id' => 10,
                'jenis_pembayaran_id' => 1, // PSB
                'metode_pembayaran_id' => 1,
                'jumlah' => 500000,
                'tanggal_pembayaran' => '2025-01-12',
                'status' => 'pending',
                'keterangan' => 'Pembayaran PSB tahun ajaran 2025/2026',
            ],
            [
                'siswa_id' => 2,
                'jenis_pembayaran_id' => 2, // SPP
                'metode_pembayaran_id' => 2,
                'jumlah' => 200000,
                'tanggal_pembayaran' => '2025-02-01',
                'status' => 'disetujui',
                'keterangan' => 'SPP bulan Februari 2025',
            ],
            [
                'siswa_id' => 3,
                'jenis_pembayaran_id' => 3, // GERAK
                'metode_pembayaran_id' => 1,
                'jumlah' => 300000,
                'tanggal_pembayaran' => '2024-08-15',
                'status' => 'disetujui',
                'keterangan' => 'Seragam dan perlengkapan sekolah',
            ],
            [
                'siswa_id' => 4,
                'jenis_pembayaran_id' => 2, // SPP
                'metode_pembayaran_id' => 3,
                'jumlah' => 200000,
                'tanggal_pembayaran' => '2025-01-15',
                'status' => 'disetujui',
                'keterangan' => 'SPP bulan Januari 2025',
            ],
            [
                'siswa_id' => 5,
                'jenis_pembayaran_id' => 4, // UJIAN
                'metode_pembayaran_id' => 2,
                'jumlah' => 150000,
                'tanggal_pembayaran' => '2024-12-10',
                'status' => 'disetujui',
                'keterangan' => 'Biaya ujian semester ganjil',
            ],
        ];

        foreach ($pembayaranData as $data) {
            Pembayaran::create($data);
        }
    }
}
