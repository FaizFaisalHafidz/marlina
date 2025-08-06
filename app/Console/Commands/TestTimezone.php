<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;

class TestTimezone extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'timezone:test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test timezone configuration for Indonesia';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("🌏 Testing Timezone Configuration");
        $this->line("=====================================");
        
        // App timezone from config
        $appTimezone = config('app.timezone');
        $this->info("📋 App Timezone (config): {$appTimezone}");
        
        // Current Carbon timezone
        $carbonDefault = Carbon::now();
        $this->info("🕐 Carbon Default: {$carbonDefault->format('Y-m-d H:i:s T')} ({$carbonDefault->getTimezone()->getName()})");
        
        // Indonesia timezone
        $indonesiaTime = Carbon::now('Asia/Jakarta');
        $this->info("🇮🇩 Indonesia Time: {$indonesiaTime->format('Y-m-d H:i:s T')} ({$indonesiaTime->getTimezone()->getName()})");
        
        // UTC time for comparison
        $utcTime = Carbon::now('UTC');
        $this->info("🌍 UTC Time: {$utcTime->format('Y-m-d H:i:s T')} ({$utcTime->getTimezone()->getName()})");
        
        $this->line("");
        $this->info("📅 Sample schedule times (Indonesia timezone):");
        
        // Test schedule times
        $schedules = [
            'Daily at 08:00' => Carbon::today('Asia/Jakarta')->setTime(8, 0),
            'Monthly 1st at 08:00' => Carbon::parse('first day of this month', 'Asia/Jakarta')->setTime(8, 0),
            'Daily at 14:00' => Carbon::today('Asia/Jakarta')->setTime(14, 0),
            'Daily at 20:00' => Carbon::today('Asia/Jakarta')->setTime(20, 0),
        ];
        
        foreach ($schedules as $description => $time) {
            $this->line("  • {$description}: {$time->format('Y-m-d H:i:s T')}");
        }
        
        $this->line("");
        
        // Test if it's the 1st of the month at 8 AM
        $now = Carbon::now('Asia/Jakarta');
        $isFirstOfMonth = $now->day === 1;
        $isEightAM = $now->hour === 8 && $now->minute === 0;
        
        $this->info("🗓️  Current date checks:");
        $this->line("  • Is 1st of month: " . ($isFirstOfMonth ? '✅ Yes' : '❌ No'));
        $this->line("  • Is 08:00 AM: " . ($isEightAM ? '✅ Yes' : '❌ No'));
        $this->line("  • Would trigger monthly reminder: " . ($isFirstOfMonth && $isEightAM ? '✅ Yes' : '❌ No'));
        
        $this->line("");
        $this->info("✅ Timezone test completed!");
        
        // Verify PHP timezone
        $phpTimezone = date_default_timezone_get();
        if ($phpTimezone !== 'Asia/Jakarta') {
            $this->warn("⚠️  Warning: PHP default timezone is '{$phpTimezone}', not 'Asia/Jakarta'");
            $this->line("   Consider adding date_default_timezone_set('Asia/Jakarta') to bootstrap/app.php");
        } else {
            $this->info("✅ PHP timezone is correctly set to Asia/Jakarta");
        }
    }
}
