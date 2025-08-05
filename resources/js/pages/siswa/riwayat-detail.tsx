import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Pembayaran, Siswa } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    Download,
    FileText,
    Receipt,
    User
} from 'lucide-react';

interface RiwayatDetailProps {
    siswaLogin: Siswa;
    pembayaran: Pembayaran;
}

export default function RiwayatDetail({ 
    siswaLogin,
    pembayaran
}: RiwayatDetailProps) {

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(amount));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'disetujui':
                return <Badge className="bg-green-100 text-green-800 border-green-200">Disetujui</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Menunggu Validasi</Badge>;
            case 'ditolak':
                return <Badge className="bg-red-100 text-red-800 border-red-200">Ditolak</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
        }
    };

    const downloadReceipt = () => {
        router.get(route('siswa.riwayat.download', pembayaran.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Detail Pembayaran #${pembayaran.id}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href={route('siswa.riwayat.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-blue-800">
                                Detail Pembayaran #{pembayaran.id}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Informasi lengkap transaksi pembayaran
                            </p>
                        </div>
                    </div>
                    {pembayaran.status === 'disetujui' && (
                        <Button onClick={downloadReceipt} className="bg-green-600 hover:bg-green-700">
                            <Download className="h-4 w-4 mr-2" />
                            Download Kwitansi
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Payment Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Payment Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Receipt className="h-5 w-5" />
                                    Informasi Pembayaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">ID Transaksi</label>
                                        <p className="text-lg font-semibold">#{pembayaran.id}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Status</label>
                                        <div className="mt-1">
                                            {getStatusBadge(pembayaran.status)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Tanggal Pembayaran</label>
                                        <p className="text-lg font-semibold">
                                            {new Date(pembayaran.tanggal_pembayaran).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Total Pembayaran</label>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(pembayaran.jumlah)}
                                        </p>
                                    </div>
                                </div>

                                {pembayaran.keterangan && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Keterangan</label>
                                        <p className="text-gray-800 mt-1">{pembayaran.keterangan}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Detail Item Pembayaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {pembayaran.details?.map((detail, index) => (
                                        <div key={detail.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">
                                                            {detail.jenis_pembayaran?.kode}
                                                        </Badge>
                                                        <h3 className="font-semibold text-lg">
                                                            {detail.jenis_pembayaran?.nama_jenis}
                                                        </h3>
                                                    </div>
                                                    {detail.keterangan && (
                                                        <p className="text-gray-600 text-sm">{detail.keterangan}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-blue-600">
                                                        {formatCurrency(detail.jumlah)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold">Total:</span>
                                            <span className="text-2xl font-bold text-green-600">
                                                {formatCurrency(pembayaran.jumlah)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Proof */}
                        {pembayaran.bukti_transfer && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Bukti Transfer</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="border rounded-lg p-4 bg-gray-50">
                                        <img 
                                            src={`/storage/${pembayaran.bukti_transfer}`} 
                                            alt="Bukti Transfer"
                                            className="max-w-full h-auto rounded-md shadow-sm"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Student Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Data Siswa
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Nama</label>
                                    <p className="font-semibold">{siswaLogin.nama}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Kelas</label>
                                    <p className="font-semibold">{siswaLogin.kelas}</p>
                                </div>
                                {siswaLogin.nisn && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">NISN</label>
                                        <p className="font-semibold">{siswaLogin.nisn}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        {pembayaran.rekening && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Rekening Tujuan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Bank</label>
                                        <p className="font-semibold">{pembayaran.rekening.nama_bank}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">No. Rekening</label>
                                        <p className="font-semibold">{pembayaran.rekening.nomor_rekening}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Atas Nama</label>
                                        <p className="font-semibold">{pembayaran.rekening.nama_penerima}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <div>
                                        <p className="font-medium">Pembayaran Dibuat</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(pembayaran.created_at).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                                
                                {pembayaran.status === 'disetujui' && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <div>
                                            <p className="font-medium">Pembayaran Disetujui</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(pembayaran.updated_at).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {pembayaran.status === 'ditolak' && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div>
                                            <p className="font-medium">Pembayaran Ditolak</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(pembayaran.updated_at).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {pembayaran.status === 'pending' && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                                        <div>
                                            <p className="font-medium">Menunggu Validasi</p>
                                            <p className="text-sm text-gray-500">
                                                Dalam proses review
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
