<?php

namespace App\Jobs;

use App\Events\OrderCancelled;
use App\Models\Discount;
use App\Models\Order;
use App\Models\ProductSku;
use Auth;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class CancelUnpaidOrder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $orderId;

    /**
     * Create a new job instance.
     */
    public function __construct($orderId)
    {
        $this->orderId = $orderId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $order = Order::with(['orderDetails', 'user'])->find($this->orderId);
    
        if ($order && !$order->is_paid && $order->status === 'pending' && $order->payment_method === 'online') {
            DB::beginTransaction();
    
            try {
                foreach ($order->orderDetails as $detail) {
                    $sku = ProductSku::where('sku', $detail->sku)->first();
                    if ($sku) {
                        $sku->increment('stock', $detail->quantity);
                        $sku->product->decrement('total_sold', $detail->quantity);
    
                        $stockKey = "sku:stock:{$detail->sku}";
                        Redis::incrby($stockKey, $detail->quantity);
    
                        Log::info("Hoàn tác tồn kho cho SKU {$detail->sku}: +{$detail->quantity} đơn vị (Redis: {$stockKey}).");
                    } else {
                        Log::warning("Không tìm thấy SKU {$detail->sku} để hoàn tác tồn kho.");
                    }
                }
    
                // Hoàn điểm
                if ($order->used_points > 0) {
                    $order->user->increment('points', $order->used_points);
                    Log::info("Hoàn lại {$order->used_points} điểm cho user #{$order->user_id}");
                }
    
                // Hoàn tác mã giảm giá
                if ($order->code) {
                    $discount = Discount::where('code', $order->code)
                        ->where('is_active', true)
                        ->first();
    
                    if ($discount) {
                        $discount->decrement('used_count', 1);
                        $discount->discountUsages()->where('user_id', $order->user_id)->delete();
                        Log::info("Hoàn tác mã giảm giá {$order->code} cho user #{$order->user_id}");
                    }
                }
    
                $order->delete();
    
                Log::info("Đơn hàng #{$this->orderId} đã bị xóa tự động do không thanh toán sau 1 phút.");
    
                DB::commit();
                OrderCancelled::dispatch($order);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Lỗi khi xóa đơn hàng #{$this->orderId}: " . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        } else {
            Log::info("Đơn hàng #{$this->orderId} không thỏa điều kiện xóa: " . json_encode([
                'is_paid' => $order?->is_paid,
                'status' => $order?->status,
                'payment_method' => $order?->payment_method,
            ]));
        }
    }
    
}