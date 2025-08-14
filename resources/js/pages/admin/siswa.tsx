import { Siswa, SiswaDataTable } from '@/components/siswa-data-table'
import { SiswaFormDialog } from '@/components/siswa-form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, router } from '@inertiajs/react'
import { Filter, Search, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Data Siswa',
        href: '/admin/siswa',
    },
]

interface Props {
    siswa: {
        data: Siswa[]
        links: any
        meta: any
    }
    kelasList: string[]
    filters: {
        kelas?: string
        search?: string
    }
}

export default function AdminSiswa({ siswa, kelasList, filters }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
    
    // Filter states
    const [selectedKelas, setSelectedKelas] = useState(filters.kelas || '')
    const [searchTerm, setSearchTerm] = useState(filters.search || '')

    const handleAdd = () => {
        setSelectedSiswa(null)
        setDialogMode('create')
        setDialogOpen(true)
    }

    const handleEdit = (siswa: Siswa) => {
        setSelectedSiswa(siswa)
        setDialogMode('edit')
        setDialogOpen(true)
    }

    const handleFilter = () => {
        router.get('/admin/siswa', {
            kelas: selectedKelas,
            search: searchTerm,
        }, {
            preserveState: true,
            replace: true,
        })
    }

    const handleReset = () => {
        setSelectedKelas('')
        setSearchTerm('')
        router.get('/admin/siswa')
    }

    const handleDelete = (siswaId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
            router.delete(`/admin/siswa/${siswaId}`, {
                onSuccess: () => {
                    toast.success('Data siswa berhasil dihapus!')
                },
                onError: () => {
                    toast.error('Terjadi kesalahan saat menghapus data siswa.')
                }
            })
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Siswa" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-green-800">Data Siswa</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Kelola data siswa sekolah
                        </p>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-lg border shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-green-800">Filter & Pencarian</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    {(selectedKelas || searchTerm) && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">Filter Aktif:</span>
                                {selectedKelas && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                        Kelas: {selectedKelas}
                                    </span>
                                )}
                                {searchTerm && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
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
                            Daftar Siswa
                            {selectedKelas && ` - Kelas ${selectedKelas}`}
                        </h3>
                        <div className="text-sm text-gray-600">
                            Total: {siswa.meta?.total || siswa.data.length} siswa
                        </div>
                    </div>
                    
                    <SiswaDataTable
                        data={siswa.data}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />

                    {/* Pagination */}
                    {siswa.meta && siswa.meta.last_page > 1 && (
                        <div className="flex items-center justify-between space-x-2 py-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Menampilkan {siswa.meta.from} sampai {siswa.meta.to} dari {siswa.meta.total} data
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get('/admin/siswa', {
                                        ...filters,
                                        page: siswa.meta.current_page - 1
                                    })}
                                    disabled={siswa.meta.current_page <= 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm">
                                    Page {siswa.meta.current_page} of {siswa.meta.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get('/admin/siswa', {
                                        ...filters,
                                        page: siswa.meta.current_page + 1
                                    })}
                                    disabled={siswa.meta.current_page >= siswa.meta.last_page}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <SiswaFormDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    siswa={selectedSiswa}
                    mode={dialogMode}
                />
            </div>
        </AppLayout>
    )
}
