<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class CartController extends Controller
{
    /**
     * Display the shopping cart.
     */
    public function index()
    {
        $cart = $this->getOrCreateCart();
        $cart->load('cartItems.product');
        
        return view('cart.index', compact('cart'));
    }

    /**
     * Add a product to the cart.
     */
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'options' => 'nullable|array',
        ]);

        $product = Product::findOrFail($request->product_id);
        
        if (!$product->isInStock()) {
            return back()->with('error', 'This product is out of stock.');
        }

        if (!$product->hasStock($request->quantity)) {
            return back()->with('error', 'Insufficient stock for this product.');
        }

        $cart = $this->getOrCreateCart();
        
        try {
            $cart->addItem($request->product_id, $request->quantity, $request->options ?? []);
            return back()->with('success', 'Product added to cart successfully!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Update cart item quantity.
     */
    public function update(Request $request, CartItem $cartItem)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = $this->getOrCreateCart();
        
        if ($cartItem->cart_id !== $cart->id) {
            return back()->with('error', 'Invalid cart item.');
        }

        try {
            $cart->updateItemQuantity($cartItem->id, $request->quantity);
            return back()->with('success', 'Cart updated successfully!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Remove an item from the cart.
     */
    public function remove(CartItem $cartItem)
    {
        $cart = $this->getOrCreateCart();
        
        if ($cartItem->cart_id !== $cart->id) {
            return back()->with('error', 'Invalid cart item.');
        }

        $cart->removeItem($cartItem->id);
        return back()->with('success', 'Item removed from cart successfully!');
    }

    /**
     * Clear the entire cart.
     */
    public function clear()
    {
        $cart = $this->getOrCreateCart();
        $cart->clear();
        
        return back()->with('success', 'Cart cleared successfully!');
    }

    /**
     * Get cart count for AJAX requests.
     */
    public function count()
    {
        $cart = $this->getOrCreateCart();
        return response()->json(['count' => $cart->item_count]);
    }

    /**
     * Get cart summary for AJAX requests.
     */
    public function summary()
    {
        $cart = $this->getOrCreateCart();
        $cart->load('cartItems.product');
        
        return response()->json([
            'item_count' => $cart->item_count,
            'subtotal' => $cart->formatted_subtotal,
            'total' => $cart->formatted_total,
            'items' => $cart->cartItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total_price' => $item->total_price,
                    'product_image' => $item->product->featured_image_url ?? null,
                ];
            }),
        ]);
    }

    /**
     * Apply discount code to cart.
     */
    public function applyDiscount(Request $request)
    {
        $request->validate([
            'discount_code' => 'required|string',
        ]);

        $cart = $this->getOrCreateCart();
        
        // This is a simplified discount system
        // In a real application, you would validate against a discount codes table
        $discountCode = $request->discount_code;
        
        if (strtoupper($discountCode) === 'SAVE10') {
            $discountAmount = $cart->subtotal * 0.10;
            $cart->update(['discount_amount' => $discountAmount]);
            $cart->calculateTotals();
            
            return back()->with('success', 'Discount code applied successfully!');
        }
        
        return back()->with('error', 'Invalid discount code.');
    }

    /**
     * Remove discount from cart.
     */
    public function removeDiscount()
    {
        $cart = $this->getOrCreateCart();
        $cart->update(['discount_amount' => 0]);
        $cart->calculateTotals();
        
        return back()->with('success', 'Discount removed successfully!');
    }

    /**
     * Get or create a cart for the current user/session.
     */
    private function getOrCreateCart()
    {
        if (Auth::check()) {
            $cart = Cart::byUser(Auth::id())->active()->first();
        } else {
            $sessionId = session()->getId();
            $cart = Cart::bySession($sessionId)->active()->first();
        }

        if (!$cart) {
            $cart = Cart::create([
                'user_id' => Auth::id(),
                'session_id' => Auth::check() ? null : session()->getId(),
                'guest_email' => Auth::check() ? null : session('guest_email'),
            ]);
        }

        return $cart;
    }

    /**
     * Merge guest cart with user cart after login.
     */
    public function mergeGuestCart()
    {
        if (!Auth::check()) {
            return;
        }

        $sessionId = session()->getId();
        $guestCart = Cart::bySession($sessionId)->active()->first();
        
        if ($guestCart) {
            $userCart = Cart::byUser(Auth::id())->active()->first();
            
            if (!$userCart) {
                $guestCart->update(['user_id' => Auth::id(), 'session_id' => null]);
            } else {
                // Merge items from guest cart to user cart
                foreach ($guestCart->cartItems as $item) {
                    $userCart->addItem($item->product_id, $item->quantity, $item->product_options ?? []);
                }
                $guestCart->delete();
            }
        }
    }
}
