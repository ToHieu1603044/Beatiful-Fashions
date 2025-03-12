<?php


namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class NotificationService
{
    public function sendNotificationToUsers(string $title, string $message, array $userIds, string $type = null)
    {
        DB::transaction(function () use ($title, $message, $userIds, $type) {
            $notification = Notification::create([
                'title'   => $title,
                'message' => $message,
                'type'    => $type
            ]);

            $notification->users()->attach($userIds);
        });
    }
}
