<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => 'nullable|exists:users,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'ward' => 'required|string',
            'district' => 'required|string',
            'city' => 'required|string',
            'zip_code' => 'nullable|string|max:10',
            'payment_method' => 'required|in:cod,bank_transfer,momo,vnpay',
            'cart' => 'required|array',
            'cart.*.sku_id' => 'required|exists:product_skus,id',
            'cart.*.quantity' => 'required|integer|min:1',
        ];
    }
}
