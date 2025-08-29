@extends('layouts.app')

@section('title', $product->name)

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Breadcrumb -->
    <nav class="flex mb-8" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
                <a href="{{ route('welcome') }}" class="text-gray-700 hover:text-indigo-600">
                    <i class="fas fa-home mr-2"></i>Home
                </a>
            </li>
            <li>
                <div class="flex items-center">
                    <i class="fas fa-chevron-right text-gray-400 mx-2"></i>
                    <a href="{{ route('products.index') }}" class="text-gray-700 hover:text-indigo-600">Products</a>
                </div>
            </li>
            @if($product->category)
            <li>
                <div class="flex items-center">
                    <i class="fas fa-chevron-right text-gray-400 mx-2"></i>
                    <a href="{{ route('products.index', ['category' => $product->category->id]) }}" class="text-gray-700 hover:text-indigo-600">
                        {{ $product->category->name }}
                    </a>
                </div>
            </li>
            @endif
            <li aria-current="page">
                <div class="flex items-center">
                    <i class="fas fa-chevron-right text-gray-400 mx-2"></i>
                    <span class="text-gray-500">{{ $product->name }}</span>
                </div>
            </li>
        </ol>
    </nav>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Product Images -->
        <div class="space-y-4">
            <!-- Main Image -->
            <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg">
                <img id="main-image" src="{{ $product->featured_image_url }}" alt="{{ $product->name }}" 
                     class="w-full h-full object-cover">
            </div>
            
            <!-- Thumbnail Images -->
            @if($product->images && count($product->images) > 0)
            <div class="grid grid-cols-4 gap-2">
                <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg cursor-pointer border-2 border-indigo-500">
                    <img src="{{ $product->featured_image_url }}" alt="{{ $product->name }}" 
                         class="w-full h-full object-cover" onclick="changeMainImage(this.src)">
                </div>
                @foreach(array_slice($product->images, 0, 3) as $image)
                <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg cursor-pointer border-2 border-transparent hover:border-indigo-300">
                    <img src="{{ asset('storage/' . $image) }}" alt="{{ $product->name }}" 
                         class="w-full h-full object-cover" onclick="changeMainImage(this.src)">
                </div>
                @endforeach
            </div>
            @endif
        </div>

        <!-- Product Info -->
        <div class="space-y-6">
            <!-- Product Header -->
            <div>
                @if($product->category)
                <div class="mb-2">
                    <span class="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        {{ $product->category->name }}
                    </span>
                </div>
                @endif
                
                <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $product->name }}</h1>
                
                <!-- Rating -->
                <div class="flex items-center mb-4">
                    <div class="flex text-yellow-400">
                        @for($i = 1; $i <= 5; $i++)
                            @if($i <= $product->average_rating)
                                <i class="fas fa-star text-lg"></i>
                            @else
                                <i class="far fa-star text-lg"></i>
                            @endif
                        @endfor
                    </div>
                    <span class="text-gray-600 ml-2">({{ $product->review_count }} reviews)</span>
                    <span class="text-gray-400 mx-2">•</span>
                    <span class="text-gray-600">{{ $product->view_count }} views</span>
                </div>
            </div>

            <!-- Price -->
            <div class="border-t border-gray-200 pt-6">
                <div class="flex items-center space-x-4">
                    @if($product->is_on_sale && $product->sale_price)
                        <span class="text-4xl font-bold text-red-600">${{ number_format($product->sale_price, 2) }}</span>
                        <span class="text-2xl text-gray-500 line-through">${{ number_format($product->price, 2) }}</span>
                        @if($product->discount_percentage > 0)
                            <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                                Save {{ $product->discount_percentage }}%
                            </span>
                        @endif
                    @else
                        <span class="text-4xl font-bold text-gray-900">${{ number_format($product->price, 2) }}</span>
                    @endif
                </div>
            </div>

            <!-- Stock Status -->
            <div class="border-t border-gray-200 pt-6">
                @if($product->stock_quantity > 0)
                    <div class="flex items-center text-green-600">
                        <i class="fas fa-check-circle mr-2"></i>
                        <span class="font-medium">In Stock ({{ $product->stock_quantity }} available)</span>
                    </div>
                @else
                    <div class="flex items-center text-red-600">
                        <i class="fas fa-times-circle mr-2"></i>
                        <span class="font-medium">Out of Stock</span>
                    </div>
                @endif
            </div>

            <!-- Add to Cart -->
            @if($product->stock_quantity > 0)
            <div class="border-t border-gray-200 pt-6">
                <form action="{{ route('cart.add') }}" method="POST" class="space-y-4">
                    @csrf
                    <input type="hidden" name="product_id" value="{{ $product->id }}">
                    
                    <div class="flex items-center space-x-4">
                        <label for="quantity" class="text-sm font-medium text-gray-700">Quantity:</label>
                        <div class="flex items-center border border-gray-300 rounded-md">
                            <button type="button" onclick="decrementQuantity()" class="px-3 py-2 text-gray-600 hover:text-gray-800">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" name="quantity" id="quantity" value="1" min="1" max="{{ $product->stock_quantity }}" 
                                   class="w-16 text-center border-0 focus:ring-0">
                            <button type="button" onclick="incrementQuantity()" class="px-3 py-2 text-gray-600 hover:text-gray-800">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    
                    <button type="submit" class="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-300 text-lg font-semibold">
                        <i class="fas fa-shopping-cart mr-2"></i>Add to Cart
                    </button>
                </form>
            </div>
            @endif

            <!-- Product Details -->
            @if($product->short_description || $product->sku || $product->weight || $product->dimensions)
            <div class="border-t border-gray-200 pt-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                <div class="space-y-3">
                    @if($product->short_description)
                    <div>
                        <span class="text-gray-600">{{ $product->short_description }}</span>
                    </div>
                    @endif
                    
                    @if($product->sku)
                    <div class="flex justify-between">
                        <span class="text-gray-600">SKU:</span>
                        <span class="font-medium">{{ $product->sku }}</span>
                    </div>
                    @endif
                    
                    @if($product->weight)
                    <div class="flex justify-between">
                        <span class="text-gray-600">Weight:</span>
                        <span class="font-medium">{{ $product->weight }} lbs</span>
                    </div>
                    @endif
                    
                    @if($product->dimensions)
                    <div class="flex justify-between">
                        <span class="text-gray-600">Dimensions:</span>
                        <span class="font-medium">{{ $product->dimensions }}</span>
                    </div>
                    @endif
                </div>
            </div>
            @endif

            <!-- Tags -->
            @if($product->tags && count($product->tags) > 0)
            <div class="border-t border-gray-200 pt-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div class="flex flex-wrap gap-2">
                    @foreach($product->tags as $tag)
                    <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {{ $tag }}
                    </span>
                    @endforeach
                </div>
            </div>
            @endif
        </div>
    </div>

    <!-- Product Description -->
    @if($product->description)
    <div class="mt-16 border-t border-gray-200 pt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Description</h2>
        <div class="prose max-w-none text-gray-700">
            {!! nl2br(e($product->description)) !!}
        </div>
    </div>
    @endif

    <!-- Product Reviews -->
    <div class="mt-16 border-t border-gray-200 pt-12">
        <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            @auth
            <button onclick="openReviewModal()" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                Write a Review
            </button>
            @endauth
        </div>

        @if($product->reviews->count() > 0)
            <div class="space-y-6">
                @foreach($product->reviews as $review)
                <div class="border border-gray-200 rounded-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span class="text-indigo-600 font-semibold">{{ substr($review->user->name, 0, 1) }}</span>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-900">{{ $review->user->name }}</h4>
                                <div class="flex items-center">
                                    <div class="flex text-yellow-400">
                                        @for($i = 1; $i <= 5; $i++)
                                            @if($i <= $review->rating)
                                                <i class="fas fa-star text-sm"></i>
                                            @else
                                                <i class="far fa-star text-sm"></i>
                                            @endif
                                        @endfor
                                    </div>
                                    <span class="text-gray-500 ml-2">{{ $review->created_at->diffForHumans() }}</span>
                                </div>
                            </div>
                        </div>
                        @if($review->is_verified_purchase)
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            Verified Purchase
                        </span>
                        @endif
                    </div>
                    
                    @if($review->title)
                    <h5 class="font-semibold text-gray-900 mb-2">{{ $review->title }}</h5>
                    @endif
                    
                    <p class="text-gray-700">{{ $review->comment }}</p>
                    
                    @if($review->images && count($review->images) > 0)
                    <div class="mt-4 flex space-x-2">
                        @foreach($review->images as $image)
                        <img src="{{ asset('storage/' . $image) }}" alt="Review image" class="w-16 h-16 object-cover rounded">
                        @endforeach
                    </div>
                    @endif
                </div>
                @endforeach
            </div>
        @else
            <div class="text-center py-12">
                <i class="fas fa-comments text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">No Reviews Yet</h3>
                <p class="text-gray-500">Be the first to review this product!</p>
            </div>
        @endif
    </div>
