<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'guest_email',
        'subtotal',
        'tax_amount',
        'shipping_amount',
        'discount_amount',
        'total_amount',
        'currency',
        'expires_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeBySession($query, $sessionId)
    {
        return $query->where('session_id', $sessionId);
    }

    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', Carbon::now());
        });
    }

    public function getItemCountAttribute()
    {
        return $this->cartItems->sum('quantity');
    }

    public function getFormattedSubtotalAttribute()
    {
        return $this->currency . ' ' . number_format($this->subtotal, 2);
    }

    public function getFormattedTotalAttribute()
    {
        return $this->currency . ' ' . number_format($this->total_amount, 2);
    }

    public function calculateTotals()
    {
        $subtotal = $this->cartItems->sum(function ($item) {
            return $item->total_price;
        });

        $this->update([
            'subtotal' => $subtotal,
            'total_amount' => $subtotal + $this->tax_amount + $this->shipping_amount - $this->discount_amount,
        ]);
    }

    public function addItem($productId, $quantity = 1, $options = [])
    {
        $product = Product::findOrFail($productId);
        
        if (!$product->hasStock($quantity)) {
            throw new \Exception('Insufficient stock for this product.');
        }

        $existingItem = $this->cartItems()->where('product_id', $productId)->first();

        if ($existingItem) {
            $existingItem->update([
                'quantity' => $existingItem->quantity + $quantity,
                'total_price' => ($existingItem->quantity + $quantity) * $existingItem->unit_price,
            ]);
        } else {
            $this->cartItems()->create([
                'product_id' => $productId,
                'product_name' => $product->name,
                'product_sku' => $product->sku,
                'quantity' => $quantity,
                'unit_price' => $product->current_price,
                'total_price' => $product->current_price * $quantity,
                'product_options' => $options,
            ]);
        }

        $this->calculateTotals();
    }

    public function removeItem($cartItemId)
    {
        $this->cartItems()->where('id', $cartItemId)->delete();
        $this->calculateTotals();
    }

    public function updateItemQuantity($cartItemId, $quantity)
    {
        $cartItem = $this->cartItems()->findOrFail($cartItemId);
        
        if ($quantity <= 0) {
            $cartItem->delete();
        } else {
            $cartItem->update([
                'quantity' => $quantity,
                'total_price' => $cartItem->unit_price * $quantity,
            ]);
        }

        $this->calculateTotals();
    }

    public function clear()
    {
        $this->cartItems()->delete();
        $this->calculateTotals();
    }

    public function isEmpty()
    {
        return $this->cartItems->count() === 0;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($cart) {
            if (empty($cart->currency)) {
                $cart->currency = 'USD';
            }
        });
    }
}
