@extends('layouts.app')

@section('title', 'Home')

@section('content')
<!-- Hero Section -->
<div class="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-6">
                Welcome to <span class="text-yellow-300">{{ config('app.name', 'Laravel Ecommerce') }}</span>
            </h1>
            <p class="text-xl md:text-2xl mb-8 text-indigo-100">
                Discover amazing products at unbeatable prices
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="{{ route('products.index') }}" class="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300">
                    Shop Now
                </a>
                <a href="{{ route('products.featured') }}" class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition duration-300">
                    Featured Products
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Categories Section -->
<div class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p class="text-lg text-gray-600">Find exactly what you're looking for</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @php
                $categories = \App\Models\Category::active()->ordered()->limit(3)->get();
            @endphp
            
            @forelse($categories as $category)
                <div class="group cursor-pointer">
                    <div class="bg-gray-100 rounded-lg p-8 text-center hover:bg-indigo-50 transition duration-300">
                        @if($category->image)
                            <img src="{{ $category->image_url }}" alt="{{ $category->name }}" class="w-24 h-24 mx-auto mb-4 rounded-lg">
                        @else
                            <div class="w-24 h-24 mx-auto mb-4 bg-indigo-200 rounded-lg flex items-center justify-center">
                                <i class="fas fa-tag text-4xl text-indigo-600"></i>
                            </div>
                        @endif
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ $category->name }}</h3>
                        <p class="text-gray-600">{{ $category->description }}</p>
                    </div>
                </div>
            @empty
                <div class="col-span-3 text-center py-12">
                    <i class="fas fa-tags text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No Categories Yet</h3>
                    <p class="text-gray-500">Categories will appear here once they're added.</p>
                </div>
            @endforelse
        </div>
    </div>
</div>

<!-- Featured Products Section -->
<div class="py-16 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p class="text-lg text-gray-600">Handpicked products just for you</p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @php
                $featuredProducts = \App\Models\Product::with(['category', 'reviews'])
                    ->active()
                    ->featured()
                    ->withCount('reviews')
                    ->limit(8)
                    ->get();
            @endphp
            
            @forelse($featuredProducts as $product)
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                    <div class="relative">
                        <img src="{{ $product->featured_image_url }}" alt="{{ $product->name }}" class="w-full h-48 object-cover">
                        @if($product->is_on_sale)
                            <span class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                                Sale
                            </span>
                        @endif
                        @if($product->is_featured)
                            <span class="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm font-semibold">
                                Featured
                            </span>
                        @endif
                    </div>
                    
                    <div class="p-4">
                        <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            <a href="{{ route('products.show', $product) }}" class="hover:text-indigo-600">
                                {{ $product->name }}
                            </a>
                        </h3>
                        
                        <div class="flex items-center mb-2">
                            <div class="flex text-yellow-400">
                                @for($i = 1; $i <= 5; $i++)
                                    @if($i <= $product->average_rating)
                                        <i class="fas fa-star"></i>
                                    @else
                                        <i class="far fa-star"></i>
                                    @endif
                                @endfor
                            </div>
                            <span class="text-sm text-gray-500 ml-2">({{ $product->review_count }})</span>
                        </div>
                        
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center space-x-2">
                                @if($product->is_on_sale && $product->sale_price)
                                    <span class="text-lg font-bold text-red-600">${{ number_format($product->sale_price, 2) }}</span>
                                    <span class="text-sm text-gray-500 line-through">${{ number_format($product->price, 2) }}</span>
                                @else
                                    <span class="text-lg font-bold text-gray-900">${{ number_format($product->price, 2) }}</span>
                                @endif
                            </div>
                            
                            @if($product->stock_quantity > 0)
                                <span class="text-sm text-green-600 font-medium">In Stock</span>
                            @else
                                <span class="text-sm text-red-600 font-medium">Out of Stock</span>
                            @endif
                        </div>
                        
                        <form action="{{ route('cart.add') }}" method="POST">
                            @csrf
                            <input type="hidden" name="product_id" value="{{ $product->id }}">
                            <input type="hidden" name="quantity" value="1">
                            
                            <button type="submit" 
                                    class="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    {{ $product->stock_quantity <= 0 ? 'disabled' : '' }}>
                                @if($product->stock_quantity > 0)
                                    <i class="fas fa-shopping-cart mr-2"></i>Add to Cart
                                @else
                                    Out of Stock
                                @endif
                            </button>
                        </form>
                    </div>
                </div>
            @empty
                <div class="col-span-4 text-center py-12">
                    <i class="fas fa-box text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No Featured Products Yet</h3>
                    <p class="text-gray-500">Featured products will appear here once they're added.</p>
                </div>
            @endforelse
        </div>
        
        <div class="text-center mt-8">
            <a href="{{ route('products.featured') }}" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                View All Featured Products
                <i class="fas fa-arrow-right ml-2"></i>
            </a>
        </div>
    </div>
</div>

<!-- Call to Action Section -->
<div class="py-16 bg-indigo-600 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
        <p class="text-xl mb-8 text-indigo-100">Join thousands of satisfied customers</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="{{ route('products.index') }}" class="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300">
                Browse Products
            </a>
            @guest
                <a href="{{ route('register') }}" class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition duration-300">
                    Create Account
                </a>
            @endguest
        </div>
    </div>
</div>
@endsection