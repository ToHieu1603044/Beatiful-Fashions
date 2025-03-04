<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldBeEncrypted; 
class OrderPaidMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $order;
    public $orderDetails;

    public function __construct(Order $order)
    {
        // Đảm bảo load orderDetails để tránh lỗi undefined
        $this->order = $order->load('orderDetails');
        $this->orderDetails = $this->order->orderDetails;
    }

    public function build()
    {
        return $this->from(config('mail.from.address'), config('mail.from.name'))
                    ->subject('Xác nhận đơn hàng #' . $this->order->id)
                    ->markdown('emails.order_paid')
                    ->with([
                        'order' => $this->order,
                        'orderDetails' => $this->orderDetails, 
                    ]);
    }
}