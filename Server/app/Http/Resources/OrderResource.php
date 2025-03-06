<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'user' => $this->user->name,
            'total_amount' => $this->total_amount,
            'status' => $this->status,
            'shipping_status' => $this->tracking_status,
            'payment_method' => $this->payment_method,
            'address' => $this->address,
            'city' => $this->city,
            'district' => $this->district,
            'ward' => $this->ward,
            'phone' => $this->phone,
            'zip_code' => $this->zip_code,
            'note' => $this->note,
            'created_at' => $this->created_at,
            'orderdetails' => OrderDetailResource::collection($this->orderdetails),
        ];
    }
}
