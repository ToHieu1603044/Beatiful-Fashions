<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->getRoleNames(),
            'phone' => $this->phone,
            'city' => $this->city,
            'ward' => $this->ward,
            'district' => $this->district,
            'address' => $this->address,
            'zip_code' => $this->zip_code,
            'active' => $this->active,
           // 'last_password_changed_at' => $this->last_password_changed_at->format('Y-m-d H:i:s'),
        ];
    }
}
