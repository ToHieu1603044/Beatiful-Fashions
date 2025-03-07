<?php

namespace App\Listeners;

use App\Events\RatingCreated;
use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UpdateProductRating
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(RatingCreated $event)
    {
        $product = Product::find($event->rating->product_id);
        if ($product) {
            $product->increment('total_rating');

        }
    }
}
