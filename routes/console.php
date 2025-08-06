<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ===== PRODUCTION SCHEDULE =====
// Send payment reminders every 1st of the month at 8:00 AM (Jakarta time)
Schedule::command('reminder:send-monthly')
    ->monthlyOn(1, '08:00')
    ->timezone('Asia/Jakarta')
    ->description('Send WhatsApp payment reminders on 1st of each month');

// ===== DEVELOPMENT/TESTING SCHEDULE =====
// Uncomment during development for testing
// Schedule::command('reminder:send-monthly --test')->dailyAt('09:00')->timezone('Asia/Jakarta');

// ===== MONITORING =====
// Log scheduler activity for monitoring
Schedule::command('inspire')
    ->dailyAt('00:01')
    ->timezone('Asia/Jakarta')
    ->appendOutputTo(storage_path('logs/scheduler.log'));
