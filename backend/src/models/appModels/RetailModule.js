const mongoose = require('mongoose');

const retailModuleSchema = new mongoose.Schema({
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  store_info: {
    store_name: String,
    business_type: {
      type: String,
      enum: ['retail', 'restaurant', 'service', 'wholesale', 'marketplace', 'subscription', 'digital_goods']
    },
    store_category: String,
    tax_id: String,
    business_license: String,
    locations: [{
      location_id: String,
      location_name: String,
      location_type: {
        type: String,
        enum: ['physical_store', 'warehouse', 'pickup_point', 'pop_up', 'kiosk']
      },
      address: {
        street: String,
        city: String,
        state: String,
        zip_code: String,
        country: String,
        coordinates: {
          latitude: Number,
          longitude: Number
        }
      },
      contact_info: {
        phone: String,
        email: String,
        manager: String
      },
      operating_hours: [{
        day: String,
        open_time: String,
        close_time: String,
        is_open: Boolean
      }],
      timezone: String,
      square_footage: Number,
      max_capacity: Number,
      amenities: [String],
      parking_available: Boolean
    }]
  },
  inventory_management: {
    products: [{
      product_id: { type: String, unique: true },
      basic_info: {
        name: String,
        description: String,
        short_description: String,
        product_type: {
          type: String,
          enum: ['physical', 'digital', 'service', 'subscription', 'bundle', 'gift_card']
        },
        category: String,
        subcategory: String,
        brand: String,
        manufacturer: String,
        model_number: String,
        upc_barcode: String,
        sku: String,
        tags: [String]
      },
      pricing: {
        cost_price: Number,
        retail_price: Number,
        sale_price: Number,
        wholesale_price: Number,
        minimum_price: Number,
        pricing_rules: [{
          rule_type: String, // quantity_discount, member_discount, seasonal
          conditions: mongoose.Schema.Types.Mixed,
          discount_type: String, // percentage, fixed_amount
          discount_value: Number,
          start_date: Date,
          end_date: Date,
          active: Boolean
        }],
        tax_category: String,
        tax_rate: Number
      },
      inventory: {
        track_inventory: Boolean,
        current_stock: Number,
        reserved_stock: Number,
        available_stock: Number,
        minimum_threshold: Number,
        maximum_threshold: Number,
        reorder_point: Number,
        reorder_quantity: Number,
        stock_by_location: [{
          location_id: String,
          quantity: Number,
          reserved: Number,
          bin_location: String
        }],
        inventory_valuation: String // fifo, lifo, average_cost
      },
      product_variants: [{
        variant_id: String,
        variant_name: String,
        attributes: mongoose.Schema.Types.Mixed, // size, color, etc.
        sku: String,
        barcode: String,
        price_adjustment: Number,
        stock_quantity: Number,
        weight: Number,
        dimensions: {
          length: Number,
          width: Number,
          height: Number,
          unit: String
        }
      }],
      media: {
        images: [{
          url: String,
          alt_text: String,
          is_primary: Boolean,
          order: Number
        }],
        videos: [{
          url: String,
          title: String,
          thumbnail_url: String
        }],
        documents: [{
          type: String, // manual, warranty, specification
          url: String,
          title: String
        }]
      },
      supplier_info: {
        primary_supplier: String,
        supplier_sku: String,
        lead_time_days: Number,
        minimum_order_quantity: Number,
        supplier_cost: Number,
        alternative_suppliers: [{
          supplier_name: String,
          supplier_sku: String,
          cost: Number,
          lead_time_days: Number
        }]
      },
      shipping_info: {
        weight: Number,
        dimensions: {
          length: Number,
          width: Number,
          height: Number,
          unit: String
        },
        shipping_class: String,
        requires_special_handling: Boolean,
        hazardous_material: Boolean,
        fragile: Boolean
      },
      seo_marketing: {
        meta_title: String,
        meta_description: String,
        search_keywords: [String],
        featured_product: Boolean,
        promotion_eligible: Boolean,
        cross_sell_products: [String],
        up_sell_products: [String]
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'discontinued', 'out_of_stock', 'back_order']
      },
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now }
    }],
    purchase_orders: [{
      po_id: String,
      supplier: String,
      order_date: Date,
      expected_delivery: Date,
      actual_delivery: Date,
      status: {
        type: String,
        enum: ['draft', 'sent', 'confirmed', 'partial_received', 'received', 'cancelled']
      },
      items: [{
        product_id: String,
        quantity_ordered: Number,
        quantity_received: Number,
        unit_cost: Number,
        total_cost: Number
      }],
      total_amount: Number,
      notes: String,
      created_by: String
    }],
    stock_movements: [{
      movement_id: String,
      product_id: String,
      location_id: String,
      movement_type: {
        type: String,
        enum: ['sale', 'return', 'adjustment', 'transfer', 'damaged', 'expired', 'restock']
      },
      quantity_change: Number,
      previous_quantity: Number,
      new_quantity: Number,
      unit_cost: Number,
      total_value: Number,
      reason: String,
      reference_number: String, // order number, transfer number, etc.
      processed_by: String,
      processed_at: Date
    }]
  },
  sales_management: {
    orders: [{
      order_id: { type: String, unique: true },
      order_number: String,
      order_type: {
        type: String,
        enum: ['online', 'in_store', 'phone', 'wholesale', 'subscription']
      },
      order_status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
      },
      customer_info: {
        customer_id: String,
        customer_type: String, // retail, wholesale, member
        first_name: String,
        last_name: String,
        email: String,
        phone: String,
        billing_address: {
          street: String,
          city: String,
          state: String,
          zip_code: String,
          country: String
        },
        shipping_address: {
          street: String,
          city: String,
          state: String,
          zip_code: String,
          country: String
        }
      },
      items: [{
        product_id: String,
        product_name: String,
        variant_id: String,
        quantity: Number,
        unit_price: Number,
        discount_amount: Number,
        tax_amount: Number,
        total_amount: Number
      }],
      pricing_summary: {
        subtotal: Number,
        discount_total: Number,
        tax_total: Number,
        shipping_cost: Number,
        handling_fee: Number,
        total_amount: Number
      },
      payment_info: {
        payment_method: String,
        payment_status: String,
        transaction_id: String,
        payment_processor: String,
        payment_date: Date,
        installments: [{
          amount: Number,
          due_date: Date,
          status: String
        }]
      },
      shipping_info: {
        shipping_method: String,
        carrier: String,
        tracking_number: String,
        estimated_delivery: Date,
        actual_delivery: Date,
        delivery_instructions: String,
        signature_required: Boolean
      },
      fulfillment: {
        fulfillment_location: String,
        picked_at: Date,
        packed_at: Date,
        shipped_at: Date,
        delivered_at: Date,
        fulfilled_by: String
      },
      order_source: String,
      sales_channel: String,
      notes: String,
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now }
    }],
    returns: [{
      return_id: String,
      order_id: String,
      return_reason: String,
      return_type: {
        type: String,
        enum: ['defective', 'wrong_item', 'not_as_described', 'damaged_shipping', 'change_of_mind']
      },
      items: [{
        product_id: String,
        quantity: Number,
        condition: String, // new, used, damaged
        action: String // refund, exchange, store_credit
      }],
      refund_amount: Number,
      processing_fee: Number,
      return_shipping_cost: Number,
      status: {
        type: String,
        enum: ['requested', 'approved', 'received', 'inspected', 'processed', 'completed']
      },
      processed_by: String,
      processed_at: Date
    }]
  },
  customer_management: {
    customers: [{
      customer_id: String,
      personal_info: {
        first_name: String,
        last_name: String,
        email: String,
        phone: String,
        date_of_birth: Date,
        gender: String,
        preferred_language: String
      },
      addresses: [{
        address_type: String, // billing, shipping, both
        street: String,
        city: String,
        state: String,
        zip_code: String,
        country: String,
        is_default: Boolean
      }],
      customer_type: {
        type: String,
        enum: ['retail', 'wholesale', 'vip', 'member'],
        default: 'retail'
      },
      loyalty_program: {
        member_id: String,
        tier: String,
        points_balance: Number,
        points_earned: Number,
        points_redeemed: Number,
        join_date: Date,
        last_activity: Date
      },
      purchase_history: {
        total_orders: Number,
        total_spent: Number,
        average_order_value: Number,
        first_purchase_date: Date,
        last_purchase_date: Date,
        favorite_categories: [String],
        preferred_brands: [String]
      },
      preferences: {
        communication_preferences: {
          email: Boolean,
          sms: Boolean,
          phone: Boolean,
          mail: Boolean
        },
        product_preferences: [String],
        shopping_preferences: {
          preferred_store_location: String,
          preferred_shopping_time: String,
          preferred_payment_method: String,
          delivery_preferences: String
        }
      },
      customer_service: {
        support_tickets: [{
          ticket_id: String,
          subject: String,
          description: String,
          priority: String,
          status: String,
          created_at: Date,
          resolved_at: Date
        }],
        notes: [{
          note: String,
          created_by: String,
          created_at: Date,
          visibility: String // internal, customer_visible
        }]
      },
      created_at: { type: Date, default: Date.now },
      last_updated: { type: Date, default: Date.now }
    }]
  },
  point_of_sale: {
    terminals: [{
      terminal_id: String,
      terminal_name: String,
      location_id: String,
      hardware_info: {
        device_type: String,
        serial_number: String,
        installation_date: Date,
        last_maintenance: Date
      },
      payment_methods: [{
        method: String, // cash, credit_card, debit_card, mobile_payment, gift_card
        enabled: Boolean,
        processor: String,
        merchant_id: String
      }],
      peripherals: {
        receipt_printer: Boolean,
        barcode_scanner: Boolean,
        cash_drawer: Boolean,
        customer_display: Boolean,
        scale: Boolean
      },
      settings: {
        default_tax_rate: Number,
        rounding_method: String,
        receipt_settings: mongoose.Schema.Types.Mixed,
        security_settings: mongoose.Schema.Types.Mixed
      },
      status: String, // active, inactive, maintenance
      software_version: String,
      last_sync: Date
    }],
    transactions: [{
      transaction_id: String,
      terminal_id: String,
      cashier_id: String,
      transaction_type: {
        type: String,
        enum: ['sale', 'return', 'exchange', 'void', 'discount', 'no_sale']
      },
      items: [{
        product_id: String,
        quantity: Number,
        unit_price: Number,
        discount: Number,
        tax: Number
      }],
      totals: {
        subtotal: Number,
        tax_total: Number,
        discount_total: Number,
        total: Number
      },
      payments: [{
        payment_method: String,
        amount: Number,
        change_given: Number,
        authorization_code: String,
        card_last_four: String
      }],
      receipt_number: String,
      transaction_date: Date,
      voided: Boolean,
      void_reason: String
    }],
    cash_management: [{
      terminal_id: String,
      cashier_id: String,
      shift_start: Date,
      shift_end: Date,
      opening_balance: Number,
      closing_balance: Number,
      expected_balance: Number,
      cash_sales: Number,
      cash_received: Number,
      cash_paid_out: Number,
      variance: Number,
      deposits: [{
        amount: Number,
        time: Date,
        notes: String
      }],
      payouts: [{
        amount: Number,
        reason: String,
        time: Date,
        authorized_by: String
      }]
    }]
  },
  e_commerce: {
    website_settings: {
      domain: String,
      theme: String,
      custom_css: String,
      payment_gateways: [{
        gateway: String,
        enabled: Boolean,
        configuration: mongoose.Schema.Types.Mixed,
        transaction_fee: Number
      }],
      shipping_zones: [{
        zone_name: String,
        countries: [String],
        states: [String],
        shipping_methods: [{
          method_name: String,
          rate_type: String, // flat_rate, weight_based, free
          rate: Number,
          estimated_delivery: String
        }]
      }],
      tax_settings: {
        tax_calculation: String, // origin_based, destination_based
        tax_rates: [{
          location: String,
          rate: Number,
          tax_class: String
        }]
      }
    },
    seo_marketing: {
      meta_settings: {
        site_title: String,
        meta_description: String,
        keywords: [String],
        google_analytics_id: String,
        facebook_pixel_id: String
      },
      promotions: [{
        promotion_id: String,
        promotion_name: String,
        promotion_type: {
          type: String,
          enum: ['percentage_discount', 'fixed_discount', 'buy_x_get_y', 'free_shipping']
        },
        conditions: {
          minimum_amount: Number,
          applicable_products: [String],
          customer_groups: [String],
          usage_limit: Number,
          usage_limit_per_customer: Number
        },
        discount_value: Number,
        promo_code: String,
        start_date: Date,
        end_date: Date,
        active: Boolean,
        usage_count: Number
      }],
      abandoned_carts: [{
        cart_id: String,
        customer_id: String,
        items: [{
          product_id: String,
          quantity: Number,
          price: Number
        }],
        cart_value: Number,
        created_at: Date,
        last_updated: Date,
        recovery_emails_sent: Number,
        recovered: Boolean,
        recovery_date: Date
      }]
    }
  },
  analytics_reporting: {
    sales_analytics: {
      daily_sales: [{
        date: Date,
        total_sales: Number,
        total_orders: Number,
        average_order_value: Number,
        new_customers: Number,
        returning_customers: Number
      }],
      product_performance: [{
        product_id: String,
        units_sold: Number,
        revenue: Number,
        profit_margin: Number,
        return_rate: Number,
        customer_rating: Number
      }],
      channel_performance: [{
        channel: String,
        sales: Number,
        orders: Number,
        conversion_rate: Number,
        customer_acquisition_cost: Number
      }]
    },
    inventory_analytics: {
      turnover_rates: [{
        product_id: String,
        turnover_rate: Number,
        days_in_stock: Number,
        reorder_frequency: Number
      }],
      stock_levels: [{
        product_id: String,
        current_stock: Number,
        safety_stock: Number,
        stock_status: String, // in_stock, low_stock, out_of_stock
        days_until_stockout: Number
      }],
      dead_stock_analysis: [{
        product_id: String,
        days_without_sale: Number,
        current_value: Number,
        recommendation: String
      }]
    },
    customer_analytics: {
      customer_segments: [{
        segment_name: String,
        customer_count: Number,
        total_value: Number,
        average_order_value: Number,
        purchase_frequency: Number
      }],
      churn_analysis: {
        churn_rate: Number,
        at_risk_customers: Number,
        high_value_churned: Number,
        retention_rate: Number
      },
      lifetime_value: [{
        customer_id: String,
        total_spent: Number,
        predicted_lifetime_value: Number,
        clv_segment: String
      }]
    }
  },
  integrations: {
    accounting_systems: [{
      system_name: String,
      api_endpoint: String,
      credentials: mongoose.Schema.Types.Mixed,
      sync_frequency: String,
      last_sync: Date,
      sync_status: String
    }],
    marketplace_integrations: [{
      marketplace: String, // amazon, ebay, shopify, etc.
      account_id: String,
      api_credentials: mongoose.Schema.Types.Mixed,
      sync_products: Boolean,
      sync_orders: Boolean,
      sync_inventory: Boolean,
      last_sync: Date
    }],
    shipping_carriers: [{
      carrier_name: String,
      account_number: String,
      api_credentials: mongoose.Schema.Types.Mixed,
      services: [String],
      default_service: String,
      tracking_enabled: Boolean
    }]
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update timestamp on save
retailModuleSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Method to add product
retailModuleSchema.methods.addProduct = function(productData) {
  const product = {
    product_id: new mongoose.Types.ObjectId().toString(),
    ...productData,
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
  };
  
  this.inventory_management.products.push(product);
  return product;
};

// Method to update inventory
retailModuleSchema.methods.updateInventory = function(productId, locationId, quantityChange, movementType, reason, referenceNumber) {
  const product = this.inventory_management.products.find(p => p.product_id === productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Update location-specific stock
  let locationStock = product.inventory.stock_by_location.find(s => s.location_id === locationId);
  if (!locationStock) {
    locationStock = {
      location_id: locationId,
      quantity: 0,
      reserved: 0,
      bin_location: ''
    };
    product.inventory.stock_by_location.push(locationStock);
  }
  
  const previousQuantity = locationStock.quantity;
  locationStock.quantity += quantityChange;
  
  // Update total stock
  product.inventory.current_stock = product.inventory.stock_by_location.reduce((total, stock) => total + stock.quantity, 0);
  product.inventory.available_stock = product.inventory.current_stock - product.inventory.reserved_stock;
  
  // Log stock movement
  const movement = {
    movement_id: new mongoose.Types.ObjectId().toString(),
    product_id: productId,
    location_id: locationId,
    movement_type: movementType,
    quantity_change: quantityChange,
    previous_quantity: previousQuantity,
    new_quantity: locationStock.quantity,
    reason: reason,
    reference_number: referenceNumber,
    processed_by: 'system', // Would be actual user ID
    processed_at: new Date()
  };
  
  this.inventory_management.stock_movements.push(movement);
  
  return {
    product_id: productId,
    previous_stock: previousQuantity,
    new_stock: locationStock.quantity,
    total_stock: product.inventory.current_stock,
    movement_id: movement.movement_id
  };
};

// Method to create order
retailModuleSchema.methods.createOrder = function(orderData) {
  const order = {
    order_id: new mongoose.Types.ObjectId().toString(),
    order_number: this.generateOrderNumber(),
    ...orderData,
    order_status: 'pending',
    created_at: new Date(),
    updated_at: new Date()
  };
  
  this.sales_management.orders.push(order);
  
  // Reserve inventory for order items
  order.items.forEach(item => {
    const product = this.inventory_management.products.find(p => p.product_id === item.product_id);
    if (product) {
      product.inventory.reserved_stock += item.quantity;
      product.inventory.available_stock = product.inventory.current_stock - product.inventory.reserved_stock;
    }
  });
  
  return order;
};

// Method to generate order number
retailModuleSchema.methods.generateOrderNumber = function() {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `ORD-${year}${month}${day}-${random}`;
};

// Method to process order fulfillment
retailModuleSchema.methods.fulfillOrder = function(orderId, fulfillmentData) {
  const order = this.sales_management.orders.find(o => o.order_id === orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  // Update order status and fulfillment info
  order.order_status = 'processing';
  order.fulfillment = {
    ...order.fulfillment,
    ...fulfillmentData,
    picked_at: new Date()
  };
  
  // Update inventory - convert reserved to sold
  order.items.forEach(item => {
    this.updateInventory(
      item.product_id,
      fulfillmentData.fulfillment_location,
      -item.quantity,
      'sale',
      'Order fulfillment',
      order.order_number
    );
    
    // Reduce reserved stock
    const product = this.inventory_management.products.find(p => p.product_id === item.product_id);
    if (product) {
      product.inventory.reserved_stock -= item.quantity;
      product.inventory.available_stock = product.inventory.current_stock - product.inventory.reserved_stock;
    }
  });
  
  return order;
};

// Method to calculate customer analytics
retailModuleSchema.methods.calculateCustomerAnalytics = function(customerId) {
  const customer = this.customer_management.customers.find(c => c.customer_id === customerId);
  
  if (!customer) {
    throw new Error('Customer not found');
  }
  
  const customerOrders = this.sales_management.orders.filter(o => 
    o.customer_info.customer_id === customerId && 
    o.order_status !== 'cancelled'
  );
  
  const analytics = {
    customer_id: customerId,
    total_orders: customerOrders.length,
    total_spent: customerOrders.reduce((sum, order) => sum + order.pricing_summary.total_amount, 0),
    average_order_value: customerOrders.length > 0 ? 
      customerOrders.reduce((sum, order) => sum + order.pricing_summary.total_amount, 0) / customerOrders.length : 0,
    first_order_date: customerOrders.length > 0 ? 
      new Date(Math.min(...customerOrders.map(o => new Date(o.created_at)))) : null,
    last_order_date: customerOrders.length > 0 ? 
      new Date(Math.max(...customerOrders.map(o => new Date(o.created_at)))) : null,
    order_frequency: this.calculateOrderFrequency(customerOrders),
    preferred_categories: this.getPreferredCategories(customerOrders),
    lifetime_value_segment: this.classifyCustomerValue(customerOrders.reduce((sum, order) => sum + order.pricing_summary.total_amount, 0)),
    churn_risk: this.assessChurnRisk(customerOrders)
  };
  
  return analytics;
};

// Helper method to calculate order frequency
retailModuleSchema.methods.calculateOrderFrequency = function(orders) {
  if (orders.length < 2) return 0;
  
  const sortedOrders = orders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const firstOrder = new Date(sortedOrders[0].created_at);
  const lastOrder = new Date(sortedOrders[sortedOrders.length - 1].created_at);
  const daysBetween = (lastOrder - firstOrder) / (1000 * 60 * 60 * 24);
  
  return orders.length / (daysBetween / 30); // Orders per month
};

// Helper method to get preferred categories
retailModuleSchema.methods.getPreferredCategories = function(orders) {
  const categoryCount = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      const product = this.inventory_management.products.find(p => p.product_id === item.product_id);
      if (product && product.basic_info.category) {
        categoryCount[product.basic_info.category] = (categoryCount[product.basic_info.category] || 0) + item.quantity;
      }
    });
  });
  
  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category]) => category);
};

