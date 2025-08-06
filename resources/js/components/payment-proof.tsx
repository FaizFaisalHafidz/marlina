import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Download, Eye, FileImage } from 'lucide-react';

interface PaymentProofProps {
    bukti_pembayaran?: string;
    siswa_nama?: string;
    jumlah?: number;
    showEmpty?: boolean;
}

export default function PaymentProof({ 
    bukti_pembayaran, 
    siswa_nama = 'Siswa', 
    jumlah = 0,
    showEmpty = true 
}: PaymentProofProps) {
    const hasProof = bukti_pembayaran && bukti_pembayaran.trim() !== '';

    if (!hasProof && !showEmpty) {
        return null;
    }

    if (!hasProof) {
        return (
            <div className="flex items-center justify-center w-20 h-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-center p-2">
                    <FileImage className="w-6 h-6 mx-auto text-gray-300 mb-1" />
                    <span className="text-xs text-gray-400">Tidak ada bukti</span>
                </div>
            </div>
        );
    }

    const imageUrl = bukti_pembayaran.startsWith('http') 
        ? bukti_pembayaran 
        : `/storage/${bukti_pembayaran}`;

    return (
        <div className="flex items-center gap-2">
            {/* Thumbnail */}
            <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border shadow-sm">
                <img 
                    src={imageUrl} 
                    alt={`Bukti pembayaran ${siswa_nama}`}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent) {
                            parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gray-50">
                                    <div class="text-center p-2">
                                        <svg class="w-6 h-6 mx-auto text-gray-300 mb-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                        </svg>
                                        <span class="text-xs text-gray-400">Gambar rusak</span>
                                    </div>
                                </div>
                            `;
                        }
                    }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white opacity-0 hover:opacity-100 transition-opacity" />
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                            <Eye className="w-3 h-3 mr-1" />
                            Lihat
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                Bukti Pembayaran - {siswa_nama}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-600">
                                    <p><span className="font-medium">Siswa:</span> {siswa_nama}</p>
                                    <p><span className="font-medium">Jumlah:</span> Rp {new Intl.NumberFormat('id-ID').format(jumlah)}</p>
                                </div>
                            </div>
                            <div className="relative bg-gray-100 rounded-lg overflow-hidden min-h-48">
                                <img 
                                    src={imageUrl} 
                                    alt={`Bukti pembayaran ${siswa_nama}`}
                                    className="w-full max-h-96 object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        const parent = target.parentElement;
                                        if (parent) {
                                            parent.innerHTML = `
                                                <div class="flex items-center justify-center h-48 text-gray-500 bg-gray-50">
                                                    <div class="text-center">
                                                        <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                                        </svg>
                                                        <p class="text-gray-400">Gambar tidak dapat dimuat</p>
                                                        <p class="text-sm text-gray-400 mt-1">File mungkin rusak atau tidak tersedia</p>
                                                    </div>
                                                </div>
                                            `;
                                        }
                                    }}
                                />
                            </div>
                            <div className="mt-4 flex justify-end">
                                <Button variant="outline" size="sm" asChild>
                                    <a 
                                        href={imageUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        download
                                    >
                                        <Download className="w-3 h-3 mr-1" />
                                        Download
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Button variant="ghost" size="sm" className="h-8" asChild>
                    <a 
                        href={imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        <Download className="w-3 h-3 mr-1" />
                        Unduh
                    </a>
                </Button>
            </div>
        </div>
    );
}

// Empty State Component
export function PaymentProofEmpty({ 
    message = "Belum ada bukti pembayaran",
    size = "normal" 
}: { 
    message?: string;
    size?: "small" | "normal" | "large";
}) {
    const sizeClasses = {
        small: "w-16 h-16",
        normal: "w-20 h-20", 
        large: "w-32 h-32"
    };

    const iconSizes = {
        small: "w-4 h-4",
        normal: "w-6 h-6",
        large: "w-8 h-8"
    };

    const textSizes = {
        small: "text-xs",
        normal: "text-sm",
        large: "text-base"
    };

    return (
        <div className={`flex items-center justify-center ${sizeClasses[size]} bg-gray-50 rounded-lg border-2 border-dashed border-gray-200`}>
            <div className="text-center p-2">
                <FileImage className={`${iconSizes[size]} mx-auto text-gray-300 mb-1`} />
                <span className={`${textSizes[size]} text-gray-400 leading-tight`}>
                    {message}
                </span>
            </div>
        </div>
    );
}
