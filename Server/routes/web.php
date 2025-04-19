<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\GoogleController;
Route::get('/', function () {
    return view('welcome');
});
Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);