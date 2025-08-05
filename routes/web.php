<?php

use App\Http\Controllers\Admin\PembayaranController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SiswaController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('welcome');
// })->name('home');

Route::redirect('/', '/dashboard')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    
    // Admin Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('roles', RoleController::class);
        Route::resource('users', UserController::class);
        Route::resource('siswa', SiswaController::class);
        Route::resource('pembayaran', PembayaranController::class);
        
        // Additional routes for pembayaran
        Route::put('pembayaran/{pembayaran}/update-status', [PembayaranController::class, 'updateStatus'])
            ->name('pembayaran.update-status');

        // Status Pembayaran Routes
        Route::get('/status-pembayaran', [App\Http\Controllers\Admin\StatusPembayaranController::class, 'index'])
            ->name('status-pembayaran.index');
        Route::put('/status-pembayaran/{pembayaran}/update-status', [App\Http\Controllers\Admin\StatusPembayaranController::class, 'updateStatus'])
            ->name('status-pembayaran.update');
        Route::post('/status-pembayaran/bulk-update', [App\Http\Controllers\Admin\StatusPembayaranController::class, 'bulkUpdateStatus'])
            ->name('status-pembayaran.bulk-update');
        Route::get('/status-pembayaran/export', [App\Http\Controllers\Admin\StatusPembayaranController::class, 'export'])
            ->name('status-pembayaran.export');

        // Laporan Routes
        Route::get('/laporan-pemasukan', [App\Http\Controllers\Admin\LaporanPemasukanController::class, 'index'])
            ->name('laporan-pemasukan.index');
        Route::get('/laporan-pemasukan/export', [App\Http\Controllers\Admin\LaporanPemasukanController::class, 'export'])
            ->name('laporan-pemasukan.export');
        Route::get('/laporan-pengeluaran', [App\Http\Controllers\Admin\LaporanPengeluaranController::class, 'index'])
            ->name('laporan-pengeluaran.index');
        Route::get('/laporan-pengeluaran/export', [App\Http\Controllers\Admin\LaporanPengeluaranController::class, 'export'])
            ->name('laporan-pengeluaran.export');
    });

    // Bendahara Routes
    Route::prefix('bendahara')->name('bendahara.')->group(function () {
        // Status Pembayaran Routes
        Route::get('/status-pembayaran', [App\Http\Controllers\Bendahara\StatusPembayaranController::class, 'index'])
            ->name('status-pembayaran.index');
        Route::put('/status-pembayaran/{pembayaran}/update-status', [App\Http\Controllers\Bendahara\StatusPembayaranController::class, 'updateStatus'])
            ->name('status-pembayaran.update');
        Route::post('/status-pembayaran/bulk-update', [App\Http\Controllers\Bendahara\StatusPembayaranController::class, 'bulkUpdateStatus'])
            ->name('status-pembayaran.bulk-update');

        // Validasi Transaksi Routes
        Route::get('/validasi-transaksi', [App\Http\Controllers\Bendahara\ValidasiTransaksiController::class, 'index'])
            ->name('validasi-transaksi.index');
        Route::put('/validasi-transaksi/{pembayaran}/update-status', [App\Http\Controllers\Bendahara\ValidasiTransaksiController::class, 'updateStatus'])
            ->name('validasi-transaksi.update-status');
        Route::post('/validasi-transaksi/bulk-update', [App\Http\Controllers\Bendahara\ValidasiTransaksiController::class, 'bulkUpdateStatus'])
            ->name('validasi-transaksi.bulk-update');
        Route::get('/validasi-transaksi/export', [App\Http\Controllers\Bendahara\ValidasiTransaksiController::class, 'export'])
            ->name('validasi-transaksi.export');

        // Data Rekening Routes
        Route::get('/rekening', [App\Http\Controllers\Bendahara\RekeningController::class, 'index'])
            ->name('rekening.index');
        Route::post('/rekening', [App\Http\Controllers\Bendahara\RekeningController::class, 'store'])
            ->name('rekening.store');
        Route::put('/rekening/{rekening}', [App\Http\Controllers\Bendahara\RekeningController::class, 'update'])
            ->name('rekening.update');
        Route::delete('/rekening/{rekening}', [App\Http\Controllers\Bendahara\RekeningController::class, 'destroy'])
            ->name('rekening.destroy');
        Route::get('/rekening/export', [App\Http\Controllers\Bendahara\RekeningController::class, 'export'])
            ->name('rekening.export');

        // Laporan Routes
        Route::get('/laporan-pemasukan', [App\Http\Controllers\Bendahara\LaporanPemasukanController::class, 'index'])
            ->name('laporan-pemasukan.index');
        Route::get('/laporan-pemasukan/export', [App\Http\Controllers\Bendahara\LaporanPemasukanController::class, 'export'])
            ->name('laporan-pemasukan.export');
        Route::get('/laporan-pengeluaran', [App\Http\Controllers\Bendahara\LaporanPengeluaranController::class, 'index'])
            ->name('laporan-pengeluaran.index');
        Route::get('/laporan-pengeluaran/export', [App\Http\Controllers\Bendahara\LaporanPengeluaranController::class, 'export'])
            ->name('laporan-pengeluaran.export');
    });

    // Kepala Madrasah Routes
    Route::prefix('kepala')->name('kepala.')->group(function () {
        // Status Pembayaran Routes
        Route::get('/status-pembayaran', [App\Http\Controllers\Kepala\StatusPembayaranController::class, 'index'])
            ->name('status-pembayaran.index');
        Route::get('/status-pembayaran/export', [App\Http\Controllers\Kepala\StatusPembayaranController::class, 'export'])
            ->name('status-pembayaran.export');

        // Laporan Routes
        Route::get('/laporan-pemasukan', [App\Http\Controllers\Kepala\LaporanPemasukanController::class, 'index'])
            ->name('laporan-pemasukan.index');
        Route::get('/laporan-pemasukan/export', [App\Http\Controllers\Kepala\LaporanPemasukanController::class, 'export'])
            ->name('laporan-pemasukan.export');
        Route::get('/laporan-pengeluaran', [App\Http\Controllers\Kepala\LaporanPengeluaranController::class, 'index'])
            ->name('laporan-pengeluaran.index');
        Route::get('/laporan-pengeluaran/export', [App\Http\Controllers\Kepala\LaporanPengeluaranController::class, 'export'])
            ->name('laporan-pengeluaran.export');
    });

    // Siswa Routes
    Route::prefix('siswa')->name('siswa.')->group(function () {
        // Tagihan Routes
        Route::get('/tagihan', [App\Http\Controllers\Siswa\TagihanController::class, 'index'])
            ->name('tagihan.index');
        Route::post('/tagihan/bayar', [App\Http\Controllers\Siswa\TagihanController::class, 'bayar'])
            ->name('tagihan.bayar');

        // Riwayat Routes
        Route::get('/riwayat', [App\Http\Controllers\Siswa\RiwayatController::class, 'index'])
            ->name('riwayat.index');
        Route::get('/riwayat/{id}', [App\Http\Controllers\Siswa\RiwayatController::class, 'show'])
            ->name('riwayat.show');
        Route::get('/riwayat/{id}/download', [App\Http\Controllers\Siswa\RiwayatController::class, 'downloadReceipt'])
            ->name('riwayat.download');
        Route::get('/riwayat/export', [App\Http\Controllers\Siswa\RiwayatController::class, 'export'])
            ->name('riwayat.export');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
