<?php 
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Controller;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Container\Attributes\Log;

class AuthController extends Controller
{
    // Đăng nhập
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);
    
        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
    
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
    
        $token = $user->createToken('auth_token')->plainTextToken;
    
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }
    
    

    // Lấy thông tin user (profile)
    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    // Đăng xuất (Xóa token)
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    // Refresh token
    public function refreshToken(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete(); // Xóa token cũ

        $newToken = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'access_token' => $newToken,
            'token_type' => 'Bearer',
        ]);
    }
}
