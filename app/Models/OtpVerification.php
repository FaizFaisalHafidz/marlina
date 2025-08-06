<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class OtpVerification extends Model
{
    protected $fillable = [
        'phone_number',
        'otp_code',
        'expires_at',
        'is_verified',
        'verified_at',
        'attempts'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'verified_at' => 'datetime',
        'is_verified' => 'boolean'
    ];

    /**
     * Generate random OTP code
     */
    public static function generateOTP()
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Check if OTP is expired
     */
    public function isExpired()
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if OTP is valid
     */
    public function isValid()
    {
        return !$this->is_verified && !$this->isExpired() && $this->attempts < 3;
    }

    /**
     * Mark as verified
     */
    public function markAsVerified()
    {
        $this->update([
            'is_verified' => true,
            'verified_at' => now()
        ]);
    }

    /**
     * Increment attempts
     */
    public function incrementAttempts()
    {
        $this->increment('attempts');
    }

    /**
     * Create new OTP for phone number
     */
    public static function createForPhone($phoneNumber)
    {
        // Clean existing unverified OTPs for this phone
        static::where('phone_number', $phoneNumber)
            ->where('is_verified', false)
            ->delete();

        return static::create([
            'phone_number' => $phoneNumber,
            'otp_code' => static::generateOTP(),
            'expires_at' => Carbon::now()->addMinutes(5), // 5 minutes expiry
            'attempts' => 0
        ]);
    }
}
