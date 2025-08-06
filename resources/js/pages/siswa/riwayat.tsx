import PaymentProof from '@/components/payment-proof';
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
import { Pembayaran, Siswa } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    CheckCircle,
    Clock,
    DollarSign,
    Download,
    Filter,
    Search,
    TrendingUp,
    XCircle
} from 'lucide-react';
import { useState } from 'react';

interface RiwayatSiswaProps {
  riwayat: {
    data: Pembayaran[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: {
    total_pembayaran: number;
    total_disetujui: number;
    total_pending: number;
    total_ditolak: number;
    total_amount_disetujui: number;
    total_amount_pending: number;
  };
  siswa: Siswa;
  monthlyPayments: {
    months: string[];
    data: number[];
  };
  filters: {
    status?: string;
    tanggal_dari?: string;
    tanggal_sampai?: string;
  };
}

export default function RiwayatSiswa({ 
  riwayat = { data: [], current_page: 1, last_page: 1, per_page: 15, total: 0 }, 
  stats = { total_pembayaran: 0, total_disetujui: 0, total_pending: 0, total_ditolak: 0, total_amount_disetujui: 0, total_amount_pending: 0 }, 
  siswa,
  monthlyPayments = { months: [], data: [] },
  filters 
}: RiwayatSiswaProps) {
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
  const [tanggalDari, setTanggalDari] = useState(filters.tanggal_dari || '');
  const [tanggalSampai, setTanggalSampai] = useState(filters.tanggal_sampai || '');

  // Detect route prefix based on current URL
  const currentPath = window.location.pathname;
  const routePrefix = 'siswa';

  const handleSearch = () => {
    router.get(route(`${routePrefix}.riwayat.index`), {
      status: selectedStatus,
      tanggal_dari: tanggalDari,
      tanggal_sampai: tanggalSampai,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleReset = () => {
    setSelectedStatus('');
    setTanggalDari('');
    setTanggalSampai('');
    router.get(route(`${routePrefix}.riwayat.index`), {}, {
      preserveState: true,
      replace: true,
    });
  };

  const handleExport = () => {
    window.open(route(`${routePrefix}.riwayat.export`, {
      status: selectedStatus,
      tanggal_dari: tanggalDari,
      tanggal_sampai: tanggalSampai,
    }), '_blank');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'disetujui':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ditolak':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  return (
    <AuthenticatedLayout>
      <Head title="Riwayat Pembayaran" />

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Riwayat Pembayaran</h1>
            <p className="text-gray-600 mt-1">
              Riwayat lengkap pembayaran Anda
            </p>
          </div>
          <Button 
            variant="outline" 
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Riwayat
          </Button>
        </div>

        {/* Student Info Card */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Informasi Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nama</p>
                <p className="font-semibold">{siswa?.nama}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">NISN</p>
                <p className="font-semibold">{siswa?.nisn}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Kelas</p>
                <p className="font-semibold">{siswa?.kelas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Pembayaran
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{stats.total_pembayaran}</div>
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
              <div className="text-2xl font-bold text-green-600">{stats.total_disetujui}</div>
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
              <div className="text-2xl font-bold text-yellow-600">{stats.total_pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ditolak
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.total_ditolak}</div>
            </CardContent>
          </Card>
        </div>

        {/* Amount Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Disetujui
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.total_amount_disetujui)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Pending
              </CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(stats.total_amount_pending)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="disetujui">Disetujui</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Dari
                </label>
                <Input
                  type="date"
                  value={tanggalDari}
                  onChange={(e) => setTanggalDari(e.target.value)}
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Sampai
                </label>
                <Input
                  type="date"
                  value={tanggalSampai}
                  onChange={(e) => setTanggalSampai(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4 mr-2" />
                Cari
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pembayaran</CardTitle>
            <CardDescription>
              Riwayat lengkap pembayaran yang pernah dilakukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {riwayat.data.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada riwayat pembayaran</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Jenis Pembayaran</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead className="text-center">Bukti</TableHead>
                        <TableHead>Bank</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {riwayat.data.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {(riwayat.current_page - 1) * riwayat.per_page + index + 1}
                          </TableCell>
                          <TableCell>
                            {new Date(item.tanggal_pembayaran).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {item.details?.map((detail, idx) => (
                                <div key={detail.id} className="text-sm">
                                  <Badge variant="outline" className="text-xs">
                                    {detail.jenis_pembayaran?.kode || 'Unknown'}
                                  </Badge>
                                </div>
                              )) || (
                                <span className="text-sm">{item.jenis_pembayaran || '-'}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(item.jumlah)}
                          </TableCell>
                          <TableCell className="text-center">
                            <PaymentProof
                              bukti_pembayaran={item.bukti_pembayaran}
                              siswa_nama={siswa.nama}
                              jumlah={Number(item.jumlah)}
                              showEmpty={true}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{item.rekening?.nama_bank || '-'}</div>
                              <div className="text-gray-500">{item.rekening?.nomor_rekening || ''}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={getStatusBadgeClass(item.status)}
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {riwayat.last_page > 1 && (
                  <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="text-sm text-muted-foreground">
                      Menampilkan {riwayat.data.length} dari {riwayat.total} data
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.get(route(`${routePrefix}.riwayat.index`), {
                          ...filters,
                          page: riwayat.current_page - 1
                        })}
                        disabled={riwayat.current_page <= 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {riwayat.current_page} of {riwayat.last_page}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.get(route(`${routePrefix}.riwayat.index`), {
                          ...filters,
                          page: riwayat.current_page + 1
                        })}
                        disabled={riwayat.current_page >= riwayat.last_page}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
