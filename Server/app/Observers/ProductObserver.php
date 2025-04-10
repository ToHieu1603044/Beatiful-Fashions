<?php

// namespace App\Observers;

// use App\Models\Product;
// use Illuminate\Support\Facades\Http;

// class ProductObserver
// {
//     /**
//      * Handle the Product "created" event.
//      */
//     public function created(Product $product): void
//     {
//         $this->syncToElasticsearch($product);

//     }

//     /**
//      * Handle the Product "updated" event.
//      */
//     public function updated(Product $product): void
//     {
//         $this->syncToElasticsearch($product);

//     }

//     /**
//      * Handle the Product "deleted" event.
//      */
//     public function deleted(Product $product): void
//     {
//         //
//     }

//     /**
//      * Handle the Product "restored" event.
//      */
//     public function restored(Product $product): void
//     {
//         //
//     }

//     /**
//      * Handle the Product "force deleted" event.
//      */
//     public function forceDeleted(Product $product): void
//     {
//         //
//     }
//     private function syncToElasticsearch(Product $product)
//     {
//         Http::put("http://localhost:9200/products/_doc/{$product->id}", $product->toArray());
//     }
// }
