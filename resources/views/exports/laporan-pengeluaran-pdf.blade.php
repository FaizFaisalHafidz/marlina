<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 15px;
        }
        
        .school-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .report-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .report-info {
            font-size: 11px;
            color: #666;
        }
        
        .filters {
            margin-bottom: 20px;
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
        }
        
        .filters h4 {
            margin: 0 0 10px 0;
            font-size: 12px;
        }
        
        .filter-item {
            display: inline-block;
            margin-right: 20px;
            font-size: 11px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        th {
            background-color: #f8f9fa;
            font-weight: bold;
            text-align: center;
        }
        
        .text-center {
            text-align: center;
        }
        
        .text-right {
            text-align: right;
        }
        
        .total-row {
            background-color: #fff3cd;
            font-weight: bold;
        }
        
        .summary {
            margin-top: 20px;
            border-top: 2px solid #000;
            padding-top: 15px;
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        
        .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        
        .signature-box {
            text-align: center;
            width: 200px;
        }
        
        .signature-line {
            border-top: 1px solid #000;
            margin-top: 60px;
            padding-top: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="{{ $logo_url }}" alt="Logo MIS Addimiyati" class="logo">
        <div class="school-name">MIS ADDIMIYATI</div>
        <div class="report-title">{{ strtoupper($title) }}</div>
        <div class="report-info">
            Dicetak pada: {{ $export_date }}
        </div>
    </div>

    @if($filters && (isset($filters['kategori']) || isset($filters['tanggal_dari']) || isset($filters['tanggal_sampai']) || isset($filters['search'])))
    <div class="filters">
        <h4>Filter yang Diterapkan:</h4>
        @if(isset($filters['kategori']) && $filters['kategori'])
            <span class="filter-item"><strong>Kategori:</strong> {{ $filters['kategori'] }}</span>
        @endif
        @if(isset($filters['tanggal_dari']) && $filters['tanggal_dari'])
            <span class="filter-item"><strong>Dari Tanggal:</strong> {{ \Carbon\Carbon::parse($filters['tanggal_dari'])->format('d/m/Y') }}</span>
        @endif
        @if(isset($filters['tanggal_sampai']) && $filters['tanggal_sampai'])
            <span class="filter-item"><strong>Sampai Tanggal:</strong> {{ \Carbon\Carbon::parse($filters['tanggal_sampai'])->format('d/m/Y') }}</span>
        @endif
        @if(isset($filters['search']) && $filters['search'])
            <span class="filter-item"><strong>Pencarian:</strong> {{ $filters['search'] }}</span>
        @endif
    </div>
    @endif

    <table>
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="12%">Tanggal</th>
                <th width="20%">Kategori</th>
                <th width="30%">Keterangan</th>
                <th width="18%">Deskripsi</th>
                <th width="15%">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            @foreach($pengeluaran_list as $index => $pengeluaran)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td class="text-center">{{ \Carbon\Carbon::parse($pengeluaran->tanggal_pengeluaran)->format('d/m/Y') }}</td>
                <td>{{ $pengeluaran->kategori->nama ?? '-' }}</td>
                <td>{{ $pengeluaran->keterangan }}</td>
                <td>{{ $pengeluaran->deskripsi ?? '-' }}</td>
                <td class="text-right">Rp {{ number_format($pengeluaran->jumlah, 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="5" class="text-center"><strong>TOTAL PENGELUARAN</strong></td>
                <td class="text-right"><strong>Rp {{ number_format($total_pengeluaran, 0, ',', '.') }}</strong></td>
            </tr>
        </tbody>
    </table>

    <div class="summary">
        <div class="summary-item">
            <span><strong>Total Data:</strong></span>
            <span>{{ count($pengeluaran_list) }} transaksi</span>
        </div>
        <div class="summary-item">
            <span><strong>Total Pengeluaran:</strong></span>
            <span><strong>Rp {{ number_format($total_pengeluaran, 0, ',', '.') }}</strong></span>
        </div>
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <div>Mengetahui,</div>
            <div>Kepala Sekolah</div>
            <div class="signature-line">
                <strong>(................................)</strong>
            </div>
        </div>
        <div class="signature-box">
            <div>Bandung, {{ \Carbon\Carbon::now()->format('d F Y') }}</div>
            <div>Bendahara</div>
            <div class="signature-line">
                <strong>(................................)</strong>
            </div>
        </div>
    </div>
</body>
</html>
