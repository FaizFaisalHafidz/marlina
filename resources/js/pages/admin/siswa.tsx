import { Siswa, SiswaDataTable } from '@/components/siswa-data-table'
import { SiswaFormDialog } from '@/components/siswa-form-dialog'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, router } from '@inertiajs/react'
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
}

export default function AdminSiswa({ siswa }: Props) {
    // Debug: Log data yang diterima dari controller
    console.log('Data siswa from controller:', siswa)
    console.log('Siswa.data:', siswa.data)
    console.log('Siswa.data type:', typeof siswa.data)
    console.log('Siswa.data length:', Array.isArray(siswa.data) ? siswa.data.length : 'Not an array')
    
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')

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
                        <h1 className="text-2xl font-bold text-gray-900">Data Siswa</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Kelola data siswa sekolah
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border shadow-sm p-6">
                    <SiswaDataTable
                        data={siswa.data}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
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
