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
        Schema::table('pembayaran', function (Blueprint $table) {
            $table->foreignId('jenis_pembayaran_id')->after('siswa_id')->constrained('jenis_pembayaran');
            $table->text('keterangan')->nullable()->after('status');
            $table->string('bukti_transfer', 255)->nullable()->after('keterangan');
            $table->foreignId('divalidasi_oleh')->nullable()->after('bukti_transfer')->constrained('users');
            $table->timestamp('tanggal_validasi')->nullable()->after('divalidasi_oleh');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pembayaran', function (Blueprint $table) {
            $table->dropForeign(['jenis_pembayaran_id']);
            $table->dropForeign(['divalidasi_oleh']);
            $table->dropColumn([
                'jenis_pembayaran_id',
                'keterangan',
                'bukti_transfer',
                'divalidasi_oleh',
                'tanggal_validasi'
            ]);
        });
    }
};
