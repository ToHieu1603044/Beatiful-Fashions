<?php

namespace App\Http\Middleware;
use Illuminate\Support\Facades\App;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LanguageMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
   
        $language = $request->get('lang', session('lang', 'en')); 
        
        if (in_array($language, ['en', 'vi'])) {
            App::setLocale($language);
        }

        session(['lang' => $language]);

        return $next($request);
    }
}
