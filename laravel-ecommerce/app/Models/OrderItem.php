<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
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
     * Get the order that owns the order item.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product associated with the order item.
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
     * Check if the ordered quantity is still available.
     */
    public function isQuantityAvailable()
    {
        return $this->product && $this->product->stock_quantity >= $this->quantity;
    }
}
