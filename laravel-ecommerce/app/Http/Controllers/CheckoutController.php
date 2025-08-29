<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class CheckoutController extends Controller
{
    /**
     * Display the checkout form.
     */
    public function index()
    {
        $cart = $this->getOrCreateCart();
        
        if ($cart->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        $cart->load('cartItems.product');
        
        return view('checkout.index', compact('cart'));
    }

    /**
     * Process the checkout and create the order.
     */
    public function process(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'shipping_address' => 'required|string|max:500',
            'shipping_city' => 'required|string|max:100',
            'shipping_state' => 'required|string|max:100',
            'shipping_zip' => 'required|string|max:20',
            'shipping_country' => 'required|string|max:100',
            'billing_address' => 'required|string|max:500',
            'billing_city' => 'required|string|max:100',
            'billing_state' => 'required|string|max:100',
            'billing_zip' => 'required|string|max:20',
            'billing_country' => 'required|string|max:100',
            'payment_method' => 'required|string|in:credit_card,paypal,stripe',
            'notes' => 'nullable|string|max:1000',
        ]);

        $cart = $this->getOrCreateCart();
        
        if ($cart->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        $cart->load('cartItems.product');

        // Validate stock availability
        foreach ($cart->cartItems as $item) {
            if (!$item->product->hasStock($item->quantity)) {
                return back()->with('error', "Insufficient stock for {$item->product->name}.");
            }
        }

        try {
            DB::beginTransaction();

            // Create the order
            $order = Order::create([
                'user_id' => Auth::id(),
                'status' => 'pending',
                'subtotal' => $cart->subtotal,
                'tax_amount' => $cart->tax_amount,
                'shipping_amount' => $cart->shipping_amount,
                'discount_amount' => $cart->discount_amount,
                'total_amount' => $cart->total_amount,
                'currency' => $cart->currency,
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'shipping_address' => $request->shipping_address,
                'shipping_city' => $request->shipping_city,
                'shipping_state' => $request->shipping_state,
                'shipping_zip' => $request->shipping_zip,
                'shipping_country' => $request->shipping_country,
                'billing_address' => $request->billing_address,
                'billing_city' => $request->billing_city,
                'billing_state' => $request->billing_state,
                'billing_zip' => $request->billing_zip,
                'billing_country' => $request->billing_country,
                'payment_method' => $request->payment_method,
                'payment_status' => 'pending',
                'notes' => $request->notes,
            ]);

            // Create order items
            foreach ($cart->cartItems as $cartItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'product_name' => $cartItem->product_name,
                    'product_sku' => $cartItem->product_sku,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $cartItem->unit_price,
                    'total_price' => $cartItem->total_price,
                    'product_options' => $cartItem->product_options,
                ]);

                // Update product stock
                $cartItem->product->decrement('stock_quantity', $cartItem->quantity);
            }

            // Clear the cart
            $cart->clear();

            DB::commit();

            // Send order confirmation email
            $this->sendOrderConfirmation($order);

            return redirect()->route('checkout.success', $order)->with('success', 'Order placed successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'An error occurred while processing your order. Please try again.');
        }
    }

    /**
     * Display order success page.
     */
    public function success(Order $order)
    {
        if (Auth::check() && $order->user_id !== Auth::id()) {
            abort(403);
        }

        return view('checkout.success', compact('order'));
    }

    /**
     * Display order confirmation page.
     */
    public function confirmation(Order $order)
    {
        if (Auth::check() && $order->user_id !== Auth::id()) {
            abort(403);
        }

        return view('checkout.confirmation', compact('order'));
    }

    /**
     * Calculate shipping costs.
     */
    public function calculateShipping(Request $request)
    {
        $request->validate([
            'zip_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
        ]);

        $cart = $this->getOrCreateCart();
        
        // This is a simplified shipping calculation
        // In a real application, you would integrate with shipping APIs
        $shippingAmount = $this->calculateShippingCost($request->zip_code, $request->country);
        
        $cart->update(['shipping_amount' => $shippingAmount]);
        $cart->calculateTotals();

        return response()->json([
            'shipping_amount' => $shippingAmount,
            'formatted_shipping' => $cart->currency . ' ' . number_format($shippingAmount, 2),
            'total_amount' => $cart->total_amount,
            'formatted_total' => $cart->currency . ' ' . number_format($cart->total_amount, 2),
        ]);
    }

    /**
     * Process payment (simplified).
     */
    public function processPayment(Request $request, Order $order)
    {
        $request->validate([
            'payment_token' => 'required|string',
        ]);

        // This is a simplified payment processing
        // In a real application, you would integrate with payment gateways
        try {
            // Simulate payment processing
            $paymentSuccessful = $this->processPaymentWithGateway($request->payment_token, $order);

            if ($paymentSuccessful) {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'processing',
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment processed successfully!',
                    'redirect_url' => route('checkout.success', $order),
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment failed. Please try again.',
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing payment.',
            ], 500);
        }
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
     * Calculate shipping cost (simplified).
     */
    private function calculateShippingCost($zipCode, $country)
    {
        // This is a simplified shipping calculation
        // In a real application, you would integrate with shipping APIs
        $baseShipping = 5.99;
        
        if ($country === 'US') {
            if (str_starts_with($zipCode, '1')) {
                return $baseShipping + 2.00; // East Coast
            } elseif (str_starts_with($zipCode, '9')) {
                return $baseShipping + 3.00; // West Coast
            } else {
                return $baseShipping + 1.50; // Central
            }
        } elseif ($country === 'CA') {
            return $baseShipping + 4.00; // Canada
        } else {
            return $baseShipping + 8.00; // International
        }
    }

    /**
     * Process payment with gateway (simplified).
     */
    private function processPaymentWithGateway($token, $order)
    {
        // This is a simplified payment processing
        // In a real application, you would integrate with Stripe, PayPal, etc.
        
        // Simulate 95% success rate
        return rand(1, 100) <= 95;
    }

    /**
     * Send order confirmation email.
     */
    private function sendOrderConfirmation($order)
    {
        // This is a simplified email sending
        // In a real application, you would use Laravel's Mail system
        
        try {
            // Mail::to($order->customer_email)->send(new OrderConfirmation($order));
            // For now, just log the email
            \Log::info("Order confirmation email sent to {$order->customer_email} for order {$order->order_number}");
        } catch (\Exception $e) {
            \Log::error("Failed to send order confirmation email: " . $e->getMessage());
        }
    }
}