// Helper method to classify customer value
retailModuleSchema.methods.classifyCustomerValue = function(totalSpent) {
  if (totalSpent >= 5000) return 'high_value';
  if (totalSpent >= 1000) return 'medium_value';
  if (totalSpent >= 100) return 'low_value';
  return 'new_customer';
};

// Helper method to assess churn risk
retailModuleSchema.methods.assessChurnRisk = function(orders) {
  if (orders.length === 0) return 'unknown';
  
  const lastOrder = new Date(Math.max(...orders.map(o => new Date(o.created_at))));
  const daysSinceLastOrder = (new Date() - lastOrder) / (1000 * 60 * 60 * 24);
  
  if (daysSinceLastOrder > 365) return 'high';
  if (daysSinceLastOrder > 180) return 'medium';
  if (daysSinceLastOrder > 90) return 'low';
  return 'active';
};

// Method to generate sales report
retailModuleSchema.methods.generateSalesReport = function(startDate, endDate) {
  const orders = this.sales_management.orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= startDate && orderDate <= endDate && order.order_status !== 'cancelled';
  });
  
  const report = {
    period: {
      start_date: startDate,
      end_date: endDate,
      days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    },
    summary: {
      total_orders: orders.length,
      total_revenue: orders.reduce((sum, order) => sum + order.pricing_summary.total_amount, 0),
      average_order_value: orders.length > 0 ? 
        orders.reduce((sum, order) => sum + order.pricing_summary.total_amount, 0) / orders.length : 0,
      unique_customers: [...new Set(orders.map(o => o.customer_info.customer_id))].length
    },
    daily_breakdown: this.generateDailyBreakdown(orders, startDate, endDate),
    top_products: this.getTopSellingProducts(orders),
    channel_performance: this.getChannelPerformance(orders),
    payment_method_breakdown: this.getPaymentMethodBreakdown(orders)
  };
  
  return report;
};

