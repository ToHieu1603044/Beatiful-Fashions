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
            'site_name' => $request->input('site_name'),
            'support_email' => $request->input('support_email'),
            'hotline' => $request->input('hotline'),
            'maintenance' => $request->boolean('maintenance'),
            'maintenance_message' => $request->input('maintenance_message'),
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

            Setting::updateOrCreate(
                ['key' => 'logo'],
                ['value' => $filename]
            );
        }

        return response()->json(['message' => __('messages.updated')]);
    }

    public function siteName(Request $request)
    {
        $key = [
            'site_name',
            'support_email',
            'hotline',
        ];
        $site = Setting::whereIn('key', $key)->pluck('value', 'key');
        return response()->json([
            'data' => $site
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
