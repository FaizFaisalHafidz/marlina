import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    DollarSign,
    Download,
    Filter,
    Search,
    TrendingDown,
    Users
} from 'lucide-react';
import { useState } from 'react';

interface KategoriPengeluaran {
    id: number;
    nama_kategori: string;
    kode: string;
    deskripsi: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface ExpenseItem {
    id: number;
    tanggal: string;
    kategori: KategoriPengeluaran;
    deskripsi: string;
    jumlah: number;
    status: string;
}

interface LaporanPengeluaranProps {
    pengeluaran: {
        data: ExpenseItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total_pengeluaran: number;
        jumlah_transaksi: number;
        rata_rata_pengeluaran: number;
        pengeluaran_hari_ini: number;
        pengeluaran_bulan_ini: number;
        pengeluaran_tahun_ini: number;
        kategori_terbesar: {
            nama: string;
            jumlah: number;
        } | null;
    };
    categories: KategoriPengeluaran[];
    monthlyExpense: {
        months: string[];
        expenses: number[];
    };
    filters: {
        tanggal_dari?: string;
        tanggal_sampai?: string;
        kategori?: string;
    };
}

export default function LaporanPengeluaran({ 
    pengeluaran, 
    stats, 
    categories = [], 
    monthlyExpense = { months: [], expenses: [] }, 
    filters 
}: LaporanPengeluaranProps) {
    const [tanggalDari, setTanggalDari] = useState(filters.tanggal_dari || '');
    const [tanggalSampai, setTanggalSampai] = useState(filters.tanggal_sampai || '');
    const [selectedKategori, setSelectedKategori] = useState(filters.kategori || '');

    // Detect route prefix based on current URL
    const currentPath = window.location.pathname;
    const routePrefix = currentPath.includes('/admin/') ? 'admin' : 
                       currentPath.includes('/bendahara/') ? 'bendahara' : 'kepala';

    const handleSearch = () => {
        router.get(route(`${routePrefix}.laporan-pengeluaran.index`), {
            tanggal_dari: tanggalDari,
            tanggal_sampai: tanggalSampai,
            kategori: selectedKategori,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setTanggalDari('');
        setTanggalSampai('');
        setSelectedKategori('');
        router.get(route(`${routePrefix}.laporan-pengeluaran.index`), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleExport = () => {
        window.open(route(`${routePrefix}.laporan-pengeluaran.export`, {
            tanggal_dari: tanggalDari,
            tanggal_sampai: tanggalSampai,
            kategori: selectedKategori,
        }), '_blank');
    };

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(amount));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'pending':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Pengeluaran" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-red-800">Laporan Pengeluaran</h1>
                        <p className="text-gray-600 mt-1">
                            Monitor dan kontrol pengeluaran sekolah
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        className="border-red-200 text-red-700 hover:bg-red-50"
                        onClick={handleExport}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export Laporan
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total Pengeluaran
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-800">
                                {formatCurrency(stats.total_pengeluaran)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Periode yang dipilih
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Jumlah Transaksi
                            </CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-800">
                                {stats.jumlah_transaksi}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Transaksi pengeluaran
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Rata-rata
                            </CardTitle>
                            <BarChart3 className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-800">
                                {formatCurrency(stats.rata_rata_pengeluaran)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Per transaksi
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Hari Ini
                            </CardTitle>
                            <TrendingDown className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-800">
                                {formatCurrency(stats.pengeluaran_hari_ini)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Pengeluaran harian
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-red-800">
                                Pengeluaran Bulan Ini
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">
                                {formatCurrency(stats.pengeluaran_bulan_ini)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-red-800">
                                Pengeluaran Tahun Ini
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">
                                {formatCurrency(stats.pengeluaran_tahun_ini)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-red-800 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Kategori Terbesar
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.kategori_terbesar ? (
                                <>
                                    <div className="text-xl font-bold text-red-600">
                                        {stats.kategori_terbesar.nama}
                                    </div>
                                    <div className="text-lg font-semibold text-gray-600">
                                        {formatCurrency(stats.kategori_terbesar.jumlah)}
                                    </div>
                                </>
                            ) : (
                                <div className="text-gray-500">
                                    Tidak ada data pengeluaran
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-red-800 flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter Laporan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                    Tanggal Dari
                                </label>
                                <Input
                                    type="date"
                                    value={tanggalDari}
                                    onChange={(e) => setTanggalDari(e.target.value)}
                                    className="focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                    Tanggal Sampai
                                </label>
                                <Input
                                    type="date"
                                    value={tanggalSampai}
                                    onChange={(e) => setTanggalSampai(e.target.value)}
                                    className="focus:ring-red-500 focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                    Kategori
                                </label>
                                <select
                                    value={selectedKategori}
                                    onChange={(e) => setSelectedKategori(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map((kategori) => (
                                        <option key={kategori.id} value={kategori.id}>
                                            {kategori.nama_kategori}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col justify-end">
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={handleSearch}
                                        className="bg-red-600 hover:bg-red-700 flex-1"
                                        size="sm"
                                    >
                                        <Search className="h-4 w-4 mr-2" />
                                        Filter
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        onClick={handleReset}
                                        className="border-red-200 text-red-700 hover:bg-red-50"
                                        size="sm"
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-red-800">
                            Detail Pengeluaran
                        </CardTitle>
                        <CardDescription>
                            {pengeluaran.total} transaksi ditemukan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead className="text-right">Jumlah</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pengeluaran.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                Tidak ada data pengeluaran ditemukan
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pengeluaran.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{formatDate(item.tanggal)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                        {item.kategori?.nama_kategori}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {item.deskripsi}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-red-600">
                                                    {formatCurrency(item.jumlah)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        variant="outline" 
                                                        className={getStatusBadgeClass(item.status)}
                                                    >
                                                        {item.status === 'approved' ? 'Disetujui' : 
                                                         item.status === 'pending' ? 'Pending' : 'Ditolak'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {pengeluaran.last_page > 1 && (
                            <div className="flex items-center justify-between space-x-2 py-4">
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan {pengeluaran.data.length} dari {pengeluaran.total} data
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(route(`${routePrefix}.laporan-pengeluaran.index`), {
                                            ...filters,
                                            page: pengeluaran.current_page - 1
                                        })}
                                        disabled={pengeluaran.current_page <= 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm">
                                        Page {pengeluaran.current_page} of {pengeluaran.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(route(`${routePrefix}.laporan-pengeluaran.index`), {
                                            ...filters,
                                            page: pengeluaran.current_page + 1
                                        })}
                                        disabled={pengeluaran.current_page >= pengeluaran.last_page}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
