<?php
namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::firstOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'google_id' => $googleUser->getId(),
                    'password' => bcrypt(uniqid()), // Random password vì không dùng
                ]
            );

            Auth::login($user);
            $token = $user->createToken('google-login')->plainTextToken;
            return response()->json([
                'message' => 'Đăng nhập thành công!',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
                'role' => $user->getRoleNames()
            ]); // hoặc trang chính của bạn

        } catch (\Exception $e) {
            return redirect('/login')->withErrors(['msg' => 'Đăng nhập bằng Google thất bại.']);
        }
    }
}
