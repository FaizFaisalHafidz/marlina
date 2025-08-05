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
import { Pembayaran } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    BarChart3,
    DollarSign,
    Download,
    Filter,
    Search,
    TrendingUp,
    Users
} from 'lucide-react';
import { useState } from 'react';

interface LaporanPemasukanProps {
    pemasukan: {
        data: Pembayaran[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total_pemasukan: number;
        jumlah_transaksi: number;
        rata_rata_pembayaran: number;
        pemasukan_hari_ini: number;
        pemasukan_bulan_ini: number;
        pemasukan_tahun_ini: number;
    };
    kelasList: string[];
    bankList: string[];
    monthlyIncome: {
        months: string[];
        incomes: number[];
    };
    filters: {
        tanggal_dari?: string;
        tanggal_sampai?: string;
        kelas?: string;
        bank?: string;
    };
}

export default function LaporanPemasukan({ 
    pemasukan, 
    stats, 
    kelasList = [], 
    bankList = [], 
    monthlyIncome = { months: [], incomes: [] }, 
    filters 
}: LaporanPemasukanProps) {
    const [tanggalDari, setTanggalDari] = useState(filters.tanggal_dari || '');
    const [tanggalSampai, setTanggalSampai] = useState(filters.tanggal_sampai || '');
    const [selectedKelas, setSelectedKelas] = useState(filters.kelas || '');
    const [selectedBank, setSelectedBank] = useState(filters.bank || '');

    // Detect route prefix based on current URL
    const currentPath = window.location.pathname;
    const routePrefix = currentPath.includes('/admin/') ? 'admin' : 
                       currentPath.includes('/bendahara/') ? 'bendahara' : 'kepala';

    const handleSearch = () => {
        router.get(route(`${routePrefix}.laporan-pemasukan.index`), {
            tanggal_dari: tanggalDari,
            tanggal_sampai: tanggalSampai,
            kelas: selectedKelas,
            bank: selectedBank,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setTanggalDari('');
        setTanggalSampai('');
        setSelectedKelas('');
        setSelectedBank('');
        router.get(route(`${routePrefix}.laporan-pemasukan.index`), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleExport = () => {
        window.open(route(`${routePrefix}.laporan-pemasukan.export`, {
            tanggal_dari: tanggalDari,
            tanggal_sampai: tanggalSampai,
            kelas: selectedKelas,
            bank: selectedBank,
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

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Pemasukan" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-green-800">Laporan Pemasukan</h1>
                        <p className="text-gray-600 mt-1">
                            Monitor dan analisis pemasukan sekolah
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        className="border-green-200 text-green-700 hover:bg-green-50"
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
                                Total Pemasukan
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800">
                                {formatCurrency(stats.total_pemasukan)}
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
                                Transaksi berhasil
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
                                {formatCurrency(stats.rata_rata_pembayaran)}
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
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-800">
                                {formatCurrency(stats.pemasukan_hari_ini)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Pemasukan harian
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-green-800">
                                Pemasukan Bulan Ini
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                {formatCurrency(stats.pemasukan_bulan_ini)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-green-800">
                                Pemasukan Tahun Ini
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                {formatCurrency(stats.pemasukan_tahun_ini)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter Laporan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                    Tanggal Dari
                                </label>
                                <Input
                                    type="date"
                                    value={tanggalDari}
                                    onChange={(e) => setTanggalDari(e.target.value)}
                                    className="focus:ring-green-500 focus:border-green-500"
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
                                    className="focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                    Kelas
                                </label>
                                <select
                                    value={selectedKelas}
                                    onChange={(e) => setSelectedKelas(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Semua Kelas</option>
                                    {kelasList.map((kelas) => (
                                        <option key={kelas} value={kelas}>
                                            {kelas}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                    Bank
                                </label>
                                <select
                                    value={selectedBank}
                                    onChange={(e) => setSelectedBank(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Semua Bank</option>
                                    {bankList.map((bank) => (
                                        <option key={bank} value={bank}>
                                            {bank}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col justify-end">
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={handleSearch}
                                        className="bg-green-600 hover:bg-green-700 flex-1"
                                        size="sm"
                                    >
                                        <Search className="h-4 w-4 mr-2" />
                                        Filter
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        onClick={handleReset}
                                        className="border-green-200 text-green-700 hover:bg-green-50"
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
                        <CardTitle className="text-lg font-semibold text-green-800">
                            Detail Pemasukan
                        </CardTitle>
                        <CardDescription>
                            {pemasukan.total} transaksi ditemukan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Siswa</TableHead>
                                        <TableHead>NISN</TableHead>
                                        <TableHead>Kelas</TableHead>
                                        <TableHead>Bank</TableHead>
                                        <TableHead className="text-right">Jumlah</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pemasukan.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                Tidak ada data pemasukan ditemukan
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pemasukan.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{formatDate(item.tanggal_pembayaran)}</TableCell>
                                                <TableCell className="font-medium">
                                                    {item.siswa?.nama || 'N/A'}
                                                </TableCell>
                                                <TableCell>{item.siswa?.nisn || 'N/A'}</TableCell>
                                                <TableCell>{item.siswa?.kelas || 'N/A'}</TableCell>
                                                <TableCell>{item.rekening?.nama_bank || 'N/A'}</TableCell>
                                                <TableCell className="text-right font-semibold text-green-600">
                                                    {formatCurrency(item.jumlah)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        Disetujui
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {pemasukan.last_page > 1 && (
                            <div className="flex items-center justify-between space-x-2 py-4">
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan {pemasukan.data.length} dari {pemasukan.total} data
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(route(`${routePrefix}.laporan-pemasukan.index`), {
                                            ...filters,
                                            page: pemasukan.current_page - 1
                                        })}
                                        disabled={pemasukan.current_page <= 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm">
                                        Page {pemasukan.current_page} of {pemasukan.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(route(`${routePrefix}.laporan-pemasukan.index`), {
                                            ...filters,
                                            page: pemasukan.current_page + 1
                                        })}
                                        disabled={pemasukan.current_page >= pemasukan.last_page}
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
