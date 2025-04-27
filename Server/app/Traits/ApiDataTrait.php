<?php

namespace App\Traits;

use App\Helpers\ApiResponse;
use App\Models\Wishlist;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Response;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
trait ApiDataTrait
{
    public function getAllData(Model $model, $message = "Danh sách ", $relations = [], array $filterableFields = [], array $dates = [], $resourceClass)
    {
        try {
            // Lấy tham số từ request
            $filters = request()->query();
            $page = request()->query('page', 1);
            $cacheKey = 'products_cache';
    
            // Kiểm tra cache
            if (Cache::has($cacheKey)) {
                \Log::info("Lấy dữ liệu từ cache: $cacheKey");
            } else {
                \Log::info("Không có cache, truy vấn database: $cacheKey");
            }
    
            // Thời gian bắt đầu để đo hiệu suất
            $start = microtime(true);
    
            // Lưu dữ liệu vào cache trong 10 phút (600 giây)
            $data = Cache::remember($cacheKey, 600, function () use ($model, $relations, $filters, $filterableFields, $dates) {
                $query = $model::with($relations);
    
                // Kiểm tra và thực hiện tìm kiếm
                if (!empty($filters['search'])) {
                    $search = trim($filters['search']);
                    \Log::info('Search term: ' . $search); // Log từ khóa tìm kiếm
    
                    $query->where(function ($q) use ($search, $filterableFields) {
                        foreach ($filterableFields as $field) {
                            $q->orWhere($field, 'like', "%$search%");
                        }
                    });
                }
    
                // Bộ lọc giá cả
                if (isset($filters['min_price']) && isset($filters['max_price'])) {
                    $query->whereHas('skus', function ($q) use ($filters) {
                        $minPrice = (int) $filters['min_price'];
                        $maxPrice = (int) $filters['max_price'];
                        $q->whereBetween('price', [$minPrice, $maxPrice]);
                    });
                }
    
                if (isset($filters['price_range'])) {
                    [$minPrice, $maxPrice] = explode('-', $filters['price_range']);
                    $query->whereHas('skus', function ($q) use ($minPrice, $maxPrice) {
                        $q->whereBetween('price', [(int) $minPrice, (int) $maxPrice]);
                    });
                }
    
                // Lọc theo giá cả
                if (isset($filters['price'])) {
                    $flagPrice = strtolower($filters['price']) === 'asc' ? 'asc' : 'desc';
                    $query->addSelect([
                        'min_price' => \DB::table('product_skus')
                            ->selectRaw('MIN(price)')
                            ->whereColumn('product_skus.product_id', 'products.id')
                    ])->orderBy('min_price', $flagPrice);
                }
    
                // Bộ lọc active
                if (isset($filters['active'])) {
                    $query->where('active', $filters['active']);
                }
    
                // Bộ lọc theo category_id
                if (isset($filters['category_id'])) {
                    $query->where('category_id', $filters['category_id']);
                }
    
                // Bộ lọc theo ngày tháng
                foreach ($dates as $date) {
                    if (isset($filters['start_date']) && isset($filters['end_date'])) {
                        $query->whereBetween($date, [$filters['start_date'], $filters['end_date']]);
                    } elseif (isset($filters['from_date'])) {
                        $query->where($date, '>=', $filters['from_date']);
                    } elseif (isset($filters['to_date'])) {
                        $query->where($date, '<=', $filters['to_date']);
                    }
                }
    
                // Lọc theo ngày tạo
                if (isset($filters['date'])) {
                    $orderDirection = strtolower($filters['date']) === 'asc' ? 'asc' : 'desc';
                    $query->orderBy('created_at', $orderDirection);
                }
    
                // Phân trang
                $perPage = request()->query('per_page', 10);
                return $query->orderBy('created_at', 'desc')
                    ->paginate($perPage);
            });
    
            // Thời gian kết thúc để đo hiệu suất
            $end = microtime(true);
            \Log::info('Thời gian truy vấn: ' . round($end - $start, 4) . ' giây.');
    
            // Kiểm tra nếu không có dữ liệu
            if ($data->isEmpty()) {
                \Log::info('Không có dữ liệu phù hợp với tìm kiếm.');
                return response()->json([
                    'message' => 'Không có dữ liệu.',
                    'data' => []
                ], Response::HTTP_OK);
            }
    
            // Trả về kết quả dưới dạng phân trang
            return ApiResponse::responsePage($resourceClass::collection($data));
    
        } catch (\Exception $e) {
            // Log lỗi
            \Log::error('Lỗi trong getAllData', ['exception' => $e->getMessage()]);
            return ApiResponse::errorResponse();
        }
    }
    
    public function getDataById(Model $model, $id, $relations = [], $message = "Ket qua")
    {
        try {
            $data = $model::with($relations)->findOrFail($id);

            if (!$data) {
                return response()->json([
                    'message' => __('messages.not_found'),
                    'data' => []
                ], Response::HTTP_NOT_FOUND);
            }

            return ApiResponse::responseObject($data, Response::HTTP_OK, $message);

        } catch (\Exception $e) {

            return ApiResponse::responseError(500, $e->getMessage(), $message);
        }
    }
    public function deleteDataById(Model $model, $id, $message = '', $force = false)
    {
        try {
            $data = $model::findOrFail($id);

            $data->delete();

            return ApiResponse::responseSuccess(__("messages.deleted"));
        } catch (\Throwable $th) {

            return ApiResponse::errorResponse(500, $th->getMessage());
        }
    }


    public function processUpdateStatus($model, $id, $status)
    {
        try {

            $data = $model::find($id);

            if (!$data) {
                return response()->json([
                    'message' => 'Không tìm thấy dữ liệu',
                ], Response::HTTP_NOT_FOUND);

            }

            if (!in_array($status, ["dang_hoat_dong", "ngung_hoat_dong"])) {
                return response()->json([
                    'message' => __("messages.status_invalid"),
                ], Response::HTTP_BAD_REQUEST);
            }

            $data->trang_thai = $status;
            $data->save();

            return ApiResponse::responseSuccess(__("messages.update_success"));
        } catch (\Exception $e) {
            \Log::error("Lỗi: " . $e->getMessage());

            return ApiResponse::responseError(500, $e->getMessage());
        }
    }
}



