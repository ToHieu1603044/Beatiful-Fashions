<?php

namespace App\Listeners;

use App\Events\OrderReturnCompleted;
use App\Mail\OrderReturnCompletedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendOrderReturnCompletedEmail
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    public function handle(OrderReturnCompleted $event)
    {
        $orderReturn = $event->orderReturn;
        $user = $orderReturn->user; 

        if ($user && $user->email) {
            Mail::to($user->email)->send(new OrderReturnCompletedMail($orderReturn));
        }
    }
}
