# Analisis Kekurangan Database dan Rancangan Perbaikan

## 1. Analisis Berdasarkan Mockup/Gambar Interface

### Berdasarkan gambar-gambar yang diberikan, saya menemukan beberapa field yang hilang:

### 1.1 Tabel `siswa` - Kekurangan Field
**Dari Gambar "Data Siswa" terlihat kolom:**
- ✅ No (auto increment)
- ✅ Nama 
- ✅ JK (Jenis Kelamin) - **HILANG**
- ✅ Kelas
- ✅ Nama Ayah - **HILANG**
- ✅ Nama Ibu - **HILANG**
- ✅ Email - **HILANG**
- ✅ No HP - **HILANG** 
- ✅ Alamat - **HILANG**
- ✅ Aksi

**Kekurangan Lainnya:**
- `user_id` untuk login siswa - **HILANG**
- `tanggal_lahir` - **HILANG**
- `tempat_lahir` - **HILANG**
- `foto` - **HILANG**

### 1.2 Tabel `pembayaran` - Kekurangan Field
**Dari Gambar "Data Pembayaran" terlihat kolom:**
- ✅ No
- ✅ Nama (dari relasi siswa)
- ✅ Kelas (dari relasi siswa)
- ✅ PSB (Jenis Pembayaran) - **HILANG**
- ✅ SPP (Jenis Pembayaran) - **HILANG** 
- ✅ Gerak (Jenis Pembayaran) - **HILANG**
- ✅ Ujian (Jenis Pembayaran) - **HILANG**
- ✅ Jumlah
- ✅ Aksi

**Analisis:** Perlu tabel `jenis_pembayaran` dan field `jenis_pembayaran_id`

### 1.3 Tabel `rekening` - Kekurangan Field  
**Dari Gambar "Data Rekening" terlihat:**
- ✅ No
- ✅ Nama Rekening (nama penerima, bukan bank)
- ✅ No Rekening
- ✅ Aksi

**Kekurangan:** Field `nama_bank` terpisah dari `nama_pemilik`

### 1.4 Tabel Status Pembayaran
**Dari Gambar "Status Pembayaran" terlihat:**
- ✅ No
- ✅ Nama
- ✅ Kelas  
- ✅ Jumlah Tunggakan
- ✅ Status

**Analisis:** Ini adalah view/summary dari pembayaran, tidak perlu tabel terpisah.

### 1.5 Halaman Transaksi (untuk Siswa)
**Dari Gambar "Tagihan" dan "Riwayat Transaksi":**
- Siswa perlu bisa login dan melihat tagihan mereka
- Perlu tabel `tagihan` atau view yang menampilkan kewajiban pembayaran

## 2. Rancangan Perbaikan Database

### 2.1 Migration: Tambahkan field di tabel `siswa`

```sql
ALTER TABLE siswa ADD COLUMN (
    user_id BIGINT UNSIGNED NULL,
    jenis_kelamin ENUM('L', 'P') NOT NULL,
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    nama_ayah VARCHAR(255),
    nama_ibu VARCHAR(255),
    alamat TEXT,
    no_hp VARCHAR(20),
    email VARCHAR(255),
    foto VARCHAR(255),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### 2.2 Migration: Perbaiki tabel `rekening`

```sql
ALTER TABLE rekening 
CHANGE COLUMN bank nama_bank VARCHAR(100) NOT NULL,
ADD COLUMN nama_penerima VARCHAR(255) NOT NULL AFTER nama_bank;

-- Update existing data
UPDATE rekening SET nama_penerima = nama_pemilik;

-- Drop old column
ALTER TABLE rekening DROP COLUMN nama_pemilik;
```

### 2.3 Migration: Buat tabel `jenis_pembayaran`

```sql
CREATE TABLE jenis_pembayaran (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama_jenis VARCHAR(100) NOT NULL,
    kode VARCHAR(20) NOT NULL UNIQUE,
    nominal_default DECIMAL(10,2) DEFAULT 0,
    is_wajib BOOLEAN DEFAULT TRUE,
    deskripsi TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL
);

