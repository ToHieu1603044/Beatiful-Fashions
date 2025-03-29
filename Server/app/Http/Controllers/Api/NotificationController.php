<?php

namespace App\Http\Controllers\Api;

use App\Events\NewNotificationEvent;
use App\Helpers\ApiResponse;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use App\Models\NotificationUser;
use App\Models\User;
use Auth;
use Illuminate\Http\Request;

class NotificationController
{
    public function getNotification(Request $request)
    {
        $user = Auth::user();

        $notifications = Notification::whereNull('user_id') // Thông báo chung
            ->whereDoesntHave('notificationUsers', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('deleted', true);
            }) // Không lấy thông báo chung nếu user đã xóa
            ->orWhereHas('notificationUsers', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('deleted', false);
            }) // Lấy thông báo cá nhân chưa bị xóa
            ->orderBy('created_at', 'desc')
            ->get();

        return ApiResponse::responseObject(NotificationResource::collection($notifications));
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|string',
        ]);

        $notification = Notification::create([
            'title' => $request->title,
            'message' => $request->message,
            'type' => $request->type,
            'status' => 'unread',
        ]);

        $userIds = User::pluck('id')->toArray();

        if (!empty($userIds)) {
            $data = array_map(fn($id) => ['user_id' => $id, 'notification_id' => $notification->id, 'status' => 'unread', 'deleted' => false], $userIds);

            \DB::table('notification_user')->insert($data);
        }

        event(new NewNotificationEvent($notification));

        return response()->json([
            'message' => 'Thông báo đã được gửi đến tất cả người dùng!',
            'notification' => $notification
        ], 201);
    }
    public function markAsRead($id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $notificationUser = NotificationUser::where('notification_id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$notificationUser) {
            return response()->json(['message' => 'Thông báo không tồn tại hoặc không thuộc về bạn'], 404);
        }

        $notificationUser->status = 'read';
        $notificationUser->save();

        return response()->json(['message' => 'Cập nhật thông báo thành công']);
    }
    public function deleteNotification($id)
    {
        $user = Auth::user();

        $notificationUser = NotificationUser::where('notification_id', $id)
            ->where('user_id', $user->id)
            ->first();

        if ($notificationUser) {
            $notificationUser->deleted = true;
            $notificationUser->save();
            return response()->json(['message' => 'Thông báo đã bị ẩn'], 200);
        }

        return response()->json(['message' => 'Thông báo không tồn tại'], 404);
    }
}
