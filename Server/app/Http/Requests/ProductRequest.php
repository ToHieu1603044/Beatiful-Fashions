<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'max:255',

                Rule::unique('products', 'name')
                    ->ignore($this->route('id')),
            ],
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'images' => 'nullable',
            'attributes' => 'required|array',
            'attributes.*.name' => 'required|string',
            'attributes.*.values' => 'required|array|min:1',
            'attributes.*.values.*' => 'required|string',
            'variant_values' => 'required|array',
            'variant_values.*.variant_combination' => 'required|array',
            'variant_values.*.price' => 'required|integer',
            'variant_values.*.old_price' => 'nullable|integer',
            'variant_values.*.stock' => 'required|integer',
        ];
    }

}
