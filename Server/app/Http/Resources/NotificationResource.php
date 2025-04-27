<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'status' => $this->notificationUsers()->where('user_id', auth()->id())->value('status') ?? 'unread',
            'created_at' => $this->created_at, 
            'time_ago' => $this->created_at ? Carbon::parse($this->created_at)->diffForHumans() : null, 
        ];
    }
    
}
