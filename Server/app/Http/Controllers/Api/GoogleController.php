<?php
namespace App\Http\Controllers\Api;
use Illuminate\Support\Facades\Log;
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
    
            Log::info('Google User Info:', [
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
            ]);
    
            $user = User::firstOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'google_id' => $googleUser->getId(),
                    'password' => bcrypt(uniqid()),
                    'phone' => '',
                    'address' => '',
                    'city' => '',
                    'district' => '',
                    'ward' => '',
                    'zip_code' => '',
                    'active' => 1,
                    'points' => 0,
                    'ranking' => 0,
                    'last_password_changed_at' => now(),
                ]
            );
    
            // Gán role nếu là user mới
            $user->assignRole('user');
    
            Auth::login($user);
    
            $token = $user->createToken('google-login')->plainTextToken;
    
            $roles = $user->getRoleNames(); // Collection
    
            // Encode data vào state
            $payload = base64_encode(json_encode([
                'token' => $token,
                'user' => $user,
                'roles' => $roles,
            ]));
    
            return redirect()->away("http://localhost:5174/login?state={$payload}");
    
        } catch (\Exception $e) {
            Log::error('Google login failed: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    
    
    



    
    
}
