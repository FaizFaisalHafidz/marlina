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
        // Create detail pembayaran table (pivot table)
        Schema::create('detail_pembayaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pembayaran_id')->constrained('pembayaran')->onDelete('cascade');
            $table->foreignId('jenis_pembayaran_id')->constrained('jenis_pembayaran')->onDelete('cascade');
            $table->decimal('jumlah', 15, 2);
            $table->text('keterangan')->nullable();
            $table->timestamps();
            
            $table->unique(['pembayaran_id', 'jenis_pembayaran_id']);
        });
        
        // Remove jenis_pembayaran_id from pembayaran table as it will be in detail
        Schema::table('pembayaran', function (Blueprint $table) {
            $table->dropForeign(['jenis_pembayaran_id']);
            $table->dropColumn('jenis_pembayaran_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back jenis_pembayaran_id to pembayaran table
        Schema::table('pembayaran', function (Blueprint $table) {
            $table->foreignId('jenis_pembayaran_id')->after('siswa_id')->constrained('jenis_pembayaran');
        });
        
        Schema::dropIfExists('detail_pembayaran');
    }
};
