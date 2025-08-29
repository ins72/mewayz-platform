<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'short_description',
        'price',
        'compare_price',
        'stock_quantity',
        'sku',
        'barcode',
        'weight',
        'dimensions',
        'category_id',
        'images',
        'featured_image',
        'is_active',
        'is_featured',
        'is_on_sale',
        'sale_price',
        'sale_start_date',
        'sale_end_date',
        'tags',
        'attributes',
        'view_count',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'weight' => 'decimal:2',
        'images' => 'array',
        'tags' => 'array',
        'attributes' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'is_on_sale' => 'boolean',
        'sale_price' => 'decimal:2',
        'sale_start_date' => 'date',
        'sale_end_date' => 'date',
        'view_count' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeOnSale($query)
    {
        return $query->where('is_on_sale', true)
                    ->where('sale_start_date', '<=', Carbon::now())
                    ->where('sale_end_date', '>=', Carbon::now());
    }

    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function getCurrentPriceAttribute()
    {
        if ($this->is_on_sale && $this->sale_price && 
            Carbon::now()->between($this->sale_start_date, $this->sale_end_date)) {
            return $this->sale_price;
        }
        return $this->price;
    }

    public function getDiscountPercentageAttribute()
    {
        if ($this->compare_price && $this->compare_price > $this->current_price) {
            return round((($this->compare_price - $this->current_price) / $this->compare_price) * 100);
        }
        return 0;
    }

    public function getFeaturedImageUrlAttribute()
    {
        if ($this->featured_image) {
            return asset('storage/' . $this->featured_image);
        }
        if ($this->images && count($this->images) > 0) {
            return asset('storage/' . $this->images[0]);
        }
        return asset('images/placeholder-product.jpg');
    }

    public function getImagesUrlsAttribute()
    {
        if ($this->images) {
            return collect($this->images)->map(function ($image) {
                return asset('storage/' . $image);
            });
        }
        return collect([$this->featured_image_url]);
    }

    public function getAverageRatingAttribute()
    {
        return $this->reviews()->where('is_approved', true)->avg('rating') ?? 0;
    }

    public function getReviewCountAttribute()
    {
        return $this->reviews()->where('is_approved', true)->count();
    }

    public function incrementViewCount()
    {
        $this->increment('view_count');
    }

    public function isInStock()
    {
        return $this->stock_quantity > 0;
    }

    public function hasStock($quantity = 1)
    {
        return $this->stock_quantity >= $quantity;
    }
}
