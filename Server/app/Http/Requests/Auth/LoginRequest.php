<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
class LoginRequest extends FormRequest{


public function ensureIsNotRateLimited()
{
    if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5, 60)) {
        return;
    }

    throw ValidationException::withMessages([
        'email' => __('Too many login attempts. Please try again in :seconds seconds.', [
            'seconds' => RateLimiter::availableIn($this->throttleKey()),
        ]),
    ]);
}

public function throttleKey()
{
    return Str::lower($this->input('email')).'|'.$this->ip();
}

}