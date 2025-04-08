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
        return [
            'id' => $this->id,
            'product' => $this->sku->product ?? 'Sản phẩm không tồn tại',
            'sku_id' => $this->sku_id,
            'quantity' => $this->quantity,
            'price' => $this->sku->product->flashSales->first()?->pivot->discount_price ?? $this->sku->price,

            'attributes' => $this->sku->attributeOptions->map(function ($option) {
                return [
                    'attribute' => $option->attribute->name,
                    'value' => $option->value
                ];
            }),
        ];
    }
}
