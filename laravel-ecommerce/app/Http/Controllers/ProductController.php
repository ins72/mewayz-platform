<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class ProductController extends Controller
{
    public function index(Request $request): View
    {
        $query = Product::with('category')->active();

        // Search functionality
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->has('category')) {
            $query->where('category_id', $request->get('category'));
        }

        // Price filter
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->get('min_price'));
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->get('max_price'));
        }

        // Sort options
        $sort = $request->get('sort', 'newest');
        switch ($sort) {
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'name':
                $query->orderBy('name', 'asc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $products = $query->paginate(12);
        $categories = Category::active()->ordered()->get();

        return view('products.index', compact('products', 'categories'));
    }

    public function show(Product $product): View
    {
        $product->load('category');
        
        // Get related products
        $relatedProducts = Product::active()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->limit(4)
            ->get();

        return view('products.show', compact('product', 'relatedProducts'));
    }

    public function featured(): View
    {
        $products = Product::with('category')
            ->active()
            ->featured()
            ->orderBy('sort_order')
            ->limit(8)
            ->get();

        return view('products.featured', compact('products'));
    }

    public function category(Category $category): View
    {
        $products = Product::with('category')
            ->active()
            ->where('category_id', $category->id)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(12);

        return view('products.category', compact('category', 'products'));
    }
}