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

class StatusPembayaranExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithDrawings, WithTitle
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
            ->orderBy('created_at', 'desc');

        // Apply filters
        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
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

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->whereHas('siswa', function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nisn', 'like', "%{$search}%");
            });
        }

        return $query->get();
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            ['MIS ADDIMIYATI'], // Row 1: School name
            ['Jl. Contoh Alamat, Kota'], // Row 2: Address
            ['LAPORAN STATUS PEMBAYARAN'], // Row 3: Report title
            ['Tanggal Export: ' . Carbon::now()->format('d/m/Y H:i')], // Row 4: Export date
            [], // Row 5: Empty
            [ // Row 6: Table headers
                'No',
                'NISN',
                'Nama Siswa',
                'Kelas',
                'Jenis Pembayaran',
                'Jumlah',
                'Tanggal Pembayaran',
                'Metode Pembayaran',
                'Rekening Tujuan',
                'Status',
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
            $pembayaran->siswa->nisn ?? '-',
            $pembayaran->siswa->nama ?? '-',
            $pembayaran->siswa->kelas ?? '-',
            $pembayaran->jenis_pembayaran ?? '-',
            'Rp ' . number_format($pembayaran->jumlah, 0, ',', '.'),
            $pembayaran->tanggal_pembayaran ? Carbon::parse($pembayaran->tanggal_pembayaran)->format('d/m/Y') : '-',
            $pembayaran->metode_pembayaran ?? '-',
            $pembayaran->rekening->nama_rekening ?? '-',
            $this->getStatusText($pembayaran->status),
            $pembayaran->keterangan ?? '-'
        ];
    }

    private function getStatusText($status)
    {
        switch ($status) {
            case 'pending':
                return 'Menunggu Validasi';
            case 'approved':
                return 'Disetujui';
            case 'rejected':
                return 'Ditolak';
            default:
                return ucfirst($status);
        }
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
            // Style for export date
            4 => [
                'font' => ['size' => 10],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ],
            // Style for table headers
            6 => [
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
            'B' => 12,  // NISN
            'C' => 25,  // Nama
            'D' => 10,  // Kelas
            'E' => 20,  // Jenis Pembayaran
            'F' => 15,  // Jumlah
            'G' => 15,  // Tanggal
            'H' => 15,  // Metode
            'I' => 20,  // Rekening
            'J' => 15,  // Status
            'K' => 30   // Keterangan
        ];
    }

    public function drawings()
    {
        $drawing = new Drawing();
        $drawing->setName('Logo');
        $drawing->setDescription('MIS Addimiyati Logo');
        
        // Download logo temporarily (you might want to store this locally)
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
        return 'Status Pembayaran';
    }
}
