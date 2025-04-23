<?php

namespace App\Http\Resources;

use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $flashSalePrice = $this->flashSales && $this->flashSales->isNotEmpty()
        ? $this->flashSales->first()->pivot->discount_price
        : null;
    
        \Log::info($flashSalePrice);
        $isFavorite = false;
        return [
            'id' => $this->id,
            'name' => $this->name,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'brand' => [
                'id' => $this->brand->id,
                'name' => $this->brand->name
            ],
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name
            ],
            'active' => $this->active,
            'images' => $this->images,
            'galleries' => $this->galleries,
            'price' => $this->skus->min('price'), 
            'old_price' => $this->skus->max('old_price'), 
            'sale_price' => $flashSalePrice ? $flashSalePrice : $this->skus->min('price'),
            'total_sold' => $this->total_sold,
            'total_rating' => $this->total_rating,
            'description' => $this->description,
            'variants' => ProductVariantResource::collection($this->skus),
            
        ];
    }
    
    
}
