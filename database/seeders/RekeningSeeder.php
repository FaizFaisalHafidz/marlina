<?php

namespace Database\Seeders;

use App\Models\Rekening;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RekeningSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rekeningData = [
            [
                'nama_bank' => 'Bank BCA',
                'nomor_rekening' => '1234567890',
                'nama_penerima' => 'Yayasan AD-DIMIYATI',
            ],
            [
                'nama_bank' => 'Bank Mandiri',
                'nomor_rekening' => '0987654321',
                'nama_penerima' => 'Yayasan AD-DIMIYATI',
            ],
            [
                'nama_bank' => 'Bank BRI',
                'nomor_rekening' => '5555666677',
                'nama_penerima' => 'AD-DIMIYATI SCHOOL',
            ],
            [
                'nama_bank' => 'Bank BNI',
                'nomor_rekening' => '1111222233',
                'nama_penerima' => 'AD-DIMIYATI SCHOOL',
            ],
        ];

        foreach ($rekeningData as $data) {
            Rekening::create($data);
        }
    }
}
