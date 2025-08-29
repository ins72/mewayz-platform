@extends('layouts.app')

@section('title', 'Checkout')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Page Header -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Checkout</h1>
        <p class="text-lg text-gray-600 mt-2">Complete your purchase</p>
    </div>

    @if($cart && $cart->cartItems->count() > 0)
        <form action="{{ route('checkout.process') }}" method="POST" id="checkout-form">
            @csrf
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Checkout Form -->
                <div class="lg:col-span-2 space-y-8">
                    <!-- Customer Information -->
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 class="text-xl font-semibold text-gray-900 mb-6">Customer Information</h2>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="customer_name" class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                <input type="text" name="customer_name" id="customer_name" required
                                       value="{{ old('customer_name', auth()->user()->name ?? '') }}"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                @error('customer_name')
                                    <p class="text-red-600 text-sm mt-1">{{ $message }}</p>
                                @enderror
                            </div>
                            
                            <div>
                                <label for="customer_email" class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                <input type="email" name="customer_email" id="customer_email" required
                                       value="{{ old('customer_email', auth()->user()->email ?? '') }}"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                @error('customer_email')
                                    <p class="text-red-600 text-sm mt-1">{{ $message }}</p>
                                @enderror
                            </div>
                            
                            <div>
                                <label for="customer_phone" class="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                                <input type="tel" name="customer_phone" id="customer_phone" required
                                       value="{{ old('customer_phone') }}"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                @error('customer_phone')
                                    <p class="text-red-600 text-sm mt-1">{{ $message }}</p>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <!-- Shipping Address -->
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 class="text-xl font-semibold text-gray-900 mb-6">Shipping Address</h2>
                        
                        <div class="space-y-4">
                            <div>
                                <label for="shipping_address" class="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                                <input type="text" name="shipping_address" id="shipping_address" required
                                       value="{{ old('shipping_address') }}"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                @error('shipping_address')
                                    <p class="text-red-600 text-sm mt-1">{{ $message }}</p>
                                @enderror
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label for="shipping_city" class="block text-sm font-medium text-gray-700 mb-2">City *</label>
                                    <input type="text" name="shipping_city" id="shipping_city" required
                                           value="{{ old('shipping_city') }}"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                    @error('shipping_city')
                                        <p class="text-red-600 text-sm mt-1">{{ $message }}</p>
                                    @enderror
                                </div>
                                
                                <div>
                                    <label for="shipping_state" class="block text-sm font-medium text-gray-700 mb-2">State *</label>
                                    <input type="text" name="shipping_state" id="shipping_state" required
                                           value="{{ old('shipping_state') }}"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                    @error('shipping_state')
                                        <p class="text-red-600 text-sm mt-1">{{ $message }}</p>
                                    @enderror
                                </div>
                                
                                <div>
                                    <label for="shipping_zip" class="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                                    <input type="text" name="shipping_zip" id="shipping_zip" required
                                           value="{{ old('shipping_zip') }}"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                    @error('shipping_zip')
                                        <p class="text-red-600 text-sm mt-1">{{ $message }}</p>
                                    @enderror
                                </div>
                            </div>
                            
                            <div>
                                <label for="shipping_country" class="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                                <select name="shipping_country" id="shipping_country" required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="">Select Country</option>
                                    <option value="US" {{ old('shipping_country') == 'US' ? 'selected' : '' }}>United States</option>
                                    <option value="CA" {{ old('shipping_country') == 'CA' ? 'selected' : '' }}>Canada</option>
                                    <option value="MX" {{ old('shipping_country') == 'MX' ? 'selected' : '' }}>Mexico</option>
                                    <option value="GB" {{ old('shipping_country') == 'GB' ? 'selected' : '' }}>United Kingdom</option>
                                    <option value="DE" {{ old('shipping_country') == 'DE' ? 'selected' : '' }}>Germany</option>
                                    <option value="FR" {{ old('shipping_country') == 'FR' ? 'selected' : '' }}>France</option>
                                    <option value="AU" {{ old('shipping_country') == 'AU' ? 'selected' : '' }}>Australia</option>
                                </select>
                                @error('shipping_country')
                                    <p class="text-red-600 text-sm mt-1">{{ $message }}</p>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <!-- Billing Address -->
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-xl font-semibold text-gray-900">Billing Address</h2>
                            <label class="flex items-center">
                                <input type="checkbox" id="same_as_shipping" checked
                                       class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                <span class="ml-2 text-sm text-gray-700">Same as shipping address</span>
                            </label>
                        </div>
                        
                        <div id="billing-address-fields" class="hidden space-y-4">
                            <div>
                                <label for="billing_address" class="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                                <input type="text" name="billing_address" id="billing_address"
                                       value="{{ old('billing_address') }}"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label for="billing_city" class="block text-sm font-medium text-gray-700 mb-2">City *</label>
                                    <input type="text" name="billing_city" id="billing_city"
                                           value="{{ old('billing_city') }}"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                </div>
                                
                                <div>
                                    <label for="billing_state" class="block text-sm font-medium text-gray-700 mb-2">State *</label>
                                    <input type="text" name="billing_state" id="billing_state"
                                           value="{{ old('billing_state') }}"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                </div>
                                
                                <div>
                                    <label for="billing_zip" class="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                                    <input type="text" name="billing_zip" id="billing_zip"
                                           value="{{ old('billing_zip') }}"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                </div>
                            </div>
                            
                            <div>
                                <label for="billing_country" class="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                                <select name="billing_country" id="billing_country"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="">Select Country</option>
                                    <option value="US" {{ old('billing_country') == 'US' ? 'selected' : '' }}>United States</option>
                                    <option value="CA" {{ old('billing_country') == 'CA' ? 'selected' : '' }}>Canada</option>
                                    <option value="MX" {{ old('billing_country') == 'MX' ? 'selected' : '' }}>Mexico</option>
                                    <option value="GB" {{ old('billing_country') == 'GB' ? 'selected' : '' }}>United Kingdom</option>
                                    <option value="DE" {{ old('shipping_country') == 'DE' ? 'selected' : '' }}>Germany</option>
                                    <option value="FR" {{ old('shipping_country') == 'FR' ? 'selected' : '' }}>France</option>
                                    <option value="AU" {{ old('shipping_country') == 'AU' ? 'selected' : '' }}>Australia</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Payment Method -->
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 class="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
                        
                        <div class="space-y-4">
                            <div>
                                <label for="payment_method" class="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                                <select name="payment_method" id="payment_method" required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="">Select Payment Method</option>
                                    <option value="credit_card" {{ old('payment_method') == 'credit_card' ? 'selected' : '' }}>Credit Card</option>
                                    <option value="paypal" {{ old('payment_method') == 'paypal' ? 'selected' : '' }}>PayPal</option>
                                    <option value="bank_transfer" {{ old('payment_method') == 'bank_transfer' ? 'selected' : '' }}>Bank Transfer</option>
                                </select>
                                @error('payment_method')
                                    <p class="text-red-600 text-sm mt-1">{{ $message }}</p>
                                @enderror
                            </div>
                            
                            <div id="credit-card-fields" class="hidden space-y-4">
                                <div>
                                    <label for="card_number" class="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                                    <input type="text" name="card_number" id="card_number" placeholder="1234 5678 9012 3456"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                </div>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label for="card_expiry" class="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                                        <input type="text" name="card_expiry" id="card_expiry" placeholder="MM/YY"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                    </div>
                                    
                                    <div>
                                        <label for="card_cvv" class="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                                        <input type="text" name="card_cvv" id="card_cvv" placeholder="123"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                    </div>
                                </div>
                                
                                <div>
                                    <label for="card_name" class="block text-sm font-medium text-gray-700 mb-2">Name on Card *</label>
                                    <input type="text" name="card_name" id="card_name"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Order Notes -->
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 class="text-xl font-semibold text-gray-900 mb-6">Order Notes (Optional)</h2>
                        <textarea name="notes" id="notes" rows="4" placeholder="Special instructions for delivery..."
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">{{ old('notes') }}</textarea>
                    </div>
                </div>

                <!-- Order Summary -->
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                        <h2 class="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                        
                        <!-- Cart Items -->
                        <div class="space-y-4 mb-6">
                            @foreach($cart->cartItems as $item)
                            <div class="flex items-center space-x-3">
                                <img src="{{ $item->product->featured_image_url }}" alt="{{ $item->product->name }}" 
                                     class="w-12 h-12 object-cover rounded">
                                <div class="flex-1 min-w-0">
                                    <h4 class="text-sm font-medium text-gray-900 truncate">{{ $item->product->name }}</h4>
                                    <p class="text-sm text-gray-500">Qty: {{ $item->quantity }}</p>
                                </div>
                                <div class="text-sm font-medium text-gray-900">
                                    @if($item->product->is_on_sale && $item->product->sale_price)
                                        ${{ number_format($item->product->sale_price * $item->quantity, 2) }}
                                    @else
                                        ${{ number_format($item->product->price * $item->quantity, 2) }}
                                    @endif
                                </div>
                            </div>
                            @endforeach
                        </div>
                        
                        <!-- Totals -->
                        <div class="border-t border-gray-200 pt-4 space-y-3">
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-600">Subtotal</span>
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
                            </div>
                        </div>
                        
                        <!-- Place Order Button -->
                        <button type="submit" 
                                class="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold text-lg mt-6">
                            Place Order
                        </button>
                        
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
        </form>
        
    @else
        <!-- Empty Cart -->
        <div class="text-center py-16">
            <div class="max-w-md mx-auto">
                <i class="fas fa-shopping-cart text-6xl text-gray-300 mb-6"></i>
                <h2 class="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <p class="text-gray-600 mb-8">You need to add items to your cart before proceeding to checkout.</p>
                <a href="{{ route('products.index') }}" 
                   class="bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold">
                    Continue Shopping
                </a>
            </div>
        </div>
    @endif
