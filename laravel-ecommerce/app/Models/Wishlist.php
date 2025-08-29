<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wishlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
    ];

    /**
     * Get the user that owns the wishlist item.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product in the wishlist.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Scope a query to only include wishlist items for a specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to only include wishlist items with active products.
     */
    public function scopeWithActiveProducts($query)
    {
        return $query->whereHas('product', function($q) {
            $q->where('is_active', true);
        });
    }

    /**
     * Scope a query to only include wishlist items with in-stock products.
     */
    public function scopeWithInStockProducts($query)
    {
        return $query->whereHas('product', function($q) {
            $q->where('stock_quantity', '>', 0);
        });
    }

    /**
     * Check if the product is in stock.
     */
    public function isProductInStock()
    {
        return $this->product && $this->product->isInStock();
    }

    /**
     * Check if the product is on sale.
     */
    public function isProductOnSale()
    {
        return $this->product && $this->product->is_on_sale;
    }

    /**
     * Get the current price of the product.
     */
    public function getCurrentPriceAttribute()
    {
        return $this->product ? $this->product->current_price : 0;
    }

    /**
     * Get the formatted current price.
     */
    public function getFormattedCurrentPriceAttribute()
    {
        return '$' . number_format($this->current_price, 2);
    }

    /**
     * Check if the product has a discount.
     */
    public function hasDiscount()
    {
        return $this->product && $this->product->discount_percentage > 0;
    }

    /**
     * Get the discount percentage.
     */
    public function getDiscountPercentageAttribute()
    {
        return $this->product ? $this->product->discount_percentage : 0;
    }

    /**
     * Check if the product is featured.
     */
    public function isProductFeatured()
    {
        return $this->product && $this->product->is_featured;
    }

    /**
     * Get the product rating.
     */
    public function getProductRatingAttribute()
    {
        return $this->product ? $this->product->average_rating : 0;
    }

    /**
     * Get the product review count.
     */
    public function getProductReviewCountAttribute()
    {
        return $this->product ? $this->product->review_count : 0;
    }

    /**
     * Check if the user can add this product to cart.
     */
    public function canAddToCart()
    {
        return $this->product && $this->product->isInStock();
    }

    /**
     * Move wishlist item to cart.
     */
    public function moveToCart($quantity = 1)
    {
        if (!$this->canAddToCart()) {
            return false;
        }

        // Get or create user's cart
        $cart = Cart::firstOrCreate([
            'user_id' => $this->user_id,
        ]);

        // Add product to cart
        $cart->addItem($this->product, $quantity);

        // Remove from wishlist
        $this->delete();

        return true;
    }

    /**
     * Check if the wishlist item is recent (added within last 30 days).
     */
    public function isRecent()
    {
        return $this->created_at->diffInDays(now()) <= 30;
    }

    /**
     * Get the time since the item was added to wishlist.
     */
    public function getTimeSinceAddedAttribute()
    {
        return $this->created_at->diffForHumans();
    }
}
