<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class PdfController
{
    public function index(Request $request)
    {
        try {
            $orders = Order::with('orderDetails.sku')->orderBy('created_at', 'desc')->get();
    
            if ($orders->isEmpty()) {
                return response()->json(['error' => 'Không có đơn hàng nào để xuất PDF'], 404);
            }
    
            $pdf = Pdf::loadView('pdf.invoices', compact('orders'));
            return $pdf->download();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    

}
