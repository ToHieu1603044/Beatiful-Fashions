<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;
class RebuyRateLimiter
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, Closure $next)
    {
        $key = 'rebuy:' . $request->user()?->id ?? $request->ip();
    
        RateLimiter::for('rebuy-limit', function () {
            return Limit::perMinute(1)->by(auth()->id() ?: request()->ip());
        });
    
        if (RateLimiter::tooManyAttempts($key, 1)) {
            throw new ThrottleRequestsException('Bạn thao tác quá nhanh, vui lòng thử lại sau.');
        }
    
        RateLimiter::hit($key, 60); // khóa trong 60 giây
    
        return $next($request);
    }
}
