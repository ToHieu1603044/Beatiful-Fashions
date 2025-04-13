<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;
use App\Models\ProductSku;
use App\Models\FlashSaleProduct;

class SyncSkuStockToRedis extends Command
{
    protected $signature = 'sync:sku-stock';
    protected $description = 'Đồng bộ tồn kho SKU và Flash Sale từ DB vào Redis';

    public function handle()
    {
        $this->syncSkuStock();
        $this->syncFlashSaleStock();

        $this->info('✅ Đồng bộ SKU và Flash Sale stock vào Redis hoàn tất!');
    }

    protected function syncSkuStock()
    {
        $skus = ProductSku::all();

        foreach ($skus as $sku) {
            $key = "sku:stock:{$sku->sku}";
            Redis::set($key, $sku->stock);
            $this->line("✅ [SKU] {$key} = {$sku->stock}");
        }

        $this->info("🎯 Đã đồng bộ " . count($skus) . " SKU vào Redis.");
    }

    protected function syncFlashSaleStock()
    {
        $flashSales = FlashSaleProduct::all();

        foreach ($flashSales as $fsp) {
            $key = "flash_sale_stock:{$fsp->product_id}";
            Redis::set($key, $fsp->quantity);
            $this->line("🔥 [FlashSale] {$key} = {$fsp->quantity}");
        }

        $this->info("🎯 Đã đồng bộ " . count($flashSales) . " Flash Sale stock vào Redis.");
    }
}
