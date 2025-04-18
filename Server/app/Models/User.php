<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Order;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;
    use HasApiTokens, Notifiable;
    use SoftDeletes;
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $guard_name = 'api';
    protected $fillable = [
        'name',
        'email',
        'email_verified_at',
        'password',
        'remember_token',
        'phone',
        'address',
        'city',
        'district',
        'ward',
        'zip_code',
        'active',
        'role',
        'points',
        'ranking',
        'last_password_changed_at'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
    public function cart()
    {
        return $this->hasOne(Cart::class);
    }
    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function membership()
    {
        return $this->hasOne(Membership::class);
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }
    public function notifications()
    {
        return $this->belongsToMany(Notification::class, 'notification_user')
            ->withPivot('status', 'deleted')
            ->withTimestamps();
    }
    public function pointRedemptions(){
        return $this->hasMany(PointRedemption::class);
    }
    public function discounts(){
        return $this->hasMany(Discount::class);
    }

    public function updateRanking()
    {
        $totalSpent = Order::where('user_id', $this->id)
                           ->where('status', 'completed')
                           ->where('is_paid', 1)
                           ->sum('total_amount');

        if ($totalSpent >= 5000000) {
            $this->ranking = 4;
        } elseif ($totalSpent >= 3000000) {
            $this->ranking = 3;
        } elseif ($totalSpent >= 2000000) {
            $this->ranking = 2;
        } elseif ($totalSpent >= 1000000) {
            $this->ranking = 1;
        }

        $this->save();
    }

}
