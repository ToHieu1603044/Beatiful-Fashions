<?php

namespace App\Services;

use Elasticsearch\ClientBuilder;

class ElasticsearchService
{
    protected $client;

    public function __construct()
    {
        $this->client = \ClientBuilder::create()
            ->setHosts(config('elasticsearch.hosts'))
            ->build();
    }

    public function indexProduct($product)
    {
        return $this->client->index([
            'index' => 'products',
            'id'    => $product->id,
            'body'  => [
                'name' => $product->name,
                'description' => $product->description,
                'price' => $product->price,
                'stock' => $product->stock,
            ],
        ]);
    }

    public function searchProduct($keyword)
    {
        return $this->client->search([
            'index' => 'products',
            'body'  => [
                'query' => [
                    'match' => ['name' => $keyword],
                ],
            ],
        ]);
    }
}