// Helper method for daily breakdown
retailModuleSchema.methods.generateDailyBreakdown = function(orders, startDate, endDate) {
  const dailyData = {};
  const currentDate = new Date(startDate);
  
  // Initialize all days with zero values
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    dailyData[dateStr] = {
      date: new Date(currentDate),
      orders: 0,
      revenue: 0,
      customers: new Set()
    };
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Populate with actual data
  orders.forEach(order => {
    const dateStr = new Date(order.created_at).toISOString().split('T')[0];
    if (dailyData[dateStr]) {
      dailyData[dateStr].orders += 1;
      dailyData[dateStr].revenue += order.pricing_summary.total_amount;
      dailyData[dateStr].customers.add(order.customer_info.customer_id);
    }
  });
  
  // Convert sets to counts
  return Object.values(dailyData).map(day => ({
    date: day.date,
    orders: day.orders,
    revenue: day.revenue,
    unique_customers: day.customers.size
  }));
};

// Helper method for top selling products
retailModuleSchema.methods.getTopSellingProducts = function(orders) {
  const productSales = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.product_id]) {
        productSales[item.product_id] = {
          product_id: item.product_id,
          product_name: item.product_name,
          quantity_sold: 0,
          revenue: 0
        };
      }
      productSales[item.product_id].quantity_sold += item.quantity;
      productSales[item.product_id].revenue += item.total_amount;
    });
  });
  
  return Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
};

// Helper method for channel performance
retailModuleSchema.methods.getChannelPerformance = function(orders) {
  const channelData = {};
  
  orders.forEach(order => {
    const channel = order.sales_channel || 'unknown';
    if (!channelData[channel]) {
      channelData[channel] = {
        channel: channel,
        orders: 0,
        revenue: 0
      };
    }
    channelData[channel].orders += 1;
    channelData[channel].revenue += order.pricing_summary.total_amount;
  });
  
  return Object.values(channelData);
};

// Helper method for payment method breakdown
retailModuleSchema.methods.getPaymentMethodBreakdown = function(orders) {
  const paymentData = {};
  
  orders.forEach(order => {
    const method = order.payment_info.payment_method || 'unknown';
    if (!paymentData[method]) {
      paymentData[method] = {
        payment_method: method,
        orders: 0,
        revenue: 0
      };
    }
    paymentData[method].orders += 1;
    paymentData[method].revenue += order.pricing_summary.total_amount;
  });
  
  return Object.values(paymentData);
};

module.exports = mongoose.model('RetailModule', retailModuleSchema); 