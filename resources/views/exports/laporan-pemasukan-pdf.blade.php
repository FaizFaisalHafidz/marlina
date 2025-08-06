<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            font-size: 12px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            margin-bottom: 10px;
        }
        
        .school-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .school-address {
            font-size: 12px;
            margin-bottom: 10px;
        }
        
        .report-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .export-info {
            font-size: 10px;
            margin-bottom: 20px;
        }
        
        .summary {
            background-color: #f8f9fa;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            border: 1px solid #dee2e6;
        }
        
        .summary h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #495057;
        }
        
        .summary .total {
            font-size: 18px;
            font-weight: bold;
            color: #28a745;
        }
        
        .filters {
            background-color: #f5f5f5;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        
        .filters h4 {
            margin: 0 0 10px 0;
            font-size: 12px;
        }
        
        .filters p {
            margin: 5px 0;
            font-size: 10px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 10px;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        th {
            background-color: #28a745;
            color: white;
            font-weight: bold;
            text-align: center;
        }
        
        .number {
            text-align: center;
        }
        
        .amount {
            text-align: right;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 30px;
            text-align: right;
            font-size: 10px;
        }
        
        .signature {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
        }
        
        .signature div {
            text-align: center;
            width: 200px;
        }
        
        @page {
            margin: 1cm;
        }
        
        .total-row {
            background-color: #f8f9fa;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="{{ $logo_url }}" alt="Logo MIS Addimiyati" class="logo" style="display: block; margin: 0 auto;">
        <div class="school-name">MIS ADDIMIYATI</div>
        <div class="school-address">Jl. Contoh Alamat, Kota</div>
        <div class="report-title">{{ $title }}</div>
        <div class="export-info">Dicetak pada: {{ $export_date }}</div>
    </div>
    
    <!-- Summary -->
    <div class="summary">
        <h3>Ringkasan Pemasukan</h3>
        <div class="total">Total Pemasukan: Rp {{ number_format($total_pemasukan, 0, ',', '.') }}</div>
        <div style="margin-top: 10px; font-size: 12px;">
            Total Transaksi: {{ $pembayaran_list->count() }} pembayaran
        </div>
    </div>
    
    @if(!empty(array_filter($filters)))
    <div class="filters">
        <h4>Filter yang Diterapkan:</h4>
        @if(!empty($filters['jenis_pembayaran']))
            <p><strong>Jenis Pembayaran:</strong> {{ $filters['jenis_pembayaran'] }}</p>
        @endif
        @if(!empty($filters['kelas']))
            <p><strong>Kelas:</strong> {{ $filters['kelas'] }}</p>
        @endif
        @if(!empty($filters['tanggal_dari']))
            <p><strong>Tanggal Dari:</strong> {{ \Carbon\Carbon::parse($filters['tanggal_dari'])->format('d/m/Y') }}</p>
        @endif
        @if(!empty($filters['tanggal_sampai']))
            <p><strong>Tanggal Sampai:</strong> {{ \Carbon\Carbon::parse($filters['tanggal_sampai'])->format('d/m/Y') }}</p>
        @endif
        @if(!empty($filters['search']))
            <p><strong>Pencarian:</strong> {{ $filters['search'] }}</p>
        @endif
    </div>
    @endif
    
    <table>
        <thead>
            <tr>
                <th class="number" style="width: 3%;">No</th>
                <th style="width: 10%;">Tanggal</th>
                <th style="width: 8%;">NISN</th>
                <th style="width: 20%;">Nama Siswa</th>
                <th style="width: 7%;">Kelas</th>
                <th style="width: 15%;">Jenis Pembayaran</th>
                <th style="width: 12%;">Jumlah</th>
                <th style="width: 10%;">Metode</th>
                <th style="width: 15%;">Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($pembayaran_list as $index => $pembayaran)
                <tr>
                    <td class="number">{{ $index + 1 }}</td>
                    <td>{{ $pembayaran->tanggal_pembayaran ? \Carbon\Carbon::parse($pembayaran->tanggal_pembayaran)->format('d/m/Y') : '-' }}</td>
                    <td>{{ $pembayaran->siswa->nisn ?? '-' }}</td>
                    <td>{{ $pembayaran->siswa->nama ?? '-' }}</td>
                    <td>{{ $pembayaran->siswa->kelas ?? '-' }}</td>
                    <td>{{ $pembayaran->jenis_pembayaran ?? '-' }}</td>
                    <td class="amount">Rp {{ number_format($pembayaran->jumlah, 0, ',', '.') }}</td>
                    <td>{{ $pembayaran->metode_pembayaran ?? ($pembayaran->rekening->nama_bank ?? '-') }}</td>
                    <td>{{ $pembayaran->keterangan ?? '-' }}</td>
                </tr>
            @endforeach
            
            @if($pembayaran_list->count() > 0)
                <tr class="total-row">
                    <td colspan="6" class="amount"><strong>TOTAL PEMASUKAN</strong></td>
                    <td class="amount"><strong>Rp {{ number_format($total_pemasukan, 0, ',', '.') }}</strong></td>
                    <td colspan="2"></td>
                </tr>
            @endif
        </tbody>
        
        @if($pembayaran_list->count() == 0)
            <tr>
                <td colspan="9" class="number" style="padding: 20px; font-style: italic;">
                    Tidak ada data pemasukan yang sesuai dengan filter yang diterapkan
                </td>
            </tr>
        @endif
    </table>
    
    <div class="footer">
        <div>Total Data: {{ $pembayaran_list->count() }}</div>
        <div class="signature">
            <div>
                <div style="margin-top: 50px;">
                    <div>Mengetahui,</div>
                    <div style="margin-top: 60px;">
                        <div>_________________________</div>
                        <div>Kepala Sekolah</div>
                    </div>
                </div>
            </div>
            <div>
                <div style="margin-top: 50px;">
                    <div>{{ \Carbon\Carbon::now()->format('d F Y') }}</div>
                    <div style="margin-top: 60px;">
                        <div>_________________________</div>
                        <div>Bendahara</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
