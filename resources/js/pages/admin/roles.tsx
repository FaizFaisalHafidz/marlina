import { Role, RoleDataTable } from '@/components/role-data-table'
import { RoleFormDialog } from '@/components/role-form-dialog'
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
        title: 'Data Role',
        href: '/admin/roles',
    },
]

interface Props {
    roles: Role[]
}

export default function AdminRoles({ roles }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')

    const handleAdd = () => {
        setSelectedRole(null)
        setDialogMode('create')
        setDialogOpen(true)
    }

    const handleEdit = (role: Role) => {
        setSelectedRole(role)
        setDialogMode('edit')
        setDialogOpen(true)
    }

    const handleDelete = (roleId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus role ini?')) {
            router.delete(`/admin/roles/${roleId}`, {
                onSuccess: () => {
                    toast.success('Role berhasil dihapus!')
                },
                onError: () => {
                    toast.error('Terjadi kesalahan saat menghapus role.')
                }
            })
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Role" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Data Role</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Kelola data role pengguna sistem
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border shadow-sm p-6">
                    <RoleDataTable
                        data={roles}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>

                <RoleFormDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    role={selectedRole}
                    mode={dialogMode}
                />
            </div>
        </AppLayout>
    )
}
