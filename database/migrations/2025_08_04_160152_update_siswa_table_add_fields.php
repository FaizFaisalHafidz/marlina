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
        Schema::table('siswa', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->onDelete('set null');
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable()->after('nama');
            $table->string('tempat_lahir', 100)->nullable()->after('jenis_kelamin');
            $table->date('tanggal_lahir')->nullable()->after('tempat_lahir');
            $table->string('nama_ayah', 255)->nullable()->after('kelas');
            $table->string('nama_ibu', 255)->nullable()->after('nama_ayah');
            $table->text('alamat')->nullable()->after('nama_ibu');
            $table->string('no_hp', 20)->nullable()->after('alamat');
            $table->string('email', 255)->nullable()->after('no_hp');
            $table->string('foto', 255)->nullable()->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn([
                'user_id',
                'jenis_kelamin', 
                'tempat_lahir',
                'tanggal_lahir',
                'nama_ayah',
                'nama_ibu', 
                'alamat',
                'no_hp',
                'email',
                'foto'
            ]);
        });
    }
};
