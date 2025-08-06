<?php

namespace App\Console\Commands;

use App\Models\Siswa;
use App\Services\WablasService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendMonthlyReminder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reminder:send-monthly {--test : Run in test mode}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send monthly payment reminder to all parents via WhatsApp';

    /**
     * Execute the console command.
     */
    public function handle(WablasService $wablasService)
    {
        $isTest = $this->option('test');
        $currentDate = Carbon::now('Asia/Jakarta');
        
        $this->info("🏫 Starting Monthly Payment Reminder");
        $this->info("📅 Current Date: " . $currentDate->format('Y-m-d H:i:s T'));
        
        if ($isTest) {
            $this->warn("⚠️  RUNNING IN TEST MODE");
        }

        // Get all active students with parent phone numbers
        $siswaList = Siswa::whereNotNull('nomor_orang_tua')
            ->where('nomor_orang_tua', '!=', '')
            ->get();

        if ($siswaList->isEmpty()) {
            $this->error("❌ No students found with parent phone numbers");
            return;
        }

        $this->info("👥 Found {$siswaList->count()} students to send reminders to");

        $successCount = 0;
        $failCount = 0;

        $progressBar = $this->output->createProgressBar($siswaList->count());
        $progressBar->start();

        foreach ($siswaList as $siswa) {
            try {
                $message = $this->buildReminderMessage($siswa, $currentDate);
                
                if ($isTest) {
                    // In test mode, just log the message instead of sending
                    Log::info("TEST MODE - Would send to {$siswa->nomor_orang_tua}", [
                        'siswa' => $siswa->nama,
                        'phone' => $siswa->nomor_orang_tua,
                        'message_preview' => substr($message, 0, 100) . '...'
                    ]);
                    $successCount++;
                } else {
                    // Send actual WhatsApp message
                    $result = $wablasService->sendMessage($siswa->nomor_orang_tua, $message);
                    
                    if ($result['success']) {
                        $successCount++;
                        Log::info("Reminder sent successfully", [
                            'siswa' => $siswa->nama,
                            'phone' => $siswa->nomor_orang_tua
                        ]);
                    } else {
                        $failCount++;
                        Log::error("Failed to send reminder", [
                            'siswa' => $siswa->nama,
                            'phone' => $siswa->nomor_orang_tua,
                            'error' => $result['error']
                        ]);
                    }
                }

                // Small delay to avoid rate limiting
                usleep(500000); // 0.5 second delay

            } catch (\Exception $e) {
                $failCount++;
                Log::error("Exception while sending reminder", [
                    'siswa' => $siswa->nama,
                    'phone' => $siswa->nomor_orang_tua,
                    'error' => $e->getMessage()
                ]);
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        // Summary
        $this->info("✅ Reminders sent successfully: {$successCount}");
        if ($failCount > 0) {
            $this->error("❌ Failed to send: {$failCount}");
        }

        $this->info("📊 Total processed: " . ($successCount + $failCount));
        $this->info("🕐 Completed at: " . Carbon::now('Asia/Jakarta')->format('Y-m-d H:i:s T'));

        // Log summary
        Log::info("Monthly reminder batch completed", [
            'success_count' => $successCount,
            'fail_count' => $failCount,
            'total_processed' => $successCount + $failCount,
            'test_mode' => $isTest
        ]);
    }

    /**
     * Build reminder message for WhatsApp
     */
    private function buildReminderMessage(Siswa $siswa, Carbon $currentDate): string
    {
        $reminderMonth = $currentDate->format('F Y');
        $paymentDueDate = $currentDate->copy()->day(10);
        
        return "🏫 *PENGINGAT PEMBAYARAN - MIS ADDIMIYATI*\n\n" .
               "Assalamu'alaikum Wr. Wb.\n\n" .
               "Yth. Orang Tua/Wali dari:\n" .
               "👤 *Nama:* {$siswa->nama}\n" .
               "🆔 *NISN:* {$siswa->nisn}\n" .
               "📚 *Kelas:* {$siswa->kelas}\n\n" .
               "📅 *Pengingat Pembayaran Bulan:* {$reminderMonth}\n" .
               "⏰ *Batas Pembayaran:* {$paymentDueDate->format('d F Y')}\n\n" .
               "💰 *Jenis Pembayaran yang Perlu Dibayar:*\n" .
               "• SPP Bulanan\n" .
               "• Uang Kegiatan (jika ada)\n" .
               "• Biaya Lainnya (jika ada)\n\n" .
               "📱 *Untuk melihat detail tagihan dan melakukan pembayaran:*\n" .
               "🌐 Login ke: " . env('APP_URL', 'http://project-marlina.test') . "\n" .
               "📞 Atau gunakan login via WhatsApp dengan nomor ini\n\n" .
               "⚠️ *PENTING:*\n" .
               "• Harap segera lakukan pembayaran sebelum tanggal jatuh tempo\n" .
               "• Jika sudah membayar, abaikan pesan ini\n" .
               "• Untuk bantuan hubungi admin sekolah\n\n" .
               "📞 *Kontak Bantuan:* " . env('WABLAS_WA_NUMBER') . "\n\n" .
               "Terima kasih atas perhatian dan kerjasamanya.\n\n" .
               "Wassalamu'alaikum Wr. Wb.\n\n" .
               "🏫 *MIS ADDIMIYATI*\n" .
               "🌐 Sistem Informasi Pembayaran";
    }
}
