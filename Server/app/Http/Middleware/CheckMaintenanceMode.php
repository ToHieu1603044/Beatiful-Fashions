<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, Closure $next)
    {
        $isMaintenance = Setting::get('maintenance', false);
        $message = Setting::get('maintenance_message', 'Hệ thống đang bảo trì, vui lòng quay lại sau.');

        if ($isMaintenance && !$request->user()?->hasRole('admin')) {
            return response()->json([
                'message' => $message
            ], 503);
        }

        return $next($request);
    }
}
