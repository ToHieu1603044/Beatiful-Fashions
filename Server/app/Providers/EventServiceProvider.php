<?php

namespace App\Providers;

use App\Events\NewNotificationEvent;
use App\Events\UserLoggedIn;
use App\Events\UserLoggedOut;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\RatingCreated;
use App\Listeners\UpdateProductRating;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Login::class => [
            \App\Events\UserLoggedIn::class => [],
        ],
            // NewNotificationEvent::class => [],
        Logout::class => [
            UserLoggedOut::class,
        ],
    ];

    public function boot()
    {
        parent::boot();
    }
}
