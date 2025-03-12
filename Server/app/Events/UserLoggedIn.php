<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

use Illuminate\Queue\SerializesModels;
use App\Models\User;

class UserLoggedIn implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public $user;

    public function __construct(User $user)
    {
        $this->user = $user;
        \Log::info('🔥 Event UserLoggedIn đã được khởi tạo cho user: ' . $user->name);
    }
    

    public function broadcastOn()
    {
        return new Channel('user-activity'); // Kênh public
    }

    public function broadcastAs()
    {
        return 'UserLoggedIn';
    }

    public function broadcastWith()
    {
        \Log::info($this->user->name . ' vừa đăng nhập!'); 
    
        return [
            'message' => $this->user->name . ' vừa đăng nhập!',
            'user_id' => $this->user->id,
        ];
    }
    
}
