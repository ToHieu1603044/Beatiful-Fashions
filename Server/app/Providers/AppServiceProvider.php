<?php

namespace App\Providers;

use App\Models\Brand;
use App\Models\Cart;
use App\Models\Category;
use App\Models\Discount;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Observers\ProductObserver;
use App\Policies\BrandPolicy;
use App\Policies\CartPolicy;
use App\Policies\CategoryPolicy;
use App\Policies\DiscountPolicy;
use App\Policies\OrderPolicy;
use App\Policies\ProductPolicy;
use App\Policies\RolePolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Role;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Đăng ký policies
        Gate::policy(Role::class, RolePolicy::class);
        Gate::policy(Product::class, ProductPolicy::class);
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Cart::class, CartPolicy::class);
        Gate::policy(Brand::class, BrandPolicy::class);
        Gate::policy(Category::class, CategoryPolicy::class);
        Gate::policy(Discount::class, DiscountPolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
      //  Product::observe(ProductObserver::class);
    }
    
}