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
            $orders = Order::with('orderDetails.sku')->orderBy('created_at', 'desc')->paginate(10);
    
            if ($orders->isEmpty()) {
                return response()->json(['error' => __('messages.order_not_found')], 404);
            }
    
            $pdf = Pdf::loadView('pdf.invoices', compact('orders'));
            return $pdf->download();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function exportPdf(Request $request, $id)
    {
        try {
            $orders = Order::with('orderDetails.sku')->where('id', $id)->get();
           
            if ($orders->isEmpty()) {
                return response()->json(['error' => __('messages.order_not_found')], 404);
            }
    
            $pdf = Pdf::loadView('pdf.invoices-order', compact('orders'));
            return $pdf->download();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    

}
