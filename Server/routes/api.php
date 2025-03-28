<?php

use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\MembershipController;
use App\Http\Controllers\Api\UserController;

Route::middleware(['api'])->group(function () {
    require __DIR__ . '/api/v1.php';
});
Route::middleware('auth:api')->get('/me', [UserController::class, 'me']);
Route::middleware('auth:api')->get('/profile', [UserController::class, 'profile']);
Route::middleware('auth:api')->put('/update-profile', [UserController::class, 'updateProfile']);
Route::middleware('auth:sanctum')->post('/change-password', [UserController::class, 'changePassword']);



