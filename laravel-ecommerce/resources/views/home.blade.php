@extends('layouts.app')

@section('content')
<div class="bg-white">
    <!-- Hero Section -->
    <div class="relative bg-gray-900">
        <div class="absolute inset-0">
            <img class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" alt="Hero">
            <div class="absolute inset-0 bg-gray-900 mix-blend-multiply"></div>
        </div>
        <div class="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Welcome to Our Store</h1>
            <p class="mt-6 text-xl text-gray-300 max-w-3xl">Discover amazing products at unbeatable prices. Shop with confidence and enjoy exceptional service.</p>
            <div class="mt-10">
                <a href="{{ route('products.index') }}" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    Shop Now
                </a>
            </div>
        </div>
    </div>

    <!-- Featured Categories -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 class="text-3xl font-extrabold text-gray-900 text-center mb-12">Shop by Category</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @foreach(['Electronics', 'Fashion', 'Home & Garden'] as $category)
            <div class="group relative">
                <div class="relative w-full h-80 bg-white rounded-lg overflow-hidden group-hover:opacity-75 sm:aspect-w-2 sm:aspect-h-1 sm:h-64 lg:aspect-w-1 lg:aspect-h-1">
                    <img src="https://images.unsplash.com/photo-{{ $loop->index === 0 ? '1560472354-b33ff0c44a43' : ($loop->index === 1 ? '1445205170230-053b83016050' : '1586023492125-5374ae3edd23') }}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="{{ $category }}" class="w-full h-full object-center object-cover">
                </div>
                <h3 class="mt-6 text-sm text-gray-500">
                    <a href="{{ route('products.index', ['category' => strtolower($category)]) }}">
                        <span class="absolute inset-0"></span>
                        {{ $category }}
                    </a>
                </h3>
            </div>
            @endforeach
        </div>
    </div>

    <!-- Featured Products -->
    <div class="bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 class="text-3xl font-extrabold text-gray-900 text-center mb-12">Featured Products</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                @foreach(range(1, 8) as $i)
                <div class="group relative">
                    <div class="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
                        <img src="https://images.unsplash.com/photo-{{ $i === 1 ? '1523275335684-37898b6baf30' : ($i === 2 ? '1505740420928-5ec560a02d38' : ($i === 3 ? '1526170375885-4d8ecf77b99f' : '1558618666-fcd25c85cd64')) }}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Product {{ $i }}" class="w-full h-full object-center object-cover lg:w-full lg:h-full">
                    </div>
                    <div class="mt-4 flex justify-between">
                        <div>
                            <h3 class="text-sm text-gray-700">
                                <a href="#">
                                    <span aria-hidden="true" class="absolute inset-0"></span>
                                    Sample Product {{ $i }}
                                </a>
                            </h3>
                            <p class="mt-1 text-sm text-gray-500">Category</p>
                        </div>
                        <p class="text-sm font-medium text-gray-900">${{ rand(20, 200) }}</p>
                    </div>
                </div>
                @endforeach
            </div>
            <div class="mt-12 text-center">
                <a href="{{ route('products.featured') }}" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    View All Featured Products
                </a>
            </div>
        </div>
    </div>

    <!-- Why Choose Us -->
    <div class="bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 class="text-3xl font-extrabold text-gray-900 text-center mb-12">Why Choose Us</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="text-center">
                    <div class="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto mb-4">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Quality Products</h3>
                    <p class="text-gray-500">We only sell products that meet our high quality standards.</p>
                </div>
                <div class="text-center">
                    <div class="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto mb-4">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Fast Shipping</h3>
                    <p class="text-gray-500">Get your products delivered quickly and securely.</p>
                </div>
                <div class="text-center">
                    <div class="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto mb-4">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">24/7 Support</h3>
                    <p class="text-gray-500">Our customer support team is always here to help you.</p>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection