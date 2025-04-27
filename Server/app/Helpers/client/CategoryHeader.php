<?php

use Illuminate\Support\Facades\DB;

if (!function_exists('category_header')) {
    function category_header()
    {
        return DB::table('categories')->where('parent_id', 0)->get();
    }
}

if (!function_exists('setting_website')) {
    function setting_website()
    {
        return DB::table('setting')->first();
    }
}
?>