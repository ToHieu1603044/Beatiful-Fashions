<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationUser extends Model
{
    protected $table = 'notification_user';
    protected $fillable = [
        'notification_id',
        'user_id',
        'status',
        'deleted',

    ];

    public function notification()
    {
        return $this->belongsTo(Notification::class, 'notification_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
