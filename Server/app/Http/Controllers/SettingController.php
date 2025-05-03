<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\Setting;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class SettingController
{
    use AuthorizesRequests;
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
        $setting = Setting::all();
        foreach ($keys as $key) {
            if (!isset($settings[$key])) {
                $settings[$key] = null;
            }
        }

        return response()->json([
            'data' => $settings,
            'setting' => $setting
        ]);
    }

    public function update(Request $request)
    {
        Log::info($request->all());
        $this->authorize('update', Setting::class);

        $request->validate([
            'site_name' => 'nullable|string|max:255',
            'support_email' => 'nullable|email|max:255',
            'hotline' => 'nullable|string|max:20',
            'maintenance' => 'boolean',
            'maintenance_message' => 'nullable|string',
            'language' => 'required|in:vi,en',
            'logo' => 'nullable|file|mimes:jpg,png,jpeg|max:2048',
        ]);
    
        try {

            
            $settings = [
                'site_name' => $request->input('site_name'),
                'support_email' => $request->input('support_email'),
                'hotline' => $request->input('hotline'),
                'maintenance' => $request->boolean('maintenance'),
                'maintenance_message' => $request->input('maintenance_message'),
                'language' => $request->input('language'),
                
            ];
    
            foreach ($settings as $key => $value) {
                Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => is_bool($value) ? ($value ? 'true' : 'false') : $value]
                );
            }
    
            if ($request->hasFile('logo')) {
                $file = $request->file('logo');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('uploads/logo', $filename, 'public');
    
                Setting::updateOrCreate(['key' => 'logo'], ['value' => $filename]);
            }
    
            return ApiResponse::responseObject($settings, 200, __('messages.update_system_settings_success'));
        } catch (\Throwable $th) {
            return ApiResponse::errorResponse(500, $th->getMessage());
        }
    }
    
    public function siteName(Request $request)
    {
        $key = [
            'site_name',
            'support_email',
            'hotline',
            'maintenance',
            'maintenance_message',
            'logo',
            'language'
            
        ];
        $settings = Setting::whereIn('key', $key)->pluck('value', 'key');
        return response()->json([
            'data' => $settings,
        ]);
    }
    public function setLanguage(Request $request, $lang)
    {

        if (in_array($lang, ['en', 'vi'])) {
            session(['lang' => $lang]);
            return redirect()->back();
        }

        return redirect()->back()->withErrors(['Invalid language']);
    }

}