-- Data default
INSERT INTO jenis_pembayaran (nama_jenis, kode, nominal_default) VALUES
('Penerimaan Siswa Baru', 'PSB', 500000),
('Sumbangan Pembinaan Pendidikan', 'SPP', 200000),
('Seragam dan Perlengkapan', 'GERAK', 300000),
('Ujian Semester', 'UJIAN', 150000);
```

### 2.4 Migration: Update tabel `pembayaran`

```sql
ALTER TABLE pembayaran 
ADD COLUMN jenis_pembayaran_id BIGINT UNSIGNED NOT NULL AFTER siswa_id,
ADD COLUMN keterangan TEXT AFTER status,
ADD COLUMN bukti_transfer VARCHAR(255) AFTER keterangan,
ADD COLUMN divalidasi_oleh BIGINT UNSIGNED NULL AFTER bukti_transfer,
ADD COLUMN tanggal_validasi TIMESTAMP NULL AFTER divalidasi_oleh,

ADD FOREIGN KEY (jenis_pembayaran_id) REFERENCES jenis_pembayaran(id),
ADD FOREIGN KEY (divalidasi_oleh) REFERENCES users(id);
```

### 2.5 Migration: Buat tabel `kategori_pengeluaran`

```sql
CREATE TABLE kategori_pengeluaran (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL,
    kode VARCHAR(20) NOT NULL UNIQUE,
    deskripsi TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL
);

-- Data default  
INSERT INTO kategori_pengeluaran (nama_kategori, kode) VALUES
('Gaji dan Tunjangan', 'GAJI'),
('Operasional Sekolah', 'OPS'),
('Pemeliharaan Fasilitas', 'MAINTAIN'),
('Kegiatan Pembelajaran', 'BELAJAR'),
('Kegiatan Ekstrakurikuler', 'EKSKUL'),
('Administrasi dan ATK', 'ADM'),
('Konsumsi', 'KONSUMSI'),
('Lainnya', 'LAIN');
```

### 2.6 Migration: Buat tabel `pengeluaran`

```sql
CREATE TABLE pengeluaran (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nomor_transaksi VARCHAR(50) UNIQUE NOT NULL,
    kategori_pengeluaran_id BIGINT UNSIGNED NOT NULL,
    tanggal_pengeluaran DATE NOT NULL,
    deskripsi TEXT NOT NULL,
    jumlah DECIMAL(15,2) NOT NULL,
    status ENUM('pending', 'disetujui', 'ditolak') DEFAULT 'pending',
    metode_pembayaran ENUM('tunai', 'transfer', 'cek', 'lainnya') DEFAULT 'tunai',
    penerima VARCHAR(255),
    nomor_kwitansi VARCHAR(100),
    keterangan TEXT,
    bukti_pembayaran VARCHAR(255),
    diajukan_oleh BIGINT UNSIGNED NOT NULL,
    disetujui_oleh BIGINT UNSIGNED NULL,
    tanggal_disetujui TIMESTAMP NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    
    FOREIGN KEY (kategori_pengeluaran_id) REFERENCES kategori_pengeluaran(id),
    FOREIGN KEY (diajukan_oleh) REFERENCES users(id),
    FOREIGN KEY (disetujui_oleh) REFERENCES users(id)
);
```

### 2.7 Migration: Update tabel `users` untuk role siswa

```sql
ALTER TABLE users 
ADD COLUMN role_id BIGINT UNSIGNED NOT NULL DEFAULT 4 AFTER email,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER role_id,
ADD COLUMN last_login TIMESTAMP NULL AFTER is_active,

ADD FOREIGN KEY (role_id) REFERENCES roles(id);

-- Insert role Siswa jika belum ada
INSERT IGNORE INTO roles (nama_role) VALUES ('Siswa');
```

## 3. View untuk Laporan dan Dashboard

### 3.1 View: Tagihan Siswa
```sql
CREATE VIEW view_tagihan_siswa AS
SELECT 
    s.id as siswa_id,
    s.nama,
    s.nisn,
    s.kelas,
    jp.id as jenis_pembayaran_id,
    jp.nama_jenis,
    jp.kode,
    jp.nominal_default,
    COALESCE(p.jumlah, 0) as jumlah_dibayar,
    CASE 
        WHEN p.id IS NULL THEN 'belum_bayar'
        WHEN p.status = 'pending' THEN 'pending'
        WHEN p.status = 'disetujui' THEN 'lunas'
        WHEN p.status = 'ditolak' THEN 'ditolak'
    END as status_pembayaran,
    (jp.nominal_default - COALESCE(p.jumlah, 0)) as sisa_tagihan
FROM siswa s
CROSS JOIN jenis_pembayaran jp
LEFT JOIN pembayaran p ON s.id = p.siswa_id 
    AND jp.id = p.jenis_pembayaran_id 
    AND p.status = 'disetujui'
