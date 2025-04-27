<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

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
        $order = Order::find($this->orderId);

        if ($order && !$order->is_paid && $order->status !== 'cancelled' && $order->payment_method !== 'online') {
            $order->update([
                'status' => 'cancelled'
            ]);

            \Log::info("Đơn hàng #$this->orderId bị huỷ tự động do không thanh toán.");
        }
    }
}
