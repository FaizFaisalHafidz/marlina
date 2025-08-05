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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    nis: '',
    nama: '',
    kelas: '',
    alamat: '',
    no_hp: '',
    nama_wali: '',
    no_hp_wali: '',
  })

  // Update form data when siswa or mode changes
  useEffect(() => {
    if (mode === 'edit' && siswa) {
      setData({
        nis: siswa.nis,
        nama: siswa.nama,
        kelas: siswa.kelas,
        alamat: siswa.alamat,
        no_hp: siswa.no_hp,
        nama_wali: siswa.nama_wali,
        no_hp_wali: siswa.no_hp_wali,
      })
    } else if (mode === 'create') {
      setData({
        nis: '',
        nama: '',
        kelas: '',
        alamat: '',
        no_hp: '',
        nama_wali: '',
        no_hp_wali: '',
      })
    }
  }, [siswa, mode, open])

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    const onSuccess = () => {
      toast.success(mode === 'create' ? 'Data siswa berhasil ditambahkan!' : 'Data siswa berhasil diperbarui!')
      onOpenChange(false)
      reset()
    }

    const onError = () => {
      toast.error('Terjadi kesalahan, silakan coba lagi.')
    }

    if (mode === 'create') {
      post('/admin/siswa', {
        onSuccess,
        onError,
      })
    } else if (siswa) {
      put(`/admin/siswa/${siswa.id}`, {
        onSuccess,
        onError,
      })
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form to initial state when closing
      if (mode === 'edit' && siswa) {
        setData({
          nis: siswa.nis,
          nama: siswa.nama,
          kelas: siswa.kelas,
          alamat: siswa.alamat,
          no_hp: siswa.no_hp,
          nama_wali: siswa.nama_wali,
          no_hp_wali: siswa.no_hp_wali,
        })
      } else {
        reset()
      }
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="text-green-700">
              {mode === 'create' ? 'Tambah Siswa Baru' : 'Edit Data Siswa'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create' 
                ? 'Tambahkan data siswa baru ke sistem.' 
                : 'Perbarui informasi siswa yang dipilih.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nis" className="text-right">
                NIS
              </Label>
              <div className="col-span-3">
                <Input
                  id="nis"
                  autoComplete="off"
                  value={data.nis}
                  onChange={(e) => setData('nis', e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500"
                  placeholder="Masukkan NIS..."
                />
                {errors.nis && (
                  <p className="text-sm text-red-600 mt-1">{errors.nis}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nama" className="text-right">
                Nama Lengkap
              </Label>
              <div className="col-span-3">
                <Input
                  id="nama"
                  autoComplete="name"
                  value={data.nama}
                  onChange={(e) => setData('nama', e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500"
                  placeholder="Masukkan nama lengkap..."
                />
                {errors.nama && (
                  <p className="text-sm text-red-600 mt-1">{errors.nama}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="kelas" className="text-right">
                Kelas
              </Label>
              <div className="col-span-3">
                <Input
                  id="kelas"
                  autoComplete="off"
                  value={data.kelas}
                  onChange={(e) => setData('kelas', e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500"
                  placeholder="Contoh: X IPA 1"
                />
                {errors.kelas && (
                  <p className="text-sm text-red-600 mt-1">{errors.kelas}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="alamat" className="text-right pt-2">
                Alamat
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="alamat"
                  autoComplete="street-address"
                  value={data.alamat}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('alamat', e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500 min-h-[80px]"
                  placeholder="Masukkan alamat lengkap..."
                />
                {errors.alamat && (
                  <p className="text-sm text-red-600 mt-1">{errors.alamat}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="no_hp" className="text-right">
                No. HP Siswa
              </Label>
              <div className="col-span-3">
                <Input
                  id="no_hp"
                  type="tel"
                  autoComplete="tel"
                  value={data.no_hp}
                  onChange={(e) => setData('no_hp', e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500"
                  placeholder="Contoh: 081234567890"
                />
                {errors.no_hp && (
                  <p className="text-sm text-red-600 mt-1">{errors.no_hp}</p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Data Wali</h4>
              
              <div className="grid grid-cols-4 items-center gap-4 mb-4">
                <Label htmlFor="nama_wali" className="text-right">
                  Nama Wali
                </Label>
                <div className="col-span-3">
                  <Input
                    id="nama_wali"
                    autoComplete="name"
                    value={data.nama_wali}
                    onChange={(e) => setData('nama_wali', e.target.value)}
                    className="focus:ring-green-500 focus:border-green-500"
                    placeholder="Masukkan nama wali..."
                  />
                  {errors.nama_wali && (
                    <p className="text-sm text-red-600 mt-1">{errors.nama_wali}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="no_hp_wali" className="text-right">
                  No. HP Wali
                </Label>
                <div className="col-span-3">
                  <Input
                    id="no_hp_wali"
                    type="tel"
                    autoComplete="tel"
                    value={data.no_hp_wali}
                    onChange={(e) => setData('no_hp_wali', e.target.value)}
                    className="focus:ring-green-500 focus:border-green-500"
                    placeholder="Contoh: 081234567890"
                  />
                  {errors.no_hp_wali && (
                    <p className="text-sm text-red-600 mt-1">{errors.no_hp_wali}</p>
                  )}
                </div>
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
