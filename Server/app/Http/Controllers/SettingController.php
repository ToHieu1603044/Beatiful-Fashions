<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController
{
    public function index()
    {
        $keys = [
            'site_name',
            'support_email',
            'hotline',
            'maintenance',
            'maintenance_message'
        ];
    
        $settings = Setting::whereIn('key', $keys)->pluck('value', 'key');

        foreach ($keys as $key) {
            if (!isset($settings[$key])) {
                $settings[$key] = null; 
            }
        }
    
        return response()->json([
            'data' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $settings = [
            'site_name'           => $request->input('site_name'),
            'support_email'       => $request->input('support_email'),
            'hotline'             => $request->input('hotline'),
            'maintenance'         => $request->boolean('maintenance'),
            'maintenance_message' => $request->input('maintenance_message'),
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => is_bool($value) ? ($value ? 'true' : 'false') : $value]
            );
        }

        return response()->json(['message' => 'Đã cập nhật thành công']);
    }
}
