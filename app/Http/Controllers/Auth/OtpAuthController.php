<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\OtpVerification;
use App\Models\Siswa;
use App\Services\WablasService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OtpAuthController extends Controller
{
    private $wablasService;

    public function __construct(WablasService $wablasService)
    {
        $this->wablasService = $wablasService;
    }

    /**
     * Show phone login form
     */
    public function showPhoneForm()
    {
        return Inertia::render('auth/phone-login');
    }

    /**
     * Send OTP to phone number
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'phone_number' => 'required|string|min:10|max:15'
        ]);

        $phoneNumber = $this->cleanPhoneNumber($request->phone_number);

        // Check if phone number exists in siswa table
        $siswa = Siswa::where('nomor_orang_tua', $phoneNumber)->first();
        
        if (!$siswa) {
            return back()->withErrors([
                'phone_number' => 'Nomor telepon tidak terdaftar dalam sistem.'
            ]);
        }

        // Create OTP
        $otpRecord = OtpVerification::createForPhone($phoneNumber);

        // Send OTP via WhatsApp
        $message = $this->buildOtpMessage($otpRecord->otp_code, $siswa);
        $result = $this->wablasService->sendMessage($phoneNumber, $message);

        if (!$result['success']) {
            Log::error('Failed to send OTP via WhatsApp', [
                'phone' => $phoneNumber,
                'error' => $result['error']
            ]);
            
            return back()->withErrors([
                'phone_number' => 'Gagal mengirim kode OTP. Silakan coba lagi.'
            ]);
        }

        Log::info('OTP sent successfully', [
            'phone' => $phoneNumber,
            'otp_id' => $otpRecord->id
        ]);

        return redirect()->route('otp.verify.form')->with([
            'phone_number' => $phoneNumber,
            'message' => 'Kode OTP telah dikirim ke WhatsApp Anda.'
        ]);
    }

    /**
     * Show OTP verification form
     */
    public function showVerifyForm()
    {
        if (!session('phone_number')) {
            return redirect()->route('otp.phone.form');
        }

        return Inertia::render('auth/otp-verify', [
            'phone_number' => session('phone_number')
        ]);
    }

    /**
     * Verify OTP and login
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'otp_code' => 'required|string|size:6',
            'phone_number' => 'required|string'
        ]);

        $phoneNumber = $this->cleanPhoneNumber($request->phone_number);
        $otpCode = $request->otp_code;

        // Find OTP record
        $otpRecord = OtpVerification::where('phone_number', $phoneNumber)
            ->where('otp_code', $otpCode)
            ->where('is_verified', false)
            ->first();

        if (!$otpRecord) {
            return back()->withErrors([
                'otp_code' => 'Kode OTP tidak valid.'
            ]);
        }

        if (!$otpRecord->isValid()) {
            return back()->withErrors([
                'otp_code' => 'Kode OTP sudah expired atau sudah mencapai batas percobaan.'
            ]);
        }

        // Find siswa
        $siswa = Siswa::where('nomor_orang_tua', $phoneNumber)->with('user')->first();
        
        if (!$siswa || !$siswa->user) {
            $otpRecord->incrementAttempts();
            return back()->withErrors([
                'otp_code' => 'Data siswa tidak ditemukan.'
            ]);
        }

        // Mark OTP as verified
        $otpRecord->markAsVerified();

        // Login the user
        Auth::login($siswa->user);

        Log::info('User logged in via OTP', [
            'user_id' => $siswa->user->id,
            'phone' => $phoneNumber
        ]);

        // Clear session
        $request->session()->forget('phone_number');

        return redirect()->intended('/dashboard');
    }

    /**
     * Resend OTP
     */
    public function resendOtp(Request $request)
    {
        $request->validate([
            'phone_number' => 'required|string'
        ]);

        $phoneNumber = $this->cleanPhoneNumber($request->phone_number);

        // Check if phone number exists
        $siswa = Siswa::where('nomor_orang_tua', $phoneNumber)->first();
        
        if (!$siswa) {
            return back()->withErrors([
                'phone_number' => 'Nomor telepon tidak terdaftar.'
            ]);
        }

        // Create new OTP
        $otpRecord = OtpVerification::createForPhone($phoneNumber);

        // Send OTP via WhatsApp
        $message = $this->buildOtpMessage($otpRecord->otp_code, $siswa);
        $result = $this->wablasService->sendMessage($phoneNumber, $message);

        if (!$result['success']) {
            return back()->withErrors([
                'phone_number' => 'Gagal mengirim ulang kode OTP.'
            ]);
        }

        return back()->with('message', 'Kode OTP baru telah dikirim.');
    }

    /**
     * Build OTP message
     */
    private function buildOtpMessage($otpCode, $siswa)
    {
        return "🏫 *KODE OTP - MIS ADDIMIYATI*\n\n" .
               "Assalamu'alaikum Wr. Wb.\n\n" .
               "Kode OTP untuk login sistem pembayaran:\n\n" .
               "🔐 *Kode OTP:* {$otpCode}\n\n" .
               "👤 *Untuk Siswa:* {$siswa->nama}\n" .
               "📚 *Kelas:* {$siswa->kelas}\n\n" .
               "⚠️ *PENTING:*\n" .
               "• Kode berlaku selama 5 menit\n" .
               "• Jangan bagikan kode ini kepada siapa pun\n" .
               "• Gunakan kode ini untuk login ke sistem\n\n" .
               "📱 Masukkan kode di: " . env('APP_URL', 'http://project-marlina.test') . "\n\n" .
               "📞 Bantuan: " . env('WABLAS_WA_NUMBER') . "\n\n" .
               "Wassalamu'alaikum Wr. Wb.\n\n" .
               "🏫 *MIS ADDIMIYATI*\n" .
               "🌐 Sistem Informasi Pembayaran";
    }

    /**
     * Clean phone number format
     */
    private function cleanPhoneNumber($phone)
    {
        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Convert to international format
        if (substr($phone, 0, 1) === '0') {
            $phone = '62' . substr($phone, 1);
        } elseif (substr($phone, 0, 2) !== '62') {
            $phone = '62' . $phone;
        }
        
        return $phone;
    }
}
