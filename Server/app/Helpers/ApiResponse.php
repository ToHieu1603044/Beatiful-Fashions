<?php

namespace App\Helpers;

class ApiResponse{
    public function errorResponse($code = 500, $message = '', $errorMessage = ''){
        $response = [
            'status' => $code,
            'message' => $message,
            'error' => $errorMessage
        ];

        return response()->json($response,$code);
    }

    public function responseObject($data, $code = 200, $message = 'success'){
        $response = [
                'code' => $code,
                'message' => $message,
                'data' => $data
        ];
        
        return response()->json($response,$code);
    }

    public function responsePage($page){
        $reponse = [
            'success' => true,
            'status' => 'success',
            'data' => $page->items(),
            'page' => [
                'currentPage' => $page->currentPage(),
                'lasstPage' => $page->lastPage(),
                'perPage' => $page->perPage(),
                'total' => $page->total()
            ]
        ];

        return response()->json($reponse,200);
    }

    public function responseSuccess($message, $code = 200){
        $response = [
            'status' => 'success',
            'message' => $message
        ];

        return response()->json($response, 200);
    }
}

?>