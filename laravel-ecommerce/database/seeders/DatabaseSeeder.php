<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Create sample categories
        $categories = [
            [
                'name' => 'Electronics',
                'slug' => 'electronics',
                'description' => 'Latest electronic gadgets and devices',
                'sort_order' => 1,
            ],
            [
                'name' => 'Fashion',
                'slug' => 'fashion',
                'description' => 'Trendy clothing and accessories',
                'sort_order' => 2,
            ],
            [
                'name' => 'Home & Garden',
                'slug' => 'home-garden',
                'description' => 'Everything for your home and garden',
                'sort_order' => 3,
            ],
            [
                'name' => 'Sports & Outdoors',
                'slug' => 'sports-outdoors',
                'description' => 'Sports equipment and outdoor gear',
                'sort_order' => 4,
            ],
            [
                'name' => 'Books & Media',
                'slug' => 'books-media',
                'description' => 'Books, movies, and music',
                'sort_order' => 5,
            ],
        ];

        foreach ($categories as $categoryData) {
            Category::create($categoryData);
        }

        // Create sample products
        $products = [
            [
                'name' => 'Wireless Bluetooth Headphones',
                'slug' => 'wireless-bluetooth-headphones',
                'description' => 'High-quality wireless headphones with noise cancellation and long battery life.',
                'price' => 99.99,
                'compare_price' => 129.99,
                'quantity' => 50,
                'sku' => 'WH-001',
                'category_id' => 1,
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Smartphone Case',
                'slug' => 'smartphone-case',
                'description' => 'Durable protective case for smartphones with shock absorption.',
                'price' => 19.99,
                'quantity' => 100,
                'sku' => 'SC-001',
                'category_id' => 1,
                'sort_order' => 2,
            ],
            [
                'name' => 'Cotton T-Shirt',
                'slug' => 'cotton-tshirt',
                'description' => 'Comfortable 100% cotton t-shirt available in multiple colors.',
                'price' => 24.99,
                'quantity' => 75,
                'sku' => 'CT-001',
                'category_id' => 2,
                'sort_order' => 1,
            ],
            [
                'name' => 'Denim Jeans',
                'slug' => 'denim-jeans',
                'description' => 'Classic denim jeans with perfect fit and durability.',
                'price' => 59.99,
                'compare_price' => 79.99,
                'quantity' => 60,
                'sku' => 'DJ-001',
                'category_id' => 2,
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Garden Tool Set',
                'slug' => 'garden-tool-set',
                'description' => 'Complete set of essential garden tools for every gardener.',
                'price' => 89.99,
                'quantity' => 30,
                'sku' => 'GT-001',
                'category_id' => 3,
                'sort_order' => 1,
            ],
            [
                'name' => 'Coffee Table',
                'slug' => 'coffee-table',
                'description' => 'Modern wooden coffee table perfect for living rooms.',
                'price' => 199.99,
                'quantity' => 20,
                'sku' => 'CT-002',
                'category_id' => 3,
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Yoga Mat',
                'slug' => 'yoga-mat',
                'description' => 'Premium yoga mat with excellent grip and cushioning.',
                'price' => 39.99,
                'quantity' => 45,
                'sku' => 'YM-001',
                'category_id' => 4,
                'sort_order' => 1,
            ],
            [
                'name' => 'Running Shoes',
                'slug' => 'running-shoes',
                'description' => 'Professional running shoes with advanced cushioning technology.',
                'price' => 129.99,
                'compare_price' => 159.99,
                'quantity' => 35,
                'sku' => 'RS-001',
                'category_id' => 4,
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Programming Book',
                'slug' => 'programming-book',
                'description' => 'Comprehensive guide to modern programming techniques.',
                'price' => 49.99,
                'quantity' => 80,
                'sku' => 'PB-001',
                'category_id' => 5,
                'sort_order' => 1,
            ],
            [
                'name' => 'Bluetooth Speaker',
                'slug' => 'bluetooth-speaker',
                'description' => 'Portable bluetooth speaker with amazing sound quality.',
                'price' => 79.99,
                'quantity' => 40,
                'sku' => 'BS-001',
                'category_id' => 1,
                'sort_order' => 3,
            ],
        ];

        foreach ($products as $productData) {
            Product::create($productData);
        }

        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin user created: admin@example.com / password');
        $this->command->info('Sample categories and products added.');
    }
}
