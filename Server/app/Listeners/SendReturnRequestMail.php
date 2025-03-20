<?php

namespace App\Listeners;

use App\Events\OrderReturnRequested;
use App\Mail\OrderReturnMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendReturnRequestMail
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
    public function handle(OrderReturnRequested $event)
    {
        Mail::to($event->order->user->email)->send(
            new OrderReturnMail($event->order, $event->returnItems)
        );
    }
}
