<?php

use App\Http\Controllers\Api\AttributeController;
use App\Http\Controllers\Api\AttributeOptionController;
use App\Http\Controllers\Api\ProductController;
use App\Models\Product;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return 'Hello World';
});
Route::get('products', [ProductController::class,'index']);
Route::post('/products', [ProductController::class,'store']);
Route::get('/products/{id}',[ProductController::class,'show']);
Route::patch('/products/{id}',[ProductController::class,'update']);

Route::apiResource('attributes', AttributeController::class);
Route::apiResource('attribute-options', AttributeOptionController::class);
?>