<?php

namespace App\Http\Middleware;
use App\Models\Setting;
use Illuminate\Support\Facades\App;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LanguageMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, Closure $next)
    {
        // Lấy ngôn ngữ từ bảng settings
        $language = Setting::where('key', 'language')->value('value') ?? 'en';  // 'en' là mặc định

        App::setLocale($language);

        Log::info("Language set to: " . $language); 

        return $next($request);
    }
    
}
