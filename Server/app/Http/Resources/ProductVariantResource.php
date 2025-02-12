<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'sku' => $this->sku,
            'price' => $this->price,
            'old_price' => $this->old_price,
            'stock' => $this->stock,
            'attributes' => AttributeResource::collection($this->attributeOptions),
        ];
    }
}
