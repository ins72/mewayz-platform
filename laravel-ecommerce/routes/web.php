<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\OrderController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Public routes
Route::get('/', function () {
    return view('welcome');
})->name('home');

// Product routes
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/featured', [ProductController::class, 'featured'])->name('products.featured');
Route::get('/products/on-sale', [ProductController::class, 'onSale'])->name('products.on-sale');
Route::get('/products/search', [ProductController::class, 'search'])->name('products.search');
Route::get('/products/{product:slug}', [ProductController::class, 'show'])->name('products.show');

// Cart routes
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::put('/cart/update/{cartItem}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/remove/{cartItem}', [CartController::class, 'remove'])->name('cart.remove');
Route::delete('/cart/clear', [CartController::class, 'clear'])->name('cart.clear');
Route::get('/cart/count', [CartController::class, 'count'])->name('cart.count');
Route::get('/cart/summary', [CartController::class, 'summary'])->name('cart.summary');
Route::post('/cart/apply-discount', [CartController::class, 'applyDiscount'])->name('cart.apply-discount');
Route::delete('/cart/remove-discount', [CartController::class, 'removeDiscount'])->name('cart.remove-discount');

// Checkout routes
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout/process', [CheckoutController::class, 'process'])->name('checkout.process');
Route::get('/checkout/success/{order}', [CheckoutController::class, 'success'])->name('checkout.success');
Route::get('/checkout/confirmation/{order}', [CheckoutController::class, 'confirmation'])->name('checkout.confirmation');
Route::post('/checkout/calculate-shipping', [CheckoutController::class, 'calculateShipping'])->name('checkout.calculate-shipping');
Route::post('/checkout/process-payment/{order}', [CheckoutController::class, 'processPayment'])->name('checkout.process-payment');

// Protected routes (require authentication)
Route::middleware(['auth'])->group(function () {
    // User dashboard
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');

    // User orders
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');

    // Wishlist
    Route::get('/wishlist', function () {
        return view('wishlist.index');
    })->name('wishlist.index');

    // Profile
    Route::get('/profile', function () {
        return view('profile.edit');
    })->name('profile.edit');
});

// Admin routes (require admin middleware)
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // Admin dashboard
    Route::get('/', function () {
        return view('admin.dashboard');
    })->name('dashboard');

    // Product management
    Route::resource('products', ProductController::class);
    Route::post('products/{product}/toggle-status', [ProductController::class, 'toggleStatus'])->name('products.toggle-status');
    Route::post('products/{product}/toggle-featured', [ProductController::class, 'toggleFeatured'])->name('products.toggle-featured');

    // Category management
    Route::resource('categories', \App\Http\Controllers\CategoryController::class);

    // Order management
    Route::resource('orders', OrderController::class);
    Route::put('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::put('orders/{order}/mark-shipped', [OrderController::class, 'markAsShipped'])->name('orders.mark-shipped');
    Route::put('orders/{order}/mark-delivered', [OrderController::class, 'markAsDelivered'])->name('orders.mark-delivered');

    // User management
    Route::resource('users', \App\Http\Controllers\UserController::class);

    // Reports
    Route::get('reports/sales', function () {
        return view('admin.reports.sales');
    })->name('reports.sales');
    Route::get('reports/inventory', function () {
        return view('admin.reports.inventory');
    })->name('reports.inventory');
});

// API routes for AJAX requests
Route::prefix('api')->name('api.')->group(function () {
    Route::get('products/search', [ProductController::class, 'search'])->name('products.search');
    Route::get('cart/summary', [CartController::class, 'summary'])->name('cart.summary');
    Route::post('checkout/calculate-shipping', [CheckoutController::class, 'calculateShipping'])->name('checkout.calculate-shipping');
});

// Fallback route for 404
Route::fallback(function () {
    return view('errors.404');
});
