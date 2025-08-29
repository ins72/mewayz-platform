<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'rating',
        'title',
        'comment',
        'is_approved',
        'is_verified_purchase',
        'images',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_approved' => 'boolean',
        'is_verified_purchase' => 'boolean',
        'images' => 'array',
    ];

    /**
     * Get the user that wrote the review.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product being reviewed.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Scope a query to only include approved reviews.
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope a query to only include verified purchase reviews.
     */
    public function scopeVerifiedPurchase($query)
    {
        return $query->where('is_verified_purchase', true);
    }

    /**
     * Scope a query to only include reviews with a specific rating.
     */
    public function scopeWithRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }

    /**
     * Scope a query to only include recent reviews.
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Get the formatted rating as stars.
     */
    public function getRatingStarsAttribute()
    {
        $stars = '';
        for ($i = 1; $i <= 5; $i++) {
            if ($i <= $this->rating) {
                $stars .= '★';
            } else {
                $stars .= '☆';
            }
        }
        return $stars;
    }

    /**
     * Get the rating text.
     */
    public function getRatingTextAttribute()
    {
        $ratings = [
            1 => 'Poor',
            2 => 'Fair',
            3 => 'Good',
            4 => 'Very Good',
            5 => 'Excellent'
        ];

        return $ratings[$this->rating] ?? 'Unknown';
    }

    /**
     * Get the formatted images URLs.
     */
    public function getImagesUrlsAttribute()
    {
        if (!$this->images || empty($this->images)) {
            return [];
        }

        return array_map(function($image) {
            return asset('storage/' . $image);
        }, $this->images);
    }

    /**
     * Check if the review has images.
     */
    public function hasImages()
    {
        return !empty($this->images);
    }

    /**
     * Get the first image URL.
     */
    public function getFirstImageUrlAttribute()
    {
        if ($this->hasImages()) {
            return asset('storage/' . $this->images[0]);
        }
        return null;
    }

    /**
     * Approve the review.
     */
    public function approve()
    {
        $this->update(['is_approved' => true]);
    }

    /**
     * Reject the review.
     */
    public function reject()
    {
        $this->update(['is_approved' => false]);
    }

    /**
     * Mark as verified purchase.
     */
    public function markAsVerifiedPurchase()
    {
        $this->update(['is_verified_purchase' => true]);
    }

    /**
     * Check if the review can be edited by the user.
     */
    public function canBeEditedBy($user)
    {
        return $user && ($user->id === $this->user_id || $user->isAdmin());
    }

    /**
     * Check if the review can be deleted by the user.
     */
    public function canBeDeletedBy($user)
    {
        return $user && ($user->id === $this->user_id || $user->isAdmin());
    }

    /**
     * Get the review excerpt.
     */
    public function getExcerptAttribute($length = 100)
    {
        if (strlen($this->comment) <= $length) {
            return $this->comment;
        }

        return substr($this->comment, 0, $length) . '...';
    }

    /**
     * Check if the review is helpful (has high rating and detailed comment).
     */
    public function isHelpful()
    {
        return $this->rating >= 4 && strlen($this->comment) >= 50;
    }
}
