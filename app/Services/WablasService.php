<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WablasService
{
    private $baseUrl;
    private $apiKey;
    private $secretKey;
    private $deviceId;
    private $waNumber;

    public function __construct()
    {
        $this->baseUrl = env('WABLAS_BASE_URL', 'https://bdg.wablas.com');
        $this->apiKey = env('WABLAS_API_KEY');
        $this->secretKey = env('WABLAS_SECRET_KEY');
        $this->deviceId = env('WABLAS_DEVICE_ID');
        $this->waNumber = env('WABLAS_WA_NUMBER');
    }

    /**
     * Send WhatsApp message
     */
    public function sendMessage($phone, $message)
    {
        try {
            // Clean phone number (remove +, spaces, etc)
            $phone = $this->cleanPhoneNumber($phone);
            
            $response = Http::withHeaders([
                'Authorization' => $this->apiKey,
            ])->post($this->baseUrl . '/api/send-message', [
                'phone' => $phone,
                'message' => $message,
                'secret' => $this->secretKey,
                'retry' => false,
                'isGroup' => false
            ]);

            if ($response->successful()) {
                Log::info('WhatsApp message sent successfully', [
                    'phone' => $phone,
                    'response' => $response->json()
                ]);
                return ['success' => true, 'data' => $response->json()];
            } else {
                Log::error('Failed to send WhatsApp message', [
                    'phone' => $phone,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                return ['success' => false, 'error' => $response->body()];
            }
        } catch (\Exception $e) {
            Log::error('WhatsApp service error', [
                'phone' => $phone,
                'error' => $e->getMessage()
            ]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send payment reminder notification
     */
    public function sendPaymentReminder($siswa, $jenisPembayaran, $dueDate)
    {
        if (!$siswa->nomor_orang_tua) {
            return ['success' => false, 'error' => 'No parent phone number found'];
        }

        $message = $this->buildPaymentReminderMessage($siswa, $jenisPembayaran, $dueDate);
        
        return $this->sendMessage($siswa->nomor_orang_tua, $message);
    }

    /**
     * Send payment confirmation notification
     */
    public function sendPaymentConfirmation($pembayaran)
    {
        if (!$pembayaran->siswa->nomor_orang_tua) {
            return ['success' => false, 'error' => 'No parent phone number found'];
        }

        $message = $this->buildPaymentConfirmationMessage($pembayaran);
        
        return $this->sendMessage($pembayaran->siswa->nomor_orang_tua, $message);
    }

    /**
     * Build payment reminder message
     */
    private function buildPaymentReminderMessage($siswa, $jenisPembayaran, $dueDate)
    {
        return "🏫 *REMINDER PEMBAYARAN - MIS ADDIMIYATI*\n\n" .
               "Assalamu'alaikum Wr. Wb.\n\n" .
               "Yth. Orang Tua/Wali dari:\n" .
               "👤 *Nama:* {$siswa->nama}\n" .
               "📚 *Kelas:* {$siswa->kelas}\n" .
               "🆔 *NISN:* {$siswa->nisn}\n\n" .
               "📋 *Jenis Pembayaran:* {$jenisPembayaran->nama_jenis}\n" .
               "💰 *Nominal:* Rp " . number_format($jenisPembayaran->nominal_default, 0, ',', '.') . "\n" .
               "📅 *Batas Waktu:* {$dueDate} (Tanggal 10 setiap bulan)\n\n" .
               "⚠️ *REMINDER:* Pembayaran rutin dilakukan setiap tanggal 10.\n" .
               "Mohon segera melakukan pembayaran sebelum tanggal 10.\n\n" .
               "📱 Login ke sistem: " . env('APP_URL', 'http://project-marlina.test') . "\n" .
               "💳 Untuk melakukan pembayaran online\n\n" .
               "💡 *Tips:* Lakukan pembayaran 1-2 hari sebelum tanggal 10 untuk memastikan proses validasi tepat waktu.\n\n" .
               "📞 Info lebih lanjut hubungi: {$this->waNumber}\n\n" .
               "Wassalamu'alaikum Wr. Wb.\n\n" .
               "🏫 *MIS ADDIMIYATI*\n" .
               "🌐 Sistem Informasi Pembayaran";
    }

    /**
     * Build payment confirmation message
     */
    private function buildPaymentConfirmationMessage($pembayaran)
    {
        $statusText = $pembayaran->status === 'disetujui' ? '✅ DISETUJUI' : 
                     ($pembayaran->status === 'ditolak' ? '❌ DITOLAK' : '⏳ PENDING');

        return "🏫 *KONFIRMASI PEMBAYARAN - MIS ADDIMIYATI*\n\n" .
               "Assalamu'alaikum Wr. Wb.\n\n" .
               "Yth. Orang Tua/Wali dari:\n" .
               "👤 *Nama:* {$pembayaran->siswa->nama}\n" .
               "📚 *Kelas:* {$pembayaran->siswa->kelas}\n\n" .
               "📋 *Detail Pembayaran:*\n" .
               "🆔 *ID Transaksi:* {$pembayaran->id}\n" .
               "💰 *Jumlah:* Rp " . number_format($pembayaran->jumlah, 0, ',', '.') . "\n" .
               "📅 *Tanggal:* {$pembayaran->tanggal_pembayaran}\n" .
               "🏦 *Rekening:* {$pembayaran->rekening->nama_bank} - {$pembayaran->rekening->no_rekening}\n\n" .
               "📊 *Status:* {$statusText}\n\n" .
               ($pembayaran->status === 'disetujui' ? 
                "✅ Pembayaran Anda telah berhasil diverifikasi.\n" .
                "📧 Bukti pembayaran akan dikirim melalui email.\n" :
                ($pembayaran->status === 'ditolak' ?
                "❌ Pembayaran ditolak. Silakan periksa kembali dan upload ulang bukti pembayaran.\n" :
                "⏳ Pembayaran Anda sedang dalam proses verifikasi.\n")) .
               "\n📱 Cek status terbaru di sistem: " . env('APP_URL', 'http://project-marlina.test') . "\n\n" .
               "📞 Info lebih lanjut hubungi: {$this->waNumber}\n\n" .
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

    /**
     * Check device status
     */
    public function getDeviceStatus()
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => $this->apiKey,
            ])->get($this->baseUrl . '/api/device/status', [
                'secret' => $this->secretKey
            ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Failed to get device status', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
