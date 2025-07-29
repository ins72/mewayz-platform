const mongoose = require('mongoose');
const User = require('../models/appModels/User');
const Product = require('../models/appModels/Product');
const Client = require('../models/appModels/Client');
const Transaction = require('../models/appModels/Transaction');
const Message = require('../models/appModels/Message');
const Notification = require('../models/appModels/Notification');
const Comment = require('../models/appModels/Comment');
const Refund = require('../models/appModels/Refund');
const Payout = require('../models/appModels/Payout');
const Income = require('../models/appModels/Income');
const Statement = require('../models/appModels/Statement');
const FAQ = require('../models/appModels/FAQ');
const Creator = require('../models/appModels/Creator');
const ShopItem = require('../models/appModels/ShopItem');
const PricingPlan = require('../models/appModels/PricingPlan');
const Follower = require('../models/appModels/Follower');
const Country = require('../models/appModels/Country');
const ActiveTime = require('../models/appModels/ActiveTime');
const Chart = require('../models/appModels/Chart');
const Compatibility = require('../models/appModels/Compatibility');
const Promotion = require('../models/appModels/Promotion');
const Affiliate = require('../models/appModels/Affiliate');
const Insight = require('../models/appModels/Insight');
const ProductActivity = require('../models/appModels/ProductActivity');
const TrafficChannel = require('../models/appModels/TrafficChannel');
const DeviceAnalytics = require('../models/appModels/DeviceAnalytics');
const ProductViewer = require('../models/appModels/ProductViewer');
const ProductTrafficSource = require('../models/appModels/ProductTrafficSource');
const ProductShare = require('../models/appModels/ProductShare');
const ProductPurchaseHistory = require('../models/appModels/ProductPurchaseHistory');
const ProductDraft = require('../models/appModels/ProductDraft');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/idurar', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Client.deleteMany({});
    await Transaction.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    await Comment.deleteMany({});
    await Refund.deleteMany({});
    await Payout.deleteMany({});
    await Income.deleteMany({});
    await Statement.deleteMany({});
    await FAQ.deleteMany({});
    await Creator.deleteMany({});
    await ShopItem.deleteMany({});
    await PricingPlan.deleteMany({});
    await Follower.deleteMany({});
    await Country.deleteMany({});
    await ActiveTime.deleteMany({});
    await Chart.deleteMany({});
    await Compatibility.deleteMany({});
    await Promotion.deleteMany({});
    await Affiliate.deleteMany({});
    await Insight.deleteMany({});
    await ProductActivity.deleteMany({});
    await TrafficChannel.deleteMany({});
    await DeviceAnalytics.deleteMany({});
    await ProductViewer.deleteMany({});
    await ProductTrafficSource.deleteMany({});
    await ProductShare.deleteMany({});
    await ProductPurchaseHistory.deleteMany({});
    await ProductDraft.deleteMany({});

    // Seed Users
    const users = await User.create([
      {
        name: "Chelsie Haley",
        email: "chelsiehaley@email.com",
        password: "123456",
        avatar: "/images/avatar.png",
        location: "Canada",
        bio: "Creative designer and digital artist",
        role: "creator",
        isVerified: true,
      },
      {
        name: "Orval Casper",
        email: "orvalcasper@email.com",
        password: "123456",
        avatar: "/images/avatars/1.png",
        location: "United States",
        bio: "UI/UX designer and developer",
        role: "creator",
        isVerified: true,
      },
      {
        name: "Admin User",
        email: "admin@example.com",
        password: "123456",
        role: "admin",
        isVerified: true,
      },
    ]);

    console.log(`✅ Seeded ${users.length} users`);

    // Seed Products
    const products = await Product.create([
      {
        title: "Crypter - NFT UI Kit",
        description: "Complete NFT marketplace UI kit",
        price: 3250,
        image: "/images/products/1.png",
        active: true,
        category: "UI Design Kit",
      },
      {
        title: "Bento Pro 2.0 Illustrations",
        description: "Premium illustration pack",
        price: 7890,
        image: "/images/products/2.png",
        active: true,
        category: "Illustrations",
      },
      {
        title: "Fleet - travel shopping kit",
        description: "Travel and shopping UI components",
        price: 1500,
        image: "/images/products/3.png",
        active: false,
        category: "UI Design Kit",
      },
      {
        title: "SimpleSocial UI Design Kit",
        description: "Social media platform UI kit",
        price: 9999,
        image: "/images/products/4.png",
        active: true,
        category: "UI Design Kit",
      },
    ]);

    console.log(`✅ Seeded ${products.length} products`);

    // Seed Clients
    const clients = await Client.create([
      {
        name: "Joyce Smith",
        email: "joyce@example.com",
        phone: "+1234567890",
        avatar: "/images/avatars/4.png",
        status: "active",
      },
      {
        name: "Gladyce Johnson",
        email: "gladyce@example.com",
        phone: "+1234567891",
        avatar: "/images/avatars/1.png",
        status: "active",
      },
      {
        name: "Elbert Wilson",
        email: "elbert@example.com",
        phone: "+1234567892",
        avatar: "/images/avatars/2.png",
        status: "active",
      },
      {
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567893",
        avatar: "/images/avatars/3.png",
        status: "inactive",
      },
    ]);

    console.log(`✅ Seeded ${clients.length} clients`);

    // Seed Transactions
    const transactions = await Transaction.create([
      {
        amount: 3140,
        type: "income",
        description: "Product sale - Crypter NFT UI Kit",
        status: "completed",
        userId: users[0]._id,
        productId: products[0]._id,
        paymentMethod: "stripe",
        transactionId: "txn_123456789",
      },
      {
        amount: 685,
        type: "income",
        description: "Product sale - Bento Pro 2.0",
        status: "completed",
        userId: users[0]._id,
        productId: products[1]._id,
        paymentMethod: "paypal",
        transactionId: "txn_987654321",
      },
      {
        amount: 854,
        type: "income",
        description: "Product sale - Fleet Travel Kit",
        status: "pending",
        userId: users[0]._id,
        productId: products[2]._id,
        paymentMethod: "credit_card",
        transactionId: "txn_456789123",
      },
    ]);

    console.log(`✅ Seeded ${transactions.length} transactions`);

    // Seed Messages
    await Message.create([
      {
        sender: "joyce@example.com",
        recipient: "admin@example.com",
        content: "Hello, I would like to request a new product, could you please check...",
        timestamp: new Date(),
        read: false,
      },
      {
        sender: "gladyce@example.com",
        recipient: "admin@example.com",
        content: "Amazing work! Do you take on custom projects?",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
      },
    ]);

    // Seed Notifications
    await Notification.create([
      {
        title: "New Purchase",
        message: "conceptual_artist purchased 3D Artistry Pack",
        type: "success",
        timestamp: new Date(),
        read: false,
      },
      {
        title: "New Like",
        message: "imaginative_vision liked Interactive Design Assets",
        type: "info",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        read: false,
      },
      {
        title: "New Comment",
        message: "aesthetic_explorer commented on CreativeSpace UI Kit",
        type: "info",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        read: false,
      },
    ]);

    // Seed Comments
    const comments = await Comment.create([
      {
        content: "Great work! When HTML version will be available? ⚡",
        userId: users[1]._id,
        productId: products[0]._id,
        isMarked: false,
      },
      {
        content: "Amazing. This says compatible with After Effects. Will After Effects files be added?",
        userId: users[0]._id,
        productId: products[1]._id,
        isMarked: true,
      },
      {
        content: "Hello, can we get the 3d source code of the characters?",
        userId: users[2]._id,
        productId: products[2]._id,
        isMarked: false,
      },
    ]);

    console.log(`✅ Seeded ${comments.length} comments`);

    // Seed Refunds
    await Refund.create([
      {
        title: "Dynamic UIDesign Kit",
        image: "/images/products/2.png",
        details: "UI Design Kit",
        status: "succeeded",
        price: 102.5,
        date: new Date(),
        avatar: "/images/avatars/1.png",
        name: "Nina Brooks",
        customerId: clients[0]._id,
        productId: products[0]._id,
        reason: "Customer requested refund",
      },
      {
        title: "3D Asset Collection",
        image: "/images/products/8.png",
        details: "Illustration",
        status: "in progress",
        price: 88.45,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        avatar: "/images/avatars/2.png",
        name: "Finn Wilder",
        customerId: clients[1]._id,
        productId: products[1]._id,
        reason: "Product not as described",
      },
    ]);

    // Seed Payouts
    await Payout.create([
      {
        date: new Date(),
        status: "in progress",
        method: "paypal",
        transactionId: "TXN-2025-006",
        amount: 9876.54,
        fees: 0.0,
        net: 9876.54,
        userId: "admin", // This would be a real user ID in production
        notes: "Monthly payout",
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: "paid",
        method: "stripe",
        transactionId: "TXN-2025-007",
        amount: 1934.56,
        fees: 0.0,
        net: 1934.56,
        userId: "admin",
        notes: "Weekly payout",
      },
    ]);

    // Seed Income
    await Income.create([
      {
        title: "Total balance",
        icon: "wallet",
        tooltip: "Maximum 100 characters. No HTML or emoji allowed",
        counter: 1620.86,
        percentage: 24.5,
        type: "balance",
        period: "monthly",
        dataChart: [
          { name: "Apr", amt: 2000 },
          { name: "May", amt: 3300 },
          { name: "Jun", amt: 5100 },
          { name: "Jul", amt: 4300 },
          { name: "Aug", amt: 6400 },
          { name: "Sep", amt: 2300 },
          { name: "Oct", amt: 3400 },
        ],
      },
      {
        title: "Future payouts",
        icon: "arrow",
        tooltip: "Maximum 100 characters. No HTML or emoji allowed",
        counter: 2256.72,
        percentage: -18.9,
        type: "payout",
        period: "monthly",
        dataChart: [
          { name: "Apr", amt: 3100 },
          { name: "May", amt: 4300 },
          { name: "Jun", amt: 3100 },
          { name: "Jul", amt: 4400 },
          { name: "Aug", amt: 2200 },
          { name: "Sep", amt: 2900 },
          { name: "Oct", amt: 1800 },
        ],
      },
    ]);

    // Seed Statements
    await Statement.create([
      {
        title: "Quantum Interaction Kit",
        category: "WordPress Theme",
        image: "/images/products/2.png",
        type: "refund",
        date: new Date(),
        orderId: "UI8–321654987",
        price: 32,
        amount: -32,
        userId: "admin",
        productId: products[0]._id,
        customerId: clients[0]._id,
        status: "completed",
      },
      {
        title: "Quantum Design System Toolkit",
        category: "UI Kit",
        image: "/images/products/3.png",
        type: "paid",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        orderId: "UI8–321654423",
        price: 132,
        amount: 132,
        userId: "admin",
        productId: products[1]._id,
        customerId: clients[1]._id,
        status: "completed",
      },
    ]);

    // Seed FAQs
    await FAQ.create([
      {
        name: "General",
        description: "General questions about our platform",
        items: [
          {
            title: "What's the difference between Lite and Pro plans?",
            content: "The Pro plan offers more advanced features including unlimited product uploads and promotion posts, analytics tools, and bulk messaging capabilities, while charging 12% of monthly income versus 8% for Lite.",
            order: 1,
            isActive: true,
          },
          {
            title: "Why is the Pro plan 'Recommended'?",
            content: "The Pro plan offers more advanced features including unlimited product uploads and promotion posts, analytics tools, and bulk messaging capabilities, while charging 12% of monthly income versus 8% for Lite.",
            order: 2,
            isActive: true,
          },
        ],
        order: 1,
        isActive: true,
      },
      {
        name: "Pricing & Fees",
        description: "Questions about pricing and fees",
        items: [
          {
            title: "How is the monthly income percentage calculated?",
            content: "The monthly income percentage is calculated based on your total earnings for the month, excluding any refunds or chargebacks.",
            order: 1,
            isActive: true,
          },
          {
            title: "What is the 'Special offers promo tool'?",
            content: "The Special offers promo tool allows you to create and manage promotional campaigns for your products with advanced targeting and analytics.",
            order: 2,
            isActive: true,
          },
        ],
        order: 2,
        isActive: true,
      },
    ]);

    // Seed Creators
    const creators = await Creator.create([
      {
        login: "maximus",
        details: "Dream Big. Think Different. Do Great!",
        avatar: "/images/avatar.png",
        isOnline: true,
        label: "Top #1 creator",
        tags: ["Mobile App", "3D Illustrations", "UI Design Kit", "Fonts"],
        time: "20 mins",
        shop: [
          { image: "/images/creators/1.png" },
          { image: "/images/creators/2.png" },
          { image: "/images/creators/3.png" },
          { image: "/images/creators/4.png" },
        ],
        socials: [
          { icon: "twitter", href: "https://x.com/ui8" },
          { icon: "instagram", href: "https://www.instagram.com/ui8net/" },
          { icon: "threads", href: "https://www.threads.net/@ui8net" },
        ],
        userId: "admin",
        isVerified: true,
        rating: 4.8,
        totalSales: 15420,
        totalProducts: 12,
        followers: 1250,
        isActive: true,
      },
      {
        login: "alex_smith",
        details: "Creating amazing digital experiences",
        avatar: "/images/avatars/9.png",
        isOnline: true,
        label: "Top creator",
        tags: ["Mobile App", "UI Design Kit", "Fonts"],
        time: "15 mins",
        shop: [
          { image: "/images/creators/5.png" },
          { image: "/images/creators/6.png" },
          { image: "/images/creators/7.png" },
          { image: "/images/creators/8.png" },
        ],
        socials: [
          { icon: "twitter", href: "https://x.com/alexsmith" },
          { icon: "instagram", href: "https://www.instagram.com/alexsmith/" },
        ],
        userId: "admin",
        isVerified: false,
        rating: 4.5,
        totalSales: 8920,
        totalProducts: 8,
        followers: 850,
        isActive: true,
      },
    ]);

    // Seed Shop Items
    await ShopItem.create([
      {
        title: "Premium UI Kit Collection",
        description: "Complete collection of premium UI components",
        price: 299,
        image: "/images/creators/1.png",
        category: "UI Design Kit",
        tags: ["UI", "Design", "Components"],
        creatorId: creators[0]._id,
        productId: products[0]._id,
        isActive: true,
        isFeatured: true,
        rating: 4.8,
        totalSales: 1250,
        totalReviews: 89,
        downloadCount: 2500,
        license: "commercial",
      },
      {
        title: "3D Illustration Pack",
        description: "High-quality 3D illustrations for modern designs",
        price: 149,
        image: "/images/creators/2.png",
        category: "Illustrations",
        tags: ["3D", "Illustrations", "Modern"],
        creatorId: creators[0]._id,
        productId: products[1]._id,
        isActive: true,
        isFeatured: false,
        rating: 4.6,
        totalSales: 890,
        totalReviews: 45,
        downloadCount: 1800,
        license: "personal",
      },
      {
        title: "Mobile App Template",
        description: "Complete mobile app template with source code",
        price: 199,
        image: "/images/creators/5.png",
        category: "Mobile App",
        tags: ["Mobile", "App", "Template"],
        creatorId: creators[1]._id,
        productId: products[2]._id,
        isActive: true,
        isFeatured: true,
        rating: 4.7,
        totalSales: 650,
        totalReviews: 32,
        downloadCount: 1200,
        license: "commercial",
      },
    ]);

    // Seed Pricing Plans
    await PricingPlan.create([
      {
        title: "Lite",
        percentage: 8,
        description: "of the monthly income you earn on the maket",
        features: [
          "Basic shop profile",
          "Customer communication tools",
          "100 promotion posts",
          "Maximum 50 product uploads",
        ],
        price: 0,
        currency: "USD",
        billingCycle: "monthly",
        isPopular: false,
        isActive: true,
        maxProducts: 50,
        maxPromotions: 100,
        hasAnalytics: false,
        hasBulkMessaging: false,
        order: 1,
      },
      {
        title: "Pro",
        percentage: 12,
        description: "of the monthly income you earn on the maket",
        features: [
          "Extended shop profile",
          "Customer communication tools",
          "Unlimited promotion posts",
          "Unlimited product uploads",
          "Analytics and insights",
          "Bulk message to all customers",
        ],
        price: 0,
        currency: "USD",
        billingCycle: "monthly",
        isPopular: true,
        isActive: true,
        maxProducts: -1, // unlimited
        maxPromotions: -1, // unlimited
        hasAnalytics: true,
        hasBulkMessaging: true,
        order: 2,
      },
    ]);

    // Seed Countries
    await Country.create([
      {
        name: "United States",
        code: "US",
        flag: "/images/flags/us.svg",
        percentage: 65.5,
        price: 3245.68,
        currency: "USD",
        totalSales: 15420,
        totalCustomers: 1250,
        totalOrders: 890,
        isActive: true,
      },
      {
        name: "Sweden",
        code: "SE",
        flag: "/images/flags/se.svg",
        percentage: 57.5,
        price: 7890.12,
        currency: "SEK",
        totalSales: 8920,
        totalCustomers: 850,
        totalOrders: 650,
        isActive: true,
      },
      {
        name: "Canada",
        code: "CA",
        flag: "/images/flags/ca.svg",
        percentage: 45.2,
        price: 2333.33,
        currency: "CAD",
        totalSales: 5670,
        totalCustomers: 450,
        totalOrders: 320,
        isActive: true,
      },
      {
        name: "UK",
        code: "UK",
        flag: "/images/flags/uk.svg",
        percentage: 33.2,
        price: 1456.99,
        currency: "GBP",
        totalSales: 3450,
        totalCustomers: 280,
        totalOrders: 210,
        isActive: true,
      },
      {
        name: "Germany",
        code: "DE",
        flag: "/images/flags/de.svg",
        percentage: 25.8,
        price: 5678.45,
        currency: "EUR",
        totalSales: 6780,
        totalCustomers: 520,
        totalOrders: 380,
        isActive: true,
      },
      {
        name: "Spain",
        code: "ES",
        flag: "/images/flags/es.svg",
        percentage: 18.8,
        price: 9999.99,
        currency: "EUR",
        totalSales: 2340,
        totalCustomers: 180,
        totalOrders: 140,
        isActive: true,
      },
    ]);

    // Seed Active Times
    const timeSlots = [
      "12:00 am", "", "", "4:00 am", "", "", "8:00 am", "", "", "12:00 pm", "", "", "4:00 pm", "", "", "8:00 pm"
    ];
    const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    
    for (let i = 0; i < timeSlots.length; i++) {
      for (let j = 0; j < days.length; j++) {
        await ActiveTime.create({
          userId: "admin",
          timeSlot: timeSlots[i] || `${i * 4}:00 ${i < 6 ? 'am' : 'pm'}`,
          dayOfWeek: days[j],
          activityCount: Math.floor(Math.random() * 3),
          date: new Date(),
          sessionDuration: Math.floor(Math.random() * 120) + 30,
          pageViews: Math.floor(Math.random() * 20) + 5,
          actions: Math.floor(Math.random() * 10) + 2,
        });
      }
    }

    // Seed Charts
    await Chart.create([
      {
        name: "Home Balance Chart",
        type: "balance",
        data: [
          { name: "Apr", amt: 0 },
          { name: "May", amt: 52480 },
          { name: "Jun", amt: 2345 },
          { name: "Jul", amt: 26345 },
          { name: "Aug", amt: 77345 },
          { name: "Sep", amt: 21454 },
        ],
        period: "monthly",
        isPublic: true,
        isActive: true,
      },
      {
        name: "Product Views Chart",
        type: "product_views",
        data: [
          { name: 14, amt: 1145231 },
          { name: 15, amt: 1453134 },
          { name: 16, amt: 809435 },
          { name: 17, amt: 2204521 },
          { name: 18, amt: 1845105 },
          { name: 19, amt: 654104 },
          { name: 20, amt: 2004561 },
        ],
        period: "daily",
        isPublic: true,
        isActive: true,
      },
      {
        name: "Customer Overview Chart",
        type: "customer_overview",
        data: [
          { name: "Jan", amt: 1600, amt2: 500 },
          { name: "Feb", amt: 1300, amt2: 520 },
          { name: "Mar", amt: 1800, amt2: 480 },
          { name: "Apr", amt: 2100, amt2: 600 },
          { name: "May", amt: 1900, amt2: 550 },
          { name: "Jun", amt: 2400, amt2: 700 },
        ],
        period: "monthly",
        isPublic: true,
        isActive: true,
      },
    ]);

    // Seed Compatibility
    await Compatibility.create([
      {
        title: "Notion",
        image: "/images/logos/notion.svg",
        category: "productivity",
        description: "Compatible with Notion templates and databases",
        version: "2024",
        isActive: true,
        order: 1,
        compatibilityLevel: "full",
        requirements: ["Notion account", "Basic knowledge"],
      },
      {
        title: "After Effects",
        image: "/images/logos/after-effects.svg",
        category: "design",
        description: "Compatible with After Effects projects and compositions",
        version: "2024",
        isActive: true,
        order: 2,
        compatibilityLevel: "full",
        requirements: ["Adobe After Effects", "Creative Cloud subscription"],
      },
      {
        title: "Bootstrap",
        image: "/images/logos/bootstrap.svg",
        category: "development",
        description: "Compatible with Bootstrap framework",
        version: "5.3",
        isActive: true,
        order: 3,
        compatibilityLevel: "full",
        requirements: ["HTML", "CSS", "JavaScript"],
      },
      {
        title: "Sketch",
        image: "/images/logos/sketch.svg",
        category: "design",
        description: "Compatible with Sketch design files",
        version: "98",
        isActive: true,
        order: 4,
        compatibilityLevel: "full",
        requirements: ["Sketch app", "macOS"],
      },
      {
        title: "Figma",
        image: "/images/logos/figma.svg",
        category: "design",
        description: "Compatible with Figma design files",
        version: "2024",
        isActive: true,
        order: 5,
        compatibilityLevel: "full",
        requirements: ["Figma account", "Web browser"],
      },
      {
        title: "Wordpress",
        image: "/images/logos/wordpress.svg",
        category: "cms",
        description: "Compatible with WordPress themes and plugins",
        version: "6.4",
        isActive: true,
        order: 6,
        compatibilityLevel: "full",
        requirements: ["WordPress installation", "PHP knowledge"],
      },
      {
        title: "Swift",
        image: "/images/logos/swift.svg",
        category: "programming",
        description: "Compatible with Swift development",
        version: "5.9",
        isActive: true,
        order: 7,
        compatibilityLevel: "full",
        requirements: ["Xcode", "macOS", "Swift knowledge"],
      },
      {
        title: "Photoshop",
        image: "/images/logos/photoshop.svg",
        category: "design",
        description: "Compatible with Photoshop files",
        version: "2024",
        isActive: true,
        order: 8,
        compatibilityLevel: "full",
        requirements: ["Adobe Photoshop", "Creative Cloud subscription"],
      },
      {
        title: "Blender",
        image: "/images/logos/blender.svg",
        category: "3d",
        description: "Compatible with Blender 3D files",
        version: "4.0",
        isActive: true,
        order: 9,
        compatibilityLevel: "full",
        requirements: ["Blender", "3D modeling knowledge"],
      },
      {
        title: "Cinema 4D",
        image: "/images/logos/cinema-4d.svg",
        category: "3d",
        description: "Compatible with Cinema 4D projects",
        version: "2024",
        isActive: true,
        order: 10,
        compatibilityLevel: "full",
        requirements: ["Cinema 4D", "3D modeling knowledge"],
      },
      {
        title: "Spline",
        image: "/images/logos/spline.svg",
        category: "3d",
        description: "Compatible with Spline 3D designs",
        version: "2024",
        isActive: true,
        order: 11,
        compatibilityLevel: "full",
        requirements: ["Spline account", "Web browser"],
      },
      {
        title: "HTML",
        image: "/images/logos/html.svg",
        category: "development",
        description: "Compatible with HTML markup",
        version: "5",
        isActive: true,
        order: 12,
        compatibilityLevel: "full",
        requirements: ["Text editor", "Web browser"],
      },
    ]);

    // Seed Promotions
    await Promotion.create([
      {
        title: "Hurry! 50% off everything! 🔥",
        image: "/images/products/11.png",
        socials: [
          { icon: "twitter", href: "https://x.com/ui8" },
          { icon: "facebook", href: "https://www.facebook.com/ui8.net/" },
          { icon: "instagram", href: "https://www.instagram.com/ui8net/" },
          { icon: "threads", href: "https://www.threads.net/@ui8net" },
        ],
        likes: { counter: 320, percentage: 20 },
        views: { counter: 742, percentage: 40 },
        conversationRate: 12.6,
        status: "published",
        type: "sale",
        creatorId: creators[0]._id,
        productId: products[0]._id,
        targetAudience: ["Designers", "Developers"],
        platforms: ["twitter", "facebook", "instagram", "threads"],
        budget: 500,
        isActive: true,
      },
      {
        title: "Last chance! 60% off clearance! 🛒",
        image: "/images/products/12.png",
        socials: [
          { icon: "twitter", href: "https://x.com/ui8" },
          { icon: "facebook", href: "https://www.facebook.com/ui8.net/" },
          { icon: "instagram", href: "https://www.instagram.com/ui8net/" },
          { icon: "threads", href: "https://www.threads.net/@ui8net" },
        ],
        likes: { counter: 368, percentage: 45 },
        views: { counter: 143, percentage: 78 },
        conversationRate: 24.3,
        status: "published",
        type: "sale",
        creatorId: creators[1]._id,
        productId: products[1]._id,
        targetAudience: ["UI/UX Designers"],
        platforms: ["twitter", "facebook", "instagram"],
        budget: 300,
        isActive: true,
      },
    ]);

    // Seed Affiliates
    await Affiliate.create([
      {
        userId: "admin",
        affiliateCode: "AFF001",
        commissionRate: 10,
        totalEarnings: 256000,
        totalReferrals: 2569,
        totalSales: 1552,
        status: "active",
        paymentMethod: "paypal",
        paymentEmail: "admin@example.com",
        minimumPayout: 50,
        isVerified: true,
        joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        lastPayout: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        referralLink: "https://example.com/ref/AFF001",
        socialLinks: [
          { platform: "twitter", url: "https://twitter.com/affiliate1" },
          { platform: "instagram", url: "https://instagram.com/affiliate1" },
        ],
        performance: {
          monthlyEarnings: [
            { month: "Jan", amount: 25000 },
            { month: "Feb", amount: 32000 },
            { month: "Mar", amount: 28000 },
            { month: "Apr", amount: 35000 },
            { month: "May", amount: 42000 },
            { month: "Jun", amount: 38000 },
          ],
          topProducts: [
            { productId: products[0]._id, sales: 45, earnings: 4500 },
            { productId: products[1]._id, sales: 32, earnings: 3200 },
          ],
        },
      },
    ]);

    // Seed Insights
    const insights = await Insight.create([
      {
        title: "Product views",
        value: "2,569",
        icon: "product-think",
        percentage: 36.8,
        tooltip: "Maximum 100 characters. No HTML or emoji allowed",
        dataChart: [
          { name: "Monday", amt: 2400 },
          { name: "Tuesday", amt: 3200 },
          { name: "Wednesday", amt: 5000 },
          { name: "Thursday", amt: 4000 },
          { name: "Friday", amt: 2200 },
          { name: "Saturday", amt: 2900 },
          { name: "Sunday", amt: 3600 },
        ],
        type: "views",
        period: "weekly",
        userId: "admin",
        category: "product",
        newCustomers: 45,
        productReached: 1250,
      },
      {
        title: "Orders",
        value: "1,552",
        icon: "bag",
        percentage: -24.2,
        tooltip: "Maximum 100 characters. No HTML or emoji allowed",
        dataChart: [
          { name: "Monday", amt: 3200 },
          { name: "Tuesday", amt: 2200 },
          { name: "Wednesday", amt: 4000 },
          { name: "Thursday", amt: 3200 },
          { name: "Friday", amt: 5500 },
          { name: "Saturday", amt: 2900 },
          { name: "Sunday", amt: 4200 },
        ],
        type: "sales",
        period: "weekly",
        userId: "admin",
        category: "product",
        newCustomers: 23,
        productReached: 890,
      },
    ]);

    console.log(`✅ Seeded ${insights.length} insights`);

    // Seed Product Activity
    await ProductActivity.create([
      {
        week: "27 Jan - 03 Feb",
        products: {
          counter: "24k",
          percentage: 36.8,
        },
        views: {
          counter: "18k",
          percentage: 25.4,
        },
        likes: {
          counter: "48",
          percentage: -15.4,
        },
        comments: {
          counter: "16",
          percentage: 36.8,
        },
        startDate: new Date('2025-01-27'),
        endDate: new Date('2025-02-03'),
        userId: "admin",
        isActive: true,
      },
      {
        week: "03 Feb - 10 Feb",
        products: {
          counter: "40k",
        },
        views: {
          counter: "12k",
          percentage: -8.9,
        },
        likes: {
          counter: "64",
        },
        comments: {
          counter: "32",
          percentage: 36.8,
        },
        startDate: new Date('2025-02-03'),
        endDate: new Date('2025-02-10'),
        userId: "admin",
        isActive: true,
      },
    ]);

    // Seed Traffic Channels
    const trafficDates = [
      new Date('2025-04-22'),
      new Date('2025-04-23'),
      new Date('2025-04-24'),
      new Date('2025-04-25'),
      new Date('2025-04-26'),
      new Date('2025-04-27'),
      new Date('2025-04-28'),
    ];

    await TrafficChannel.create([
      {
        date: trafficDates[0],
        direct: 555423,
        search: 233232,
        social: 50000,
        referral: 30000,
        email: 20000,
        other: 23093,
        userId: "admin",
        period: "daily",
        isActive: true,
      },
      {
        date: trafficDates[1],
        direct: 455423,
        search: 333232,
        social: 60000,
        referral: 40000,
        email: 25000,
        other: 67921,
        userId: "admin",
        period: "daily",
        isActive: true,
      },
      {
        date: trafficDates[2],
        direct: 355423,
        search: 433232,
        social: 70000,
        referral: 50000,
        email: 30000,
        other: 101166,
        userId: "admin",
        period: "daily",
        isActive: true,
      },
      {
        date: trafficDates[3],
        direct: 255423,
        search: 533232,
        social: 80000,
        referral: 60000,
        email: 35000,
        other: 134523,
        userId: "admin",
        period: "daily",
        isActive: true,
      },
      {
        date: trafficDates[4],
        direct: 155423,
        search: 433232,
        social: 90000,
        referral: 70000,
        email: 40000,
        other: 167123,
        userId: "admin",
        period: "daily",
        isActive: true,
      },
      {
        date: trafficDates[5],
        direct: 555423,
        search: 237902,
        social: 100000,
        referral: 80000,
        email: 45000,
        other: 123123,
        userId: "admin",
        period: "daily",
        isActive: true,
      },
      {
        date: trafficDates[6],
        direct: 355420,
        search: 512232,
        social: 110000,
        referral: 90000,
        email: 50000,
        other: 157298,
        userId: "admin",
        period: "daily",
        isActive: true,
      },
    ]);

    // Seed Device Analytics
    await DeviceAnalytics.create([
      {
        name: "Mobile",
        value: 1485,
        icon: "mobile",
        type: "device",
        userId: "admin",
        isActive: true,
      },
      {
        name: "Tablet",
        value: 1745,
        icon: "tablet",
        type: "device",
        userId: "admin",
        isActive: true,
      },
      {
        name: "Desktop",
        value: 4325,
        icon: "desktop",
        type: "device",
        userId: "admin",
        isActive: true,
      },
      {
        name: "Female",
        value: 3213,
        type: "gender",
        userId: "admin",
        isActive: true,
      },
      {
        name: "Male",
        value: 2144,
        type: "gender",
        userId: "admin",
        isActive: true,
      },
      {
        name: "Undefined",
        value: 4344,
        type: "gender",
        userId: "admin",
        isActive: true,
      },
    ]);

    // Seed Product Viewers
    await ProductViewer.create([
      {
        name: "Joyce Smith",
        avatar: "/images/avatars/4.png",
        email: "joyce@example.com",
        location: "New York, USA",
        device: "Desktop",
        browser: "Chrome",
        visitTime: new Date(),
        duration: 180,
        pageViews: 5,
        productId: products[0]._id,
        userId: "admin",
        isActive: true,
      },
      {
        name: "Gladyce Johnson",
        avatar: "/images/avatars/1.png",
        email: "gladyce@example.com",
        location: "London, UK",
        device: "Mobile",
        browser: "Safari",
        visitTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        duration: 120,
        pageViews: 3,
        productId: products[1]._id,
        userId: "admin",
        isActive: true,
      },
      {
        name: "Elbert Wilson",
        avatar: "/images/avatars/2.png",
        email: "elbert@example.com",
        location: "Toronto, Canada",
        device: "Tablet",
        browser: "Firefox",
        visitTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        duration: 90,
        pageViews: 2,
        productId: products[2]._id,
        userId: "admin",
        isActive: true,
      },
    ]);

    // Seed Product Traffic Sources
    await ProductTrafficSource.create([
      {
        productId: products[0]._id,
        title: "Social media",
        value: 340123,
        percentage: 36.8,
        period: "weekly",
        userId: "admin",
        isActive: true,
      },
      {
        productId: products[1]._id,
        title: "Direct",
        value: 232132,
        percentage: 25.4,
        period: "weekly",
        userId: "admin",
        isActive: true,
      },
      {
        productId: products[2]._id,
        title: "Others",
        value: 640128,
        percentage: 37.8,
        period: "weekly",
        userId: "admin",
        isActive: true,
      },
    ]);

    // Seed Product Shares
    await ProductShare.create([
      {
        productId: products[0]._id,
        title: "Bento Pro v.2",
        image: "/images/products/4.png",
        category: "UI Design Kit",
        price: 98,
        shareCount: 15,
        shareType: "social",
        platform: "twitter",
        sharedBy: "admin",
        isActive: true,
      },
      {
        productId: products[1]._id,
        title: "Cryper – NFT UI Design Kit",
        image: "/images/products/2.png",
        category: "Illustrations",
        price: 134,
        shareCount: 8,
        shareType: "social",
        platform: "facebook",
        sharedBy: "admin",
        isActive: true,
      },
      {
        productId: products[2]._id,
        title: "Fleet - travel shopping kit",
        image: "/images/products/5.png",
        category: "3D Assets",
        price: 54,
        shareCount: 12,
        shareType: "link",
        sharedBy: "admin",
        isActive: true,
      },
    ]);

    // Seed Product Purchase History
    await ProductPurchaseHistory.create([
      {
        productId: products[0]._id,
        title: "Bento Matte 3D Illustration",
        category: "UI Design Kit",
        image: "/images/products/4.png",
        sales: 98,
        purchaseTime: new Date('2025-04-09'),
        customerId: clients[0]._id,
        transactionId: "TXN001",
        paymentMethod: "credit_card",
        status: "completed",
        isActive: true,
      },
      {
        productId: products[1]._id,
        title: "Cryper – NFT UI Design Kit",
        category: "Illustrations",
        image: "/images/products/2.png",
        sales: 134,
        purchaseTime: new Date('2025-04-10'),
        customerId: clients[1]._id,
        transactionId: "TXN002",
        paymentMethod: "paypal",
        status: "completed",
        isActive: true,
      },
      {
        productId: products[2]._id,
        title: "Fleet - travel shopping kit",
        category: "3D Assets",
        image: "/images/products/5.png",
        sales: 54,
        purchaseTime: new Date('2025-04-11'),
        customerId: clients[2]._id,
        transactionId: "TXN003",
        paymentMethod: "stripe",
        status: "completed",
        isActive: true,
      },
    ]);

    // Seed Product Drafts
    await ProductDraft.create([
      {
        title: "Bento Pro v.2",
        image: "/images/products/lg-10.png",
        details: "ui8.net/product/product-link",
        category: "UI Design Kit",
        price: 98,
        date: new Date('2025-03-09T15:55:00'),
        status: "draft",
        creatorId: creators[0]._id,
        userId: "admin",
        description: "Advanced UI design kit with modern components",
        tags: ["UI", "Design", "Components"],
        isActive: true,
      },
      {
        title: "Bento Design System",
        image: "/images/products/lg-9.png",
        details: "ui8.net/product/product-link",
        category: "Coded templates",
        price: 122,
        date: new Date('2025-03-07T15:55:00'),
        status: "review",
        creatorId: creators[1]._id,
        userId: "admin",
        description: "Complete design system with coded templates",
        tags: ["Design System", "Templates", "Code"],
        isActive: true,
      },
      {
        title: "Bento Pro v. 1",
        image: "/images/products/lg-10.png",
        details: "ui8.net/product/product-link",
        category: "Illustrations",
        price: 0,
        date: new Date('2025-03-02T15:55:00'),
        status: "approved",
        creatorId: creators[2]._id,
        userId: "admin",
        description: "Free illustration pack",
        tags: ["Illustrations", "Free", "Pack"],
        isActive: true,
      },
    ]);

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Created ${products.length} products`);
    console.log(`👥 Created ${clients.length} clients`);
    console.log(`💰 Created transactions, messages, notifications, comments, refunds, payouts, income, statements, FAQs, creators, shop items, pricing plans, countries, active times, charts, compatibility, promotions, affiliates, insights, product activity, traffic channels, device analytics, product viewers, product traffic sources, product shares, product purchase history, and product drafts`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
seedData(); 