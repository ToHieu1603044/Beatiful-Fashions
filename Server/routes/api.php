<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['api'])->group(function () {
    require __DIR__ . '/api/v1.php'; // Include file routes/api/v1.php
});
