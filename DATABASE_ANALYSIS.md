# Analisis dan Rancangan Database untuk Sistem Laporan Sekolah

## 1. Analisis Struktur Database Saat Ini

Berdasarkan rancangan database yang sudah ada, kita memiliki:

### Tabel yang Sudah Ada:
- **roles** - Role pengguna (Admin, Bendahara, Kepala, Orang Tua)
- **users** - Data pengguna sistem
- **siswa** - Data siswa dengan NISN, nama, kelas, dll
- **rekening** - Data rekening bank untuk pembayaran
- **pembayaran** - Data pembayaran siswa (pemasukan)

### Status Saat Ini:
✅ **Laporan Pemasukan**: Sudah dapat menggunakan data dari tabel `pembayaran` yang statusnya 'disetujui'
❌ **Laporan Pengeluaran**: Belum ada tabel untuk data pengeluaran (masih menggunakan mock data)

## 2. Tabel Tambahan yang Diperlukan

### 2.1 Tabel `kategori_pengeluaran`
Untuk mengkategorikan jenis-jenis pengeluaran sekolah.

```sql
CREATE TABLE kategori_pengeluaran (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL
);
```

**Data Kategori yang Disarankan:**
- Gaji dan Tunjangan
- Operasional Sekolah
- Pemeliharaan Fasilitas
- Kegiatan Pembelajaran
- Kegiatan Ekstrakurikuler
- Administrasi dan ATK
- Transportasi
- Konsumsi/Catering
- Pengembangan SDM
- Lainnya

### 2.2 Tabel `pengeluaran`
Untuk mencatat semua pengeluaran sekolah.

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
    diajukan_oleh BIGINT UNSIGNED,
    disetujui_oleh BIGINT UNSIGNED,
    tanggal_disetujui TIMESTAMP NULL,
    bukti_pembayaran VARCHAR(255), -- path file bukti
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    
    FOREIGN KEY (kategori_pengeluaran_id) REFERENCES kategori_pengeluaran(id),
    FOREIGN KEY (diajukan_oleh) REFERENCES users(id),
    FOREIGN KEY (disetujui_oleh) REFERENCES users(id)
);
```

### 2.3 Tabel `anggaran` (Opsional - untuk fitur advanced)
Untuk perencanaan dan kontrol anggaran sekolah.

```sql
CREATE TABLE anggaran (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tahun_anggaran YEAR NOT NULL,
    kategori_pengeluaran_id BIGINT UNSIGNED NOT NULL,
    jumlah_anggaran DECIMAL(15,2) NOT NULL,
    jumlah_terpakai DECIMAL(15,2) DEFAULT 0,
    status ENUM('draft', 'aktif', 'selesai') DEFAULT 'draft',
    keterangan TEXT,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    
    FOREIGN KEY (kategori_pengeluaran_id) REFERENCES kategori_pengeluaran(id),
    UNIQUE KEY unique_anggaran (tahun_anggaran, kategori_pengeluaran_id)
);
```

## 3. Model dan Relasi yang Diperlukan

### 3.1 Model KategoriPengeluaran
```php
class KategoriPengeluaran extends Model
{
    protected $table = 'kategori_pengeluaran';
    
    protected $fillable = [
        'nama_kategori',
        'deskripsi',
        'is_active'
    ];
    
    public function pengeluaran()
    {
        return $this->hasMany(Pengeluaran::class);
    }
    
    public function anggaran()
    {
        return $this->hasMany(Anggaran::class);
    }
}
```

### 3.2 Model Pengeluaran
```php
class Pengeluaran extends Model
{
    protected $table = 'pengeluaran';
    
    protected $fillable = [
        'nomor_transaksi',
        'kategori_pengeluaran_id',
        'tanggal_pengeluaran',
        'deskripsi',
        'jumlah',
        'status',
        'metode_pembayaran',
        'penerima',
        'nomor_kwitansi',
        'keterangan',
        'diajukan_oleh',
        'disetujui_oleh',
        'tanggal_disetujui',
        'bukti_pembayaran'
    ];
    
    protected $casts = [
        'tanggal_pengeluaran' => 'date',
        'tanggal_disetujui' => 'datetime',
        'jumlah' => 'decimal:2'
    ];
    
    public function kategori()
    {
        return $this->belongsTo(KategoriPengeluaran::class, 'kategori_pengeluaran_id');
    }
    
