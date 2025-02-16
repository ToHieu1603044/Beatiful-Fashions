<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function index()
    {
        $brands = \App\Models\Brand::all();
        return ApiResponse::responseObject($brands);
    }
}
