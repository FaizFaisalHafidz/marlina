<?php

namespace Database\Seeders;

use App\Models\Pembayaran;
use App\Models\DetailPembayaran;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PembayaranSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Hapus data lama
        DetailPembayaran::truncate();
        Pembayaran::truncate();

        $pembayaranData = [
            [
                'siswa_id' => 1,
                'metode_pembayaran_id' => 1,
                'tanggal_pembayaran' => '2025-01-15',
                'status' => 'disetujui',
                'keterangan' => 'Pembayaran lengkap PSB dan SPP',
                'details' => [
                    ['jenis_pembayaran_id' => 1, 'jumlah' => 500000, 'keterangan' => 'PSB tahun ajaran 2025/2026'],
                    ['jenis_pembayaran_id' => 2, 'jumlah' => 200000, 'keterangan' => 'SPP bulan Januari 2025'],
                ]
            ],
            [
                'siswa_id' => 2,
                'metode_pembayaran_id' => 1,
                'tanggal_pembayaran' => '2025-01-20',
                'status' => 'disetujui',
                'keterangan' => 'Pembayaran PSB saja',
                'details' => [
                    ['jenis_pembayaran_id' => 1, 'jumlah' => 500000, 'keterangan' => 'PSB tahun ajaran 2025/2026'],
                ]
            ],
            [
                'siswa_id' => 3,
                'metode_pembayaran_id' => 2,
                'tanggal_pembayaran' => '2025-01-25',
                'status' => 'pending',
                'keterangan' => 'Pembayaran SPP dan Gerak',
                'details' => [
                    ['jenis_pembayaran_id' => 2, 'jumlah' => 200000, 'keterangan' => 'SPP bulan Januari 2025'],
                    ['jenis_pembayaran_id' => 3, 'jumlah' => 300000, 'keterangan' => 'Seragam dan perlengkapan'],
                ]
            ],
            [
                'siswa_id' => 1,
                'metode_pembayaran_id' => 1,
                'tanggal_pembayaran' => '2024-08-10',
                'status' => 'disetujui',
                'keterangan' => 'Pembayaran Gerak saja',
                'details' => [
                    ['jenis_pembayaran_id' => 3, 'jumlah' => 300000, 'keterangan' => 'Seragam dan perlengkapan sekolah'],
                ]
            ],
            [
                'siswa_id' => 4,
                'metode_pembayaran_id' => 3,
                'tanggal_pembayaran' => '2025-01-10',
                'status' => 'disetujui',
                'keterangan' => 'Pembayaran lengkap',
                'details' => [
                    ['jenis_pembayaran_id' => 1, 'jumlah' => 500000, 'keterangan' => 'PSB tahun ajaran 2025/2026'],
                    ['jenis_pembayaran_id' => 2, 'jumlah' => 200000, 'keterangan' => 'SPP Januari 2025'],
                    ['jenis_pembayaran_id' => 3, 'jumlah' => 300000, 'keterangan' => 'Seragam dan perlengkapan'],
                ]
            ],
            [
                'siswa_id' => 5,
                'metode_pembayaran_id' => 2,
                'tanggal_pembayaran' => '2024-07-15',
                'status' => 'disetujui',
                'keterangan' => 'SPP Juli',
                'details' => [
                    ['jenis_pembayaran_id' => 2, 'jumlah' => 200000, 'keterangan' => 'SPP bulan Juli 2024'],
                ]
            ],
            [
                'siswa_id' => 6,
                'metode_pembayaran_id' => 1,
                'tanggal_pembayaran' => '2024-12-05',
                'status' => 'disetujui',
                'keterangan' => 'Ujian semester',
                'details' => [
                    ['jenis_pembayaran_id' => 4, 'jumlah' => 150000, 'keterangan' => 'Biaya ujian semester ganjil'],
                ]
            ],
            [
                'siswa_id' => 7,
                'metode_pembayaran_id' => 4,
                'tanggal_pembayaran' => '2024-07-20',
                'status' => 'disetujui',
                'keterangan' => 'Gerak dan SPP',
                'details' => [
                    ['jenis_pembayaran_id' => 3, 'jumlah' => 300000, 'keterangan' => 'Seragam dan perlengkapan'],
                    ['jenis_pembayaran_id' => 2, 'jumlah' => 200000, 'keterangan' => 'SPP Juli 2024'],
                ]
            ],
            [
                'siswa_id' => 8,
                'metode_pembayaran_id' => 2,
                'tanggal_pembayaran' => '2025-01-28',
                'status' => 'ditolak',
                'keterangan' => 'SPP Januari - bukti transfer tidak valid',
                'details' => [
                    ['jenis_pembayaran_id' => 2, 'jumlah' => 200000, 'keterangan' => 'SPP bulan Januari 2025'],
                ]
            ],
            [
                'siswa_id' => 9,
                'metode_pembayaran_id' => 3,
                'tanggal_pembayaran' => '2024-12-01',
                'status' => 'disetujui',
                'keterangan' => 'SPP Desember',
                'details' => [
                    ['jenis_pembayaran_id' => 2, 'jumlah' => 200000, 'keterangan' => 'SPP bulan Desember 2024'],
                ]
            ],
            [
                'siswa_id' => 10,
                'metode_pembayaran_id' => 1,
                'tanggal_pembayaran' => '2025-01-12',
                'status' => 'pending',
                'keterangan' => 'Pembayaran PSB',
                'details' => [
                    ['jenis_pembayaran_id' => 1, 'jumlah' => 500000, 'keterangan' => 'PSB tahun ajaran 2025/2026'],
                ]
            ],
            [
                'siswa_id' => 2,
                'metode_pembayaran_id' => 2,
                'tanggal_pembayaran' => '2025-02-01',
                'status' => 'disetujui',
                'keterangan' => 'SPP Februari',
                'details' => [
                    ['jenis_pembayaran_id' => 2, 'jumlah' => 200000, 'keterangan' => 'SPP bulan Februari 2025'],
                ]
            ],
        ];

        foreach ($pembayaranData as $data) {
            $details = $data['details'];
            unset($data['details']);
            
            // Calculate total amount
            $totalJumlah = collect($details)->sum('jumlah');
            $data['jumlah'] = $totalJumlah;
            
            // Create pembayaran
            $pembayaran = Pembayaran::create($data);
            
            // Create detail pembayaran
            foreach ($details as $detail) {
                $detail['pembayaran_id'] = $pembayaran->id;
                DetailPembayaran::create($detail);
            }
        }
    }
}
