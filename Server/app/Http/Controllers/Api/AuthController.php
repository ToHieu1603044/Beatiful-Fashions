<?php
namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Traits\ApiDataTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\Api\Controller;
use Illuminate\Validation\Validator;
use Jenssegers\Agent\Agent;
class AuthController extends Controller
{
  use ApiDataTrait;
  // Đăng nhập
  public function login(Request $request)
  {
    $request->validate([
      'email' => 'required|string|email',
      'password' => 'required|string',
    ]);

    if (!Auth::attempt($request->only('email', 'password'))) {
      return response()->json(['message' => 'Sai email hoặc mật khẩu'], 401);
    }
    $userAgent = $request->header('User-Agent');
    $ip = $request->ip();
    \Log::info($ip);
    \Log::info($userAgent);
    $user = Auth::user();

    $tokenResult = $user->createToken('auth_token');
    $plainTextToken = $tokenResult->plainTextToken;

    $tokenResult->accessToken->update([
      'name' => $this->parseDeviceName($userAgent),
      'user_agent' => $userAgent,
      'ip_address' => $ip,
    ]);

    if ($user->roles()->exists()) {
      event(new \App\Events\UserLoggedIn($user));
    }

    return response()->json([
      'message' => 'Đăng nhập thành công!',
      'access_token' => $plainTextToken,
      'token_type' => 'Bearer',
      'user' => $user,
      'role' => $user->getRoleNames()
    ]);

  }
  protected function parseDeviceName($userAgent)
  {
    $agent = new \Jenssegers\Agent\Agent();
    $agent->setUserAgent($userAgent);

    $platform = $agent->platform(); // Windows
    $browser = $agent->browser();   // Chrome, Edge...

    return "{$platform} - {$browser}";
  }



  public function register(Request $request)
  {
    \Log::info($request->all());
    $request->validate([
      'name' => 'required|string|max:255',
      'email' => 'required|string|email|max:255|unique:users',
      'password' => 'required|string|min:6|confirmed',

      'phone' => 'nullable|string|max:15',
      'address' => 'nullable|string|max:255',
      'city' => 'nullable|string|max:100',
      'ward' => 'nullable|string|max:100',
      'district' => 'nullable|string|max:100',
      'zip_code' => 'nullable|string|max:10',
      'active' => 'nullable|boolean',
      'roles' => 'nullable|array',
      'roles.*' => 'string|exists:roles,name',
    ]);

    $user = User::create([
      'name' => $request->name,
      'email' => $request->email,
      'password' => Hash::make($request->password),
      'phone' => $request->phone,
      'address' => $request->address,
      'city' => $request->city,
      'ward' => $request->ward,
      'district' => $request->district,
      'zip_code' => $request->zip_code,
      'active' => $request->active ?? 0,
    ]);

    if ($request->has('roles')) {
      $user->assignRole($request->roles);
    }


    $token = $user->createToken('auth_token')->plainTextToken;

    return ApiResponse::responseObject(new UserResource($user), 201, 'User created successfully');

  }
  public function listUser(Request $request)
  {
    return $this->getAllData(new User, 'Danh sách người dùng', [], ['role', 'name', 'email', 'phone'], [], UserResource::class);

  }

  public function profile(Request $request)
  {
    $user = Auth::user();
    try {
      if ($user) {
        return ApiResponse::responseObject(new UserResource($user), 200, 'Thong tin nguoi dung');
      } else {
        return ApiResponse::errorResponse('User not found', 404);
      }
    } catch (\Exception $e) {
      return ApiResponse::errorResponse($e->getMessage(), 500);
    }
  }


  // Đăng xuất
  public function logout(Request $request)
  {
    $request->user()->tokens()->delete();

    return response()->json(['message' => 'Đăng xuất thành công']);
  }
  // Doi mat khau
  public function resetPassword(Request $request)
  {
    $request->validate([
      'old_password' => 'required|string|min:6',
      'password' => 'required|string|min:6|confirmed',
    ]);

    $user = Auth::user();

    if (Hash::check($request->old_password, $user->password)) {
      $user->update([
        'password' => Hash::make($request->password),
        'last_password_changed_at' => now(),
      ]);

      $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();
      return ApiResponse::responseObject(new UserResource($user), 200, 'Reset password successfully');
    }
    return ApiResponse::errorResponse('Old password is incorrect', 400);

  }
  // Quen mat khaukhau
  public function forgotPassword(Request $request)
  {
    $request->validate(['email' => 'required|email|exists:users,email']);

    $status = Password::sendResetLink($request->only('email'));

    return $status === Password::RESET_LINK_SENT
      ? response()->json(['message' => 'Reset password link sent to your email.'])
      : response()->json(['error' => 'Unable to send reset link.'], 500);
  }

  // Đặt lại mật khẩu
  public function resetPasswords(Request $request)
  {
    $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
      'email' => 'required|email|exists:users,email',
      'token' => 'required',
      'password' => 'required|string|min:6|confirmed',
    ]);

    if ($validator->fails()) {
      return response()->json(['error' => $validator->errors()], 422);
    }

    $status = Password::reset(
      $request->only('email', 'password', 'password_confirmation', 'token'),
      function ($user, $password) {
        $user->forceFill([
          'last_password_changed_at' => now(),
          'password' => Hash::make($password),
        ])->save();
        $user->tokens()->delete();
      }

    );

    return $status === Password::PASSWORD_RESET
      ? response()->json(['message' => 'Password has been reset.'])
      : response()->json(['error' => 'Invalid token or email.'], 500);
  }
  public function myDevices(Request $request)
  {
    $user = $request->user();
    $currentTokenId = $user->currentAccessToken()->id ?? null;

    $devices = $user->tokens->map(function ($token) use ($currentTokenId) {
      return [
        'id' => $token->id,
        'name' => $token->name,
        'created_at' => $token->created_at,
        'last_used_at' => $token->last_used_at,
        'is_current_device' => $token->id === $currentTokenId,
        'ip_address' => $token->ip_address,
        'user_agent' => $token->user_agent,
      ];
    });

    return response()->json([
      'message' => 'Danh sách thiết bị đã đăng nhập',
      'devices' => $devices,
    ]);
  }


  public function revokeDevice(Request $request, $id)
  {
    $user = $request->user();

    $token = $user->tokens()->find($id);

    if (!$token) {
      return response()->json(['message' => 'Không tìm thấy thiết bị'], 404);
    }

    if ($token->id === $request->user()->currentAccessToken()->id) {
      return response()->json(['message' => 'Không thể xóa thiết bị đang dùng'], 400);
    }

    $token->delete();

    return response()->json(['message' => 'Thiết bị đã được đăng xuất']);
  }

}