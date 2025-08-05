import { PembayaranStatusDialog } from '@/components/pembayaran-status-dialog';
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
  Users,
  XCircle
} from 'lucide-react';
import { useState } from 'react';

interface StatusPembayaranProps {
  pembayaran: {
    data: Pembayaran[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  siswa: Siswa[];
  statistics: {
    total: number;
    pending: number;
    disetujui: number;
    ditolak: number;
    total_amount_approved: number;
  };
  filters: {
    status?: string;
    siswa_id?: string;
    search?: string;
  };
}

export default function StatusPembayaran({ pembayaran, siswa, statistics, filters }: StatusPembayaranProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
  const [selectedSiswa, setSelectedSiswa] = useState(filters.siswa_id || '');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedPembayaran, setSelectedPembayaran] = useState<Pembayaran | null>(null);

  const handleSearch = () => {
    router.get(route('admin.status-pembayaran.index'), {
      search: searchTerm,
      status: selectedStatus,
      siswa_id: selectedSiswa,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedSiswa('');
    router.get(route('admin.status-pembayaran.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  const handleStatusUpdate = (pembayaran: Pembayaran) => {
    setSelectedPembayaran(pembayaran);
    setStatusDialogOpen(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'disetujui':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'ditolak':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Status Pembayaran Siswa" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-800">Status Pembayaran Siswa</h1>
            <p className="text-gray-600 mt-1">
              Kelola dan pantau status pembayaran siswa
            </p>
          </div>
          <Button 
            variant="outline" 
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Pembayaran
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{statistics.total}</div>
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
              <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
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
              <div className="text-2xl font-bold text-green-600">{statistics.disetujui}</div>
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
              <div className="text-2xl font-bold text-red-600">{statistics.ditolak}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Disetujui
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(statistics.total_amount_approved)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Cari nama siswa atau NISN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="disetujui">Disetujui</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>

              <div>
                <select 
                  value={selectedSiswa} 
                  onChange={(e) => setSelectedSiswa(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Semua Siswa</option>
                  {siswa.map((s) => (
                    <option key={s.id} value={s.id.toString()}>
                      {s.nama} - {s.nisn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSearch}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Cari
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleReset}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-green-800">
              Daftar Pembayaran Siswa
            </CardTitle>
            <CardDescription>
              Total {pembayaran.total} pembayaran ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Siswa</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pembayaran.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        Tidak ada data pembayaran ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    pembayaran.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.siswa?.nama || 'N/A'}
                        </TableCell>
                        <TableCell>{item.siswa?.nisn || 'N/A'}</TableCell>
                        <TableCell>{item.siswa?.kelas || 'N/A'}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(item.jumlah)}
                        </TableCell>
                        <TableCell>{formatDate(item.tanggal_pembayaran)}</TableCell>
                        <TableCell>{item.rekening?.nama_bank || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${getStatusBadgeClass(item.status)} text-xs`}
                          >
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(item)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Update
                                </Button>
                              </>
                            )}
                            {item.status !== 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(item)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                Ubah
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pembayaran.last_page > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Menampilkan {pembayaran.data.length} dari {pembayaran.total} data
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.get(route('admin.status-pembayaran.index'), {
                      ...filters,
                      page: pembayaran.current_page - 1
                    })}
                    disabled={pembayaran.current_page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pembayaran.current_page} of {pembayaran.last_page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.get(route('admin.status-pembayaran.index'), {
                      ...filters,
                      page: pembayaran.current_page + 1
                    })}
                    disabled={pembayaran.current_page >= pembayaran.last_page}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Dialog */}
        <PembayaranStatusDialog
          pembayaran={selectedPembayaran}
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
        />
      </div>
    </AuthenticatedLayout>
  );
}
