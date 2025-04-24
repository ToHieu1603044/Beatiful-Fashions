<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $product = optional(optional($this->sku)->product);

        $is_deleted = $product && $product->trashed();
        $is_inactive = $product && !$product->active;
        return [
            'id' => $this->id,
            'product' => $this->sku->product ?? 'Sản phẩm không tồn tại',
            'sku_id' => $this->sku_id,
            'quantity' => $this->quantity,
            'product_status' => $is_deleted ? 'deleted' : ($is_inactive ? 'inactive' : 'active'),
            'product_status_text' => $is_deleted
                ? 'Sản phẩm đã bị xóa khỏi hệ thống'
                : ($is_inactive
                    ? 'Sản phẩm hiện đang tạm ẩn'
                    : 'Sản phẩm hoạt động'),
            'sale_price' => $this->sku->product->flashSales->first()?->pivot->discount_price,
            'price' => $this->sku->price,
            'attributes' => $this->sku->attributeOptions->map(function ($option) {
                return [
                    'attribute' => $option->attribute->name,
                    'value' => $option->value
                ];
            }),
        ];
    }
}