</div>

<!-- Review Modal -->
@auth
<div id="review-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50">
    <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-lg max-w-md w-full p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Write a Review</h3>
                <button onclick="closeReviewModal()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <form action="{{ route('reviews.store') }}" method="POST">
                @csrf
                <input type="hidden" name="product_id" value="{{ $product->id }}">
                
                <div class="space-y-4">
                    <div>
                        <label for="rating" class="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div class="flex space-x-2">
                            @for($i = 1; $i <= 5; $i++)
                            <input type="radio" name="rating" id="rating_{{ $i }}" value="{{ $i }}" class="sr-only">
                            <label for="rating_{{ $i }}" class="text-2xl text-gray-300 hover:text-yellow-400 cursor-pointer">
                                <i class="far fa-star"></i>
                            </label>
                            @endfor
                        </div>
                    </div>
                    
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Title (optional)</label>
                        <input type="text" name="title" id="title" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    
                    <div>
                        <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                        <textarea name="comment" id="comment" rows="4" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    </div>
                </div>
                
                <div class="flex space-x-3 mt-6">
                    <button type="submit" class="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300">
                        Submit Review
                    </button>
                    <button type="button" onclick="closeReviewModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-300">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endauth

<script>
function changeMainImage(src) {
    document.getElementById('main-image').src = src;
}

function incrementQuantity() {
    const input = document.getElementById('quantity');
    const max = parseInt(input.getAttribute('max'));
    const current = parseInt(input.value);
    if (current < max) {
        input.value = current + 1;
    }
}

function decrementQuantity() {
    const input = document.getElementById('quantity');
    const current = parseInt(input.value);
    if (current > 1) {
        input.value = current - 1;
    }
}

function openReviewModal() {
    document.getElementById('review-modal').classList.remove('hidden');
}

function closeReviewModal() {
    document.getElementById('review-modal').classList.add('hidden');
}

// Star rating functionality
document.querySelectorAll('input[name="rating"]').forEach(input => {
    input.addEventListener('change', function() {
        const rating = parseInt(this.value);
        const stars = document.querySelectorAll('label[for^="rating_"] i');
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas', 'text-yellow-400');
            } else {
                star.classList.remove('fas', 'text-yellow-400');
                star.classList.add('far');
            }
        });
    });
});
</script>
@endsection