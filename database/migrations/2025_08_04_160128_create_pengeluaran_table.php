<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pengeluaran', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_transaksi', 50)->unique();
            $table->foreignId('kategori_pengeluaran_id')->constrained('kategori_pengeluaran');
            $table->date('tanggal_pengeluaran');
            $table->text('deskripsi');
            $table->decimal('jumlah', 15, 2);
            $table->enum('status', ['pending', 'disetujui', 'ditolak'])->default('pending');
            $table->enum('metode_pembayaran', ['tunai', 'transfer', 'cek', 'lainnya'])->default('tunai');
            $table->string('penerima', 255)->nullable();
            $table->string('nomor_kwitansi', 100)->nullable();
            $table->text('keterangan')->nullable();
            $table->string('bukti_pembayaran', 255)->nullable();
            $table->foreignId('diajukan_oleh')->constrained('users');
            $table->foreignId('disetujui_oleh')->nullable()->constrained('users');
            $table->timestamp('tanggal_disetujui')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengeluaran');
    }
};
