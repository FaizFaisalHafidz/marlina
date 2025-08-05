import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AuthenticatedLayout from '@/layouts/app-layout';
import { JenisPembayaran, Rekening, Siswa } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    Upload,
    Users
} from 'lucide-react';
import { useState } from 'react';

interface PembayaranData {
    id: number;
    siswa_id: number;
    jumlah: number;
    status: string;
    tanggal_pembayaran: string;
    created_at: string;
    details: {
        id: number;
        jenis_pembayaran_id: number;
        jumlah: number;
        keterangan: string;
        jenis_pembayaran: JenisPembayaran;
    }[];
}

interface StudentPaymentStatus {
    [key: string]: {
        jenis_id: number;
        nama_jenis: string;
        kode: string;
        nominal: number;
        sudah_bayar: boolean;
        jumlah_bayar: number;
        is_wajib: boolean;
    };
}

interface TagihanSiswaProps {
    siswaLogin: Siswa;
    recentPayments: PembayaranData[];
    studentPaymentStatus: StudentPaymentStatus;
    totalTagihan: number;
    jenisPembayaran: JenisPembayaran[];
    rekening: Rekening[];
    stats: {
        total_pembayaran: number;
        pending: number;
        disetujui: number;
        ditolak: number;
        pembayaran_bulan_ini: number;
        total_amount_disetujui: number;
        total_amount_pending: number;
    };
    filters: {
        status?: string;
    };
}

interface BayarFormData {
    jenis_pembayaran_id: number;
    rekening_id: number;
    jumlah: number;
    bukti_transfer: File | null;
    [key: string]: any;
}

