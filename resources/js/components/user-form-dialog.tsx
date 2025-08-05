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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useForm } from '@inertiajs/react'
import { FormEventHandler, useEffect } from 'react'
import { toast } from 'sonner'
import { User } from './user-data-table'

interface Role {
  id: number
  nama_role: string
}

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  roles: Role[]
  mode: 'create' | 'edit'
}

export function UserFormDialog({ open, onOpenChange, user, roles, mode }: UserFormDialogProps) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: '',
    email: '',
    role_id: '',
    password: '',
    password_confirmation: '',
  })

  // Update form data when user or mode changes
  useEffect(() => {
    if (mode === 'edit' && user) {
      setData({
        name: user.name,
        email: user.email,
        role_id: user.role_id?.toString() || '',
        password: '',
        password_confirmation: '',
      })
    } else if (mode === 'create') {
      setData({
        name: '',
        email: '',
        role_id: '',
        password: '',
        password_confirmation: '',
      })
    }
  }, [user, mode, open])

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    const onSuccess = () => {
      toast.success(mode === 'create' ? 'User berhasil ditambahkan!' : 'User berhasil diperbarui!')
      onOpenChange(false)
      reset()
    }

    const onError = () => {
      toast.error('Terjadi kesalahan, silakan coba lagi.')
    }

    if (mode === 'create') {
      post('/admin/users', {
        onSuccess,
        onError,
      })
    } else if (user) {
      put(`/admin/users/${user.id}`, {
        onSuccess,
        onError,
      })
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form to initial state when closing
      if (mode === 'edit' && user) {
        setData({
          name: user.name,
          email: user.email,
          role_id: user.role_id?.toString() || '',
          password: '',
          password_confirmation: '',
        })
      } else {
        reset()
      }
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="text-green-700">
              {mode === 'create' ? 'Tambah User Baru' : 'Edit User'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create' 
                ? 'Tambahkan user baru ke sistem.' 
                : 'Perbarui informasi user yang dipilih.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama Lengkap
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  autoComplete="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500"
                  placeholder="Masukkan nama lengkap..."
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <div className="col-span-3">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500"
                  placeholder="Masukkan email..."
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role_id" className="text-right">
                Role
              </Label>
              <div className="col-span-3">
                <Select value={data.role_id} onValueChange={(value) => setData('role_id', value)}>
                  <SelectTrigger className="focus:ring-green-500 focus:border-green-500">
                    <SelectValue placeholder="Pilih role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.nama_role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role_id && (
                  <p className="text-sm text-red-600 mt-1">{errors.role_id}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                {mode === 'create' ? 'Password' : 'Password Baru'}
              </Label>
              <div className="col-span-3">
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500"
                  placeholder={mode === 'create' ? 'Masukkan password...' : 'Kosongkan jika tidak ingin mengubah...'}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password_confirmation" className="text-right">
                Konfirmasi Password
              </Label>
              <div className="col-span-3">
                <Input
                  id="password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500"
                  placeholder="Konfirmasi password..."
                />
                {errors.password_confirmation && (
                  <p className="text-sm text-red-600 mt-1">{errors.password_confirmation}</p>
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
