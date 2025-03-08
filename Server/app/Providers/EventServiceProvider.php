<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\RatingCreated;
use App\Listeners\UpdateProductRating;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        RatingCreated::class => [
            UpdateProductRating::class,
        ],
    ];

    public function boot()
    {
        parent::boot();
    }
}
