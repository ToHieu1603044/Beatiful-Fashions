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
            'user_id' => $this->user_id,
            'name' => $this->name,
            'email' => $this->email,
            'total_amount' => $this->total_amount,
            'status' => $this->status,
            'tracking_status' => $this->tracking_status,
            'payment_method' => $this->payment_method,
            'address' => $this->address,
            'city' => $this->city,
            'district' => $this->district,
            'ward' => $this->ward,
            'phone' => $this->phone,
            'zip_code' => $this->zip_code,
            'note' => $this->note,
            'discount_code' => $this->discount_code,
            'discount_amount' => $this->discount_amount,
            'is_paid' => $this->is_paid,
            'created_at' => $this->created_at,
            'orderdetails' => OrderDetailResource::collection($this->orderdetails),
        ];
    }
}
