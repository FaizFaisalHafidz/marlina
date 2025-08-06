<?php

namespace App\Http\Controllers;

use App\Services\WablasService;
use App\Models\Siswa;
use App\Models\JenisPembayaran;
use App\Models\Pembayaran;
use Illuminate\Http\Request;
use Carbon\Carbon;

class NotificationController extends Controller
{
    private $wablasService;

    public function __construct(WablasService $wablasService)
    {
        $this->wablasService = $wablasService;
    }

    /**
     * Test WhatsApp device status
     */
    public function testDeviceStatus()
    {
        $status = $this->wablasService->getDeviceStatus();
        
        return response()->json([
            'message' => 'Device status checked',
            'data' => $status
        ]);
    }

    /**
     * Test send reminder to specific student
     */
    public function testSendReminder(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:siswa,id',
            'jenis_pembayaran_id' => 'required|exists:jenis_pembayaran,id'
        ]);

        $siswa = Siswa::with(['user', 'kelas'])->find($request->siswa_id);
        $jenisPembayaran = JenisPembayaran::find($request->jenis_pembayaran_id);

        if (!$siswa->nomor_orang_tua) {
            return response()->json([
                'success' => false,
                'message' => 'Student has no parent phone number'
            ], 400);
        }

        $dueDate = Carbon::now()->endOfMonth();
        $result = $this->wablasService->sendPaymentReminder($siswa, $jenisPembayaran, $dueDate->format('d F Y'));

        return response()->json([
            'message' => $result['success'] ? 'Reminder sent successfully' : 'Failed to send reminder',
            'data' => $result
        ]);
    }

    /**
     * Test send payment confirmation
     */
    public function testSendConfirmation(Request $request)
    {
        $request->validate([
            'pembayaran_id' => 'required|exists:pembayaran,id'
        ]);

        $pembayaran = Pembayaran::with(['siswa.user', 'rekening'])->find($request->pembayaran_id);

        if (!$pembayaran->siswa->nomor_orang_tua) {
            return response()->json([
                'success' => false,
                'message' => 'Student has no parent phone number'
            ], 400);
        }

        $result = $this->wablasService->sendPaymentConfirmation($pembayaran);

        return response()->json([
            'message' => $result['success'] ? 'Confirmation sent successfully' : 'Failed to send confirmation',
            'data' => $result
        ]);
    }

    /**
     * Send test message
     */
    public function testSendMessage(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'message' => 'required|string'
        ]);

        $result = $this->wablasService->sendMessage($request->phone, $request->message);

        return response()->json([
            'message' => $result['success'] ? 'Message sent successfully' : 'Failed to send message',
            'data' => $result
        ]);
    }
}
