<?php

namespace App\Exports;

use App\Models\Pembayaran;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithDrawings;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Carbon\Carbon;

class LaporanPemasukanExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithDrawings, WithTitle
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $query = Pembayaran::with(['siswa', 'rekening'])
            ->where('status', 'approved')
            ->orderBy('tanggal_pembayaran', 'desc');

        // Apply filters
        if (!empty($this->filters['jenis_pembayaran'])) {
            $query->where('jenis_pembayaran', $this->filters['jenis_pembayaran']);
        }

        if (!empty($this->filters['kelas'])) {
            $query->whereHas('siswa', function($q) {
                $q->where('kelas', $this->filters['kelas']);
            });
        }

        if (!empty($this->filters['tanggal_dari'])) {
            $query->whereDate('tanggal_pembayaran', '>=', $this->filters['tanggal_dari']);
        }

        if (!empty($this->filters['tanggal_sampai'])) {
            $query->whereDate('tanggal_pembayaran', '<=', $this->filters['tanggal_sampai']);
        }

        return $query->get();
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        $totalPemasukan = $this->collection()->sum('jumlah');
        
        return [
            ['MIS ADDIMIYATI'], // Row 1: School name
            ['Jl. Contoh Alamat, Kota'], // Row 2: Address
            ['LAPORAN PEMASUKAN'], // Row 3: Report title
            ['Periode: ' . ($this->filters['tanggal_dari'] ?? 'Semua') . ' s/d ' . ($this->filters['tanggal_sampai'] ?? 'Semua')], // Row 4: Period
            ['Total Pemasukan: Rp ' . number_format($totalPemasukan, 0, ',', '.')], // Row 5: Total
            ['Tanggal Export: ' . Carbon::now()->format('d/m/Y H:i')], // Row 6: Export date
            [], // Row 7: Empty
            [ // Row 8: Table headers
                'No',
                'Tanggal',
                'NISN',
                'Nama Siswa',
                'Kelas',
                'Jenis Pembayaran',
                'Jumlah',
                'Metode Pembayaran',
                'Rekening Tujuan',
                'Keterangan'
            ]
        ];
    }

    /**
     * @var Pembayaran $pembayaran
     */
    public function map($pembayaran): array
    {
        static $no = 1;
        
        return [
            $no++,
            $pembayaran->tanggal_pembayaran ? Carbon::parse($pembayaran->tanggal_pembayaran)->format('d/m/Y') : '-',
            $pembayaran->siswa->nisn ?? '-',
            $pembayaran->siswa->nama ?? '-',
            $pembayaran->siswa->kelas ?? '-',
            $pembayaran->jenis_pembayaran ?? '-',
            'Rp ' . number_format($pembayaran->jumlah, 0, ',', '.'),
            $pembayaran->metode_pembayaran ?? '-',
            $pembayaran->rekening->nama_rekening ?? '-',
            $pembayaran->keterangan ?? '-'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style for school name
            1 => [
                'font' => ['bold' => true, 'size' => 16],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ],
            // Style for address
            2 => [
                'font' => ['size' => 12],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ],
            // Style for report title
            3 => [
                'font' => ['bold' => true, 'size' => 14],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ],
            // Style for period
            4 => [
                'font' => ['size' => 11],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ],
            // Style for total
            5 => [
                'font' => ['bold' => true, 'size' => 12],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ],
            // Style for export date
            6 => [
                'font' => ['size' => 10],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ],
            // Style for table headers
            8 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FFE0E0E0']
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                    ],
                ],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ]
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 5,   // No
            'B' => 12,  // Tanggal
            'C' => 12,  // NISN
            'D' => 25,  // Nama
            'E' => 10,  // Kelas
            'F' => 20,  // Jenis Pembayaran
            'G' => 15,  // Jumlah
            'H' => 15,  // Metode
            'I' => 20,  // Rekening
            'J' => 30   // Keterangan
        ];
    }

    public function drawings()
    {
        $drawing = new Drawing();
        $drawing->setName('Logo');
        $drawing->setDescription('MIS Addimiyati Logo');
        
        // Download logo temporarily
        $logoPath = storage_path('app/temp/logo-sirnamiskin.png');
        if (!file_exists(dirname($logoPath))) {
            mkdir(dirname($logoPath), 0755, true);
        }
        
        // Download logo if not exists
        if (!file_exists($logoPath)) {
            $logoContent = file_get_contents('https://neoflash.sgp1.cdn.digitaloceanspaces.com/logo-sirnamiskin.png');
            if ($logoContent !== false) {
                file_put_contents($logoPath, $logoContent);
            }
        }
        
        if (file_exists($logoPath)) {
            $drawing->setPath($logoPath);
            $drawing->setHeight(60);
            $drawing->setCoordinates('A1');
            $drawing->setOffsetX(10);
            $drawing->setOffsetY(10);
            
            return [$drawing];
        }
        
        return [];
    }

    public function title(): string
    {
        return 'Laporan Pemasukan';
    }
}
