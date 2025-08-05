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
import { type Rekening } from '@/types'
import { useForm } from '@inertiajs/react'
import { FormEventHandler, useEffect } from 'react'
import { toast } from 'sonner'

interface RekeningFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rekening?: Rekening | null
  mode: 'create' | 'edit'
}

export function RekeningFormDialog({
  open,
  onOpenChange,
  rekening,
  mode
}: RekeningFormDialogProps) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    nama_bank: '',
    nama_penerima: '',
    nomor_rekening: '',
  })

  // Update form data when rekening or mode changes
  useEffect(() => {
    if (mode === 'edit' && rekening) {
      setData({
        nama_bank: rekening.nama_bank,
        nama_penerima: rekening.nama_penerima,
        nomor_rekening: rekening.nomor_rekening,
      })
    } else if (mode === 'create') {
      reset()
    }
  }, [mode, rekening, open])

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    
    const onSuccess = () => {
      toast.success(`Data rekening berhasil ${mode === 'create' ? 'ditambahkan' : 'diperbarui'}!`)
      onOpenChange(false)
      reset()
    }

    const onError = () => {
      toast.error(`Gagal ${mode === 'create' ? 'menambahkan' : 'memperbarui'} data rekening.`)
    }

    if (mode === 'create') {
      post('/bendahara/rekening', {
        onSuccess,
        onError,
      })
    } else if (mode === 'edit' && rekening) {
      put(`/bendahara/rekening/${rekening.id}`, {
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
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="text-green-700">
              {mode === 'create' ? 'Tambah Rekening Baru' : 'Edit Data Rekening'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Tambahkan data rekening bank baru ke sistem.'
                : 'Perbarui informasi rekening bank yang dipilih.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Nama Bank */}
            <div className="space-y-2">
              <Label htmlFor="nama_bank" className="text-sm font-medium">Nama Bank *</Label>
              <Input
                id="nama_bank"
                type="text"
                value={data.nama_bank}
                onChange={(e) => setData('nama_bank', e.target.value)}
                className={`h-10 ${errors.nama_bank ? 'border-red-500' : ''}`}
                placeholder="Contoh: Bank BRI, Bank Mandiri"
              />
              {errors.nama_bank && (
                <p className="text-xs text-red-600 mt-1">{errors.nama_bank}</p>
              )}
            </div>

            {/* Nama Penerima */}
            <div className="space-y-2">
              <Label htmlFor="nama_penerima" className="text-sm font-medium">Nama Penerima *</Label>
              <Input
                id="nama_penerima"
                type="text"
                value={data.nama_penerima}
                onChange={(e) => setData('nama_penerima', e.target.value)}
                className={`h-10 ${errors.nama_penerima ? 'border-red-500' : ''}`}
                placeholder="Nama lengkap pemilik rekening"
              />
              {errors.nama_penerima && (
                <p className="text-xs text-red-600 mt-1">{errors.nama_penerima}</p>
              )}
            </div>

            {/* Nomor Rekening */}
            <div className="space-y-2">
              <Label htmlFor="nomor_rekening" className="text-sm font-medium">Nomor Rekening *</Label>
              <Input
                id="nomor_rekening"
                type="text"
                value={data.nomor_rekening}
                onChange={(e) => setData('nomor_rekening', e.target.value)}
                className={`h-10 ${errors.nomor_rekening ? 'border-red-500' : ''}`}
                placeholder="Nomor rekening tanpa spasi atau tanda baca"
              />
              {errors.nomor_rekening && (
                <p className="text-xs text-red-600 mt-1">{errors.nomor_rekening}</p>
              )}
            </div>
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
            <Button
              type="submit"
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? 'Menyimpan...' : mode === 'create' ? 'Tambah Rekening' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
