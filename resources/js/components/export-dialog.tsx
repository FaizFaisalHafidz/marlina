import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useState } from 'react';

interface ExportDialogProps {
    title: string;
    exportUrl: string;
    currentFilters?: Record<string, any>;
    children?: React.ReactNode;
}

export default function ExportDialog({ 
    title, 
    exportUrl, 
    currentFilters = {},
    children 
}: ExportDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'excel' | 'pdf') => {
        setIsExporting(true);
        
        try {
            // Build URL with current filters
            const params = new URLSearchParams();
            
            // Add format
            params.append('format', format);
            
            // Add current filters
            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    params.append(key, String(value));
                }
            });

            const url = `${exportUrl}?${params.toString()}`;
            
            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = ''; // Let the server determine filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Close dialog after a short delay
            setTimeout(() => {
                setIsOpen(false);
            }, 1000);
            
        } catch (error) {
            console.error('Export failed:', error);
            alert('Gagal mengekspor data. Silakan coba lagi.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Export {title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Pilih format file yang ingin diunduh:
                    </p>
                    
                    {/* Excel Export */}
                    <Button
                        className="w-full justify-start h-16"
                        variant="outline"
                        onClick={() => handleExport('excel')}
                        disabled={isExporting}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="text-left">
                                <div className="font-medium">Excel (.xlsx)</div>
                                <div className="text-sm text-gray-500">
                                    Format spreadsheet dengan perhitungan
                                </div>
                            </div>
                        </div>
                    </Button>

                    {/* PDF Export */}
                    <Button
                        className="w-full justify-start h-16"
                        variant="outline"
                        onClick={() => handleExport('pdf')}
                        disabled={isExporting}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                                <FileText className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="text-left">
                                <div className="font-medium">PDF (.pdf)</div>
                                <div className="text-sm text-gray-500">
                                    Format dokumen dengan kop surat
                                </div>
                            </div>
                        </div>
                    </Button>

                    {/* Current Filters Info */}
                    {Object.keys(currentFilters).some(key => 
                        currentFilters[key] !== null && 
                        currentFilters[key] !== undefined && 
                        currentFilters[key] !== ''
                    ) && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">
                                Filter yang akan diterapkan:
                            </h4>
                            <div className="space-y-1 text-sm text-blue-700">
                                {Object.entries(currentFilters)
                                    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
                                    .map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="capitalize">{key.replace('_', ' ')}:</span>
                                            <span className="font-medium">{String(value)}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    )}

                    {isExporting && (
                        <div className="flex items-center justify-center py-4">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm text-gray-600">Memproses export...</span>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
