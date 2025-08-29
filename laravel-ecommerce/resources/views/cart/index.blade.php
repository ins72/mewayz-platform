@extends('layouts.app')

@section('title', 'Shopping Cart')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Page Header -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p class="text-lg text-gray-600 mt-2">Review your items and proceed to checkout</p>
    </div>

    @if($cart && $cart->cartItems->count() > 0)
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Cart Items -->
            <div class="lg:col-span-2">
                <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h2 class="text-lg font-semibold text-gray-900">Cart Items ({{ $cart->item_count }})</h2>
                    </div>
                    
                    <div class="divide-y divide-gray-200">
                        @foreach($cart->cartItems as $item)
                        <div class="p-6">
                            <div class="flex items-center space-x-4">
                                <!-- Product Image -->
                                <div class="flex-shrink-0">
                                    <img src="{{ $item->product->featured_image_url }}" alt="{{ $item->product->name }}" 
                                         class="w-20 h-20 object-cover rounded-lg">
                                </div>
                                
                                <!-- Product Info -->
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <h3 class="text-lg font-medium text-gray-900">
                                                <a href="{{ route('products.show', $item->product) }}" class="hover:text-indigo-600">
                                                    {{ $item->product->name }}
                                                </a>
                                            </h3>
                                            @if($item->product->category)
                                            <p class="text-sm text-gray-500">{{ $item->product->category->name }}</p>
                                            @endif
                                            @if($item->product->sku)
                                            <p class="text-sm text-gray-500">SKU: {{ $item->product->sku }}</p>
                                            @endif
                                        </div>
                                        
                                        <!-- Remove Button -->
                                        <form action="{{ route('cart.remove') }}" method="POST" class="flex-shrink-0">
                                            @csrf
                                            <input type="hidden" name="product_id" value="{{ $item->product->id }}">
                                            <button type="submit" class="text-red-500 hover:text-red-700 transition duration-300">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                    
                                    <!-- Price and Quantity -->
                                    <div class="flex items-center justify-between mt-4">
                                        <div class="flex items-center space-x-4">
                                            <!-- Quantity Controls -->
                                            <div class="flex items-center border border-gray-300 rounded-md">
                                                <form action="{{ route('cart.update') }}" method="POST" class="flex items-center">
                                                    @csrf
                                                    <input type="hidden" name="product_id" value="{{ $item->product->id }}">
                                                    <button type="submit" name="action" value="decrease" 
                                                            class="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                                                            {{ $item->quantity <= 1 ? 'disabled' : '' }}>
                                                        <i class="fas fa-minus text-sm"></i>
                                                    </button>
                                                    <span class="px-3 py-1 text-gray-900 font-medium">{{ $item->quantity }}</span>
                                                    <button type="submit" name="action" value="increase" 
                                                            class="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                                                            {{ $item->quantity >= $item->product->stock_quantity ? 'disabled' : '' }}>
                                                        <i class="fas fa-plus text-sm"></i>
                                                    </button>
                                                </form>
                                            </div>
                                            
                                            <!-- Stock Status -->
                                            @if($item->product->stock_quantity < $item->quantity)
                                                <span class="text-red-600 text-sm font-medium">Only {{ $item->product->stock_quantity }} in stock</span>
                                            @endif
                                        </div>
                                        
                                        <!-- Price -->
                                        <div class="text-right">
                                            @if($item->product->is_on_sale && $item->product->sale_price)
                                                <p class="text-lg font-semibold text-red-600">${{ number_format($item->product->sale_price * $item->quantity, 2) }}</p>
                                                <p class="text-sm text-gray-500 line-through">${{ number_format($item->product->price * $item->quantity, 2) }}</p>
                                            @else
                                                <p class="text-lg font-semibold text-gray-900">${{ number_format($item->product->price * $item->quantity, 2) }}</p>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        @endforeach
                    </div>
                    
                    <!-- Cart Actions -->
                    <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div class="flex items-center justify-between">
                            <form action="{{ route('cart.clear') }}" method="POST">
                                @csrf
                                <button type="submit" class="text-red-600 hover:text-red-800 font-medium transition duration-300">
                                    <i class="fas fa-trash mr-2"></i>Clear Cart
                                </button>
                            </form>
                            
                            <a href="{{ route('products.index') }}" class="text-indigo-600 hover:text-indigo-800 font-medium transition duration-300">
                                <i class="fas fa-arrow-left mr-2"></i>Continue Shopping
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Order Summary -->
            <div class="lg:col-span-1">
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                    
                    <div class="space-y-3 mb-6">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Subtotal ({{ $cart->item_count }} items)</span>
                            <span class="font-medium">${{ number_format($cart->subtotal, 2) }}</span>
                        </div>
                        
                        @if($cart->tax_amount > 0)
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Tax</span>
                            <span class="font-medium">${{ number_format($cart->tax_amount, 2) }}</span>
                        </div>
                        @endif
                        
                        @if($cart->shipping_amount > 0)
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Shipping</span>
                            <span class="font-medium">${{ number_format($cart->shipping_amount, 2) }}</span>
                        </div>
                        @endif
                        
                        @if($cart->discount_amount > 0)
                        <div class="flex justify-between text-sm text-green-600">
                            <span>Discount</span>
                            <span class="font-medium">-${{ number_format($cart->discount_amount, 2) }}</span>
                        </div>
                        @endif
                        
                        <div class="border-t border-gray-200 pt-3">
                            <div class="flex justify-between text-lg font-semibold">
                                <span>Total</span>
                                <span>${{ number_format($cart->total_amount, 2) }}</span>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">Including tax and shipping</p>
                        </div>
                    </div>
                    
                    <!-- Discount Code -->
                    <div class="mb-6">
                        <form action="{{ route('cart.apply-discount') }}" method="POST" class="space-y-3">
                            @csrf
                            <div>
                                <label for="discount_code" class="block text-sm font-medium text-gray-700 mb-1">Discount Code</label>
                                <div class="flex space-x-2">
                                    <input type="text" name="discount_code" id="discount_code" 
                                           placeholder="Enter code" 
                                           class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                    <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300">
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </form>
                        
                        @if($cart->discount_amount > 0)
                        <div class="flex items-center justify-between bg-green-50 p-3 rounded-md">
                            <span class="text-sm text-green-800">Discount applied</span>
                            <form action="{{ route('cart.remove-discount') }}" method="POST">
                                @csrf
                                <button type="submit" class="text-green-600 hover:text-green-800 text-sm">
                                    Remove
                                </button>
                            </form>
                        </div>
                        @endif
                    </div>
                    
                    <!-- Checkout Button -->
                    <a href="{{ route('checkout.index') }}" 
                       class="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-300 text-center font-semibold text-lg block">
                        Proceed to Checkout
                    </a>
                    
                    <!-- Security Notice -->
                    <div class="mt-4 text-center">
                        <div class="flex items-center justify-center text-gray-500 text-sm">
                            <i class="fas fa-lock mr-2"></i>
                            <span>Secure checkout</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Related Products -->
        <div class="mt-16">
            <h2 class="text-2xl font-bold text-gray-900 mb-8">You might also like</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                @foreach($relatedProducts as $product)
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                    <a href="{{ route('products.show', $product) }}">
                        <img src="{{ $product->featured_image_url }}" alt="{{ $product->name }}" 
                             class="w-full h-32 object-cover">
                    </a>
                    <div class="p-4">
                        <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">
                            <a href="{{ route('products.show', $product) }}" class="hover:text-indigo-600">
                                {{ $product->name }}
                            </a>
                        </h3>
                        <div class="flex items-center justify-between">
                            <span class="font-bold text-gray-900">
                                @if($product->is_on_sale && $product->sale_price)
                                    ${{ number_format($product->sale_price, 2) }}
                                @else
                                    ${{ number_format($product->price, 2) }}
                                @endif
                            </span>
                            <form action="{{ route('cart.add') }}" method="POST">
                                @csrf
                                <input type="hidden" name="product_id" value="{{ $product->id }}">
                                <input type="hidden" name="quantity" value="1">
                                <button type="submit" class="text-indigo-600 hover:text-indigo-800">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
        
    @else
        <!-- Empty Cart -->
        <div class="text-center py-16">
            <div class="max-w-md mx-auto">
                <i class="fas fa-shopping-cart text-6xl text-gray-300 mb-6"></i>
                <h2 class="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <p class="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
                <div class="space-y-3">
                    <a href="{{ route('products.index') }}" 
                       class="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold block">
                        Start Shopping
                    </a>
                    <a href="{{ route('products.featured') }}" 
                       class="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition duration-300 font-semibold block">
                        View Featured Products
                    </a>
                </div>
            </div>
        </div>
    @endif
</div>

<script>
// Update cart count in header
function updateCartCount() {
    fetch('{{ route("cart.count") }}')
        .then(response => response.json())
        .then(data => {
            const cartCount = document.getElementById('cart-count');
            if (cartCount) {
                cartCount.textContent = data.count;
            }
        });
}

// Update cart summary via AJAX
function updateCartSummary() {
    fetch('{{ route("cart.summary") }}')
        .then(response => response.json())
        .then(data => {
            // Update cart summary display
            location.reload(); // Simple approach for now
        });
}

// Auto-update cart count when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});
</script>
@endsection