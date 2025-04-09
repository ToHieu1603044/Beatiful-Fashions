<?php

namespace App\Http\Controllers\Api;

use App\Models\Slide;
use Illuminate\Http\Request;

class SlideController extends Controller
{
    public function index()
    {
        return response()->json(Slide::get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'images' => 'required|string',
        ]);

        $slide = Slide::create($validated);

        return response()->json($slide, 201);
    }

    public function show(Slide $slide)
    {
        return response()->json($slide);
    }

    public function update(Request $request, Slide $slide)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'images' => 'nullable|string',
            'order' => 'integer',
        ]);

        $slide->update($validated);

        return response()->json($slide);
    }

    public function destroy(Slide $slide)
    {
        $slide->delete();
        return response()->json(['message' => 'Slide deleted successfully']);
    }
}
