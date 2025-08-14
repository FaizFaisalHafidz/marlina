import { Pembayaran, PembayaranDataTable, Rekening, Siswa } from '@/components/pembayaran-data-table'
import { PembayaranFormDialog } from '@/components/pembayaran-form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem, type JenisPembayaran } from '@/types'
import { Head, router } from '@inertiajs/react'
import { CreditCard, Filter, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Data Pembayaran',
        href: '/admin/pembayaran',
    },
]

interface Props {
    pembayaran: {
        data: Pembayaran[]
        links: any
        meta: any
    }
    siswa: Siswa[]
    rekening: Rekening[]
    jenisPembayaran: JenisPembayaran[]
    kelasList: string[]
    filters: {
        kelas?: string
        status?: string
        search?: string
    }
}

export default function AdminPembayaran({ pembayaran, siswa, rekening, jenisPembayaran, kelasList, filters }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedPembayaran, setSelectedPembayaran] = useState<Pembayaran | null>(null)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
    
    // Filter states
    const [selectedKelas, setSelectedKelas] = useState(filters.kelas || '')
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '')
    const [searchTerm, setSearchTerm] = useState(filters.search || '')

    const handleAdd = () => {
        setSelectedPembayaran(null)
        setDialogMode('create')
        setDialogOpen(true)
    }

    const handleEdit = (pembayaran: Pembayaran) => {
        setSelectedPembayaran(pembayaran)
        setDialogMode('edit')
        setDialogOpen(true)
    }

    const handleFilter = () => {
        router.get('/admin/pembayaran', {
            kelas: selectedKelas,
            status: selectedStatus,
            search: searchTerm,
        }, {
            preserveState: true,
            replace: true,
        })
    }

    const handleReset = () => {
        setSelectedKelas('')
        setSelectedStatus('')
        setSearchTerm('')
        router.get('/admin/pembayaran')
    }

    const handleDelete = (pembayaranId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data pembayaran ini?')) {
            router.delete(`/admin/pembayaran/${pembayaranId}`, {
                onSuccess: () => {
                    toast.success('Data pembayaran berhasil dihapus!')
                },
                onError: () => {
                    toast.error('Terjadi kesalahan saat menghapus data pembayaran.')
                }
            })
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Pembayaran" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-green-800">Data Pembayaran</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Kelola data pembayaran siswa sekolah
                        </p>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-lg border shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-green-800">Filter & Pencarian</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                    onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="kelas">Filter Kelas</Label>
                            <select
                                id="kelas"
                                value={selectedKelas}
                                onChange={(e) => setSelectedKelas(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Semua Kelas</option>
                                {kelasList.map((kelas) => (
                                    <option key={kelas} value={kelas}>
                                        {kelas}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Filter Status</Label>
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

                        <div className="flex flex-col justify-end">
                            <div className="flex gap-2">
                                <Button 
                                    onClick={handleFilter}
                                    className="bg-green-600 hover:bg-green-700"
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

                    {/* Info Filter Aktif */}
                    {(selectedKelas || selectedStatus || searchTerm) && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">Filter Aktif:</span>
                                {selectedKelas && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                        Kelas: {selectedKelas}
                                    </span>
                                )}
                                {selectedStatus && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                        Status: {selectedStatus}
                                    </span>
                                )}
                                {searchTerm && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                        Pencarian: {searchTerm}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg border shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-green-800">
                            Daftar Pembayaran
                            {selectedKelas && ` - Kelas ${selectedKelas}`}
                        </h3>
                        <div className="text-sm text-gray-600">
                            Total: {pembayaran.meta?.total || pembayaran.data.length} pembayaran
                        </div>
                    </div>
                    
                    <PembayaranDataTable
                        data={pembayaran.data}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />

                    {/* Pagination */}
                    {pembayaran.meta && pembayaran.meta.last_page > 1 && (
                        <div className="flex items-center justify-between space-x-2 py-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Menampilkan {pembayaran.meta.from} sampai {pembayaran.meta.to} dari {pembayaran.meta.total} data
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get('/admin/pembayaran', {
                                        ...filters,
                                        page: pembayaran.meta.current_page - 1
                                    })}
                                    disabled={pembayaran.meta.current_page <= 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm">
                                    Page {pembayaran.meta.current_page} of {pembayaran.meta.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get('/admin/pembayaran', {
                                        ...filters,
                                        page: pembayaran.meta.current_page + 1
                                    })}
                                    disabled={pembayaran.meta.current_page >= pembayaran.meta.last_page}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <PembayaranFormDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    pembayaran={selectedPembayaran}
                    siswa={siswa}
                    rekening={rekening}
                    jenisPembayaran={jenisPembayaran}
                    mode={dialogMode}
                />
            </div>
        </AppLayout>
    )
}
