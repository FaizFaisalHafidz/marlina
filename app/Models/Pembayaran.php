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
        'bukti_pembayaran', // New field for payment proof
        'jenis_pembayaran', // Direct field for payment type
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

    /**
     * Accessor untuk URL bukti pembayaran
     */
    public function getBuktiPembayaranUrlAttribute()
    {
        if ($this->bukti_pembayaran) {
            return asset('storage/' . $this->bukti_pembayaran);
        }
        return null;
    }

    /**
     * Check if payment has proof
     */
    public function hasProof(): bool
    {
        return !empty($this->bukti_pembayaran);
    }

    /**
     * Get status badge class
     */
    public function getStatusBadgeAttribute()
    {
        switch ($this->status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    /**
     * Get status text
     */
    public function getStatusTextAttribute()
    {
        switch ($this->status) {
            case 'pending':
                return 'Menunggu Validasi';
            case 'approved':
                return 'Disetujui';
            case 'rejected':
                return 'Ditolak';
            default:
                return ucfirst($this->status);
        }
    }
}
