<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'product_id',
        'product_name',
        'product_sku',
        'quantity',
        'unit_price',
        'total_price',
        'product_options',
    ];

    protected $casts = [
        'product_options' => 'array',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    /**
     * Get the cart that owns the cart item.
     */
    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Get the product associated with the cart item.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the formatted unit price.
     */
    public function getFormattedUnitPriceAttribute()
    {
        return '$' . number_format($this->unit_price, 2);
    }

    /**
     * Get the formatted total price.
     */
    public function getFormattedTotalPriceAttribute()
    {
        return '$' . number_format($this->total_price, 2);
    }

    /**
     * Calculate the total price for this item.
     */
    public function calculateTotalPrice()
    {
        $this->total_price = $this->unit_price * $this->quantity;
        return $this->total_price;
    }

    /**
     * Get product options as a formatted string.
     */
    public function getFormattedOptionsAttribute()
    {
        if (!$this->product_options || empty($this->product_options)) {
            return '';
        }

        $options = [];
        foreach ($this->product_options as $key => $value) {
            $options[] = ucfirst($key) . ': ' . $value;
        }

        return implode(', ', $options);
    }

    /**
     * Check if the product is still available.
     */
    public function isProductAvailable()
    {
        return $this->product && $this->product->isInStock();
    }

    /**
     * Check if the requested quantity is available.
     */
    public function isQuantityAvailable()
    {
        return $this->product && $this->product->stock_quantity >= $this->quantity;
    }

    /**
     * Get the maximum available quantity for this product.
     */
    public function getMaxAvailableQuantityAttribute()
    {
        return $this->product ? $this->product->stock_quantity : 0;
    }

    /**
     * Check if this item can be updated to the requested quantity.
     */
    public function canUpdateQuantity($newQuantity)
    {
        return $this->product && $newQuantity > 0 && $newQuantity <= $this->product->stock_quantity;
    }

    /**
     * Update the quantity and recalculate total price.
     */
    public function updateQuantity($newQuantity)
    {
        if ($this->canUpdateQuantity($newQuantity)) {
            $this->quantity = $newQuantity;
            $this->calculateTotalPrice();
            $this->save();
            return true;
        }
        return false;
    }
}
