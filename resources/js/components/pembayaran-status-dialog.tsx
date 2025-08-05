import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pembayaran } from "@/types"
import { useForm } from "@inertiajs/react"
import { toast } from "sonner"

interface PembayaranStatusDialogProps {
  pembayaran: Pembayaran | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PembayaranStatusDialog({
  pembayaran,
  open,
  onOpenChange,
}: PembayaranStatusDialogProps) {
  const { data, setData, put, processing, errors } = useForm<{
    status: 'pending' | 'disetujui' | 'ditolak';
    keterangan: string;
  }>({
    status: pembayaran?.status || 'pending',
    keterangan: '',
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!pembayaran) return

    put(route('admin.pembayaran.update-status', pembayaran.id), {
      onSuccess: () => {
        toast.success('Status pembayaran berhasil diperbarui')
        onOpenChange(false)
        setData('keterangan', '')
      },
      onError: () => {
        toast.error('Gagal memperbarui status pembayaran')
      }
    })
  }

  // Get status badge color classes
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'disetujui':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'ditolak':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-green-800">
            Update Status Pembayaran
          </DialogTitle>
          <DialogDescription>
            Ubah status pembayaran siswa. Pastikan untuk memberikan keterangan yang jelas.
          </DialogDescription>
        </DialogHeader>

        {pembayaran && (
          <div className="space-y-4">
            {/* Info Pembayaran */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Siswa:</span>
                <span className="text-sm font-semibold">{pembayaran.siswa?.nama}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">NISN:</span>
                <span className="text-sm">{pembayaran.siswa?.nisn}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Jumlah:</span>
                <span className="text-sm font-semibold">
                  Rp {new Intl.NumberFormat('id-ID').format(Number(pembayaran.jumlah))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Tanggal:</span>
                <span className="text-sm">{formatDate(pembayaran.tanggal_pembayaran)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Bank:</span>
                <span className="text-sm">{pembayaran.rekening?.bank}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Status Saat Ini:</span>
                <Badge 
                  variant="outline" 
                  className={`${getStatusBadgeClass(pembayaran.status)} text-xs`}
                >
                  {pembayaran.status.charAt(0).toUpperCase() + pembayaran.status.slice(1)}
                </Badge>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-green-800">
                  Status Baru <span className="text-red-500">*</span>
                </Label>
                <select
                  id="status"
                  value={data.status}
                  onChange={(e) => setData('status', e.target.value as 'pending' | 'disetujui' | 'ditolak')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="pending">Pending</option>
                  <option value="disetujui">Disetujui</option>
                  <option value="ditolak">Ditolak</option>
                </select>
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="keterangan" className="text-green-800">
                  Keterangan
                </Label>
                <Textarea
                  id="keterangan"
                  placeholder="Berikan keterangan untuk perubahan status ini..."
                  value={data.keterangan}
                  onChange={(e) => setData('keterangan', e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500"
                  rows={3}
                />
                {errors.keterangan && (
                  <p className="text-sm text-red-600">{errors.keterangan}</p>
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
                <Button
                  type="submit"
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing ? 'Menyimpan...' : 'Update Status'}
                </Button>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
