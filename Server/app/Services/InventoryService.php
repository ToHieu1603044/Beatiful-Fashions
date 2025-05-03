<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class InventoryService
{
    public static function reduceStock($sku, $quantity)
    {
        $key = "sku:stock:$sku";
    
        $lua = <<<LUA
        local stock = redis.call('GET', KEYS[1])
        if not stock then return -2 end
        if tonumber(stock) >= tonumber(ARGV[1]) then
            return redis.call('DECRBY', KEYS[1], ARGV[1])
        else
            return -1
        end
        LUA;
    
        return Redis::eval($lua, 1, $key, $quantity);
    }
    public static function restoreStock($sku, $quantity)
    {
        return Redis::incrby("sku:stock:$sku", $quantity);
    }
    

    public static function reduceFlashSaleStock($productId, $quantity)
    {
        $key = "flash_sale_stock:$productId"; 
    
        $lua = <<<LUA
        local stock = redis.call('GET', KEYS[1])
        if not stock then return -2 end
        if tonumber(stock) >= tonumber(ARGV[1]) then
            return redis.call('DECRBY', KEYS[1], ARGV[1])
        else
            return -1
        end
        LUA;
    
        return Redis::eval($lua, 1, $key, $quantity);
    }
    
    public static function restoreFlashSaleStock($productId, $quantity)
    {
        $redisKey = "flash_sale_stock:{$productId}";
    
        // Kiểm tra tồn kho hiện tại trong Redis
        if (Redis::exists($redisKey)) {
            $currentStock = (int) Redis::get($redisKey);
            Redis::set($redisKey, $currentStock + $quantity);
        } else {
            // Nếu Redis chưa có → đọc từ DB rồi khởi tạo
            $flashSale = DB::table('flash_sale_products')->where('product_id', $productId)->first();
            if ($flashSale) {
                $currentStock = $flashSale->quantity + $quantity;
                Redis::set($redisKey, $currentStock);
            }
        }
    
        // Cập nhật lại DB theo Redis
        $updatedStock = Redis::get($redisKey);
        DB::table('flash_sale_products')
            ->where('product_id', $productId)
            ->update(['quantity' => $updatedStock]);
    }
    
    
    
}
