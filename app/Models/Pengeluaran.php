<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengeluaran extends Model
{
    use HasFactory;

    protected $table = 'pengeluaran';

    protected $fillable = [
        'nomor_transaksi',
        'kategori_pengeluaran_id',
        'tanggal_pengeluaran',
        'deskripsi',
        'jumlah',
        'status',
        'metode_pembayaran',
        'penerima',
        'nomor_kwitansi',
        'keterangan',
        'bukti_pembayaran',
        'diajukan_oleh',
        'disetujui_oleh',
        'tanggal_disetujui'
    ];

    protected $casts = [
        'tanggal_pengeluaran' => 'date',
        'tanggal_disetujui' => 'datetime',
        'jumlah' => 'decimal:2'
    ];

    /**
     * Get the kategori that owns the pengeluaran.
     */
    public function kategori()
    {
        return $this->belongsTo(KategoriPengeluaran::class, 'kategori_pengeluaran_id');
    }

    /**
     * Get the user who submitted the expense.
     */
    public function pengaju()
    {
        return $this->belongsTo(User::class, 'diajukan_oleh');
    }

    /**
     * Get the user who approved the expense.
     */
    public function penyetuju()
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }

    /**
     * Scope for approved expenses
     */
    public function scopeDisetujui($query)
    {
        return $query->where('status', 'disetujui');
    }

    /**
     * Scope for pending expenses
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for rejected expenses
     */
    public function scopeDitolak($query)
    {
        return $query->where('status', 'ditolak');
    }
}
