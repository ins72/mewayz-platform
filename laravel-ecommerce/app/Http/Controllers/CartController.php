<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;

class CartController extends Controller
{
    public function index(): View
    {
        $cart = $this->getOrCreateCart();
        $cart->load('items.product');

        return view('cart.index', compact('cart'));
    }

    public function add(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'options' => 'nullable|array',
        ]);

        $product = Product::findOrFail($request->product_id);
        
        if ($product->quantity < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Not enough stock available.'
            ], 400);
        }

        $cart = $this->getOrCreateCart();
        
        // Check if product already exists in cart
        $existingItem = $cart->items()->where('product_id', $product->id)->first();
        
        if ($existingItem) {
            $existingItem->update([
                'quantity' => $existingItem->quantity + $request->quantity
            ]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'options' => $request->options ?? [],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Product added to cart successfully.',
            'cart_count' => $cart->items()->sum('quantity')
        ]);
    }

    public function update(Request $request, CartItem $item): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        if ($item->product->quantity < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Not enough stock available.'
            ], 400);
        }

        $item->update(['quantity' => $request->quantity]);

        return response()->json([
            'success' => true,
            'message' => 'Cart updated successfully.',
            'cart_total' => $this->getCartTotal($item->cart)
        ]);
    }

    public function remove(CartItem $item): JsonResponse
    {
        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product removed from cart.',
            'cart_count' => $item->cart->items()->sum('quantity')
        ]);
    }

    public function clear(): JsonResponse
    {
        $cart = $this->getOrCreateCart();
        $cart->items()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared successfully.'
        ]);
    }

    private function getOrCreateCart(): Cart
    {
        if (auth()->check()) {
            return Cart::firstOrCreate(['user_id' => auth()->id()]);
        }

        $sessionId = session()->getId();
        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }

    private function getCartTotal(Cart $cart): float
    {
        return $cart->items->sum(function ($item) {
            return $item->product->price * $item->quantity;
        });
    }
}