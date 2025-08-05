<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rekening extends Model
{
    protected $table = 'rekening';

    protected $fillable = [
        'nama_bank',
        'nomor_rekening',
        'nama_penerima',
    ];

    /**
     * Relasi ke model Pembayaran
     */
    public function pembayaran(): HasMany
    {
        return $this->hasMany(Pembayaran::class, 'metode_pembayaran_id');
    }
}
