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
import { Textarea } from "@/components/ui/textarea"
import { useForm } from '@inertiajs/react'
import { FormEventHandler, useEffect } from 'react'
import { toast } from 'sonner'
import { Pembayaran, Rekening, Siswa } from './pembayaran-data-table'
import { type JenisPembayaran } from '@/types'

interface PembayaranFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pembayaran?: Pembayaran | null
  siswa: Siswa[]
  rekening: Rekening[]
  jenisPembayaran: JenisPembayaran[]
  mode: 'create' | 'edit'
}

export function PembayaranFormDialog({ 
  open, 
  onOpenChange, 
  pembayaran, 
  siswa, 
  rekening,
  jenisPembayaran,
  mode 
}: PembayaranFormDialogProps) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    siswa_id: '',
    jenis_pembayaran_id: '',
    metode_pembayaran_id: '',
    jumlah: '',
    tanggal_pembayaran: '',
    status: 'pending',
    keterangan: '',
    bukti_transfer: '',
  })

  // Update form data when pembayaran or mode changes
  useEffect(() => {
    if (mode === 'edit' && pembayaran) {
      setData({
        siswa_id: pembayaran.siswa_id.toString(),
        rekening_id: pembayaran.rekening_id.toString(),
        jenis_pembayaran: pembayaran.jenis_pembayaran,
        jumlah_pembayaran: pembayaran.jumlah_pembayaran.toString(),
        tanggal_pembayaran: pembayaran.tanggal_pembayaran,
        status_pembayaran: pembayaran.status_pembayaran,
        keterangan: pembayaran.keterangan || '',
      })
    } else if (mode === 'create') {
      const today = new Date().toISOString().split('T')[0]
      setData({
        siswa_id: '',
        rekening_id: '',
        jenis_pembayaran: '',
        jumlah_pembayaran: '',
        tanggal_pembayaran: today,
        status_pembayaran: 'pending',
        keterangan: '',
      })
    }
  }, [pembayaran, mode, open])

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    const onSuccess = () => {
      toast.success(mode === 'create' ? 'Data pembayaran berhasil ditambahkan!' : 'Data pembayaran berhasil diperbarui!')
      onOpenChange(false)
      reset()
    }

    const onError = () => {
      toast.error('Terjadi kesalahan, silakan coba lagi.')
    }

    if (mode === 'create') {
      post('/admin/pembayaran', {
        onSuccess,
        onError,
      })
    } else if (pembayaran) {
      put(`/admin/pembayaran/${pembayaran.id}`, {
        onSuccess,
        onError,
      })
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form to initial state when closing
      if (mode === 'edit' && pembayaran) {
        setData({
          siswa_id: pembayaran.siswa_id.toString(),
          rekening_id: pembayaran.rekening_id.toString(),
          jenis_pembayaran: pembayaran.jenis_pembayaran,
          jumlah_pembayaran: pembayaran.jumlah_pembayaran.toString(),
          tanggal_pembayaran: pembayaran.tanggal_pembayaran,
          status_pembayaran: pembayaran.status_pembayaran,
          keterangan: pembayaran.keterangan || '',
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
              {mode === 'create' ? 'Tambah Pembayaran Baru' : 'Edit Data Pembayaran'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create' 
                ? 'Tambahkan data pembayaran baru ke sistem.' 
                : 'Perbarui informasi pembayaran yang dipilih.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="siswa_id" className="text-right">
                Siswa
              </Label>
              <div className="col-span-3">
                <Select value={data.siswa_id} onValueChange={(value) => setData('siswa_id', value)}>
                  <SelectTrigger className="focus:ring-green-500 focus:border-green-500">
                    <SelectValue placeholder="Pilih siswa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {siswa.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.nama} - {s.nis} ({s.kelas})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.siswa_id && (
                  <p className="text-sm text-red-600 mt-1">{errors.siswa_id}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jenis_pembayaran" className="text-right">
                Jenis Pembayaran
              </Label>
              <div className="col-span-3">
                <Input
                  id="jenis_pembayaran"
                  autoComplete="off"
                  value={data.jenis_pembayaran}
                  onChange={(e) => setData('jenis_pembayaran', e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500"
                  placeholder="Contoh: SPP Bulan Januari, Uang Kegiatan, dll"
                />
                {errors.jenis_pembayaran && (
                  <p className="text-sm text-red-600 mt-1">{errors.jenis_pembayaran}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jumlah_pembayaran" className="text-right">
                Jumlah Pembayaran
              </Label>
              <div className="col-span-3">
                <Input
                  id="jumlah_pembayaran"
                  type="number"
                  min="0"
                  step="1000"
                  autoComplete="off"
                  value={data.jumlah_pembayaran}
                  onChange={(e) => setData('jumlah_pembayaran', e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500"
                  placeholder="Masukkan jumlah pembayaran..."
                />
                {errors.jumlah_pembayaran && (
                  <p className="text-sm text-red-600 mt-1">{errors.jumlah_pembayaran}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tanggal_pembayaran" className="text-right">
                Tanggal Pembayaran
              </Label>
              <div className="col-span-3">
                <Input
                  id="tanggal_pembayaran"
                  type="date"
                  value={data.tanggal_pembayaran}
                  onChange={(e) => setData('tanggal_pembayaran', e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500"
                />
                {errors.tanggal_pembayaran && (
                  <p className="text-sm text-red-600 mt-1">{errors.tanggal_pembayaran}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status_pembayaran" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Select value={data.status_pembayaran} onValueChange={(value) => setData('status_pembayaran', value)}>
                  <SelectTrigger className="focus:ring-green-500 focus:border-green-500">
                    <SelectValue placeholder="Pilih status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="berhasil">Berhasil</SelectItem>
                    <SelectItem value="gagal">Gagal</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status_pembayaran && (
                  <p className="text-sm text-red-600 mt-1">{errors.status_pembayaran}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rekening_id" className="text-right">
                Rekening Tujuan
              </Label>
              <div className="col-span-3">
                <Select value={data.rekening_id} onValueChange={(value) => setData('rekening_id', value)}>
                  <SelectTrigger className="focus:ring-green-500 focus:border-green-500">
                    <SelectValue placeholder="Pilih rekening..." />
                  </SelectTrigger>
                  <SelectContent>
                    {rekening.map((r) => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.bank} - {r.nomor_rekening} ({r.nama_pemilik})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.rekening_id && (
                  <p className="text-sm text-red-600 mt-1">{errors.rekening_id}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="keterangan" className="text-right pt-2">
                Keterangan
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="keterangan"
                  value={data.keterangan}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('keterangan', e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500 min-h-[80px]"
                  placeholder="Keterangan tambahan (opsional)..."
                />
                {errors.keterangan && (
                  <p className="text-sm text-red-600 mt-1">{errors.keterangan}</p>
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
