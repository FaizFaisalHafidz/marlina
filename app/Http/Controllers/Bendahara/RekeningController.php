<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\Rekening;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RekeningController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        
        $query = Rekening::query();
        
        if ($search) {
            $query->where('nama_bank', 'like', "%{$search}%")
                  ->orWhere('nama_penerima', 'like', "%{$search}%")
                  ->orWhere('nomor_rekening', 'like', "%{$search}%");
        }
        
        $rekening = $query->orderBy('nama_bank', 'asc')->paginate(15);
        
        // Get statistics
        $stats = [
            'total_rekening' => Rekening::count(),
            'total_bank' => Rekening::distinct('nama_bank')->count(),
        ];

        return Inertia::render('bendahara/rekening', [
            'rekening' => $rekening,
            'stats' => $stats,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_bank' => 'required|string|max:100',
            'nama_penerima' => 'required|string|max:255',
            'nomor_rekening' => 'required|string|max:50|unique:rekening,nomor_rekening',
        ]);

        Rekening::create($validated);

        return back()->with('success', 'Data rekening berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Rekening $rekening)
    {
        $validated = $request->validate([
            'nama_bank' => 'required|string|max:100',
            'nama_penerima' => 'required|string|max:255',
            'nomor_rekening' => 'required|string|max:50|unique:rekening,nomor_rekening,' . $rekening->id,
        ]);

        $rekening->update($validated);

        return back()->with('success', 'Data rekening berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Rekening $rekening)
    {
        // Check if rekening is being used in pembayaran
        if ($rekening->pembayaran()->exists()) {
            return back()->with('error', 'Rekening tidak dapat dihapus karena sedang digunakan dalam transaksi pembayaran.');
        }

        $rekening->delete();

        return back()->with('success', 'Data rekening berhasil dihapus.');
    }

    /**
     * Export rekening data
     */
    public function export(Request $request)
    {
        $search = $request->input('search');
        
        $query = Rekening::query();
        
        if ($search) {
            $query->where('nama_bank', 'like', "%{$search}%")
                  ->orWhere('nama_penerima', 'like', "%{$search}%")
                  ->orWhere('nomor_rekening', 'like', "%{$search}%");
        }
        
        $rekening = $query->orderBy('nama_bank', 'asc')->get();

        // Return CSV export
        $filename = 'data-rekening-' . now()->format('Y-m-d-H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($rekening) {
            $file = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($file, [
                'No',
                'Nama Bank',
                'Nama Penerima',
                'Nomor Rekening',
                'Tanggal Dibuat',
                'Terakhir Diupdate'
            ]);

            // CSV data
            foreach ($rekening as $index => $item) {
                fputcsv($file, [
                    $index + 1,
                    $item->nama_bank,
                    $item->nama_penerima,
                    $item->nomor_rekening,
                    $item->created_at->format('d/m/Y H:i'),
                    $item->updated_at->format('d/m/Y H:i')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