export default function TagihanSiswa({ 
    siswaLogin,
    recentPayments = [],
    studentPaymentStatus = {},
    totalTagihan = 0,
    jenisPembayaran = [],
    rekening = [],
    stats = { total_pembayaran: 0, pending: 0, disetujui: 0, ditolak: 0, pembayaran_bulan_ini: 0, total_amount_disetujui: 0, total_amount_pending: 0 },
    filters 
}: TagihanSiswaProps) {
    const [bayarDialogOpen, setBayarDialogOpen] = useState(false);
    const [selectedJenis, setSelectedJenis] = useState<any>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        jenis_pembayaran_id: 0,
        rekening_id: 0,
        jumlah: 0,
        bukti_transfer: null as File | null,
    });

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(amount));
    };

    const handleBayar = (jenisData: any) => {
        setSelectedJenis(jenisData);
        setData({
            jenis_pembayaran_id: jenisData.jenis_id,
            rekening_id: 0,
            jumlah: jenisData.nominal,
            bukti_transfer: null,
        });
        setBayarDialogOpen(true);
    };

    const handleSubmitBayar = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('siswa.tagihan.bayar'), {
            onSuccess: () => {
                setBayarDialogOpen(false);
                reset();
                setSelectedJenis(null);
            },
        });
    };

    const getStatusBadge = (sudahBayar: boolean, isWajib: boolean) => {
        if (sudahBayar) {
            return <Badge className="bg-green-100 text-green-800 border-green-200">Lunas</Badge>;
        }
        if (isWajib) {
            return <Badge className="bg-red-100 text-red-800 border-red-200">Belum Bayar</Badge>;
        }
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Optional</Badge>;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tagihan" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-800">Tagihan</h1>
                        {/* <p className="text-gray-600 mt-1">
                            Daftar tagihan pembayaran sekolah
                        </p>
                        <div className="mt-2 text-sm text-gray-500">
                            HOME {'>'} TAGIHAN
                        </div> */}
                    </div>
                    {/* <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-600">NAMA SISWA</p>
                            <p className="font-semibold text-lg">{siswaLogin?.nama}</p>
                        </div>
                        <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                            <span className="text-xs text-gray-500">FOTO</span>
                        </div>
                    </div> */}
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total Pembayaran
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-800">{stats.total_pembayaran}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Pending
                            </CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Disetujui
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.disetujui}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total Lunas
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(stats.total_amount_disetujui)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Pembayaran */}
                <Card>
                    <CardHeader>
                        <CardTitle>Status Pembayaran Anda</CardTitle>
                        <CardDescription>
                            Status pembayaran untuk semua jenis tagihan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(studentPaymentStatus).map(([kode, data]) => (
                                <div key={kode} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-lg">{kode.toUpperCase()}</h3>
                                        {getStatusBadge(data.sudah_bayar, data.is_wajib)}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{data.nama_jenis}</p>
                                    <p className="text-lg font-bold text-blue-600">
                                        {formatCurrency(data.nominal)}
                                    </p>
                                    {!data.sudah_bayar && data.is_wajib && (
                                        <Button
                                            size="sm"
                                            className="w-full mt-3 bg-green-600 hover:bg-green-700"
                                            onClick={() => handleBayar(data)}
                                        >
                                            Bayar Sekarang
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {totalTagihan > 0 && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-red-800 font-semibold">Total Tagihan Belum Lunas:</span>
                                    <span className="text-red-800 font-bold text-lg">
                                        {formatCurrency(totalTagihan)}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        {totalTagihan === 0 && (
                            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <span className="text-green-800 font-semibold">Semua Tagihan Sudah Lunas!</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Riwayat Pembayaran Terbaru */}
                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Pembayaran Terbaru</CardTitle>
                        <CardDescription>
                            3 pembayaran terakhir yang Anda lakukan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentPayments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Jenis Pembayaran</TableHead>
                                            <TableHead className="text-center">Jumlah</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentPayments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>
                                                    {new Date(payment.tanggal_pembayaran).toLocaleDateString('id-ID')}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        {payment.details.map((detail, idx) => (
                                                            <div key={detail.id}>
                                                                <span className="font-medium">
                                                                    {detail.jenis_pembayaran.nama_jenis}
                                                                </span>
                                                                {idx < payment.details.length - 1 && (
                                                                    <span className="text-gray-400"> + </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center font-semibold">
                                                    {formatCurrency(payment.jumlah)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge 
                                                        className={
                                                            payment.status === 'disetujui' 
                                                                ? 'bg-green-100 text-green-800 border-green-200'
                                                                : payment.status === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                                : 'bg-red-100 text-red-800 border-red-200'
                                                        }
                                                    >
                                                        {payment.status === 'disetujui' ? 'Disetujui' :
                                                         payment.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>Belum ada riwayat pembayaran</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payment Dialog */}
                <Dialog open={bayarDialogOpen} onOpenChange={setBayarDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Bayar {selectedJenis?.nama_jenis}</DialogTitle>
                            <DialogDescription>
                                Silakan isi form pembayaran di bawah ini
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmitBayar} className="space-y-4">
                            <div>
                                <Label htmlFor="rekening_id">Pilih Rekening Tujuan</Label>
                                <select
                                    id="rekening_id"
                                    value={data.rekening_id}
                                    onChange={(e) => setData('rekening_id', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Pilih Rekening</option>
                                    {rekening.map((rek) => (
                                        <option key={rek.id} value={rek.id}>
                                            {rek.nama_bank} - {rek.nomor_rekening} ({rek.nama_penerima})
                                        </option>
                                    ))}
                                </select>
                                {errors.rekening_id && <p className="text-red-500 text-sm mt-1">{errors.rekening_id}</p>}
                            </div>

                            <div>
                                <Label htmlFor="jumlah">Jumlah Pembayaran</Label>
                                <Input
                                    id="jumlah"
                                    type="number"
                                    value={data.jumlah}
                                    onChange={(e) => setData('jumlah', parseInt(e.target.value))}
                                    placeholder="Masukkan jumlah"
                                    required
                                />
                                {errors.jumlah && <p className="text-red-500 text-sm mt-1">{errors.jumlah}</p>}
                            </div>

                            <div>
                                <Label htmlFor="bukti_transfer">Bukti Transfer</Label>
                                <Input
                                    id="bukti_transfer"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('bukti_transfer', e.target.files?.[0] || null)}
                                    required
                                />
                                {errors.bukti_transfer && <p className="text-red-500 text-sm mt-1">{errors.bukti_transfer}</p>}
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setBayarDialogOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Upload className="h-4 w-4 mr-2 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Bayar Sekarang
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
