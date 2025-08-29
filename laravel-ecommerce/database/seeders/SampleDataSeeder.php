<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Create regular user
        $user = User::create([
            'name' => 'John Doe',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Create categories
        $categories = [
            [
                'name' => 'Electronics',
                'description' => 'Latest electronic devices and gadgets',
                'is_active' => true,
                'sort_order' => 1
            ],
            [
                'name' => 'Clothing',
                'description' => 'Fashion and apparel for all ages',
                'is_active' => true,
                'sort_order' => 2
            ],
            [
                'name' => 'Home & Garden',
                'description' => 'Everything for your home and garden',
                'is_active' => true,
                'sort_order' => 3
            ],
            [
                'name' => 'Books',
                'description' => 'Books, magazines, and educational materials',
                'is_active' => true,
                'sort_order' => 4
            ],
            [
                'name' => 'Sports & Outdoors',
                'description' => 'Sports equipment and outdoor gear',
                'is_active' => true,
                'sort_order' => 5
            ]
        ];

        foreach ($categories as $categoryData) {
            $categoryData['slug'] = Str::slug($categoryData['name']);
            Category::create($categoryData);
        }

        // Get category IDs
        $electronicsId = Category::where('name', 'Electronics')->first()->id;
        $clothingId = Category::where('name', 'Clothing')->first()->id;
        $homeId = Category::where('name', 'Home & Garden')->first()->id;
        $booksId = Category::where('name', 'Books')->first()->id;
        $sportsId = Category::where('name', 'Sports & Outdoors')->first()->id;

        // Create products
        $products = [
            // Electronics
            [
                'name' => 'Smartphone X1',
                'description' => 'Latest smartphone with advanced features, high-resolution camera, and long battery life.',
                'short_description' => 'Advanced smartphone with premium features',
                'price' => 699.99,
                'compare_price' => 799.99,
                'stock_quantity' => 50,
                'sku' => 'SMART-X1-001',
                'category_id' => $electronicsId,
                'is_active' => true,
                'is_featured' => true,
                'is_on_sale' => true,
                'sale_price' => 649.99,
                'sale_start_date' => now()->subDays(5),
                'sale_end_date' => now()->addDays(25),
                'tags' => ['smartphone', 'mobile', 'technology'],
                'attributes' => ['color' => 'Black', 'storage' => '128GB', 'ram' => '8GB']
            ],
            [
                'name' => 'Laptop Pro',
                'description' => 'Professional laptop for work and gaming with high performance processor and graphics.',
                'short_description' => 'Professional laptop for work and gaming',
                'price' => 1299.99,
                'compare_price' => 1499.99,
                'stock_quantity' => 25,
                'sku' => 'LAPTOP-PRO-001',
                'category_id' => $electronicsId,
                'is_active' => true,
                'is_featured' => true,
                'is_on_sale' => false,
                'tags' => ['laptop', 'computer', 'work'],
                'attributes' => ['processor' => 'Intel i7', 'ram' => '16GB', 'storage' => '512GB SSD']
            ],
            [
                'name' => 'Wireless Headphones',
                'description' => 'Premium wireless headphones with noise cancellation and long battery life.',
                'short_description' => 'Premium wireless headphones with noise cancellation',
                'price' => 199.99,
                'compare_price' => 249.99,
                'stock_quantity' => 100,
                'sku' => 'HEAD-WIRE-001',
                'category_id' => $electronicsId,
                'is_active' => true,
                'is_featured' => false,
                'is_on_sale' => true,
                'sale_price' => 179.99,
                'sale_start_date' => now()->subDays(10),
                'sale_end_date' => now()->addDays(20),
                'tags' => ['headphones', 'wireless', 'audio'],
                'attributes' => ['color' => 'White', 'battery' => '30 hours', 'bluetooth' => '5.0']
            ],

            // Clothing
            [
                'name' => 'Classic T-Shirt',
                'description' => 'Comfortable cotton t-shirt available in multiple colors and sizes.',
                'short_description' => 'Comfortable cotton t-shirt',
                'price' => 24.99,
                'compare_price' => 29.99,
                'stock_quantity' => 200,
                'sku' => 'TSHIRT-CLASSIC-001',
                'category_id' => $clothingId,
                'is_active' => true,
                'is_featured' => false,
                'is_on_sale' => true,
                'sale_price' => 19.99,
                'sale_start_date' => now()->subDays(15),
                'sale_end_date' => now()->addDays(15),
                'tags' => ['t-shirt', 'clothing', 'casual'],
                'attributes' => ['material' => 'Cotton', 'fit' => 'Regular', 'sleeve' => 'Short']
            ],
            [
                'name' => 'Denim Jeans',
                'description' => 'High-quality denim jeans with perfect fit and durability.',
                'short_description' => 'High-quality denim jeans',
                'price' => 79.99,
                'compare_price' => 89.99,
                'stock_quantity' => 75,
                'sku' => 'JEANS-DENIM-001',
                'category_id' => $clothingId,
                'is_active' => true,
                'is_featured' => true,
                'is_on_sale' => false,
                'tags' => ['jeans', 'denim', 'pants'],
                'attributes' => ['material' => 'Denim', 'fit' => 'Slim', 'color' => 'Blue']
            ],

            // Home & Garden
            [
                'name' => 'Coffee Maker',
                'description' => 'Automatic coffee maker with programmable timer and multiple brewing options.',
                'short_description' => 'Automatic coffee maker with timer',
                'price' => 89.99,
                'compare_price' => 119.99,
                'stock_quantity' => 60,
                'sku' => 'COFFEE-MAKER-001',
                'category_id' => $homeId,
                'is_active' => true,
                'is_featured' => false,
                'is_on_sale' => true,
                'sale_price' => 74.99,
                'sale_start_date' => now()->subDays(8),
                'sale_end_date' => now()->addDays(22),
                'tags' => ['coffee', 'kitchen', 'appliance'],
                'attributes' => ['capacity' => '12 cups', 'timer' => 'Yes', 'color' => 'Black']
            ],
            [
                'name' => 'Garden Tool Set',
                'description' => 'Complete set of essential garden tools for all your gardening needs.',
                'short_description' => 'Complete garden tool set',
                'price' => 149.99,
                'compare_price' => 199.99,
                'stock_quantity' => 30,
                'sku' => 'GARDEN-TOOLS-001',
                'category_id' => $homeId,
                'is_active' => true,
                'is_featured' => true,
                'is_on_sale' => false,
                'tags' => ['garden', 'tools', 'outdoor'],
                'attributes' => ['pieces' => '15', 'material' => 'Stainless Steel', 'case' => 'Included']
            ],

            // Books
            [
                'name' => 'Programming Guide',
                'description' => 'Comprehensive guide to modern programming languages and best practices.',
                'short_description' => 'Comprehensive programming guide',
                'price' => 49.99,
                'compare_price' => 59.99,
                'stock_quantity' => 150,
                'sku' => 'BOOK-PROG-001',
                'category_id' => $booksId,
                'is_active' => true,
                'is_featured' => false,
                'is_on_sale' => true,
                'sale_price' => 39.99,
                'sale_start_date' => now()->subDays(12),
                'sale_end_date' => now()->addDays(18),
                'tags' => ['book', 'programming', 'education'],
                'attributes' => ['pages' => '450', 'format' => 'Paperback', 'language' => 'English']
            ],

            // Sports & Outdoors
            [
                'name' => 'Yoga Mat',
                'description' => 'Premium yoga mat with excellent grip and cushioning for all types of yoga.',
                'short_description' => 'Premium yoga mat with excellent grip',
                'price' => 39.99,
                'compare_price' => 49.99,
                'stock_quantity' => 120,
                'sku' => 'YOGA-MAT-001',
                'category_id' => $sportsId,
                'is_active' => true,
                'is_featured' => false,
                'is_on_sale' => true,
                'sale_price' => 34.99,
                'sale_start_date' => now()->subDays(6),
                'sale_end_date' => now()->addDays(24),
                'tags' => ['yoga', 'fitness', 'exercise'],
                'attributes' => ['thickness' => '6mm', 'material' => 'PVC', 'color' => 'Purple']
            ],
            [
                'name' => 'Running Shoes',
                'description' => 'Professional running shoes with advanced cushioning and support technology.',
                'short_description' => 'Professional running shoes',
                'price' => 129.99,
                'compare_price' => 159.99,
                'stock_quantity' => 80,
                'sku' => 'SHOES-RUN-001',
                'category_id' => $sportsId,
                'is_active' => true,
                'is_featured' => true,
                'is_on_sale' => false,
                'tags' => ['shoes', 'running', 'sports'],
                'attributes' => ['type' => 'Road Running', 'weight' => 'Lightweight', 'drop' => '8mm']
            ]
        ];

        foreach ($products as $productData) {
            $productData['slug'] = Str::slug($productData['name']);
            $product = Product::create($productData);
            
            // Add some reviews for products
            if (rand(1, 3) > 1) {
                Review::create([
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                    'rating' => rand(4, 5),
                    'title' => 'Great Product!',
                    'comment' => 'This product exceeded my expectations. Highly recommended!',
                    'is_approved' => true,
                    'is_verified_purchase' => true
                ]);
            }
        }

        // Create some sample orders
        $this->createSampleOrders($user);

        $this->command->info('Sample data seeded successfully!');
        $this->command->info('Admin user: admin@example.com / password');
        $this->command->info('Regular user: user@example.com / password');
    }

    private function createSampleOrders($user)
    {
        // Sample order 1
        $order1 = Order::create([
            'user_id' => $user->id,
            'status' => 'delivered',
            'subtotal' => 199.98,
            'tax_amount' => 19.99,
            'shipping_amount' => 9.99,
            'discount_amount' => 0,
            'total_amount' => 229.96,
            'currency' => 'USD',
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => '+1234567890',
            'shipping_address' => '123 Main St',
            'shipping_city' => 'New York',
            'shipping_state' => 'NY',
            'shipping_zip' => '10001',
            'shipping_country' => 'US',
            'billing_address' => '123 Main St',
            'billing_city' => 'New York',
            'billing_state' => 'NY',
            'billing_zip' => '10001',
            'billing_country' => 'US',
            'payment_method' => 'credit_card',
            'payment_status' => 'paid',
            'shipped_at' => now()->subDays(5),
            'delivered_at' => now()->subDays(2)
        ]);

        // Add order items
        $product1 = Product::where('name', 'Classic T-Shirt')->first();
        $product2 = Product::where('name', 'Yoga Mat')->first();

        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => $product1->id,
            'product_name' => $product1->name,
            'product_sku' => $product1->sku,
            'quantity' => 2,
            'unit_price' => 19.99,
            'total_price' => 39.98
        ]);

        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => $product2->id,
            'product_name' => $product2->name,
            'product_sku' => $product2->sku,
            'quantity' => 1,
            'unit_price' => 34.99,
            'total_price' => 34.99
        ]);

        // Sample order 2
        $order2 = Order::create([
            'user_id' => $user->id,
            'status' => 'processing',
            'subtotal' => 129.99,
            'tax_amount' => 13.00,
            'shipping_amount' => 9.99,
            'discount_amount' => 0,
            'total_amount' => 152.98,
            'currency' => 'USD',
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => '+1234567890',
            'shipping_address' => '123 Main St',
            'shipping_city' => 'New York',
            'shipping_state' => 'NY',
            'shipping_zip' => '10001',
            'shipping_country' => 'US',
            'billing_address' => '123 Main St',
            'billing_city' => 'New York',
            'billing_state' => 'NY',
            'billing_zip' => '10001',
            'billing_country' => 'US',
            'payment_method' => 'paypal',
            'payment_status' => 'paid'
        ]);

        // Add order items
        $product3 = Product::where('name', 'Denim Jeans')->first();

        OrderItem::create([
            'order_id' => $order2->id,
            'product_id' => $product3->id,
            'product_name' => $product3->name,
            'product_sku' => $product3->sku,
            'quantity' => 1,
            'unit_price' => 79.99,
            'total_price' => 79.99
        ]);
    }
}
