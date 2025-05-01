<?php

namespace App\Http\OpenApi;

/**
 * @OA\Schema(
 *     schema="Product",
 *     type="object",
 *     @OA\Property(property="id", type="integer", description="Product ID"),
 *     @OA\Property(property="name", type="string", description="Product name"),
 *     @OA\Property(property="category_id", type="integer", description="Category ID"),
 *     @OA\Property(property="brand_id", type="integer", description="Brand ID"),
 *     @OA\Property(property="active", type="boolean", description="Product active status"),
 *     @OA\Property(property="created_at", type="string", format="date-time", description=" Contracting date"),
 *     @OA\Property(property="brand", type="object", description="Associated brand details"),
 *     @OA\Property(property="category", type="object", description="Associated category details"),
 *     @OA\Property(
 *         property="skus",
 *         type="array",
 *         @OA\Items(
 *             type="object",
 *             @OA\Property(property="price", type="integer", description="SKU price"),
 *             @OA\Property(
 *                 property="attributeOptions",
 *                 type="array",
 *                 @OA\Items(type="object", description="Attribute options for the SKU")
 *             )
 *         )
 *     ),
 *     @OA\Property(
 *         property="galleries",
 *         type="array",
 *         @OA\Items(type="object", description="Product gallery images")
 *     )
 * )
 * @OA\Schema(
 *     schema="PaginatedProductResponse",
 *     type="object",
 *     @OA\Property(
 *         property="data",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/Product")
 *     ),
 *     @OA\Property(property="current_page", type="integer", description="Current page number"),
 *     @OA\Property(property="per_page", type="integer", description="Number of items per page"),
 *     @OA\Property(property="total", type="integer", description="Total number of items"),
 *     @OA\Property(property="last_page", type="integer", description="Last page number")
 * )
 * @OA\Schema(
 *     schema="EmptyProductResponse",
 *     type="object",
 *     @OA\Property(property="message", type="string", example="Không có dữ liệu."),
 *     @OA\Property(property="data", type="array", @OA\Items())
 * )
 * @OA\Schema(
 *     schema="ErrorResponse",
 *     type="object",
 *     @OA\Property(property="message", type="string", example="An error occurred")
 * )
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 */
class Schemas
{
}