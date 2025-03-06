<?php

return [
    'hosts' => [
        env('ELASTICSEARCH_HOST', 'localhost') . ':' . env('ELASTICSEARCH_PORT', '9200'),
    ]
];
