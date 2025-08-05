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

interface TagihanData {
    siswa: Siswa;
    pembayaran: {
        [key: string]: {
            jenis_id: number;
            nama_jenis: string;
            kode: string;
            nominal: number;
            sudah_bayar: boolean;
            jumlah_bayar: number;
            is_wajib: boolean;
        };
    };
    total_tagihan: number;
}

interface TagihanSiswaProps {
    siswaLogin: Siswa;
    tagihanData: TagihanData[];
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
}

export default function TagihanSiswa({ 
    siswaLogin,
    tagihanData = [],
    jenisPembayaran = [],
    rekening = [],
    stats = { total_pembayaran: 0, pending: 0, disetujui: 0, ditolak: 0, pembayaran_bulan_ini: 0, total_amount_disetujui: 0, total_amount_pending: 0 },
    filters 
}: TagihanSiswaProps) {
    const [bayarDialogOpen, setBayarDialogOpen] = useState(false);
    const [selectedJenis, setSelectedJenis] = useState<any>(null);

    const { data, setData, post, processing, errors, reset } = useForm<BayarFormData>({
        jenis_pembayaran_id: 0,
        rekening_id: 0,
        jumlah: 0,
        bukti_transfer: null,
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
                        <p className="text-gray-600 mt-1">
                            Daftar tagihan pembayaran sekolah
                        </p>
                        <div className="mt-2 text-sm text-gray-500">
                            HOME {'>'} TAGIHAN
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-600">NAMA SISWA</p>
                            <p className="font-semibold text-lg">{siswaLogin?.nama}</p>
                        </div>
                        <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                            <span className="text-xs text-gray-500">FOTO</span>
                        </div>
                    </div>
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

                {/* Tagihan Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Tagihan Kelas {siswaLogin?.kelas}</CardTitle>
                        <CardDescription>
                            Informasi tagihan untuk semua siswa di kelas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-bold">NAMA</TableHead>
                                        <TableHead className="font-bold">KELAS</TableHead>
                                        {jenisPembayaran.map((jenis) => (
                                            <TableHead key={jenis.id} className="font-bold text-center">
                                                {jenis.kode.toUpperCase()}
                                            </TableHead>
                                        ))}
                                        <TableHead className="font-bold text-center">JUMLAH</TableHead>
                                        <TableHead className="font-bold text-center">AKSI BAYAR</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tagihanData.map((item) => (
                                        <TableRow 
                                            key={item.siswa.id}
                                            className={item.siswa.id === siswaLogin?.id ? 'bg-blue-50' : ''}
                                        >
                                            <TableCell className="font-medium">
                                                {item.siswa.nama}
                                                {item.siswa.id === siswaLogin?.id && (
                                                    <Badge className="ml-2 bg-blue-100 text-blue-800">Anda</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{item.siswa.kelas}</TableCell>
                                            {jenisPembayaran.map((jenis) => {
                                                const pembayaranData = item.pembayaran[jenis.kode];
                                                return (
                                                    <TableCell key={jenis.id} className="text-center">
                                                        {pembayaranData ? (
                                                            <div className="space-y-1">
                                                                <div className="text-sm">
                                                                    {formatCurrency(pembayaranData.nominal)}
                                                                </div>
                                                                {getStatusBadge(pembayaranData.sudah_bayar, pembayaranData.is_wajib)}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell className="text-center font-semibold">
                                                {formatCurrency(item.total_tagihan)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.siswa.id === siswaLogin?.id && item.total_tagihan > 0 && (
                                                    <div className="space-y-1">
                                                        {Object.values(item.pembayaran).map((pembayaranData) => (
                                                            !pembayaranData.sudah_bayar && pembayaranData.is_wajib && (
                                                                <Button
                                                                    key={pembayaranData.jenis_id}
                                                                    size="sm"
                                                                    className="w-full bg-green-600 hover:bg-green-700"
                                                                    onClick={() => handleBayar(pembayaranData)}
                                                                >
                                                                    Bayar {pembayaranData.kode.toUpperCase()}
                                                                </Button>
                                                            )
                                                        ))}
                                                    </div>
                                                )}
                                                {item.siswa.id === siswaLogin?.id && item.total_tagihan === 0 && (
                                                    <Badge className="bg-green-100 text-green-800">Semua Lunas</Badge>
                                                )}
                                                {item.siswa.id !== siswaLogin?.id && (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
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
