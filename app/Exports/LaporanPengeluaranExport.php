<?php

namespace App\Exports;

use App\Models\Pengeluaran;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithDrawings;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class LaporanPengeluaranExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithDrawings, WithColumnWidths, WithTitle
{
    protected $filters;
    protected $totalPengeluaran;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Pengeluaran::with(['kategori'])
            ->orderBy('tanggal_pengeluaran', 'desc');

        // Apply filters
        if (!empty($this->filters['kategori'])) {
            $query->where('kategori_id', $this->filters['kategori']);
        }

        if (!empty($this->filters['tanggal_dari'])) {
            $query->whereDate('tanggal_pengeluaran', '>=', $this->filters['tanggal_dari']);
        }

        if (!empty($this->filters['tanggal_sampai'])) {
            $query->whereDate('tanggal_pengeluaran', '<=', $this->filters['tanggal_sampai']);
        }

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('keterangan', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%");
            });
        }

        $pengeluaran = $query->get();
        $this->totalPengeluaran = $pengeluaran->sum('jumlah');

        return $pengeluaran;
    }

    public function headings(): array
    {
        return [
            // Add empty rows for header
            [], [], [], [], [], // 5 empty rows for logo and title
            ['No', 'Tanggal', 'Kategori', 'Keterangan', 'Deskripsi', 'Jumlah'],
        ];
    }

    public function map($pengeluaran): array
    {
        static $no = 1;
        return [
            $no++,
            \Carbon\Carbon::parse($pengeluaran->tanggal_pengeluaran)->format('d/m/Y'),
            $pengeluaran->kategori->nama ?? '-',
            $pengeluaran->keterangan,
            $pengeluaran->deskripsi ?? '-',
            'Rp ' . number_format($pengeluaran->jumlah, 0, ',', '.'),
        ];
    }

    public function drawings()
    {
        // Download logo
        $logoUrl = 'https://neoflash.sgp1.cdn.digitaloceanspaces.com/logo-sirnamiskin.png';
        $logoPath = storage_path('app/temp_logo_' . time() . '.png');
        
        try {
            $logoContent = file_get_contents($logoUrl);
            if ($logoContent !== false) {
                file_put_contents($logoPath, $logoContent);
                
                $drawing = new Drawing();
                $drawing->setName('Logo');
                $drawing->setDescription('MIS Addimiyati Logo');
                $drawing->setPath($logoPath);
                $drawing->setHeight(80);
                $drawing->setCoordinates('A1');
                
                return [$drawing];
            }
        } catch (\Exception $e) {
            // Logo failed to load, continue without it
        }

        return [];
    }

    public function styles(Worksheet $sheet)
    {
        // Title and school info
        $sheet->setCellValue('C1', 'MIS ADDIMIYATI');
        $sheet->setCellValue('C2', 'LAPORAN PENGELUARAN');
        $sheet->setCellValue('C3', 'Periode: ' . $this->getPeriodeText());
        $sheet->setCellValue('C4', 'Dicetak: ' . \Carbon\Carbon::now()->format('d/m/Y H:i'));

        // Merge title cells
        $sheet->mergeCells('C1:F1');
        $sheet->mergeCells('C2:F2');
        $sheet->mergeCells('C3:F3');
        $sheet->mergeCells('C4:F4');

        // Header styles
        $sheet->getStyle('C1:C4')->applyFromArray([
            'font' => ['bold' => true, 'size' => 12],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);

        // Table header style (row 6)
        $sheet->getStyle('A6:F6')->applyFromArray([
            'font' => ['bold' => true],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E2E8F0']
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN]
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);

        // Add total row at the end
        $lastRow = $sheet->getHighestRow() + 1;
        $sheet->setCellValue("E{$lastRow}", 'TOTAL');
        $sheet->setCellValue("F{$lastRow}", 'Rp ' . number_format($this->totalPengeluaran, 0, ',', '.'));
        
        $sheet->getStyle("E{$lastRow}:F{$lastRow}")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'FEF3C7']
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN]
            ]
        ]);

        return [
            // Apply borders to all data
            7 => ['borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 5,   // No
            'B' => 12,  // Tanggal
            'C' => 20,  // Kategori
            'D' => 30,  // Keterangan
            'E' => 25,  // Deskripsi
            'F' => 15,  // Jumlah
        ];
    }

    public function title(): string
    {
        return 'Laporan Pengeluaran';
    }

    private function getPeriodeText()
    {
        if (!empty($this->filters['tanggal_dari']) && !empty($this->filters['tanggal_sampai'])) {
            return \Carbon\Carbon::parse($this->filters['tanggal_dari'])->format('d/m/Y') . ' - ' . 
                   \Carbon\Carbon::parse($this->filters['tanggal_sampai'])->format('d/m/Y');
        } elseif (!empty($this->filters['tanggal_dari'])) {
            return 'Dari ' . \Carbon\Carbon::parse($this->filters['tanggal_dari'])->format('d/m/Y');
        } elseif (!empty($this->filters['tanggal_sampai'])) {
            return 'Sampai ' . \Carbon\Carbon::parse($this->filters['tanggal_sampai'])->format('d/m/Y');
        }
        
        return 'Semua Data';
    }
}