WHERE jp.is_active = TRUE
ORDER BY s.nama, jp.nama_jenis;
```

### 3.2 View: Ringkasan Keuangan
```sql
CREATE VIEW view_ringkasan_keuangan AS
SELECT 
    DATE_FORMAT(tanggal, '%Y-%m') as periode,
    SUM(CASE WHEN tipe = 'pemasukan' THEN jumlah ELSE 0 END) as total_pemasukan,
    SUM(CASE WHEN tipe = 'pengeluaran' THEN jumlah ELSE 0 END) as total_pengeluaran,
    (SUM(CASE WHEN tipe = 'pemasukan' THEN jumlah ELSE 0 END) - 
     SUM(CASE WHEN tipe = 'pengeluaran' THEN jumlah ELSE 0 END)) as saldo_bersih
FROM (
    SELECT tanggal_pembayaran as tanggal, jumlah, 'pemasukan' as tipe 
    FROM pembayaran WHERE status = 'disetujui'
    UNION ALL
    SELECT tanggal_pengeluaran as tanggal, jumlah, 'pengeluaran' as tipe 
    FROM pengeluaran WHERE status = 'disetujui'
) as transaksi
GROUP BY DATE_FORMAT(tanggal, '%Y-%m')
ORDER BY periode DESC;
```

## 4. Seed Data yang Diperlukan

### 4.1 Update RoleSeeder
```php
// Tambahkan role Siswa
Role::create(['nama_role' => 'Siswa']);
```

### 4.2 SiswaSeeder dengan user_id
```php
// Buat user untuk setiap siswa
$user = User::create([
    'name' => $siswa['nama'],
    'email' => $siswa['email'],
    'password' => Hash::make('password'),
    'role_id' => 4 // Role Siswa
]);

$siswa['user_id'] = $user->id;
```

## 5. Urutan Implementasi

### Phase 1: Core Database Updates
1. ✅ Migration untuk jenis_pembayaran
2. ✅ Migration untuk kategori_pengeluaran  
3. ✅ Migration untuk pengeluaran
4. ✅ Update migration siswa (tambah field)
5. ✅ Update migration rekening (pisah bank dan penerima)
6. ✅ Update migration pembayaran (tambah jenis_pembayaran_id)
7. ✅ Update migration users (tambah role_id)

### Phase 2: Seed Data
1. ✅ Seed jenis_pembayaran
2. ✅ Seed kategori_pengeluaran
3. ✅ Update siswa seeder dengan data lengkap
4. ✅ Buat user untuk siswa

### Phase 3: Models & Relations
1. ✅ Update model Siswa dengan relasi User
2. ✅ Buat model JenisPembayaran
3. ✅ Buat model KategoriPengeluaran
4. ✅ Buat model Pengeluaran
5. ✅ Update relasi di semua model

### Phase 4: Controllers & Views
1. ✅ Update controller pembayaran dengan jenis
2. ✅ Update laporan controller dengan data real
3. ✅ Buat controller pengeluaran CRUD
4. ✅ Update interface siswa untuk login

## 6. Kesimpulan

**Field yang Hilang dan Perlu Ditambahkan:**

### Tabel `siswa`:
- `user_id`, `jenis_kelamin`, `tempat_lahir`, `tanggal_lahir`
- `nama_ayah`, `nama_ibu`, `alamat`, `no_hp`, `email`, `foto`

### Tabel `rekening`:
- Pisah `bank` menjadi `nama_bank` dan `nama_penerima`

### Tabel `pembayaran`:
- `jenis_pembayaran_id`, `keterangan`, `bukti_transfer`
- `divalidasi_oleh`, `tanggal_validasi`

### Tabel Baru:
- `jenis_pembayaran` (PSB, SPP, GERAK, UJIAN)
- `kategori_pengeluaran` (Gaji, Operasional, dll)
- `pengeluaran` (untuk laporan pengeluaran real)

**Dengan perbaikan ini, sistem akan:**
1. ✅ Siswa bisa login dan melihat tagihan
2. ✅ Pembayaran dikategorikan (PSB, SPP, dll)  
3. ✅ Laporan menggunakan data real, bukan mock
4. ✅ Rekening memiliki info bank dan penerima terpisah
5. ✅ Pengeluaran terkategorisasi dan dapat divalidasi
