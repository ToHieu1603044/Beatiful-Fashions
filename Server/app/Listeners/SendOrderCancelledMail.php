<?php

namespace App\Listeners;

use App\Events\OrderCancelled;
use App\Mail\OrderCancelledMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendOrderCancelledMail
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(OrderCancelled $event): void
    {
        $order = $event->order;

        Mail::to($order->email)->send(new OrderCancelledMail($order));
    }
}
