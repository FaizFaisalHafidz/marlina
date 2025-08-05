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
import { type JenisPembayaran, type Pembayaran, type Rekening, type Siswa } from '@/types'
import { useForm } from '@inertiajs/react'
import { FormEventHandler, useEffect } from 'react'
import { toast } from 'sonner'

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
    status: 'pending' as 'pending' | 'disetujui' | 'ditolak',
    keterangan: '',
    bukti_transfer: '',
  })

  // Update form data when pembayaran or mode changes
  useEffect(() => {
    if (mode === 'edit' && pembayaran) {
      setData({
        siswa_id: pembayaran.siswa_id.toString(),
        jenis_pembayaran_id: pembayaran.jenis_pembayaran_id.toString(),
        metode_pembayaran_id: pembayaran.metode_pembayaran_id.toString(),
        jumlah: pembayaran.jumlah.toString(),
        tanggal_pembayaran: pembayaran.tanggal_pembayaran,
        status: pembayaran.status,
        keterangan: pembayaran.keterangan || '',
        bukti_transfer: pembayaran.bukti_transfer || '',
      })
    } else if (mode === 'create') {
      reset()
    }
  }, [mode, pembayaran, open])

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    const onSuccess = () => {
      toast.success(`Data pembayaran berhasil ${mode === 'create' ? 'ditambahkan' : 'diperbarui'}!`)
      onOpenChange(false)
      reset()
    }

    const onError = () => {
      toast.error(`Gagal ${mode === 'create' ? 'menambahkan' : 'memperbarui'} data pembayaran.`)
    }

    if (mode === 'create') {
      post('/admin/pembayaran', {
        onSuccess,
        onError,
      })
    } else if (mode === 'edit' && pembayaran) {
      put(`/admin/pembayaran/${pembayaran.id}`, {
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
            {mode === 'create' ? 'Tambah Pembayaran Baru' : 'Edit Data Pembayaran'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Lengkapi form di bawah untuk menambahkan pembayaran baru.'
              : 'Perbarui informasi pembayaran di bawah ini.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {/* Siswa Selection */}
          <div className="space-y-2">
            <Label htmlFor="siswa_id">Siswa *</Label>
            <Select value={data.siswa_id} onValueChange={(value) => setData('siswa_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih siswa" />
              </SelectTrigger>
              <SelectContent>
                {siswa.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.nama} - {s.kelas}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.siswa_id && (
              <p className="text-sm text-red-600 mt-1">{errors.siswa_id}</p>
            )}
          </div>

          {/* Jenis Pembayaran Selection */}
          <div className="space-y-2">
            <Label htmlFor="jenis_pembayaran_id">Jenis Pembayaran *</Label>
            <Select value={data.jenis_pembayaran_id} onValueChange={(value) => setData('jenis_pembayaran_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis pembayaran" />
              </SelectTrigger>
              <SelectContent>
                {jenisPembayaran.map((jp) => (
                  <SelectItem key={jp.id} value={jp.id.toString()}>
                    {jp.nama_jenis} ({jp.kode}) - Rp {jp.nominal_default.toLocaleString('id-ID')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.jenis_pembayaran_id && (
              <p className="text-sm text-red-600 mt-1">{errors.jenis_pembayaran_id}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="jumlah">Jumlah Pembayaran *</Label>
            <Input
              id="jumlah"
              type="number"
              value={data.jumlah}
              onChange={(e) => setData('jumlah', e.target.value)}
              className={errors.jumlah ? 'border-red-500' : ''}
              placeholder="Masukkan jumlah pembayaran"
              min="0"
              step="1000"
            />
            {errors.jumlah && (
              <p className="text-sm text-red-600 mt-1">{errors.jumlah}</p>
            )}
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="tanggal_pembayaran">Tanggal Pembayaran *</Label>
            <Input
              id="tanggal_pembayaran"
              type="date"
              value={data.tanggal_pembayaran}
              onChange={(e) => setData('tanggal_pembayaran', e.target.value)}
              className={errors.tanggal_pembayaran ? 'border-red-500' : ''}
            />
            {errors.tanggal_pembayaran && (
              <p className="text-sm text-red-600 mt-1">{errors.tanggal_pembayaran}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status Pembayaran</Label>
            <Select value={data.status} onValueChange={(value) => setData('status', value as 'pending' | 'disetujui' | 'ditolak')}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="disetujui">Disetujui</SelectItem>
                <SelectItem value="ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-600 mt-1">{errors.status}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="metode_pembayaran_id">Metode Pembayaran *</Label>
            <Select value={data.metode_pembayaran_id} onValueChange={(value) => setData('metode_pembayaran_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih metode pembayaran" />
              </SelectTrigger>
              <SelectContent>
                {rekening.map((r) => (
                  <SelectItem key={r.id} value={r.id.toString()}>
                    {r.nama_bank} - {r.nomor_rekening} ({r.nama_penerima})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.metode_pembayaran_id && (
              <p className="text-sm text-red-600 mt-1">{errors.metode_pembayaran_id}</p>
            )}
          </div>

          {/* Bukti Transfer */}
          <div className="space-y-2">
            <Label htmlFor="bukti_transfer">Bukti Transfer</Label>
            <Input
              id="bukti_transfer"
              type="text"
              value={data.bukti_transfer}
              onChange={(e) => setData('bukti_transfer', e.target.value)}
              placeholder="URL atau nama file bukti transfer"
            />
            {errors.bukti_transfer && (
              <p className="text-sm text-red-600 mt-1">{errors.bukti_transfer}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              value={data.keterangan}
              onChange={(e) => setData('keterangan', e.target.value)}
              placeholder="Masukkan keterangan tambahan"
              rows={3}
            />
            {errors.keterangan && (
              <p className="text-sm text-red-600 mt-1">{errors.keterangan}</p>
            )}
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
              {processing ? 'Menyimpan...' : mode === 'create' ? 'Tambah Pembayaran' : 'Update Pembayaran'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
