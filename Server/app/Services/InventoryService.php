<?php

namespace App\Services;

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
        return Redis::incrby("flash_sale_stock:$productId", $quantity);
    }
    
}
