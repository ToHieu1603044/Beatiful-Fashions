<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'status'
    ];

    protected $casts = [
        'type' => 'string',
        'status' => 'string'
    ];

    public function users()
    {
        return $this->belongsToMany(User::class)
            ->withPivot('status', 'deleted')
            ->withTimestamps();
    }
    public function notificationUsers()
    {
        return $this->hasMany(NotificationUser::class, 'notification_id');
    }

}
