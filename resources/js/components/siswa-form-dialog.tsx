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
import { Textarea } from "@/components/ui/textarea"
import { useForm } from '@inertiajs/react'
import { FormEventHandler, useEffect } from 'react'
import { toast } from 'sonner'
import { Siswa } from './siswa-data-table'

interface SiswaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  siswa?: Siswa | null
  mode: 'create' | 'edit'
}

export function SiswaFormDialog({ open, onOpenChange, siswa, mode }: SiswaFormDialogProps) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    nama: '',
    jenis_kelamin: 'L' as 'L' | 'P',
    tempat_lahir: '',
    tanggal_lahir: '',
    nisn: '',
    kelas: '',
    nama_ayah: '',
    nama_ibu: '',
    alamat: '',
    no_hp: '',
    email: '',
    foto: '',
  })

  // Update form data when siswa or mode changes
  useEffect(() => {
    if (mode === 'edit' && siswa) {
      setData({
        nama: siswa.nama,
        jenis_kelamin: siswa.jenis_kelamin,
        tempat_lahir: siswa.tempat_lahir || '',
        tanggal_lahir: siswa.tanggal_lahir || '',
        nisn: siswa.nisn,
        kelas: siswa.kelas,
        nama_ayah: siswa.nama_ayah || '',
        nama_ibu: siswa.nama_ibu || '',
        alamat: siswa.alamat || '',
        no_hp: siswa.no_hp || '',
        email: siswa.email || '',
        foto: siswa.foto || '',
      })
    } else if (mode === 'create') {
      reset()
    }
  }, [mode, siswa, open])

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    const onSuccess = () => {
      toast.success(`Data siswa berhasil ${mode === 'create' ? 'ditambahkan' : 'diperbarui'}!`)
      onOpenChange(false)
      reset()
    }

    const onError = () => {
      toast.error(`Gagal ${mode === 'create' ? 'menambahkan' : 'memperbarui'} data siswa.`)
    }

    if (mode === 'create') {
      post('/admin/siswa', {
        onSuccess,
        onError,
      })
    } else if (mode === 'edit' && siswa) {
      put(`/admin/siswa/${siswa.id}`, {
        onSuccess,
        onError,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tambah Siswa Baru' : 'Edit Data Siswa'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Lengkapi form di bawah untuk menambahkan siswa baru. Akun login akan dibuat otomatis.'
              : 'Perbarui informasi siswa di bawah ini.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap *</Label>
              <Input
                id="nama"
                type="text"
                value={data.nama}
                onChange={(e) => setData('nama', e.target.value)}
                className={errors.nama ? 'border-red-500' : ''}
                placeholder="Masukkan nama lengkap"
              />
              {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jenis_kelamin">Jenis Kelamin *</Label>
              <select
                id="jenis_kelamin"
                value={data.jenis_kelamin}
                onChange={(e) => setData('jenis_kelamin', e.target.value as 'L' | 'P')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
              {errors.jenis_kelamin && <p className="text-sm text-red-500">{errors.jenis_kelamin}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
              <Input
                id="tempat_lahir"
                type="text"
                value={data.tempat_lahir}
                onChange={(e) => setData('tempat_lahir', e.target.value)}
                placeholder="Masukkan tempat lahir"
              />
              {errors.tempat_lahir && <p className="text-sm text-red-500">{errors.tempat_lahir}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
              <Input
                id="tanggal_lahir"
                type="date"
                value={data.tanggal_lahir}
                onChange={(e) => setData('tanggal_lahir', e.target.value)}
              />
              {errors.tanggal_lahir && <p className="text-sm text-red-500">{errors.tanggal_lahir}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nisn">NISN *</Label>
              <Input
                id="nisn"
                type="text"
                value={data.nisn}
                onChange={(e) => setData('nisn', e.target.value)}
                className={errors.nisn ? 'border-red-500' : ''}
                placeholder="Masukkan NISN"
              />
              {errors.nisn && <p className="text-sm text-red-500">{errors.nisn}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="kelas">Kelas *</Label>
              <Input
                id="kelas"
                type="text"
                value={data.kelas}
                onChange={(e) => setData('kelas', e.target.value)}
                className={errors.kelas ? 'border-red-500' : ''}
                placeholder="Contoh: X IPA 1"
              />
              {errors.kelas && <p className="text-sm text-red-500">{errors.kelas}</p>}
            </div>
          </div>

          {/* Parent Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nama_ayah">Nama Ayah</Label>
              <Input
                id="nama_ayah"
                type="text"
                value={data.nama_ayah}
                onChange={(e) => setData('nama_ayah', e.target.value)}
                placeholder="Masukkan nama ayah"
              />
              {errors.nama_ayah && <p className="text-sm text-red-500">{errors.nama_ayah}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama_ibu">Nama Ibu</Label>
              <Input
                id="nama_ibu"
                type="text"
                value={data.nama_ibu}
                onChange={(e) => setData('nama_ibu', e.target.value)}
                placeholder="Masukkan nama ibu"
              />
              {errors.nama_ibu && <p className="text-sm text-red-500">{errors.nama_ibu}</p>}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
                placeholder="contoh@student.madrasah.com"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="no_hp">No. HP</Label>
              <Input
                id="no_hp"
                type="text"
                value={data.no_hp}
                onChange={(e) => setData('no_hp', e.target.value)}
                placeholder="Contoh: 081234567890"
              />
              {errors.no_hp && <p className="text-sm text-red-500">{errors.no_hp}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Textarea
              id="alamat"
              value={data.alamat}
              onChange={(e) => setData('alamat', e.target.value)}
              placeholder="Masukkan alamat lengkap"
              rows={3}
            />
            {errors.alamat && <p className="text-sm text-red-500">{errors.alamat}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={processing}
            >
              Batal
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Menyimpan...' : mode === 'create' ? 'Tambah Siswa' : 'Update Siswa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
