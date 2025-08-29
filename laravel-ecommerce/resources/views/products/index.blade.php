@extends('layouts.app')

@section('title', 'Products')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Page Header -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">All Products</h1>
        <p class="text-lg text-gray-600 mt-2">Discover our amazing collection of products</p>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <form action="{{ route('products.index') }}" method="GET" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <!-- Search -->
                <div>
                    <label for="search" class="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <input type="text" name="search" id="search" value="{{ request('search') }}" 
                           placeholder="Search products..." 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                </div>

                <!-- Category Filter -->
                <div>
                    <label for="category" class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select name="category" id="category" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">All Categories</option>
                        @foreach($categories as $category)
                            <option value="{{ $category->id }}" {{ request('category') == $category->id ? 'selected' : '' }}>
                                {{ $category->name }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <!-- Price Range -->
                <div>
                    <label for="min_price" class="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                    <input type="number" name="min_price" id="min_price" value="{{ request('min_price') }}" 
                           placeholder="0" min="0" step="0.01"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                </div>

                <div>
                    <label for="max_price" class="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                    <input type="number" name="max_price" id="max_price" value="{{ request('max_price') }}" 
                           placeholder="1000" min="0" step="0.01"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <!-- Sort Options -->
                <div class="flex items-center space-x-4">
                    <label for="sort" class="text-sm font-medium text-gray-700">Sort by:</label>
                    <select name="sort" id="sort" 
                            class="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="newest" {{ request('sort') == 'newest' ? 'selected' : '' }}>Newest</option>
                        <option value="price_low" {{ request('sort') == 'price_low' ? 'selected' : '' }}>Price: Low to High</option>
                        <option value="price_high" {{ request('sort') == 'price_high' ? 'selected' : '' }}>Price: High to Low</option>
                        <option value="name" {{ request('sort') == 'name' ? 'selected' : '' }}>Name</option>
                        <option value="popular" {{ request('sort') == 'popular' ? 'selected' : '' }}>Most Popular</option>
                    </select>
                </div>

                <!-- Filter Buttons -->
                <div class="flex space-x-3">
                    <button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-300">
                        Apply Filters
                    </button>
                    <a href="{{ route('products.index') }}" class="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition duration-300">
                        Clear
                    </a>
                </div>
            </div>
        </form>
    </div>

    <!-- Results Count -->
    <div class="mb-6">
        <p class="text-gray-600">
            Showing {{ $products->firstItem() ?? 0 }} to {{ $products->lastItem() ?? 0 }} of {{ $products->total() }} products
        </p>
    </div>

    <!-- Products Grid -->
    @if($products->count() > 0)
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @foreach($products as $product)
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                    <div class="relative">
                        <a href="{{ route('products.show', $product) }}">
                            <img src="{{ $product->featured_image_url }}" alt="{{ $product->name }}" 
                                 class="w-full h-48 object-cover hover:scale-105 transition duration-300">
                        </a>
                        
                        <!-- Badges -->
                        <div class="absolute top-2 left-2 space-y-1">
                            @if($product->is_on_sale)
                                <span class="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                    Sale
                                </span>
                            @endif
                            @if($product->is_featured)
                                <span class="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                    Featured
                                </span>
                            @endif
                        </div>

                        <!-- Stock Status -->
                        @if($product->stock_quantity <= 0)
                            <div class="absolute top-2 right-2">
                                <span class="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                    Out of Stock
                                </span>
                            </div>
                        @endif
                    </div>
                    
                    <div class="p-4">
                        <!-- Category -->
                        @if($product->category)
                            <div class="mb-2">
                                <span class="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                    {{ $product->category->name }}
                                </span>
                            </div>
                        @endif

                        <!-- Product Name -->
                        <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            <a href="{{ route('products.show', $product) }}" class="hover:text-indigo-600">
                                {{ $product->name }}
                            </a>
                        </h3>
                        
                        <!-- Rating -->
                        <div class="flex items-center mb-2">
                            <div class="flex text-yellow-400">
                                @for($i = 1; $i <= 5; $i++)
                                    @if($i <= $product->average_rating)
                                        <i class="fas fa-star text-sm"></i>
                                    @else
                                        <i class="far fa-star text-sm"></i>
                                    @endif
                                @endfor
                            </div>
                            <span class="text-sm text-gray-500 ml-2">({{ $product->review_count }})</span>
                        </div>
                        
                        <!-- Price -->
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center space-x-2">
                                @if($product->is_on_sale && $product->sale_price)
                                    <span class="text-lg font-bold text-red-600">${{ number_format($product->sale_price, 2) }}</span>
                                    <span class="text-sm text-gray-500 line-through">${{ number_format($product->price, 2) }}</span>
                                    @if($product->discount_percentage > 0)
                                        <span class="text-xs text-red-600 font-medium">-{{ $product->discount_percentage }}%</span>
                                    @endif
                                @else
                                    <span class="text-lg font-bold text-gray-900">${{ number_format($product->price, 2) }}</span>
                                @endif
                            </div>
                        </div>
                        
                        <!-- Add to Cart Button -->
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
            @endforeach
        </div>

        <!-- Pagination -->
        <div class="mt-8">
            {{ $products->appends(request()->query())->links() }}
        </div>
    @else
        <!-- No Products Found -->
        <div class="text-center py-12">
            <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
            <h3 class="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
            <p class="text-gray-500 mb-6">Try adjusting your search criteria or browse our categories.</p>
            <a href="{{ route('products.index') }}" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300">
                View All Products
            </a>
        </div>
    @endif
</div>
@endsection