</div>

<script>
// Handle billing address toggle
document.getElementById('same_as_shipping').addEventListener('change', function() {
    const billingFields = document.getElementById('billing-address-fields');
    const billingInputs = billingFields.querySelectorAll('input, select');
    
    if (this.checked) {
        billingFields.classList.add('hidden');
        billingInputs.forEach(input => {
            input.removeAttribute('required');
        });
    } else {
        billingFields.classList.remove('hidden');
        billingInputs.forEach(input => {
            input.setAttribute('required', 'required');
        });
    }
});

// Handle payment method toggle
document.getElementById('payment_method').addEventListener('change', function() {
    const creditCardFields = document.getElementById('credit-card-fields');
    const creditCardInputs = creditCardFields.querySelectorAll('input');
    
    if (this.value === 'credit_card') {
        creditCardFields.classList.remove('hidden');
        creditCardInputs.forEach(input => {
            input.setAttribute('required', 'required');
        });
    } else {
        creditCardFields.classList.add('hidden');
        creditCardInputs.forEach(input => {
            input.removeAttribute('required');
        });
    }
});

// Copy shipping address to billing address
document.getElementById('same_as_shipping').addEventListener('change', function() {
    if (this.checked) {
        document.getElementById('billing_address').value = document.getElementById('shipping_address').value;
        document.getElementById('billing_city').value = document.getElementById('shipping_city').value;
        document.getElementById('billing_state').value = document.getElementById('shipping_state').value;
        document.getElementById('billing_zip').value = document.getElementById('shipping_zip').value;
        document.getElementById('billing_country').value = document.getElementById('shipping_country').value;
    }
});

// Auto-copy when shipping fields change
['shipping_address', 'shipping_city', 'shipping_state', 'shipping_zip', 'shipping_country'].forEach(field => {
    document.getElementById(field).addEventListener('input', function() {
        if (document.getElementById('same_as_shipping').checked) {
            const billingField = field.replace('shipping_', 'billing_');
            document.getElementById(billingField).value = this.value;
        }
    });
});

// Form validation
document.getElementById('checkout-form').addEventListener('submit', function(e) {
    const requiredFields = this.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('border-red-500');
        } else {
            field.classList.remove('border-red-500');
        }
    });
    
    if (!isValid) {
        e.preventDefault();
        alert('Please fill in all required fields.');
    }
});
</script>
@endsection