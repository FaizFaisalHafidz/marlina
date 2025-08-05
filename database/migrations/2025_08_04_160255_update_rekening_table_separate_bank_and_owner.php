<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('rekening', function (Blueprint $table) {
            // Rename bank column to nama_bank
            $table->renameColumn('bank', 'nama_bank');
            // Add nama_penerima column
            $table->string('nama_penerima', 255)->after('nama_bank');
        });
        
        // Copy data from nama_pemilik to nama_penerima
        DB::statement('UPDATE rekening SET nama_penerima = nama_pemilik');
        
        // Drop the old nama_pemilik column
        Schema::table('rekening', function (Blueprint $table) {
            $table->dropColumn('nama_pemilik');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rekening', function (Blueprint $table) {
            $table->string('nama_pemilik', 255)->after('nama_penerima');
        });
        
        // Copy data back
        DB::statement('UPDATE rekening SET nama_pemilik = nama_penerima');
        
        Schema::table('rekening', function (Blueprint $table) {
            $table->dropColumn('nama_penerima');
            $table->renameColumn('nama_bank', 'bank');
        });
    }
};
