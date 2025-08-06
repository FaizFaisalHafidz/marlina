<?php

namespace App\Listeners;

use App\Events\PaymentStatusUpdated;
use App\Services\WablasService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendWhatsAppNotification implements ShouldQueue
{
    use InteractsWithQueue;

    private $wablasService;

    /**
     * Create the event listener.
     */
    public function __construct(WablasService $wablasService)
    {
        $this->wablasService = $wablasService;
    }

    /**
     * Handle the event.
     */
    public function handle(PaymentStatusUpdated $event): void
    {
        // Only send notification if status changed to approved or rejected
        if (in_array($event->newStatus, ['disetujui', 'ditolak'])) {
            $result = $this->wablasService->sendPaymentConfirmation($event->pembayaran);
            
            if ($result['success']) {
                Log::info('WhatsApp notification sent for payment status update', [
                    'pembayaran_id' => $event->pembayaran->id,
                    'siswa' => $event->pembayaran->siswa->nama,
                    'status' => $event->newStatus
                ]);
            } else {
                Log::error('Failed to send WhatsApp notification', [
                    'pembayaran_id' => $event->pembayaran->id,
                    'error' => $result['error']
                ]);
            }
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(PaymentStatusUpdated $event, $exception)
    {
        Log::error('WhatsApp notification job failed', [
            'pembayaran_id' => $event->pembayaran->id,
            'exception' => $exception->getMessage()
        ]);
    }
}
