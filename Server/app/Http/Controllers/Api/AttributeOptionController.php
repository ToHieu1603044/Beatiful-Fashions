<?php

namespace App\Http\Controllers\Api;

use App\Models\AttributeOption;
use Illuminate\Http\Request;

class AttributeOptionController extends Controller
{
    public function index()
    {
        return response()->json(AttributeOption::with('attribute')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'attribute_id' => 'required|exists:attributes,id',
            'value' => 'required|string'
        ]);

        $option = AttributeOption::create($request->only(['attribute_id', 'value']));

        return response()->json($option, 201);
    }

    public function show(AttributeOption $option)
    {
        return response()->json($option->load('attribute'));
    }

    public function update(Request $request, AttributeOption $option)
    {
        $request->validate([
            'attribute_id' => 'required|exists:attributes,id',
            'value' => 'required|string'
        ]);

        $option->update($request->only(['attribute_id', 'value']));

        return response()->json($option);
    }

    public function destroy(AttributeOption $option)
    {
        $option->delete();
        return response()->json(null, 204);
    }
}
