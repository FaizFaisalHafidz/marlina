<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\Siswa;
use App\Models\User;
use App\Models\JenisPembayaran;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $userRole = $user->role->nama_role ?? 'Orang Tua';

        $dashboardData = match($userRole) {
            'Admin' => $this->getAdminDashboardData(),
            'Bendahara' => $this->getBendaharaDashboardData(),
            'Kepala Madrasah' => $this->getKepalaMadrasahDashboardData(),
            'Orang Tua' => $this->getOrangTuaDashboardData($user),
            'Siswa' => $this->getSiswaDashboardData($user),
            default => $this->getDefaultDashboardData()
        };

        return Inertia::render('dashboard', [
            'user' => $user,
            'dashboardData' => $dashboardData,
            'userRole' => $userRole
        ]);
    }

    private function getAdminDashboardData()
    {
        $currentYear = Carbon::now()->year;
        $currentMonth = Carbon::now()->month;

        // Total siswa
        $totalSiswa = Siswa::count();

        // Total tunggakan (pembayaran wajib yang belum dibayar)
        $jenisPembayaranWajib = JenisPembayaran::where('is_wajib', true)->get();
        $totalTunggakan = 0;
        
        foreach ($jenisPembayaranWajib as $jenis) {
            $siswaBelumBayar = Siswa::whereDoesntHave('pembayaran', function($query) use ($jenis) {
                $query->whereHas('details', function($q) use ($jenis) {
                    $q->where('jenis_pembayaran_id', $jenis->id);
                })->where('status', 'disetujui');
            })->count();
            
            $totalTunggakan += $siswaBelumBayar * $jenis->nominal_default;
        }

        // Total pemasukan tahun ini
        $totalPemasukan = Pembayaran::where('status', 'disetujui')
            ->whereYear('tanggal_pembayaran', $currentYear)
            ->sum('jumlah');

        // Pembayaran pending untuk validasi
        $pembayaranPending = Pembayaran::where('status', 'pending')->count();

        // Data untuk chart - pemasukan per bulan
        $chartData = $this->getMonthlyIncomeData($currentYear);

        // Recent activities
        $recentActivities = Pembayaran::with(['siswa', 'details.jenisPembayaran'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return [
            'cards' => [
                [
                    'title' => 'Total Siswa',
                    'value' => number_format($totalSiswa),
                    'subtitle' => 'Siswa aktif',
                    'icon' => 'Users',
                    'color' => 'blue'
                ],
                [
                    'title' => 'Total Tunggakan',
                    'value' => 'Rp ' . number_format($totalTunggakan, 0, ',', '.'),
                    'subtitle' => 'Belum terbayar',
                    'icon' => 'Receipt',
                    'color' => 'red'
                ],
                [
                    'title' => 'Pemasukan Tahun Ini',
                    'value' => 'Rp ' . number_format($totalPemasukan, 0, ',', '.'),
                    'subtitle' => 'Total diterima',
                    'icon' => 'TrendingUp',
                    'color' => 'green'
                ],
                [
                    'title' => 'Menunggu Validasi',
                    'value' => number_format($pembayaranPending),
                    'subtitle' => 'Pembayaran pending',
                    'icon' => 'Clock',
                    'color' => 'yellow'
                ]
            ],
            'chartData' => $chartData,
            'recentActivities' => $recentActivities
        ];
    }

    private function getBendaharaDashboardData()
    {
        $currentYear = Carbon::now()->year;
        $currentMonth = Carbon::now()->month;

        // Data sama seperti admin tapi fokus ke validasi
        $pembayaranPending = Pembayaran::where('status', 'pending')->count();
        $pembayaranDivalidasiHariIni = Pembayaran::where('status', 'disetujui')
            ->whereDate('updated_at', Carbon::today())
            ->count();

        $totalPemasukanBulanIni = Pembayaran::where('status', 'disetujui')
            ->whereYear('tanggal_pembayaran', $currentYear)
            ->whereMonth('tanggal_pembayaran', $currentMonth)
            ->sum('jumlah');

        $totalSiswa = Siswa::count();

        // Recent transactions untuk validasi
        $recentTransactions = Pembayaran::with(['siswa', 'details.jenisPembayaran'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $chartData = $this->getMonthlyIncomeData($currentYear);

        return [
            'cards' => [
                [
                    'title' => 'Menunggu Validasi',
                    'value' => number_format($pembayaranPending),
                    'subtitle' => 'Perlu diproses',
                    'icon' => 'Clock',
                    'color' => 'yellow'
                ],
                [
                    'title' => 'Divalidasi Hari Ini',
                    'value' => number_format($pembayaranDivalidasiHariIni),
                    'subtitle' => 'Telah diproses',
                    'icon' => 'CheckCircle',
                    'color' => 'green'
                ],
                [
                    'title' => 'Pemasukan Bulan Ini',
                    'value' => 'Rp ' . number_format($totalPemasukanBulanIni, 0, ',', '.'),
                    'subtitle' => 'Total diterima',
                    'icon' => 'DollarSign',
                    'color' => 'blue'
                ],
                [
                    'title' => 'Total Siswa',
                    'value' => number_format($totalSiswa),
                    'subtitle' => 'Siswa aktif',
                    'icon' => 'Users',
                    'color' => 'purple'
                ]
            ],
            'chartData' => $chartData,
            'recentTransactions' => $recentTransactions
        ];
    }

    private function getKepalaMadrasahDashboardData()
    {
        $currentYear = Carbon::now()->year;

        // Data overview untuk kepala madrasah
        $totalSiswa = Siswa::count();
        $totalPemasukan = Pembayaran::where('status', 'disetujui')
            ->whereYear('tanggal_pembayaran', $currentYear)
            ->sum('jumlah');

        $tingkatPembayaran = Pembayaran::where('status', 'disetujui')
            ->whereYear('tanggal_pembayaran', $currentYear)
            ->count() / max(Siswa::count(), 1) * 100;

        $rataRataPembayaran = Pembayaran::where('status', 'disetujui')
            ->whereYear('tanggal_pembayaran', $currentYear)
            ->avg('jumlah') ?? 0;

        $chartData = $this->getMonthlyIncomeData($currentYear);

        // Summary by class
        $summaryByClass = DB::table('siswa')
            ->select('kelas', DB::raw('COUNT(*) as total_siswa'))
            ->groupBy('kelas')
            ->orderBy('kelas')
            ->get();

        return [
            'cards' => [
                [
                    'title' => 'Total Siswa',
                    'value' => number_format($totalSiswa),
                    'subtitle' => 'Siswa aktif',
                    'icon' => 'Users',
                    'color' => 'blue'
                ],
                [
                    'title' => 'Pemasukan Tahun Ini',
                    'value' => 'Rp ' . number_format($totalPemasukan, 0, ',', '.'),
                    'subtitle' => 'Total diterima',
                    'icon' => 'TrendingUp',
                    'color' => 'green'
                ],
                [
                    'title' => 'Tingkat Pembayaran',
                    'value' => number_format($tingkatPembayaran, 1) . '%',
                    'subtitle' => 'Dari total siswa',
                    'icon' => 'BarChart3',
                    'color' => 'purple'
                ],
                [
                    'title' => 'Rata-rata Pembayaran',
                    'value' => 'Rp ' . number_format($rataRataPembayaran, 0, ',', '.'),
                    'subtitle' => 'Per transaksi',
                    'icon' => 'DollarSign',
                    'color' => 'orange'
                ]
            ],
            'chartData' => $chartData,
            'summaryByClass' => $summaryByClass
        ];
    }

    private function getOrangTuaDashboardData($user)
    {
        // Untuk orang tua, ambil data anak-anaknya
        $siswa = Siswa::where('user_id', $user->id)->first();
        
        if (!$siswa) {
            return $this->getDefaultDashboardData();
        }

        // Total tagihan untuk siswa ini
        $jenisPembayaranWajib = JenisPembayaran::where('is_wajib', true)->get();
        $totalTagihan = $jenisPembayaranWajib->sum('nominal_default');

        // Yang sudah dibayar
        $sudahDibayar = Pembayaran::where('siswa_id', $siswa->id)
            ->where('status', 'disetujui')
            ->sum('jumlah');

        // Sisa pembayaran
        $sisaPembayaran = max($totalTagihan - $sudahDibayar, 0);

        // Pembayaran pending
        $pembayaranPending = Pembayaran::where('siswa_id', $siswa->id)
            ->where('status', 'pending')
            ->count();

        // Recent payments
        $recentPayments = Pembayaran::where('siswa_id', $siswa->id)
            ->with(['details.jenisPembayaran'])
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get();

        return [
            'cards' => [
                [
                    'title' => 'Total Tagihan',
                    'value' => 'Rp ' . number_format($totalTagihan, 0, ',', '.'),
                    'subtitle' => 'Untuk ' . $siswa->nama,
                    'icon' => 'Receipt',
                    'color' => 'blue'
                ],
                [
                    'title' => 'Sudah Dibayar',
                    'value' => 'Rp ' . number_format($sudahDibayar, 0, ',', '.'),
                    'subtitle' => 'Lunas',
                    'icon' => 'CheckCircle',
                    'color' => 'green'
                ],
                [
                    'title' => 'Sisa Pembayaran',
                    'value' => 'Rp ' . number_format($sisaPembayaran, 0, ',', '.'),
                    'subtitle' => 'Belum lunas',
                    'icon' => 'Clock',
                    'color' => $sisaPembayaran > 0 ? 'red' : 'green'
                ],
                [
                    'title' => 'Menunggu Validasi',
                    'value' => number_format($pembayaranPending),
                    'subtitle' => 'Pembayaran pending',
                    'icon' => 'FileText',
                    'color' => 'yellow'
                ]
            ],
            'siswa' => $siswa,
            'recentPayments' => $recentPayments
        ];
    }

    private function getSiswaDashboardData($user)
    {
        // Data sama seperti orang tua
        return $this->getOrangTuaDashboardData($user);
    }

    private function getDefaultDashboardData()
    {
        return [
            'cards' => [
                [
                    'title' => 'Total Tagihan',
                    'value' => 'Rp 0',
                    'subtitle' => 'Tidak ada data',
                    'icon' => 'Receipt',
                    'color' => 'gray'
                ]
            ]
        ];
    }

    private function getMonthlyIncomeData($year)
    {
        $monthlyData = [];
        
        for ($month = 1; $month <= 12; $month++) {
            $income = Pembayaran::where('status', 'disetujui')
                ->whereYear('tanggal_pembayaran', $year)
                ->whereMonth('tanggal_pembayaran', $month)
                ->sum('jumlah');
                
            $monthlyData[] = [
                'month' => Carbon::create($year, $month, 1)->format('M'),
                'income' => $income
            ];
        }
        
        return $monthlyData;
    }
}
