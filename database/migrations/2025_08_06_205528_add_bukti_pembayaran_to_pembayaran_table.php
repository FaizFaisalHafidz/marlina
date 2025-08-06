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
            $table->string('bukti_pembayaran')->nullable()->after('bukti_transfer');
            $table->string('jenis_pembayaran')->nullable()->after('metode_pembayaran_id');
            $table->string('metode_pembayaran')->nullable()->after('jenis_pembayaran');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pembayaran', function (Blueprint $table) {
            $table->dropColumn(['bukti_pembayaran', 'jenis_pembayaran', 'metode_pembayaran']);
        });
    }
};
