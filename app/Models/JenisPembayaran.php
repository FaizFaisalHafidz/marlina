<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JenisPembayaran extends Model
{
    use HasFactory;

    protected $table = 'jenis_pembayaran';

    protected $fillable = [
        'nama_jenis',
        'kode',
        'nominal_default',
        'is_wajib',
        'deskripsi',
        'is_active'
    ];

    protected $casts = [
        'nominal_default' => 'decimal:2',
        'is_wajib' => 'boolean',
        'is_active' => 'boolean'
    ];

    /**
     * Get the pembayaran for the jenis pembayaran.
     */
    public function pembayaran()
    {
        return $this->hasMany(Pembayaran::class, 'jenis_pembayaran_id');
    }

    /**
     * Scope for active payment types
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for mandatory payment types
     */
    public function scopeWajib($query)
    {
        return $query->where('is_wajib', true);
    }
}
