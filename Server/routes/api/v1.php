<?php

use App\Http\Controllers\Api\AttributeController;
use App\Http\Controllers\Api\AttributeOptionController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Models\Product;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;


Route::get('/', function () {
    return 'Hello World';
});
Route::get('products', [ProductController::class,'index']);
Route::post('/products', [ProductController::class,'store']);
Route::delete('/products/{id}',[ProductController::class,'destroy']);
Route::get('/products/{id}',[ProductController::class,'show']);
Route::put('/products/{id}',[ProductController::class,'update']);

Route::apiResource('attributes', AttributeController::class);
Route::apiResource('attribute-options', AttributeOptionController::class);

Route::middleware(['api'])->group(function () {
    Route::apiResource('brands', BrandController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::put('/categories/{id}',[CategoryController::class,'update']);
});
// Routes công khai (không cần login)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// Routes yêu cầu login
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'userProfile']);
});
Route::middleware('auth:sanctum')->group(function(){
    Route::apiResource('carts',CartController::class);
    Route::delete('carts', [CartController::class, 'clearCart']);
});

?>