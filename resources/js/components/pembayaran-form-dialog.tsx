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
    metode_pembayaran_id: '',
    tanggal_pembayaran: '',
    status: 'pending' as 'pending' | 'disetujui' | 'ditolak',
    keterangan: '',
    bukti_transfer: '',
    details: [] as Array<{
      jenis_pembayaran_id: string,
      jumlah: string,
      keterangan?: string
    }>
  })

  // Update form data when pembayaran or mode changes
  useEffect(() => {
    if (mode === 'edit' && pembayaran) {
      // Convert details to the format expected by the form
      const details = pembayaran.details?.map(detail => ({
        jenis_pembayaran_id: detail.jenis_pembayaran_id.toString(),
        jumlah: detail.jumlah.toString(),
        keterangan: detail.keterangan || ''
      })) || []

      setData({
        siswa_id: pembayaran.siswa_id.toString(),
        metode_pembayaran_id: pembayaran.metode_pembayaran_id.toString(),
        tanggal_pembayaran: pembayaran.tanggal_pembayaran,
        status: pembayaran.status,
        keterangan: pembayaran.keterangan || '',
        bukti_transfer: pembayaran.bukti_transfer || '',
        details: details
      })
    } else if (mode === 'create') {
      reset()
      // Initialize with one empty detail for create mode
      setData('details', [{ jenis_pembayaran_id: '', jumlah: '', keterangan: '' }])
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
      <DialogContent className="max-w-none w-[98vw] h-[90vh] overflow-hidden p-6" style={{ width: '98vw', maxWidth: 'none' }}>
        <DialogHeader className="pb-3">
          <DialogTitle className="text-xl font-bold">
            {mode === 'create' ? 'Tambah Pembayaran Baru' : 'Edit Data Pembayaran'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {mode === 'create' 
              ? 'Lengkapi form di bawah untuk menambahkan pembayaran baru.'
              : 'Perbarui informasi pembayaran di bawah ini.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="h-full flex flex-col">
          {/* Main Layout: 2 Columns - Side by side dengan ruang lebih luas */}
          <div className="grid grid-cols-5 gap-10 flex-1 overflow-hidden">
            
            {/* Left Column - Basic Info (3/5 width) */}
            <div className="col-span-3 space-y-4 overflow-y-auto pr-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Informasi Dasar</h3>
              
              {/* Basic fields in 2 columns dengan spacing yang lebih luas */}
              <div className="grid grid-cols-2 gap-6">
                {/* Siswa Selection */}
                <div className="space-y-2">
                  <Label htmlFor="siswa_id" className="text-sm font-medium">Siswa *</Label>
                  <Select value={data.siswa_id} onValueChange={(value) => setData('siswa_id', value)}>
                    <SelectTrigger className="h-10">
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
                    <p className="text-xs text-red-600 mt-1">{errors.siswa_id}</p>
                  )}
                </div>

                {/* Tanggal Pembayaran */}
                <div className="space-y-2">
                  <Label htmlFor="tanggal_pembayaran" className="text-sm font-medium">Tanggal Pembayaran *</Label>
                  <Input
                    id="tanggal_pembayaran"
                    type="date"
                    value={data.tanggal_pembayaran}
                    onChange={(e) => setData('tanggal_pembayaran', e.target.value)}
                    className={`h-10 ${errors.tanggal_pembayaran ? 'border-red-500' : ''}`}
                  />
                  {errors.tanggal_pembayaran && (
                    <p className="text-xs text-red-600 mt-1">{errors.tanggal_pembayaran}</p>
                  )}
                </div>

                {/* Status Pembayaran */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">Status Pembayaran *</Label>
                  <Select value={data.status} onValueChange={(value) => setData('status', value as 'pending' | 'disetujui' | 'ditolak')}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="disetujui">Disetujui</SelectItem>
                      <SelectItem value="ditolak">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-xs text-red-600 mt-1">{errors.status}</p>
                  )}
                </div>

                {/* Bukti Transfer */}
                <div className="space-y-2">
                  <Label htmlFor="bukti_transfer" className="text-sm font-medium">Bukti Transfer</Label>
                  <Input
                    id="bukti_transfer"
                    type="text"
                    value={data.bukti_transfer}
                    onChange={(e) => setData('bukti_transfer', e.target.value)}
                    placeholder="URL atau nama file"
                    className="h-10"
                  />
                  {errors.bukti_transfer && (
                    <p className="text-xs text-red-600 mt-1">{errors.bukti_transfer}</p>
                  )}
                </div>
              </div>

              {/* Metode Pembayaran - Full width */}
              <div className="space-y-2">
                <Label htmlFor="metode_pembayaran_id" className="text-sm font-medium">Metode Pembayaran *</Label>
                <Select value={data.metode_pembayaran_id} onValueChange={(value) => setData('metode_pembayaran_id', value)}>
                  <SelectTrigger className="h-10">
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
                  <p className="text-xs text-red-600 mt-1">{errors.metode_pembayaran_id}</p>
                )}
              </div>

              {/* Keterangan */}
              <div className="space-y-2">
                <Label htmlFor="keterangan" className="text-sm font-medium">Keterangan</Label>
                <Textarea
                  id="keterangan"
                  value={data.keterangan}
                  onChange={(e) => setData('keterangan', e.target.value)}
                  placeholder="Masukkan keterangan tambahan"
                  rows={4}
                  className="resize-none"
                />
                {errors.keterangan && (
                  <p className="text-xs text-red-600 mt-1">{errors.keterangan}</p>
                )}
              </div>
            </div>

            {/* Right Column - Payment Details (2/5 width) */}
            <div className="col-span-2 space-y-4 overflow-hidden flex flex-col">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Detail Pembayaran</h3>
              
              <div className="border rounded-lg p-4 flex-1 overflow-y-auto space-y-3 bg-gray-50/50">
                {data.details.map((detail, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end bg-white p-3 rounded-lg border border-gray-200">
                    <div className="col-span-4">
                      <Label htmlFor={`detail_jenis_${index}`} className="text-xs font-medium text-gray-700">Jenis</Label>
                      <Select 
                        value={detail.jenis_pembayaran_id} 
                        onValueChange={(value) => {
                          const newDetails = [...data.details]
                          newDetails[index].jenis_pembayaran_id = value
                          setData('details', newDetails)
                        }}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          {jenisPembayaran.map((jp) => (
                            <SelectItem key={jp.id} value={jp.id.toString()}>
                              {jp.kode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor={`detail_jumlah_${index}`} className="text-xs font-medium text-gray-700">Jumlah</Label>
                      <Input
                        id={`detail_jumlah_${index}`}
                        type="number"
                        value={detail.jumlah}
                        onChange={(e) => {
                          const newDetails = [...data.details]
                          newDetails[index].jumlah = e.target.value
                          setData('details', newDetails)
                        }}
                        placeholder="0"
                        min="0"
                        step="1000"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="col-span-4">
                      <Label htmlFor={`detail_keterangan_${index}`} className="text-xs font-medium text-gray-700">Keterangan</Label>
                      <Input
                        id={`detail_keterangan_${index}`}
                        value={detail.keterangan || ''}
                        onChange={(e) => {
                          const newDetails = [...data.details]
                          newDetails[index].keterangan = e.target.value
                          setData('details', newDetails)
                        }}
                        placeholder="Keterangan"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newDetails = data.details.filter((_, i) => i !== index)
                          setData('details', newDetails)
                        }}
                        className="w-full h-9 p-0 text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDetails = [...data.details, { 
                      jenis_pembayaran_id: '', 
                      jumlah: '', 
                      keterangan: '' 
                    }]
                    setData('details', newDetails)
                  }}
                  className="w-full mt-3 h-10 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                >
                  + Tambah Detail Pembayaran
                </Button>
              </div>
                
              {/* Total Pembayaran */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700 text-base">Total Pembayaran:</span>
                  <span className="text-xl font-bold text-green-600">
                    Rp {data.details.reduce((total, detail) => total + (Number(detail.jumlah) || 0), 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              
              {errors.details && (
                <p className="text-sm text-red-600 mt-2 p-2 bg-red-50 rounded border border-red-200">{errors.details}</p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 pt-4 border-t bg-gray-50/50 rounded-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={processing}
              className="px-6 py-2 h-10"
            >
              Batal
            </Button>
            <Button type="submit" disabled={processing} className="px-6 py-2 h-10 bg-blue-600 hover:bg-blue-700">
              {processing ? 'Menyimpan...' : mode === 'create' ? 'Tambah Pembayaran' : 'Update Pembayaran'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
