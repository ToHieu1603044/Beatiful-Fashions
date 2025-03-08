<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SyncProductsToElasticsearch extends Command
{
    protected $signature = 'sync:products';
    protected $description = 'Sync products from Laravel API to Elasticsearch';

    public function handle()
    {
        $elasticUrl = "http://localhost:9200/products/_bulk";
        $laravelApi = "http://127.0.0.1:8000/api/products";

        // Lấy danh sách sản phẩm từ Laravel API
        $response = Http::get($laravelApi);
        $products = $response->json()['data'] ?? [];

        if (empty($products)) {
            $this->error("Không có sản phẩm nào để đồng bộ.");
            return;
        }

        $bulkData = "";
        foreach ($products as $product) {
            if (!isset($product['id'], $product['name'])) {
                $this->info("Bỏ qua sản phẩm không hợp lệ: " . json_encode($product));
                continue;
            }
        
            $galleries = array_map(fn($g) => $g['image'], $product['galleries'] ?? []);
        
            $variants = [];
            foreach ($product['variants'] ?? [] as $variant) {
                $attrs = [];
                foreach ($variant['attributes'] ?? [] as $attr) {
                    $attrs[$attr['name']] = $attr['value'];
                }
                $variants[] = [
                    "sku_id" => $variant['sku_id'],
                    "sku" => $variant['sku'],
                    "price" => $variant['price'],
                    "stock" => $variant['stock'],
                    "attributes" => $attrs
                ];
            }
        
            $doc = [
                "name" => $product['name'],
                "brand" => $product['brand']['name'] ?? null,
                "category" => $product['category']['name'] ?? null,
                "price" => $product['price'] ?? 0,
                "old_price" => $product['old_price'] ?? 0,
                "active" => $product['active'] ?? true,
                "images" => $product['images'] ?? null,
                "galleries" => $galleries,
                "variants" => $variants
            ];
        
            // Thêm chỉ thị index và dữ liệu vào bulkData
            $bulkData .= json_encode(["index" => ["_index" => "products", "_id" => $product['id']]]) . "\n";
            $bulkData .= json_encode($doc) . "\n"; // Dữ liệu sản phẩm phải kết thúc với newline
        }
        
        // Nếu không có dữ liệu hợp lệ, thoát
        if (empty($bulkData)) {
            $this->error("❌ Không có dữ liệu hợp lệ để gửi lên Elasticsearch.");
            return;
        }
        
        // Debug dữ liệu gửi lên Elasticsearch
        file_put_contents("bulk.json", $bulkData);
        $this->info("📢 Dữ liệu gửi lên Elasticsearch đã lưu vào bulk.json");
        
        // Gửi dữ liệu lên Elasticsearch
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $elasticUrl);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $bulkData); // Bulk data
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
        $response = curl_exec($ch);
        curl_close($ch);
        
        // Kiểm tra phản hồi từ Elasticsearch
        $this->info("📢 Phản hồi từ Elasticsearch:\n$response");
        
    }
}
