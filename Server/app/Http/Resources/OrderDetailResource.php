<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return[
            'sku' => $this->sku,
            'quantity' => $this->quantity,
            'price' => $this->price,
            'subtotal' => $this->subtotal
        ];
    }
}
