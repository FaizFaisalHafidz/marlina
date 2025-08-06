<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Siswa;
use App\Models\JenisPembayaran;
use App\Models\Pembayaran;
use App\Services\WablasService;
use Carbon\Carbon;

class SendPaymentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payment:send-reminders {--force : Force send reminders regardless of date}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send WhatsApp payment reminders to parents on 1st day of each month for payments due on 10th';

    private $wablasService;

    public function __construct(WablasService $wablasService)
    {
        parent::__construct();
        $this->wablasService = $wablasService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting payment reminder process...');

        // Check if today is the 1st day of month or force flag is used
        $today = Carbon::now();
        $forceFlag = $this->option('force');
        
        if (!$forceFlag && $today->day !== 1) {
            $this->info('Reminders are only sent on the 1st day of each month. Use --force to override.');
            return;
        }

        // Calculate due date (10th of current month)
        $dueDate = Carbon::now()->day(10);
        
        // If today is 1st and due date (10th) has already passed this month,
        // set due date to 10th of next month
        if ($today->day === 1 && $today->day(10)->isPast()) {
            $dueDate = Carbon::now()->addMonth()->day(10);
        }

        $this->info("Sending reminders for payments due on: {$dueDate->format('d F Y')}");
        
        // Get all mandatory payment types
        $jenisPembayaranWajib = JenisPembayaran::where('is_wajib', true)->get();

        $totalReminders = 0;
        $successCount = 0;
        $failedCount = 0;

        foreach ($jenisPembayaranWajib as $jenisPembayaran) {
            $this->info("Processing payment type: {$jenisPembayaran->nama}");

            // Find students who haven't paid for this payment type in current month
            $studentsWithUnpaidPayments = Siswa::whereDoesntHave('pembayaran', function($query) use ($jenisPembayaran, $dueDate) {
                $query->whereHas('details', function($q) use ($jenisPembayaran) {
                    $q->where('jenis_pembayaran_id', $jenisPembayaran->id);
                })
                ->where('status', 'disetujui')
                ->whereYear('tanggal_pembayaran', $dueDate->year)
                ->whereMonth('tanggal_pembayaran', $dueDate->month);
            })
            ->with(['user'])
            ->get();

            foreach ($studentsWithUnpaidPayments as $siswa) {
                if (!$siswa->nomor_orang_tua) {
                    $this->warn("No parent phone number for student: {$siswa->nama}");
                    continue;
                }

                $totalReminders++;
                
                $result = $this->wablasService->sendPaymentReminder(
                    $siswa, 
                    $jenisPembayaran, 
                    $dueDate->format('d F Y')
                );

                if ($result['success']) {
                    $successCount++;
                    $this->info("✅ Reminder sent to: {$siswa->nama} ({$siswa->nomor_orang_tua})");
                } else {
                    $failedCount++;
                    $this->error("❌ Failed to send to: {$siswa->nama} - {$result['error']}");
                }

                // Small delay to avoid rate limiting
                sleep(1);
            }
        }

        $this->info("\n📊 Payment Reminder Summary:");
        $this->info("Total reminders attempted: {$totalReminders}");
        $this->info("Successfully sent: {$successCount}");
        $this->info("Failed: {$failedCount}");

        if ($totalReminders === 0) {
            $this->info("No payment reminders needed at this time.");
        }
    }
}
