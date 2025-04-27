<?php

namespace App\Helpers;

class ApiResponse{
    public static function errorResponse($code = 500, $message = '', $errorMessage = ''){
        $response = [
            'status' => $code,
            'message' => $message,
            'error' => $errorMessage
        ];

        return response()->json($response,$code);
    }

    public static function responseObject($data, $code = 200, $message = ''){
        $response = [
                'code' => $code,
                'message' => $message,
                'data' => $data
        ];
        
        return response()->json($response,$code);
    }

    public static function responsePage($page){
        $reponse = [
            'success' => true,
            'status' => 'success',
            'data' => $page->items(),
            'message' => __('messages.success'),
            'page' => [
                'currentPage' => $page->currentPage(),
                'lastPage' => $page->lastPage(),
                'perPage' => $page->perPage(),
                'total' => $page->total()
            ]
        ];

        return response()->json($reponse,200);
    }

    public static function responseSuccess($data, $message, $code = 200)
    {
        $response = [
            'status' => 'success',
            'message' => $message,  
            'data' => $data
        ];
    
        return response()->json($response, $code);  // Trả về mã trạng thái theo tham số $code
    }
    
}

?>