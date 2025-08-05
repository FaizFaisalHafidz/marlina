import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ValidasiStatusDialog } from '@/components/validasi-status-dialog'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem, type Pembayaran, type Siswa } from '@/types'
import { Head, router } from '@inertiajs/react'
import { CheckCircle, Clock, Download, Filter, Search, TrendingUp, Users } from 'lucide-react'
import { useState } from 'react'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Validasi Transaksi',
    href: '/bendahara/validasi-transaksi',
  },
]

interface ValidationStats {
  total_pembayaran: number
  pending: number
  disetujui: number
  ditolak: number
  pembayaran_hari_ini: number
  pembayaran_bulan_ini: number
  total_amount_disetujui: number
  total_amount_pending: number
}

interface ValidasiTransaksiProps {
  pembayaran: {
    data: Pembayaran[]
    current_page: number
    last_page: number
    total: number
  }
  siswa: Siswa[]
  stats: ValidationStats
  filters: {
    search?: string
    status?: string
    tanggal_dari?: string
    tanggal_sampai?: string
  }
}

export default function ValidasiTransaksi({ pembayaran, siswa, stats, filters }: ValidasiTransaksiProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '')
  const [tanggalDari, setTanggalDari] = useState(filters.tanggal_dari || '')
  const [tanggalSampai, setTanggalSampai] = useState(filters.tanggal_sampai || '')
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedPembayaran, setSelectedPembayaran] = useState<Pembayaran | null>(null)

  const handleSearch = () => {
    router.get(route('bendahara.validasi-transaksi.index'), {
      search: searchTerm,
      status: selectedStatus,
      tanggal_dari: tanggalDari,
      tanggal_sampai: tanggalSampai,
    }, {
      preserveState: true,
      replace: true,
    })
  }

  const handleReset = () => {
    setSearchTerm('')
    setSelectedStatus('')
    setTanggalDari('')
    setTanggalSampai('')
    router.get(route('bendahara.validasi-transaksi.index'))
  }

  const handleExport = () => {
    const params = new URLSearchParams({
      search: searchTerm,
      status: selectedStatus,
      tanggal_dari: tanggalDari,
      tanggal_sampai: tanggalSampai,
    })
    window.open(`/bendahara/validasi-transaksi/export?${params.toString()}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'disetujui':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'ditolak':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'disetujui':
        return 'Disetujui'
      case 'ditolak':
        return 'Ditolak'
      case 'pending':
        return 'Pending'
      default:
        return 'Unknown'
    }
  }

  const handleStatusUpdate = (pembayaran: Pembayaran) => {
    setSelectedPembayaran(pembayaran)
    setStatusDialogOpen(true)
  }

  const getJenisPembayaranText = (pembayaran: Pembayaran) => {
    if (!pembayaran.details || pembayaran.details.length === 0) {
      return '-'
    }
    return pembayaran.details.map(detail => 
      detail.jenisPembayaran?.nama_jenis || 'Unknown'
    ).join(', ')
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Validasi Transaksi" />
      
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-800">Validasi Transaksi</h1>
            <p className="text-gray-600 mt-1">Kelola dan validasi pembayaran siswa</p>
          </div>
          <Button 
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Pembayaran
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">
                {stats.total_pembayaran}
              </div>
              <p className="text-xs text-muted-foreground">
                Semua transaksi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Validasi
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-800">
                {stats.pending}
              </div>
              <p className="text-xs text-muted-foreground">
                Menunggu validasi
              </p>
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
              <div className="text-2xl font-bold text-green-800">
                {stats.disetujui}
              </div>
              <p className="text-xs text-muted-foreground">
                Transaksi disetujui
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Nilai Disetujui
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">
                {formatCurrency(stats.total_amount_disetujui)}
              </div>
              <p className="text-xs text-muted-foreground">
                Nilai yang disetujui
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="search">Cari Siswa</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Nama atau NISN siswa"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="disetujui">Disetujui</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggal_dari">Tanggal Dari</Label>
                <Input
                  id="tanggal_dari"
                  type="date"
                  value={tanggalDari}
                  onChange={(e) => setTanggalDari(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggal_sampai">Tanggal Sampai</Label>
                <Input
                  id="tanggal_sampai"
                  type="date"
                  value={tanggalSampai}
                  onChange={(e) => setTanggalSampai(e.target.value)}
                />
              </div>

              <div className="flex flex-col justify-end">
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSearch}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Cari
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
            <CardTitle className="text-lg font-semibold text-green-800">
              Daftar Transaksi Pembayaran
            </CardTitle>
            <CardDescription>
              {pembayaran.total} transaksi ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>Pembayaran</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Validasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pembayaran.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Tidak ada data transaksi ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    pembayaran.data.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {(pembayaran.current_page - 1) * 15 + index + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.siswa?.nama}</div>
                            <div className="text-sm text-gray-500">
                              NISN: {item.siswa?.nisn} • {item.siswa?.kelas}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getJenisPembayaranText(item)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(Number(item.jumlah))}
                        </TableCell>
                        <TableCell>
                          {formatDate(item.tanggal_pembayaran)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={getStatusBadgeClass(item.status)}
                          >
                            {getStatusText(item.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(item)}
                            className="hover:bg-green-50 hover:border-green-300"
                          >
                            Validasi
                          </Button>
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
                    onClick={() => router.get(route('bendahara.validasi-transaksi.index'), {
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
                    onClick={() => router.get(route('bendahara.validasi-transaksi.index'), {
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
        <ValidasiStatusDialog
          pembayaran={selectedPembayaran}
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
        />
      </div>
    </AppLayout>
  )
}
