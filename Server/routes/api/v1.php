<?php
use App\Http\Controllers\ProductController;
use App\Models\Product;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return 'Hello World';
});
Route::get('products', ProductController::class,'index');
Route::post('/products', [ProductController::class,'store']);

?>