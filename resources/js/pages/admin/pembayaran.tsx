import { Pembayaran, PembayaranDataTable, Rekening, Siswa } from '@/components/pembayaran-data-table'
import { PembayaranFormDialog } from '@/components/pembayaran-form-dialog'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem, type JenisPembayaran } from '@/types'
import { Head, router } from '@inertiajs/react'
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
}

export default function AdminPembayaran({ pembayaran, siswa, rekening, jenisPembayaran }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedPembayaran, setSelectedPembayaran] = useState<Pembayaran | null>(null)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')

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
                        <h1 className="text-2xl font-bold text-gray-900">Data Pembayaran</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Kelola data pembayaran siswa sekolah
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border shadow-sm p-6">
                    <PembayaranDataTable
                        data={pembayaran.data}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
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
