import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from '@inertiajs/react'
import { FormEventHandler } from 'react'
import { toast } from 'sonner'
import { Role } from './role-data-table'

interface RoleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null
  mode: 'create' | 'edit'
}

export function RoleFormDialog({ open, onOpenChange, role, mode }: RoleFormDialogProps) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    nama_role: role?.nama_role || '',
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    const onSuccess = () => {
      toast.success(mode === 'create' ? 'Role berhasil ditambahkan!' : 'Role berhasil diperbarui!')
      onOpenChange(false)
      reset()
    }

    const onError = () => {
      toast.error('Terjadi kesalahan, silakan coba lagi.')
    }

    if (mode === 'create') {
      post('/admin/roles', {
        onSuccess,
        onError,
      })
    } else if (role) {
      put(`/admin/roles/${role.id}`, {
        onSuccess,
        onError,
      })
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="text-green-700">
              {mode === 'create' ? 'Tambah Role Baru' : 'Edit Role'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create' 
                ? 'Tambahkan role baru ke sistem.' 
                : 'Perbarui informasi role yang dipilih.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nama_role" className="text-right">
                Nama Role
              </Label>
              <div className="col-span-3">
                <Input
                  id="nama_role"
                  value={data.nama_role}
                  onChange={(e) => setData('nama_role', e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500"
                  placeholder="Masukkan nama role..."
                />
                {errors.nama_role && (
                  <p className="text-sm text-red-600 mt-1">{errors.nama_role}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={processing}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={processing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {processing ? 'Menyimpan...' : (mode === 'create' ? 'Tambah' : 'Perbarui')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
