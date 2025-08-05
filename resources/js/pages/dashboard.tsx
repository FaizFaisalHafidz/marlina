import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProfileCard } from '@/components/user-profile-card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    FileText,
    Receipt,
    TrendingUp,
    Users
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Icon mapping
const iconMap = {
    Users,
    Receipt,
    TrendingUp,
    DollarSign,
    Clock,
    CheckCircle,
    BarChart3,
    FileText,
    Activity
};

// Color mapping for cards
const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500', 
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    gray: 'bg-gray-500'
};

interface DashboardProps {
    user: any;
    dashboardData: {
        cards: Array<{
            title: string;
            value: string;
            subtitle: string;
            icon: string;
            color: string;
        }>;
        chartData?: Array<{
            month: string;
            income: number;
        }>;
        recentActivities?: any[];
        recentTransactions?: any[];
        recentPayments?: any[];
        summaryByClass?: any[];
        siswa?: any;
    };
    userRole: string;
}

export default function Dashboard({ user, dashboardData, userRole }: DashboardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'disetujui':
                return <Badge className="bg-green-100 text-green-800 border-green-200">Disetujui</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Menunggu</Badge>;
            case 'ditolak':
                return <Badge className="bg-red-100 text-red-800 border-red-200">Ditolak</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* User Profile Card */}
                <UserProfileCard 
                    name={user?.name || 'User'}
                    role={userRole}
                    kelas={dashboardData.siswa?.kelas}
                    nisn={dashboardData.siswa?.nisn}
                    avatar={user?.avatar}
                />

                {/* Dashboard Cards */}
                <div className={`grid gap-6 ${dashboardData.cards.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
                    {dashboardData.cards.map((card, index) => {
                        const IconComponent = iconMap[card.icon as keyof typeof iconMap] || Activity;
                        const colorClass = colorMap[card.color as keyof typeof colorMap] || 'bg-blue-500';
                        
                        return (
                            <Card key={index} className="relative overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        {card.title}
                                    </CardTitle>
                                    <div className={`p-2 rounded-full ${colorClass} bg-opacity-10`}>
                                        <IconComponent className={`h-4 w-4 ${colorClass.replace('bg-', 'text-')}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {card.value}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {card.subtitle}
                                    </p>
                                </CardContent>
                                <div className={`absolute bottom-0 left-0 w-full h-1 ${colorClass}`}></div>
                            </Card>
                        );
                    })}
                </div>

                {/* Content Area based on Role */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart Area */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                {userRole === 'Kepala Madrasah' || userRole === 'Admin' || userRole === 'Bendahara' 
                                    ? 'Grafik Pemasukan Bulanan' 
                                    : 'Ringkasan Pembayaran'
                                }
                            </CardTitle>
                            <CardDescription>
                                {userRole === 'Kepala Madrasah' || userRole === 'Admin' || userRole === 'Bendahara'
                                    ? 'Pemasukan sekolah per bulan tahun ini'
                                    : 'Status pembayaran dan riwayat transaksi'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dashboardData.chartData ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        {dashboardData.chartData.slice(-3).map((data, index) => (
                                            <div key={index} className="border rounded-lg p-3">
                                                <div className="text-sm text-gray-500">{data.month}</div>
                                                <div className="text-lg font-semibold text-blue-600">
                                                    {formatCurrency(data.income)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-center text-sm text-gray-500">
                                        3 bulan terakhir
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-40 items-center justify-center text-gray-400">
                                    <div className="text-center">
                                        <BarChart3 className="mx-auto h-8 w-8 mb-2" />
                                        <p className="text-sm">Data grafik tidak tersedia</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Activities/Transactions */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                {userRole === 'Bendahara' ? 'Transaksi Pending' :
                                 userRole === 'Admin' ? 'Aktivitas Terbaru' :
                                 'Pembayaran Terbaru'}
                            </CardTitle>
                            <CardDescription>
                                {userRole === 'Bendahara' ? 'Transaksi yang memerlukan validasi' :
                                 userRole === 'Admin' ? 'Aktivitas pembayaran terbaru' :
                                 'Riwayat pembayaran terakhir'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {/* For Bendahara - Recent Transactions */}
                                {userRole === 'Bendahara' && dashboardData.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
                                    dashboardData.recentTransactions.slice(0, 5).map((transaction: any) => (
                                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{transaction.siswa?.nama}</p>
                                                <p className="text-xs text-gray-500">
                                                    {transaction.details?.map((d: any) => d.jenis_pembayaran?.kode).join(', ')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-sm">{formatCurrency(transaction.jumlah)}</p>
                                                <p className="text-xs text-yellow-600">Pending</p>
                                            </div>
                                        </div>
                                    ))
                                ) : 
                                /* For Admin - Recent Activities */
                                userRole === 'Admin' && dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
                                    dashboardData.recentActivities.slice(0, 5).map((activity: any) => (
                                        <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{activity.siswa?.nama}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(activity.created_at).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-sm">{formatCurrency(activity.jumlah)}</p>
                                                {getStatusBadge(activity.status)}
                                            </div>
                                        </div>
                                    ))
                                ) : 
                                /* For Parents/Students - Recent Payments */
                                (userRole === 'Orang Tua' || userRole === 'Siswa') && dashboardData.recentPayments && dashboardData.recentPayments.length > 0 ? (
                                    dashboardData.recentPayments.map((payment: any) => (
                                        <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">
                                                    {payment.details?.map((d: any) => d.jenis_pembayaran?.nama_jenis).join(', ')}
                                                </p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(payment.tanggal_pembayaran).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-sm">{formatCurrency(payment.jumlah)}</p>
                                                {getStatusBadge(payment.status)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex h-32 items-center justify-center text-gray-400">
                                        <div className="text-center">
                                            <FileText className="mx-auto h-8 w-8 mb-2" />
                                            <p className="text-sm">Belum ada data</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary by Class (for Kepala Madrasah) */}
                {userRole === 'Kepala Madrasah' && dashboardData.summaryByClass && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Ringkasan Per Kelas</CardTitle>
                            <CardDescription>Jumlah siswa di setiap kelas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {dashboardData.summaryByClass.map((classData, index) => (
                                    <div key={index} className="text-center p-3 border rounded-lg">
                                        <div className="font-semibold text-blue-600">{classData.kelas}</div>
                                        <div className="text-2xl font-bold">{classData.total_siswa}</div>
                                        <div className="text-xs text-gray-500">siswa</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
