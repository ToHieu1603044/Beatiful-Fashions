<?php

namespace App\Events;

use App\Models\Order;
use App\Models\OrderReturn;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderReturnRequested
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $order;
    public $orderReturn;
    public $returnItems;

    public function __construct(Order $order, OrderReturn $orderReturn, array $returnItems)
    {
        $this->order = $order;
        $this->orderReturn = $orderReturn;
        $this->returnItems = $returnItems;
    }
}