    public function pengaju()
    {
        return $this->belongsTo(User::class, 'diajukan_oleh');
    }
    
    public function penyetuju()
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }
}
```

### 3.3 Model Anggaran
```php
class Anggaran extends Model
{
    protected $table = 'anggaran';
    
    protected $fillable = [
        'tahun_anggaran',
        'kategori_pengeluaran_id',
        'jumlah_anggaran',
        'jumlah_terpakai',
        'status',
        'keterangan'
    ];
    
    protected $casts = [
        'jumlah_anggaran' => 'decimal:2',
        'jumlah_terpakai' => 'decimal:2'
    ];
    
    public function kategori()
    {
        return $this->belongsTo(KategoriPengeluaran::class, 'kategori_pengeluaran_id');
    }
}
```

## 4. Fitur Laporan yang Dapat Diimplementasikan

### 4.1 Laporan Pemasukan (Sudah Ada Data)
- ✅ Total pemasukan per periode
- ✅ Breakdown per kelas
- ✅ Breakdown per bank/rekening
- ✅ Trend bulanan
- ✅ Status pembayaran

### 4.2 Laporan Pengeluaran (Setelah Tabel Ditambahkan)
- Total pengeluaran per periode
- Breakdown per kategori
- Comparison dengan anggaran (jika tabel anggaran dibuat)
- Status persetujuan
- Trend bulanan
- Top 10 pengeluaran terbesar

### 4.3 Laporan Keuangan Komprehensif
- **Cash Flow**: Pemasukan vs Pengeluaran
- **Profit/Loss**: Saldo bersih per periode
- **Budget Variance**: Realisasi vs Anggaran
- **Financial Ratios**: Various financial metrics

## 5. Menu dan Hak Akses

### Role-based Access:
- **Admin**: Full access ke semua laporan dan data
- **Bendahara**: 
  - Input dan approval pengeluaran
  - View laporan keuangan
  - Manage rekening
- **Kepala Madrasah**: 
  - View-only laporan untuk monitoring
  - Approval pengeluaran besar (>threshold tertentu)
- **Orang Tua**: 
  - View laporan pembayaran anaknya saja

## 6. Implementasi Bertahap

### Phase 1: Tabel Pengeluaran Dasar
1. Buat migration untuk `kategori_pengeluaran` dan `pengeluaran`
2. Buat model dan relasi
3. Update LaporanPengeluaranController untuk menggunakan data real
4. Buat seeder untuk data kategori dan sample pengeluaran

### Phase 2: CRUD Pengeluaran
1. Buat halaman input pengeluaran
2. Workflow approval
3. Upload bukti pembayaran

### Phase 3: Advanced Features
1. Tabel anggaran
2. Budget comparison
3. Advanced analytics
4. Export ke Excel/PDF

## 7. Sample Seeder Data

### Kategori Pengeluaran:
```php
KategoriPengeluaran::create(['nama_kategori' => 'Gaji dan Tunjangan']);
KategoriPengeluaran::create(['nama_kategori' => 'Operasional Sekolah']);
KategoriPengeluaran::create(['nama_kategori' => 'Pemeliharaan Fasilitas']);
// ... dst
```

### Sample Pengeluaran:
```php
Pengeluaran::create([
    'nomor_transaksi' => 'PGL-2024-001',
    'kategori_pengeluaran_id' => 1,
    'tanggal_pengeluaran' => '2024-07-15',
    'deskripsi' => 'Gaji guru bulan Juli 2024',
    'jumlah' => 15000000,
    'status' => 'disetujui',
    'diajukan_oleh' => 2, // bendahara
    'disetujui_oleh' => 1  // admin
]);
```

## 8. Keuntungan Implementasi

1. **Data Integrity**: Menggunakan foreign key dan validasi
2. **Audit Trail**: Track siapa yang input dan approve
3. **Scalability**: Mudah ditambah fitur baru
4. **Reporting**: Data real untuk analytics
5. **Compliance**: Dokumentasi lengkap untuk audit

## 9. Kesimpulan

Untuk melengkapi sistem laporan, minimal diperlukan:
1. ✅ **Tabel `kategori_pengeluaran`** - Wajib
2. ✅ **Tabel `pengeluaran`** - Wajib  
3. ⚡ **Tabel `anggaran`** - Opsional (advanced feature)

Dengan penambahan 2 tabel wajib, sistem laporan akan dapat menggunakan data real dan memberikan insights yang akurat untuk manajemen keuangan sekolah.
