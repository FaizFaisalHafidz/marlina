import { User, UserDataTable } from '@/components/user-data-table'
import { UserFormDialog } from '@/components/user-form-dialog'
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
        title: 'Data Pengguna',
        href: '/admin/users',
    },
]

interface Role {
    id: number
    nama_role: string
}

interface Props {
    users: User[]
    roles: Role[]
}

export default function AdminUsers({ users, roles }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')

    const handleAdd = () => {
        setSelectedUser(null)
        setDialogMode('create')
        setDialogOpen(true)
    }

    const handleEdit = (user: User) => {
        setSelectedUser(user)
        setDialogMode('edit')
        setDialogOpen(true)
    }

    const handleDelete = (userId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
            router.delete(`/admin/users/${userId}`, {
                onSuccess: () => {
                    toast.success('User berhasil dihapus!')
                },
                onError: () => {
                    toast.error('Terjadi kesalahan saat menghapus user.')
                }
            })
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Pengguna" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Data Pengguna</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Kelola data pengguna sistem
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border shadow-sm p-6">
                    <UserDataTable
                        data={users}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>

                <UserFormDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    user={selectedUser}
                    roles={roles}
                    mode={dialogMode}
                />
            </div>
        </AppLayout>
    )
}
