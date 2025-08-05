<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PengeluaranSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pengeluaranData = [
            [
                'nomor_transaksi' => 'PGL-2024-001',
                'kategori_pengeluaran_id' => 1, // Gaji dan Tunjangan
                'tanggal_pengeluaran' => '2024-07-15',
                'deskripsi' => 'Gaji guru bulan Juli 2024',
                'jumlah' => 15000000,
                'status' => 'disetujui',
                'metode_pembayaran' => 'transfer',
                'penerima' => 'Guru dan Staff',
                'nomor_kwitansi' => 'KWT-001',
                'keterangan' => 'Pembayaran gaji rutin bulanan',
                'diajukan_oleh' => 2, // Bendahara
                'disetujui_oleh' => 1, // Admin
                'tanggal_disetujui' => '2024-07-15 10:30:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nomor_transaksi' => 'PGL-2024-002',
                'kategori_pengeluaran_id' => 2, // Operasional Sekolah
                'tanggal_pengeluaran' => '2024-07-20',
                'deskripsi' => 'Listrik dan air bulan Juli',
                'jumlah' => 2500000,
                'status' => 'disetujui',
                'metode_pembayaran' => 'transfer',
                'penerima' => 'PLN dan PDAM',
                'nomor_kwitansi' => 'KWT-002',
                'keterangan' => 'Pembayaran utilitas bulanan',
                'diajukan_oleh' => 2,
                'disetujui_oleh' => 1,
                'tanggal_disetujui' => '2024-07-20 14:15:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nomor_transaksi' => 'PGL-2024-003',
                'kategori_pengeluaran_id' => 3, // Pemeliharaan Fasilitas
                'tanggal_pengeluaran' => '2024-07-25',
                'deskripsi' => 'Perbaikan AC ruang kelas',
                'jumlah' => 1800000,
                'status' => 'disetujui',
                'metode_pembayaran' => 'tunai',
                'penerima' => 'Toko Elektronik Jaya',
                'nomor_kwitansi' => 'KWT-003',
                'keterangan' => 'Service dan ganti spare part AC',
                'diajukan_oleh' => 2,
                'disetujui_oleh' => 1,
                'tanggal_disetujui' => '2024-07-25 09:45:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nomor_transaksi' => 'PGL-2024-004',
                'kategori_pengeluaran_id' => 5, // Kegiatan Ekstrakurikuler
                'tanggal_pengeluaran' => '2024-08-01',
                'deskripsi' => 'Peralatan olahraga untuk ekstrakurikuler',
                'jumlah' => 3200000,
                'status' => 'disetujui',
                'metode_pembayaran' => 'transfer',
                'penerima' => 'Toko Olahraga Sportindo',
                'nomor_kwitansi' => 'KWT-004',
                'keterangan' => 'Bola voli, sepak bola, dan net',
                'diajukan_oleh' => 2,
                'disetujui_oleh' => 1,
                'tanggal_disetujui' => '2024-08-01 11:20:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nomor_transaksi' => 'PGL-2024-005',
                'kategori_pengeluaran_id' => 6, // Administrasi dan ATK
                'tanggal_pengeluaran' => '2024-08-03',
                'deskripsi' => 'ATK dan keperluan kantor',
                'jumlah' => 850000,
                'status' => 'pending',
                'metode_pembayaran' => 'tunai',
                'penerima' => 'Toko Buku Cerdas',
                'nomor_kwitansi' => 'KWT-005',
                'keterangan' => 'Kertas, tinta printer, alat tulis',
                'diajukan_oleh' => 2,
                'disetujui_oleh' => null,
                'tanggal_disetujui' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nomor_transaksi' => 'PGL-2024-006',
                'kategori_pengeluaran_id' => 7, // Konsumsi
                'tanggal_pengeluaran' => '2024-08-04',
                'deskripsi' => 'Konsumsi rapat guru',
                'jumlah' => 450000,
                'status' => 'disetujui',
                'metode_pembayaran' => 'tunai',
                'penerima' => 'Catering Sederhana',
                'nomor_kwitansi' => 'KWT-006',
                'keterangan' => 'Makan siang rapat bulanan',
                'diajukan_oleh' => 2,
                'disetujui_oleh' => 1,
                'tanggal_disetujui' => '2024-08-04 08:30:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('pengeluaran')->insert($pengeluaranData);
    }
}
