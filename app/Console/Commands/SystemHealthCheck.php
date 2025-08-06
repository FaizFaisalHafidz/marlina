<?php

namespace App\Console\Commands;

use App\Models\OtpVerification;
use App\Models\Siswa;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SystemHealthCheck extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'system:health-check {--alert : Send alert if issues found}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check system health and report issues';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("🏥 System Health Check - MIS Addimiyati");
        $this->info("Time: " . Carbon::now('Asia/Jakarta')->format('Y-m-d H:i:s T'));
        $this->line("============================================");

        $issues = [];
        $checks = 0;
        $passed = 0;

        // 1. Database Connection
        $checks++;
        try {
            DB::connection()->getPdo();
            $this->info("✅ Database connection: OK");
            $passed++;
        } catch (\Exception $e) {
            $this->error("❌ Database connection: FAILED");
            $issues[] = "Database connection failed: " . $e->getMessage();
        }

        // 2. Check timezone configuration
        $checks++;
        $appTimezone = config('app.timezone');
        if ($appTimezone === 'Asia/Jakarta') {
            $this->info("✅ Timezone configuration: OK (Asia/Jakarta)");
            $passed++;
        } else {
            $this->error("❌ Timezone configuration: INCORRECT ({$appTimezone})");
            $issues[] = "Timezone should be Asia/Jakarta, currently: {$appTimezone}";
        }

        // 3. Check Wablas configuration
        $checks++;
        $wablasConfig = [
            'WABLAS_BASE_URL' => env('WABLAS_BASE_URL'),
            'WABLAS_API_KEY' => env('WABLAS_API_KEY'),
            'WABLAS_SECRET_KEY' => env('WABLAS_SECRET_KEY'),
            'WABLAS_DEVICE_ID' => env('WABLAS_DEVICE_ID'),
        ];

        $wablasOk = true;
        foreach ($wablasConfig as $key => $value) {
            if (empty($value)) {
                $wablasOk = false;
                $issues[] = "Missing Wablas configuration: {$key}";
            }
        }

        if ($wablasOk) {
            $this->info("✅ Wablas configuration: OK");
            $passed++;
        } else {
            $this->error("❌ Wablas configuration: INCOMPLETE");
        }

        // 4. Check storage permissions
        $checks++;
        $storagePath = storage_path('logs');
        if (is_writable($storagePath)) {
            $this->info("✅ Storage permissions: OK");
            $passed++;
        } else {
            $this->error("❌ Storage permissions: NOT WRITABLE");
            $issues[] = "Storage directory not writable: {$storagePath}";
        }

        // 5. Check active students
        $checks++;
        try {
            $studentCount = Siswa::whereNotNull('nomor_orang_tua')
                ->where('nomor_orang_tua', '!=', '')
                ->count();
            
            if ($studentCount > 0) {
                $this->info("✅ Active students with phone numbers: {$studentCount}");
                $passed++;
            } else {
                $this->error("❌ No students with parent phone numbers found");
                $issues[] = "No students have parent phone numbers configured";
            }
        } catch (\Exception $e) {
            $this->error("❌ Student data check: FAILED");
            $issues[] = "Failed to check student data: " . $e->getMessage();
        }

        // 6. Check expired OTP cleanup
        $checks++;
        try {
            $expiredOtps = OtpVerification::where('expires_at', '<', Carbon::now('Asia/Jakarta'))
                ->where('is_verified', false)
                ->count();
            
            if ($expiredOtps < 100) { // Arbitrary threshold
                $this->info("✅ OTP cleanup: OK ({$expiredOtps} expired)");
                $passed++;
            } else {
                $this->warn("⚠️  OTP cleanup: WARNING ({$expiredOtps} expired OTPs)");
                $issues[] = "High number of expired OTPs, consider cleanup";
            }
        } catch (\Exception $e) {
            $this->error("❌ OTP check: FAILED");
            $issues[] = "Failed to check OTP data: " . $e->getMessage();
        }

        // 7. Check log file size
        $checks++;
        $logFile = storage_path('logs/laravel.log');
        if (file_exists($logFile)) {
            $logSize = filesize($logFile);
            $logSizeMB = round($logSize / 1024 / 1024, 2);
            
            if ($logSizeMB < 100) { // Less than 100MB
                $this->info("✅ Log file size: OK ({$logSizeMB} MB)");
                $passed++;
            } else {
                $this->warn("⚠️  Log file size: LARGE ({$logSizeMB} MB)");
                $issues[] = "Log file is large ({$logSizeMB} MB), consider rotation";
            }
        } else {
            $this->info("✅ Log file: Not found (first run)");
            $passed++;
        }

        // Summary
        $this->line("");
        $this->info("📊 Health Check Summary");
        $this->line("=====================");
        $this->info("Total checks: {$checks}");
        $this->info("Passed: {$passed}");
        $this->info("Issues: " . count($issues));

        if (empty($issues)) {
            $this->info("🎉 All systems operational!");
        } else {
            $this->line("");
            $this->error("🚨 Issues Found:");
            foreach ($issues as $issue) {
                $this->line("  • {$issue}");
            }
        }

        // Log results
        Log::info("System health check completed", [
            'total_checks' => $checks,
            'passed' => $passed,
            'issues_count' => count($issues),
            'issues' => $issues,
            'timestamp' => Carbon::now('Asia/Jakarta')->toISOString()
        ]);

        // Send alert if requested and issues found
        if ($this->option('alert') && !empty($issues)) {
            $this->sendAlert($issues);
        }

        return empty($issues) ? 0 : 1;
    }

    /**
     * Send alert about system issues
     */
    private function sendAlert(array $issues)
    {
        $this->warn("🚨 Sending system alert...");
        
        // In a real implementation, you might want to:
        // - Send email to administrators
        // - Send WhatsApp message to admin
        // - Post to Slack/Discord
        // - Create monitoring dashboard alert
        
        Log::error("System health check failed", [
            'issues' => $issues,
            'timestamp' => Carbon::now('Asia/Jakarta')->toISOString(),
            'server' => $_SERVER['SERVER_NAME'] ?? 'unknown'
        ]);
    }
}
