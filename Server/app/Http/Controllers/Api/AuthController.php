<?php
namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Helpers\TextSystemConst;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Traits\ApiDataTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\Api\Controller;
use Illuminate\Validation\Validator;
use Jenssegers\Agent\Agent;
class AuthController extends Controller
{
  use ApiDataTrait;


  public function login(Request $request)
  {
    $request->validate([
      'email' => 'required|string|email',
      'password' => 'required|string',
    ]);

    $key = Str::lower($request->input('email')) . '|' . $request->ip();

    if (RateLimiter::tooManyAttempts($key, 5)) {
      $seconds = RateLimiter::availableIn($key);

      return response()->json([
        'message' => __('messages.throttle', ['seconds' => $seconds]),
      ], 429);
    }

    if (!Auth::attempt($request->only('email', 'password'))) {
      RateLimiter::hit($key, 60);
      return response()->json(
        [
          'message' => __('messages.login_fail'),
          "status" => 401
        ],
        401
      );
    }

    RateLimiter::clear($key);

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
      'message' => __('messages.login_success'),
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
      'phone' => 'nullable|string|max:15|unique:users:phone',
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

    return ApiResponse::responseObject(new UserResource($user), 201, __('messages.register_success'));

  }
  public function listUser(Request $request)
  {
    return $this->getAllData(new User, __('messages.list_user'), [], ['role', 'name', 'email', 'phone'], [], UserResource::class);

  }

  public function profile(Request $request)
  {
    $user = Auth::user();
    try {
      if ($user) {
        return ApiResponse::responseObject(new UserResource($user), 200, __('messages.profile'));
      } else {
        return ApiResponse::errorResponse(404, TextSystemConst::USER_NOT_FOUND, );
      }
    } catch (\Exception $e) {
      return ApiResponse::errorResponse($e->getMessage(), 500);
    }
  }


  // Đăng xuất
  public function logout(Request $request)
  {
    $request->user()->tokens()->delete();

    return response()->json(['message' => __('messages.logout_success')]);
  }
  // Doi mat khau
  public function resetPassword(Request $request)
  {
      \Log::info($request->all());
      $request->validate([
          'old_password' => 'required|string|min:6',
          'password' => 'required|string|min:6|confirmed',
      ]);
  
      try {
          $user = Auth::user();
  
          if (!$user) {
              return ApiResponse::errorResponse(410, TextSystemConst::USER_NOT_FOUND);
          }
  
          if (Hash::check($request->old_password, $user->password)) {
              $user->update([
                  'password' => Hash::make($request->password),
                  'last_password_changed_at' => now(),
              ]);
  
              $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();
              return ApiResponse::responseObject(new UserResource($user), 200, __('messages.change_password_success'));
          }
  
          return ApiResponse::errorResponse(400, __('messages.old_password_not_match'));
      } catch (\Throwable $th) {
          return ApiResponse::errorResponse(500, $th->getMessage());
      }
  }


  // Quen mat khaukhau
  public function forgotPassword(Request $request)
  {
    $request->validate(['email' => 'required|email|exists:users,email']);

    $status = Password::sendResetLink($request->only('email'));

    return $status === Password::RESET_LINK_SENT
      ? response()->json(['message' => __('messages.reset_link_sent')])
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
      ? response()->json(['message' => __('messages.password_reset_success')])
      : response()->json(['error' => __('messages.invalid_token_or_email')], 500);

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
      'message' => __('messages.device_list'),
      'devices' => $devices,
    ]);
  }


  public function revokeDevice(Request $request, $id)
  {
    $user = $request->user();

    $token = $user->tokens()->find($id);

    if (!$token) {
      return response()->json(['message' => __('messages.device_not_found')], 404);
    }

    if ($token->id === $request->user()->currentAccessToken()->id) {
      return response()->json(['message' => __('messages.cannot_revoke_current_device')], 400);
    }

    $token->delete();

    return response()->json(['message' => __('messages.device_logged_out')]);
  }

}