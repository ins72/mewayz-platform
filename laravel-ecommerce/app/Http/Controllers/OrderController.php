<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of the user's orders.
     */
    public function index()
    {
        $orders = Order::where('user_id', Auth::id())
            ->with(['orderItems.product'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return view('orders.index', compact('orders'));
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order)
    {
        // Check if user owns this order or is admin
        if ($order->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            abort(403);
        }

        $order->load(['orderItems.product', 'user']);

        return view('orders.show', compact('order'));
    }

    /**
     * Update the order status (admin only).
     */
    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled,refunded'
        ]);

        $oldStatus = $order->status;
        $newStatus = $request->status;

        // Check if status change is allowed
        if (!$this->canChangeStatus($oldStatus, $newStatus)) {
            return back()->with('error', 'Invalid status change.');
        }

        // Update order status
        switch ($newStatus) {
            case 'shipped':
                $order->markAsShipped();
                break;
            case 'delivered':
                $order->markAsDelivered();
                break;
            case 'cancelled':
                $order->markAsCancelled();
                break;
            case 'refunded':
                $order->markAsRefunded();
                break;
            default:
                $order->update(['status' => $newStatus]);
        }

        // Log the status change
        activity()
            ->performedOn($order)
            ->log("Order status changed from {$oldStatus} to {$newStatus}");

        return back()->with('success', 'Order status updated successfully.');
    }

    /**
     * Mark order as shipped.
     */
    public function markAsShipped(Order $order)
    {
        if (!$order->canBeShipped()) {
            return back()->with('error', 'Order cannot be marked as shipped.');
        }

        $order->markAsShipped();

        return back()->with('success', 'Order marked as shipped successfully.');
    }

    /**
     * Mark order as delivered.
     */
    public function markAsDelivered(Order $order)
    {
        if (!$order->canBeDelivered()) {
            return back()->with('error', 'Order cannot be marked as delivered.');
        }

        $order->markAsDelivered();

        return back()->with('success', 'Order marked as delivered successfully.');
    }

    /**
     * Cancel an order.
     */
    public function cancel(Order $order)
    {
        if (!$order->canBeCancelled()) {
            return back()->with('error', 'Order cannot be cancelled.');
        }

        DB::transaction(function () use ($order) {
            // Restore product stock
            foreach ($order->orderItems as $item) {
                if ($item->product) {
                    $item->product->increment('stock_quantity', $item->quantity);
                }
            }

            // Update order status
            $order->markAsCancelled();
        });

        return back()->with('success', 'Order cancelled successfully.');
    }

    /**
     * Request a refund for an order.
     */
    public function requestRefund(Request $request, Order $order)
    {
        $request->validate([
            'refund_reason' => 'required|string|max:500'
        ]);

        if (!$order->canBeRefunded()) {
            return back()->with('error', 'Order cannot be refunded.');
        }

        // Create refund request (you might want to create a separate Refund model)
        $order->update([
            'status' => 'refund_requested',
            'notes' => $order->notes . "\n\nRefund Request: " . $request->refund_reason
        ]);

        return back()->with('success', 'Refund request submitted successfully.');
    }

    /**
     * Download order invoice (PDF).
     */
    public function downloadInvoice(Order $order)
    {
        // Check if user owns this order or is admin
        if ($order->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            abort(403);
        }

        // Generate PDF invoice (you'll need to implement this)
        // For now, just return a view
        return view('orders.invoice', compact('order'));
    }

    /**
     * Track order status.
     */
    public function track(Order $order)
    {
        // Check if user owns this order or is admin
        if ($order->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            abort(403);
        }

        return view('orders.track', compact('order'));
    }

    /**
     * Get order tracking information via API.
     */
    public function getTrackingInfo(Order $order)
    {
        // Check if user owns this order or is admin
        if ($order->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $trackingInfo = [
            'order_number' => $order->order_number,
            'status' => $order->status,
            'status_text' => $order->status_text,
            'created_at' => $order->created_at->format('Y-m-d H:i:s'),
            'shipped_at' => $order->shipped_at ? $order->shipped_at->format('Y-m-d H:i:s') : null,
            'delivered_at' => $order->delivered_at ? $order->delivered_at->format('Y-m-d H:i:s') : null,
            'estimated_delivery' => $this->getEstimatedDelivery($order),
            'tracking_events' => $this->getTrackingEvents($order)
        ];

        return response()->json($trackingInfo);
    }

    /**
     * Check if status change is allowed.
     */
    private function canChangeStatus($oldStatus, $newStatus)
    {
        $allowedTransitions = [
            'pending' => ['processing', 'cancelled'],
            'processing' => ['shipped', 'cancelled'],
            'shipped' => ['delivered', 'cancelled'],
            'delivered' => ['refunded'],
            'cancelled' => [],
            'refunded' => []
        ];

        return in_array($newStatus, $allowedTransitions[$oldStatus] ?? []);
    }

    /**
     * Get estimated delivery date.
     */
    private function getEstimatedDelivery($order)
    {
        if ($order->shipped_at) {
            // Add 3-7 business days for delivery
            $deliveryDays = rand(3, 7);
            return $order->shipped_at->addWeekdays($deliveryDays)->format('Y-m-d');
        }

        if ($order->status === 'processing') {
            // Add 1-3 business days for shipping + 3-7 for delivery
            $shippingDays = rand(1, 3);
            $deliveryDays = rand(3, 7);
            return now()->addWeekdays($shippingDays + $deliveryDays)->format('Y-m-d');
        }

        return null;
    }

    /**
     * Get tracking events for the order.
     */
    private function getTrackingEvents($order)
    {
        $events = [
            [
                'date' => $order->created_at->format('Y-m-d H:i:s'),
                'status' => 'Order Placed',
                'description' => 'Your order has been placed successfully.',
                'location' => 'Online Store'
            ]
        ];

        if ($order->status === 'processing') {
            $events[] = [
                'date' => $order->created_at->addMinutes(rand(30, 120))->format('Y-m-d H:i:s'),
                'status' => 'Processing',
                'description' => 'Your order is being processed and prepared for shipping.',
                'location' => 'Warehouse'
            ];
        }

        if ($order->shipped_at) {
            $events[] = [
                'date' => $order->shipped_at->format('Y-m-d H:i:s'),
                'status' => 'Shipped',
                'description' => 'Your order has been shipped and is on its way.',
                'location' => 'Shipping Center'
            ];
        }

        if ($order->delivered_at) {
            $events[] = [
                'date' => $order->delivered_at->format('Y-m-d H:i:s'),
                'status' => 'Delivered',
                'description' => 'Your order has been delivered successfully.',
                'location' => 'Delivery Address'
            ];
        }

        if ($order->status === 'cancelled') {
            $events[] = [
                'date' => $order->updated_at->format('Y-m-d H:i:s'),
                'status' => 'Cancelled',
                'description' => 'Your order has been cancelled.',
                'location' => 'Online Store'
            ];
        }

        return $events;
    }
}
