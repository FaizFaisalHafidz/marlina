import { RekeningFormDialog } from '@/components/rekening-form-dialog'
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
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem, type Rekening } from '@/types'
import { Head, router } from '@inertiajs/react'
import { Building, Download, Edit, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Data Rekening',
    href: '/bendahara/rekening',
  },
]

interface RekeningStats {
  total_rekening: number
  total_bank: number
}

interface DataRekeningProps {
  rekening: {
    data: Rekening[]
    current_page: number
    last_page: number
    total: number
  }
  stats: RekeningStats
  filters: {
    search?: string
  }
}

export default function DataRekening({ rekening, stats, filters }: DataRekeningProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRekening, setSelectedRekening] = useState<Rekening | null>(null)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')

  const handleSearch = () => {
    router.get(route('bendahara.rekening.index'), {
      search: searchTerm,
    }, {
      preserveState: true,
      replace: true,
    })
  }

  const handleReset = () => {
    setSearchTerm('')
    router.get(route('bendahara.rekening.index'))
  }

  const handleExport = () => {
    const params = new URLSearchParams({
      search: searchTerm,
    })
    window.open(`/bendahara/rekening/export?${params.toString()}`)
  }

  const handleAdd = () => {
    setSelectedRekening(null)
    setDialogMode('create')
    setDialogOpen(true)
  }

  const handleEdit = (rekening: Rekening) => {
    setSelectedRekening(rekening)
    setDialogMode('edit')
    setDialogOpen(true)
  }

  const handleDelete = (rekeningId: number, namaBank: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus rekening ${namaBank}?`)) {
      router.delete(`/bendahara/rekening/${rekeningId}`, {
        onSuccess: () => {
          toast.success('Data rekening berhasil dihapus!')
        },
        onError: (errors) => {
          if (errors.error) {
            toast.error(errors.error)
          } else {
            toast.error('Terjadi kesalahan saat menghapus data rekening.')
          }
        }
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatRekeningNumber = (nomor: string) => {
    // Format nomor rekening dengan spasi setiap 4 digit untuk kemudahan baca
    return nomor.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Data Rekening" />
      
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-800">Data Rekening</h1>
            <p className="text-gray-600 mt-1">Kelola data rekening bank untuk pembayaran</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleExport}
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Rekening
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Rekening
              </CardTitle>
              <Building className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">
                {stats.total_rekening}
              </div>
              <p className="text-xs text-muted-foreground">
                Rekening terdaftar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Bank
              </CardTitle>
              <Building className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">
                {stats.total_bank}
              </div>
              <p className="text-xs text-muted-foreground">
                Bank berbeda
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
              <Search className="h-5 w-5" />
              Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="search">Cari Rekening</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Nama bank, penerima, atau nomor rekening"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
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
              Daftar Rekening Bank
            </CardTitle>
            <CardDescription>
              {rekening.total} rekening ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Nama Bank</TableHead>
                    <TableHead>Nama Penerima</TableHead>
                    <TableHead>Nomor Rekening</TableHead>
                    <TableHead>Tanggal Dibuat</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rekening.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Tidak ada data rekening ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    rekening.data.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {(rekening.current_page - 1) * 15 + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-green-600" />
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {item.nama_bank}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.nama_penerima}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {formatRekeningNumber(item.nomor_rekening)}
                        </TableCell>
                        <TableCell>
                          {formatDate(item.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              className="hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item.id, item.nama_bank)}
                              className="hover:bg-red-50 hover:border-red-300 text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {rekening.last_page > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Menampilkan {rekening.data.length} dari {rekening.total} data
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.get(route('bendahara.rekening.index'), {
                      ...filters,
                      page: rekening.current_page - 1
                    })}
                    disabled={rekening.current_page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {rekening.current_page} of {rekening.last_page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.get(route('bendahara.rekening.index'), {
                      ...filters,
                      page: rekening.current_page + 1
                    })}
                    disabled={rekening.current_page >= rekening.last_page}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Dialog */}
        <RekeningFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          rekening={selectedRekening}
          mode={dialogMode}
        />
      </div>
    </AppLayout>
  )
}
