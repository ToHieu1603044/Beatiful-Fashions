<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Support\Facades\DB;

class NewNotificationEvent implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public $notification;
    public $userIds;

    public function __construct(Notification $notification)
    {
        \Log::info('Phát sự kiện realtime', ['notification_id' => $notification->id]);

        $this->notification = $notification;

        $this->userIds = DB::table('notification_user')
            ->where('notification_id', $notification->id)
            ->pluck('user_id')
            ->toArray();

        \Log::info('Danh sách User nhận thông báo:', ['userIds' => $this->userIds]);
    }


    public function broadcastOn()
    {
        \Log::info('📡 Phát thông báo đến tất cả người dùng trên kênh global-notifications');
    
        return new Channel("global-notifications");
    }
    


    public function broadcastAs()
    {
        return 'NewNotification';
    }

    public function broadcastWith()
    {
        \Log::info('Dữ liệu thông báo gửi đi', [
            'id' => $this->notification->id,
            'title' => $this->notification->title,
            'message' => $this->notification->message,
            'type' => $this->notification->type,
            'user_id' => $this->notification->user_id,
            'created_at' => $this->notification->created_at->toDateTimeString(),
        ]);

        return [
            'id' => $this->notification->id,
            'title' => $this->notification->title,
            'message' => $this->notification->message,
            'type' => $this->notification->type,
            'user_id' => $this->notification->user_id,
            'created_at' => $this->notification->created_at->toDateTimeString(),
        ];
    }
}