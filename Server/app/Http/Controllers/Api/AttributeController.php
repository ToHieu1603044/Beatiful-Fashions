<?php

namespace App\Http\Controllers\Api;

use App\Models\Attribute;
use App\Models\AttributeOption;
use Illuminate\Http\Request;

class AttributeController extends Controller
{
    public function index()
    {
        return response()->json(Attribute::with('values')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:attributes,name',
            'options' => 'nullable|array'
        ]);
    
        $attribute = Attribute::create($request->only('name'));
    
        // Kiểm tra nếu $request->options không rỗng và là mảng
        if (!empty($request->options) && is_array($request->options)) {
            foreach ($request->options as $option) {
                AttributeOption::firstOrCreate([
                    'attribute_id' => $attribute->id,
                    'value' => $option
                ]);
            }
        }
    
        return response()->json($attribute, 201);
    }
    
    public function show(Attribute $attribute)
    {
        return response()->json($attribute->load('options'));
    }

    public function update(Request $request, Attribute $attribute)
    {
        $request->validate([
            'name' => 'required|string|unique:attributes,name,' . $attribute->id
        ]);

        $attribute->update($request->only('name'));

        return response()->json($attribute);
    }

    public function destroy(Attribute $attribute)
    {
        $attribute->delete();
        return response()->json(null, 204);
    }
}
