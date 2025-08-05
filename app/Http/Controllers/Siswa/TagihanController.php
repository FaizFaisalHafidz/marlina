<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Siswa as ModelSiswa;
use App\Models\JenisPembayaran;
use App\Models\Rekening;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TagihanController extends Controller
{
    /**
     * Display student's bills/tagihan
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get student data based on logged in user
        $siswa = ModelSiswa::where('user_id', $user->id)->first();
        
        if (!$siswa) {
            return redirect()->route('dashboard')->with('error', 'Data siswa tidak ditemukan.');
        }

        // Get all payment types (PSB, SPP, GERAK, UJIAN, etc.)
        $jenisPembayaran = JenisPembayaran::where('is_active', true)
            ->orderBy('nama_jenis', 'asc')
            ->get();

        // Get recent payments for current student (3 latest)
        $recentPayments = Pembayaran::where('siswa_id', $siswa->id)
            ->with(['details.jenisPembayaran'])
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get();

        // Get student's payment status for each payment type
        $studentPaymentStatus = [];
        $totalTagihan = 0;
        
        foreach ($jenisPembayaran as $jenis) {
            // Check if this student has paid for this payment type
            $pembayaran = Pembayaran::whereHas('details', function($query) use ($jenis) {
                $query->where('jenis_pembayaran_id', $jenis->id);
            })
            ->where('siswa_id', $siswa->id)
            ->where('status', 'disetujui')
            ->first();

            $sudahBayar = $pembayaran ? true : false;
            $jumlahBayar = $pembayaran ? $pembayaran->jumlah : $jenis->nominal_default;

            $studentPaymentStatus[$jenis->kode] = [
                'jenis_id' => $jenis->id,
                'nama_jenis' => $jenis->nama_jenis,
                'kode' => $jenis->kode,
                'nominal' => $jenis->nominal_default,
                'sudah_bayar' => $sudahBayar,
                'jumlah_bayar' => $jumlahBayar,
                'is_wajib' => $jenis->is_wajib,
            ];

            if (!$sudahBayar && $jenis->is_wajib) {
                $totalTagihan += $jenis->nominal_default;
            }
        }

        // Get available bank accounts for payment
        $rekening = Rekening::all();

        // Get payment statistics for current student
        $statistics = $this->getStudentStatistics($siswa->id);

        return Inertia::render('siswa/tagihan', [
            'siswaLogin' => $siswa,
            'recentPayments' => $recentPayments,
            'studentPaymentStatus' => $studentPaymentStatus,
            'totalTagihan' => $totalTagihan,
            'jenisPembayaran' => $jenisPembayaran,
            'rekening' => $rekening,
            'stats' => $statistics,
            'filters' => $request->only(['status'])
        ]);
    }

    /**
     * Process payment for a student
     */
    public function bayar(Request $request)
    {
        $request->validate([
            'jenis_pembayaran_id' => 'required|exists:jenis_pembayaran,id',
            'rekening_id' => 'required|exists:rekening,id',
            'jumlah' => 'required|numeric|min:1',
            'bukti_transfer' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $user = Auth::user();
        $siswa = ModelSiswa::where('user_id', $user->id)->first();

        if (!$siswa) {
            return redirect()->back()->with('error', 'Data siswa tidak ditemukan.');
        }

        // Check if already paid
        $existingPayment = Pembayaran::whereHas('details', function($query) use ($request) {
            $query->where('jenis_pembayaran_id', $request->jenis_pembayaran_id);
        })
        ->where('siswa_id', $siswa->id)
        ->where('status', '!=', 'ditolak')
        ->first();

        if ($existingPayment) {
            return redirect()->back()->with('error', 'Pembayaran untuk jenis ini sudah pernah dilakukan.');
        }

        // Upload bukti transfer
        $buktiPath = null;
        if ($request->hasFile('bukti_transfer')) {
            $buktiPath = $request->file('bukti_transfer')->store('bukti-transfer', 'public');
        }

        try {
            DB::beginTransaction();

            // Create payment record
            $pembayaran = Pembayaran::create([
                'siswa_id' => $siswa->id,
                'jumlah' => $request->jumlah,
                'tanggal_pembayaran' => now(),
                'status' => 'pending',
                'metode_pembayaran_id' => $request->rekening_id,
                'bukti_transfer' => $buktiPath,
                'keterangan' => 'Pembayaran melalui sistem siswa',
            ]);

            // Create payment detail
            $pembayaran->details()->create([
                'jenis_pembayaran_id' => $request->jenis_pembayaran_id,
                'jumlah' => $request->jumlah,
                'keterangan' => 'Pembayaran ' . JenisPembayaran::find($request->jenis_pembayaran_id)->nama_jenis,
            ]);

            DB::commit();

            return redirect()->route('siswa.tagihan.index')->with('success', 'Pembayaran berhasil diajukan. Menunggu validasi.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan saat memproses pembayaran.');
        }
    }

    /**
     * Get student payment statistics
     */
    private function getStudentStatistics($siswaId)
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        return [
            'total_pembayaran' => Pembayaran::where('siswa_id', $siswaId)->count(),
            'pending' => Pembayaran::where('siswa_id', $siswaId)->where('status', 'pending')->count(),
            'disetujui' => Pembayaran::where('siswa_id', $siswaId)->where('status', 'disetujui')->count(),
            'ditolak' => Pembayaran::where('siswa_id', $siswaId)->where('status', 'ditolak')->count(),
            'pembayaran_bulan_ini' => Pembayaran::where('siswa_id', $siswaId)
                ->whereBetween('created_at', [$thisMonth, $today])
                ->count(),
            'total_amount_disetujui' => Pembayaran::where('siswa_id', $siswaId)
                ->where('status', 'disetujui')
                ->sum('jumlah'),
            'total_amount_pending' => Pembayaran::where('siswa_id', $siswaId)
                ->where('status', 'pending')
                ->sum('jumlah'),
        ];
    }
}
