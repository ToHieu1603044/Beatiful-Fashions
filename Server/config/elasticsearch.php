<?php

return [
    'hosts' => [
        env('ELASTICSEARCH_HOST', 'localhost') . ':' . env('ELASTICSEARCH_PORT', '9200'),
    ],

    'retries' => 3, // Thêm cấu hình số lần thử lại nếu có lỗi kết nối
    'connectionParams' => [
        'retries' => 3, // Số lần thử lại khi kết nối không thành công
        'timeout' => 5,  // Thời gian chờ kết nối
    ]
];
