<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use App\Models\Wishlist;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display the user's dashboard.
     */
    public function dashboard()
    {
        $user = Auth::user();
        
        $recentOrders = Order::where('user_id', $user->id)
            ->with(['orderItems.product'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
            
        $wishlistCount = Wishlist::where('user_id', $user->id)->count();
        $reviewCount = Review::where('user_id', $user->id)->count();
        
        $stats = [
            'total_orders' => Order::where('user_id', $user->id)->count(),
            'total_spent' => Order::where('user_id', $user->id)
                ->where('status', '!=', 'cancelled')
                ->sum('total_amount'),
            'wishlist_items' => $wishlistCount,
            'reviews_written' => $reviewCount
        ];

        return view('users.dashboard', compact('user', 'recentOrders', 'stats'));
    }

    /**
     * Display the user's profile.
     */
    public function profile()
    {
        $user = Auth::user();
        return view('users.profile', compact('user'));
    }

    /**
     * Show the form for editing the user's profile.
     */
    public function editProfile()
    {
        $user = Auth::user();
        return view('users.edit-profile', compact('user'));
    }

    /**
     * Update the user's profile.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100'
        ]);

        $data = $request->only([
            'name', 'email', 'phone', 'date_of_birth', 'gender',
            'address', 'city', 'state', 'zip_code', 'country'
        ]);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $avatarPath;
        }

        $user->update($data);

        return redirect()->route('users.profile')
            ->with('success', 'Profile updated successfully.');
    }

    /**
     * Show the form for changing password.
     */
    public function changePassword()
    {
        return view('users.change-password');
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return redirect()->route('users.profile')
            ->with('success', 'Password changed successfully.');
    }

    /**
     * Display the user's orders.
     */
    public function orders()
    {
        $orders = Order::where('user_id', Auth::id())
            ->with(['orderItems.product'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return view('users.orders', compact('orders'));
    }

    /**
     * Display the user's wishlist.
     */
    public function wishlist()
    {
        $wishlistItems = Wishlist::where('user_id', Auth::id())
            ->with(['product.category'])
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return view('users.wishlist', compact('wishlistItems'));
    }

    /**
     * Add product to wishlist.
     */
    public function addToWishlist(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $userId = Auth::id();
        $productId = $request->product_id;

        // Check if already in wishlist
        $existing = Wishlist::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Product already in wishlist',
                'in_wishlist' => true
            ]);
        }

        Wishlist::create([
            'user_id' => $userId,
            'product_id' => $productId
        ]);

        return response()->json([
            'message' => 'Product added to wishlist',
            'in_wishlist' => true
        ]);
    }

    /**
     * Remove product from wishlist.
     */
    public function removeFromWishlist(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $userId = Auth::id();
        $productId = $request->product_id;

        Wishlist::where('user_id', $userId)
            ->where('product_id', $productId)
            ->delete();

        return response()->json([
            'message' => 'Product removed from wishlist',
            'in_wishlist' => false
        ]);
    }

    /**
     * Move wishlist item to cart.
     */
    public function moveWishlistToCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $userId = Auth::id();
        $productId = $request->product_id;
        $quantity = $request->quantity;

        $wishlistItem = Wishlist::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if (!$wishlistItem) {
            return response()->json([
                'error' => 'Product not found in wishlist'
            ], 404);
        }

        // Add to cart
        $cart = \App\Models\Cart::firstOrCreate([
            'user_id' => $userId
        ]);

        $cart->addItem(\App\Models\Product::find($productId), $quantity);

        // Remove from wishlist
        $wishlistItem->delete();

        return response()->json([
            'message' => 'Product moved to cart successfully'
        ]);
    }

    /**
     * Display the user's reviews.
     */
    public function reviews()
    {
        $reviews = Review::where('user_id', Auth::id())
            ->with(['product.category'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return view('users.reviews', compact('reviews'));
    }

    /**
     * Show the form for editing a review.
     */
    public function editReview(Review $review)
    {
        // Check if user owns this review
        if ($review->user_id !== Auth::id()) {
            abort(403);
        }

        return view('users.edit-review', compact('review'));
    }

    /**
     * Update a review.
     */
    public function updateReview(Request $request, Review $review)
    {
        // Check if user owns this review
        if ($review->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'rating' => 'required|integer|between:1,5',
            'title' => 'nullable|string|max:255',
            'comment' => 'required|string|max:1000',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $data = $request->only(['rating', 'title', 'comment']);
        $data['is_approved'] = false; // Reset approval status

        // Handle image uploads
        if ($request->hasFile('images')) {
            $images = [];
            foreach ($request->file('images') as $image) {
                $imagePath = $image->store('reviews', 'public');
                $images[] = $imagePath;
            }
            $data['images'] = $images;
        }

        $review->update($data);

        return redirect()->route('users.reviews')
            ->with('success', 'Review updated successfully.');
    }

    /**
     * Delete a review.
     */
    public function deleteReview(Review $review)
    {
        // Check if user owns this review
        if ($review->user_id !== Auth::id()) {
            abort(403);
        }

        // Delete review images
        if ($review->images) {
            foreach ($review->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $review->delete();

        return redirect()->route('users.reviews')
            ->with('success', 'Review deleted successfully.');
    }

    /**
     * Display user's account settings.
     */
    public function settings()
    {
        $user = Auth::user();
        return view('users.settings', compact('user'));
    }

    /**
     * Update user's account settings.
     */
    public function updateSettings(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'email_notifications' => 'boolean',
            'marketing_emails' => 'boolean',
            'order_updates' => 'boolean',
            'product_recommendations' => 'boolean',
            'two_factor_enabled' => 'boolean'
        ]);

        $user->update($request->all());

        return redirect()->route('users.settings')
            ->with('success', 'Settings updated successfully.');
    }

    /**
     * Delete user account.
     */
    public function deleteAccount(Request $request)
    {
        $request->validate([
            'password' => 'required|current_password',
            'confirmation' => 'required|in:DELETE'
        ]);

        $user = Auth::user();

        // Delete user's data
        $user->orders()->delete();
        $user->wishlists()->delete();
        $user->reviews()->delete();
        
        // Delete user's cart
        $user->cart()->delete();

        // Delete user's avatar
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Delete user account
        $user->delete();

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('welcome')
            ->with('success', 'Your account has been deleted successfully.');
    }

    /**
     * Get user's order history.
     */
    public function getOrderHistory()
    {
        $orders = Order::where('user_id', Auth::id())
            ->select('id', 'order_number', 'status', 'total_amount', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    /**
     * Get user's wishlist count.
     */
    public function getWishlistCount()
    {
        $count = Wishlist::where('user_id', Auth::id())->count();
        
        return response()->json(['count' => $count]);
    }

    /**
     * Check if product is in user's wishlist.
     */
    public function checkWishlistStatus(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $inWishlist = Wishlist::where('user_id', Auth::id())
            ->where('product_id', $request->product_id)
            ->exists();

        return response()->json(['in_wishlist' => $inWishlist]);
    }
}