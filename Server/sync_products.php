<?php
$elasticUrl = "http://localhost:9200/products/_bulk";
$laravelApi = "http://127.0.0.1:8000/api/products/web";


$response = json_decode(file_get_contents($laravelApi), true);
$products = $response['data'] ?? [];

if (empty($products)) {
    die(" Không có sản phẩm nào để đồng bộ.\n");
}

// Chuyển đổi dữ liệu thành định dạng Bulk API
$bulkData = "";
foreach ($products as $product) {
    if (!isset($product['id'], $product['name'])) {
        echo "⚠️ Bỏ qua sản phẩm không hợp lệ: " . json_encode($product) . "\n";
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

    $bulkData .= json_encode(["index" => ["_index" => "products", "_id" => $product['id']]]) . "\n";
    $bulkData .= json_encode($doc) . "\n";
}

if (empty($bulkData)) {
    die("❌ Không có dữ liệu hợp lệ để gửi lên Elasticsearch.\n");
}

// Debug dữ liệu gửi lên Elasticsearch
file_put_contents("bulk.json", $bulkData);
echo "📢 Dữ liệu gửi lên Elasticsearch đã lưu vào bulk.json\n";

// Gửi dữ liệu lên Elasticsearch
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $elasticUrl);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_POSTFIELDS, $bulkData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
$response = curl_exec($ch);
curl_close($ch);

echo "📢 Phản hồi từ Elasticsearch:\n$response\n";
?>
