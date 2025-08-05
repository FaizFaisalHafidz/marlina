<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Pembayaran extends Model
{
    protected $table = 'pembayaran';

    protected $fillable = [
        'siswa_id',
        'jumlah',
        'tanggal_pembayaran',
        'status',
        'metode_pembayaran_id',
        'keterangan',
        'bukti_transfer',
        'divalidasi_oleh',
        'tanggal_validasi',
    ];

    protected $casts = [
        'tanggal_pembayaran' => 'date',
        'tanggal_validasi' => 'datetime',
        'jumlah' => 'decimal:2',
    ];

    /**
     * Relasi ke model Siswa
     */
    public function siswa(): BelongsTo
    {
        return $this->belongsTo(Siswa::class);
    }

    /**
     * Relasi ke detail pembayaran (many-to-many dengan jenis pembayaran)
     */
    public function details(): HasMany
    {
        return $this->hasMany(DetailPembayaran::class);
    }

    /**
     * Relasi ke jenis pembayaran melalui detail pembayaran
     */
    public function jenisPembayaran(): BelongsToMany
    {
        return $this->belongsToMany(JenisPembayaran::class, 'detail_pembayaran')
            ->withPivot('jumlah', 'keterangan')
            ->withTimestamps();
    }

    /**
     * Relasi ke model Rekening (sebagai metode pembayaran)
     */
    public function metodePembayaran(): BelongsTo
    {
        return $this->belongsTo(Rekening::class, 'metode_pembayaran_id');
    }

    /**
     * Relasi ke model Rekening (alias untuk backward compatibility)
     */
    public function rekening(): BelongsTo
    {
        return $this->belongsTo(Rekening::class, 'metode_pembayaran_id');
    }

    /**
     * Relasi ke User yang memvalidasi pembayaran
     */
    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'divalidasi_oleh');
    }
}
