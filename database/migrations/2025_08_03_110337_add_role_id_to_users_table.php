<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->after('password')->nullable()->constrained('roles');
        });
        
        // Update existing users to have default role_id = 1 (Admin role)
        DB::table('users')->whereNull('role_id')->update(['role_id' => 1]);
        
        // Make role_id non-nullable after setting default values
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->after('password')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });
    }
};
