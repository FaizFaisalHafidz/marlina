<?php

namespace Database\Seeders;

use App\Models\Siswa;
use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SiswaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get role siswa ID
        $roleSiswa = Role::where('nama_role', 'Siswa')->first();
        
        $siswaData = [
            [
                'nama' => 'Ahmad Fauzi',
                'jenis_kelamin' => 'L',
                'tempat_lahir' => 'Jakarta',
                'tanggal_lahir' => '2008-03-15',
                'nisn' => '2024001',
                'kelas' => 'X IPA 1',
                'nama_ayah' => 'Budi Fauzi',
                'nama_ibu' => 'Sari Wulandari',
                'alamat' => 'Jl. Merdeka No. 123, Jakarta Selatan',
                'no_hp' => '081234567001',
                'email' => 'ahmad.fauzi@student.madrasah.com',
            ],
            [
                'nama' => 'Siti Nurhaliza',
                'jenis_kelamin' => 'P',
                'tempat_lahir' => 'Bandung',
                'tanggal_lahir' => '2008-07-22',
                'nisn' => '2024002',
                'kelas' => 'X IPA 1',
                'nama_ayah' => 'Ahmad Nurdin',
                'nama_ibu' => 'Haliza Sari',
                'alamat' => 'Jl. Sudirman No. 45, Bandung',
                'no_hp' => '081234567002',
                'email' => 'siti.nurhaliza@student.madrasah.com',
            ],
            [
                'nama' => 'Muhammad Rizki',
                'jenis_kelamin' => 'L',
                'tempat_lahir' => 'Surabaya',
                'tanggal_lahir' => '2008-11-10',
                'nisn' => '2024003',
                'kelas' => 'X IPS 1',
                'nama_ayah' => 'Rizky Pratama',
                'nama_ibu' => 'Dewi Sartika',
                'alamat' => 'Jl. Pahlawan No. 67, Surabaya',
                'no_hp' => '081234567003',
                'email' => 'muhammad.rizki@student.madrasah.com',
            ],
            [
                'nama' => 'Dewi Lestari',
                'jenis_kelamin' => 'P',
                'tempat_lahir' => 'Yogyakarta',
                'tanggal_lahir' => '2008-05-18',
                'nisn' => '2024004',
                'kelas' => 'X IPS 1',
                'nama_ayah' => 'Bambang Lestari',
                'nama_ibu' => 'Indira Sari',
                'alamat' => 'Jl. Malioboro No. 89, Yogyakarta',
                'no_hp' => '081234567004',
                'email' => 'dewi.lestari@student.madrasah.com',
            ],
            [
                'nama' => 'Andi Pratama',
                'jenis_kelamin' => 'L',
                'tempat_lahir' => 'Makassar',
                'tanggal_lahir' => '2007-09-25',
                'nisn' => '2024005',
                'kelas' => 'XI IPA 1',
                'nama_ayah' => 'Andi Wijaya',
                'nama_ibu' => 'Sitti Aminah',
                'alamat' => 'Jl. Veteran No. 12, Makassar',
                'no_hp' => '081234567005',
                'email' => 'andi.pratama@student.madrasah.com',
            ],
            [
                'nama' => 'Rina Kartika',
                'jenis_kelamin' => 'P',
                'tempat_lahir' => 'Medan',
                'tanggal_lahir' => '2007-12-08',
                'nisn' => '2024006',
                'kelas' => 'XI IPA 2',
                'nama_ayah' => 'Kartika Wijaya',
                'nama_ibu' => 'Rina Sari',
                'alamat' => 'Jl. Gatot Subroto No. 34, Medan',
                'no_hp' => '081234567006',
                'email' => 'rina.kartika@student.madrasah.com',
            ],
            [
                'nama' => 'Dian Permata',
                'jenis_kelamin' => 'P',
                'tempat_lahir' => 'Semarang',
                'tanggal_lahir' => '2007-04-14',
                'nisn' => '2024007',
                'kelas' => 'XI IPS 1',
                'nama_ayah' => 'Permata Hadi',
                'nama_ibu' => 'Dian Sari',
                'alamat' => 'Jl. Pemuda No. 56, Semarang',
                'no_hp' => '081234567007',
                'email' => 'dian.permata@student.madrasah.com',
            ],
            [
                'nama' => 'Fajar Ramadhan',
                'jenis_kelamin' => 'L',
                'tempat_lahir' => 'Palembang',
                'tanggal_lahir' => '2006-08-30',
                'nisn' => '2024008',
                'kelas' => 'XII IPA 1',
                'nama_ayah' => 'Ramadhan Fajar',
                'nama_ibu' => 'Siti Fajar',
                'alamat' => 'Jl. Sudirman No. 78, Palembang',
                'no_hp' => '081234567008',
                'email' => 'fajar.ramadhan@student.madrasah.com',
            ],
            [
                'nama' => 'Maya Sari',
                'jenis_kelamin' => 'P',
                'tempat_lahir' => 'Denpasar',
                'tanggal_lahir' => '2006-06-12',
                'nisn' => '2024009',
                'kelas' => 'XII IPA 2',
                'nama_ayah' => 'Made Sari',
                'nama_ibu' => 'Kadek Maya',
                'alamat' => 'Jl. Gajah Mada No. 90, Denpasar',
                'no_hp' => '081234567009',
                'email' => 'maya.sari@student.madrasah.com',
            ],
            [
                'nama' => 'Rendi Saputra',
                'jenis_kelamin' => 'L',
                'tempat_lahir' => 'Pontianak',
                'tanggal_lahir' => '2006-10-05',
                'nisn' => '2024010',
                'kelas' => 'XII IPS 1',
                'nama_ayah' => 'Saputra Rendi',
                'nama_ibu' => 'Wati Indah',
                'alamat' => 'Jl. Ahmad Yani No. 112, Pontianak',
                'no_hp' => '081234567010',
                'email' => 'rendi.saputra@student.madrasah.com',
            ],
        ];

        foreach ($siswaData as $data) {
            // Create user account for each student
            $user = User::create([
                'name' => $data['nama'],
                'email' => $data['email'],
                'password' => Hash::make('password123'),
                'role_id' => $roleSiswa->id,
                'email_verified_at' => now(),
            ]);

            // Create siswa with user_id
            $data['user_id'] = $user->id;
            Siswa::create($data);
        }
    }
}
