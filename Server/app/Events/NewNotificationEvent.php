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
    public $userIds; // Danh sách user_id nhận thông báo

    public function __construct(Notification $notification)
    {
        $this->notification = $notification;

        // Lấy danh sách user từ bảng trung gian notification_user
        $this->userIds = DB::table('notification_user')
            ->where('notification_id', $notification->id)
            ->pluck('user_id')
            ->toArray();
    }

    public function broadcastOn()
    {
        // Nếu là thông báo chung => gửi đến tất cả user
        if (empty($this->userIds)) {
            return new Channel("global-notifications");
        }

        // Nếu là thông báo cá nhân => gửi đến từng user
        return array_map(fn ($userId) => new Channel("user-{$userId}"), $this->userIds);
    }

    public function broadcastAs()
    {
        return 'NewNotification';
    }

    public function broadcastWith()
    {
        return [
            'id'      => $this->notification->id,
            'title'   => $this->notification->title,
            'message' => $this->notification->message,
            'type'    => $this->notification->type,
            'status'  => $this->notification->status,
            'user_id' => $this->notification->user_id,
            'created_at' => $this->notification->created_at->toDateTimeString(),
        ];
    }
}
