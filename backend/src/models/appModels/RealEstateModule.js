const mongoose = require('mongoose');

const realEstateModuleSchema = new mongoose.Schema({
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  agency_info: {
    agency_name: String,
    license_number: String,
    agency_type: {
      type: String,
      enum: ['residential', 'commercial', 'industrial', 'mixed', 'luxury', 'investment']
    },
    established_date: Date,
    address: {
      street: String,
      city: String,
      state: String,
      zip_code: String,
      country: String
    },
    contact_info: {
      phone: String,
      fax: String,
      email: String,
      website: String,
      emergency_contact: String
    },
    certifications: [String],
    service_areas: [String],
    specializations: [String]
  },
  property_management: {
    properties: [{
      property_id: { type: String, unique: true },
      basic_info: {
        property_type: {
          type: String,
          enum: ['single_family', 'condo', 'townhouse', 'multi_family', 'commercial', 'land', 'industrial']
        },
        status: {
          type: String,
          enum: ['for_sale', 'for_rent', 'sold', 'rented', 'off_market', 'pending', 'under_contract']
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
        mls_number: String,
        parcel_number: String,
        listing_date: Date,
        expiration_date: Date
      },
      property_details: {
        square_footage: Number,
        lot_size: Number,
        bedrooms: Number,
        bathrooms: Number,
        half_baths: Number,
        garage_spaces: Number,
        year_built: Number,
        stories: Number,
        basement: Boolean,
        pool: Boolean,
        fireplace: Number,
        ac_type: String,
        heating_type: String,
        roof_type: String,
        flooring_types: [String],
        appliances_included: [String]
      },
      financial_info: {
        list_price: Number,
        previous_prices: [{
          price: Number,
          date_changed: Date,
          reason: String
        }],
        property_taxes: Number,
        hoa_fees: Number,
        utilities_included: [String],
        estimated_monthly_costs: Number,
        down_payment_assistance: Boolean,
        financing_options: [String]
      },
      media: {
        photos: [{
          url: String,
          caption: String,
          is_primary: Boolean,
          room_type: String,
          upload_date: Date
        }],
        virtual_tour_url: String,
        video_tour_url: String,
        floor_plan_url: String,
        documents: [{
          document_type: String, // disclosure, inspection, appraisal
          url: String,
          upload_date: Date,
          access_level: String // public, agent_only, client_only
        }]
      },
      neighborhood_info: {
        school_district: String,
        schools: [{
          name: String,
          type: String, // elementary, middle, high
          rating: Number,
          distance_miles: Number
        }],
        nearby_amenities: [{
          name: String,
          type: String, // shopping, dining, recreation, transportation
          distance_miles: Number
        }],
        transportation: {
          public_transit: [String],
          major_highways: [String],
          airport_distance: Number,
          walkability_score: Number
        }
      },
      inspection_reports: [{
        inspection_id: String,
        inspector_name: String,
        inspection_date: Date,
        inspection_type: String, // general, pest, roof, electrical, plumbing
        issues_found: [{
          category: String,
          severity: String, // minor, moderate, major, safety
          description: String,
          estimated_cost: Number,
          photos: [String]
        }],
        overall_condition: String,
        report_url: String
      }],
      showing_history: [{
        showing_id: String,
        date_time: Date,
        duration_minutes: Number,
        client_id: String,
        agent_id: String,
        feedback: String,
        interest_level: String, // high, medium, low, none
        follow_up_required: Boolean
      }],
      offers: [{
        offer_id: String,
        buyer_id: String,
        offer_price: Number,
        earnest_money: Number,
        financing_type: String,
        down_payment_percentage: Number,
        contingencies: [String],
        closing_date: Date,
        offer_date: Date,
        expiration_date: Date,
        status: String, // pending, accepted, rejected, countered, expired
        counter_offers: [{
          counter_price: Number,
          counter_terms: String,
          counter_date: Date,
          response_deadline: Date
        }]
      }],
      created_at: { type: Date, default: Date.now },
      last_updated: { type: Date, default: Date.now }
    }]
  },
  client_management: {
    clients: [{
      client_id: String,
      client_type: {
        type: String,
        enum: ['buyer', 'seller', 'tenant', 'landlord', 'investor']
      },
      personal_info: {
        first_name: String,
        last_name: String,
        email: String,
        phone: String,
        alternate_phone: String,
        date_of_birth: Date,
        occupation: String,
        employer: String,
        marital_status: String,
        address: {
          street: String,
          city: String,
          state: String,
          zip_code: String,
          country: String
        }
      },
      preferences: {
        property_type: [String],
        min_price: Number,
        max_price: Number,
        min_bedrooms: Number,
        max_bedrooms: Number,
        min_bathrooms: Number,
        preferred_locations: [String],
        must_have_features: [String],
        deal_breakers: [String],
        timeline: String,
        communication_preference: String // email, phone, text, in_person
      },
      financial_qualification: {
        pre_approved: Boolean,
        pre_approval_amount: Number,
        pre_approval_date: Date,
        lender_info: {
          lender_name: String,
          loan_officer: String,
          phone: String,
          email: String
        },
        down_payment_available: Number,
        monthly_income: Number,
        debt_obligations: Number,
        credit_score: Number,
        employment_history: [{
          employer: String,
          position: String,
          start_date: Date,
          end_date: Date,
          monthly_income: Number
        }]
      },
      interactions: [{
        interaction_id: String,
        interaction_type: String, // call, email, meeting, showing, text
        date_time: Date,
        duration_minutes: Number,
        agent_id: String,
        notes: String,
        follow_up_required: Boolean,
        follow_up_date: Date,
        outcome: String
      }],
      property_interests: [{
        property_id: String,
        interest_level: String,
        notes: String,
        viewed_date: Date,
        offer_submitted: Boolean
      }],
      documents: [{
        document_type: String, // id, income_verification, bank_statements, pre_approval
        document_name: String,
        url: String,
        upload_date: Date,
        expiration_date: Date,
        verified: Boolean
      }],
      referral_source: String,
      lead_source: String,
      agent_assigned: String,
      client_status: String, // active, inactive, converted, lost
      created_at: { type: Date, default: Date.now }
    }]
  },
  agents_staff: [{
    agent_id: String,
    personal_info: {
      first_name: String,
      last_name: String,
      license_number: String,
      license_state: String,
      license_expiration: Date,
      email: String,
      phone: String,
      photo_url: String
    },
    professional_info: {
      hire_date: Date,
      position: String, // agent, broker, assistant, manager
      specializations: [String],
      certifications: [String],
      years_experience: Number,
      languages_spoken: [String],
      service_areas: [String]
    },
    performance_metrics: {
      current_year: {
        listings_taken: Number,
        listings_sold: Number,
        buyer_transactions: Number,
        total_volume: Number,
        total_commission: Number,
        average_days_on_market: Number
      },
      career_totals: {
        total_transactions: Number,
        total_volume: Number,
        total_commission: Number
      }
    },
    client_assignments: [String], // client IDs
    property_assignments: [String], // property IDs
    schedule: [{
      date: Date,
      appointments: [{
        time: String,
        type: String, // showing, listing_appointment, client_meeting
        client_id: String,
        property_id: String,
        notes: String
      }]
    }],
    marketing_materials: [{
      material_type: String, // business_card, flyer, brochure, yard_sign
      design_template: String,
      last_updated: Date
    }]
  }],
  transaction_management: {
    transactions: [{
      transaction_id: String,
      transaction_type: {
        type: String,
        enum: ['sale', 'purchase', 'lease', 'rental']
      },
      property_id: String,
      client_id: String,
      agent_id: String,
      transaction_status: {
        type: String,
        enum: ['pending', 'under_contract', 'in_escrow', 'closed', 'cancelled', 'failed']
      },
      key_dates: {
        contract_date: Date,
        inspection_deadline: Date,
        appraisal_deadline: Date,
        financing_deadline: Date,
        closing_date: Date,
        possession_date: Date
      },
      financial_details: {
        sale_price: Number,
        earnest_money: Number,
        down_payment: Number,
        loan_amount: Number,
        interest_rate: Number,
        commission_rate: Number,
        total_commission: Number,
        agent_commission: Number,
        closing_costs: Number,
        net_proceeds: Number
      },
      parties_involved: {
        buyer_agent: String,
        seller_agent: String,
        title_company: String,
        lender: String,
        appraiser: String,
        inspector: String,
        attorney: String
      },
      documents: [{
        document_type: String, // contract, addendum, disclosure, inspection_report
        document_name: String,
        url: String,
        upload_date: Date,
        signed: Boolean,
        required: Boolean
      }],
      milestones: [{
        milestone_name: String,
        due_date: Date,
        completed_date: Date,
        responsible_party: String,
        status: String, // pending, completed, overdue
        notes: String
      }],
      contingencies: [{
        contingency_type: String, // inspection, appraisal, financing, sale_of_home
        deadline: Date,
        status: String, // active, satisfied, waived, failed
        notes: String
      }],
      communications: [{
        communication_id: String,
        date_time: Date,
        from: String,
        to: [String],
        subject: String,
        message: String,
        communication_type: String, // email, call, text, in_person
        attachments: [String]
      }]
    }]
  },
  mls_integration: {
    mls_systems: [{
      mls_name: String,
      mls_id: String,
      api_endpoint: String,
      authentication: mongoose.Schema.Types.Mixed,
      coverage_areas: [String],
      last_sync: Date,
      sync_frequency: String, // hourly, daily, real_time
      sync_status: String, // active, inactive, error
      data_mapping: mongoose.Schema.Types.Mixed
    }],
    listing_sync: {
      auto_sync_enabled: Boolean,
      sync_direction: String, // two_way, push_only, pull_only
      sync_fields: [String],
      last_full_sync: Date,
      sync_errors: [{
        error_date: Date,
        property_id: String,
        error_message: String,
        resolved: Boolean
      }]
    },
    market_data: {
      comparable_sales: [{
        property_id: String,
        sale_date: Date,
        sale_price: Number,
        square_footage: Number,
        price_per_sqft: Number,
        days_on_market: Number,
        address: String
      }],
      market_trends: [{
        area: String,
        period: String,
        average_sale_price: Number,
        median_sale_price: Number,
        average_days_on_market: Number,
        price_change_percentage: Number,
        inventory_levels: Number
      }]
    }
  },
  marketing_tools: {
    listing_marketing: [{
      property_id: String,
      marketing_plan: {
        target_audience: String,
        marketing_channels: [String], // mls, website, social_media, print_ads
        budget: Number,
        duration_days: Number
      },
      social_media_posts: [{
        platform: String, // facebook, instagram, twitter, linkedin
        post_content: String,
        scheduled_date: Date,
        posted: Boolean,
        engagement_metrics: {
          likes: Number,
          shares: Number,
          comments: Number,
          views: Number
        }
      }],
      print_materials: [{
        material_type: String, // flyer, brochure, postcard, yard_sign
        design_url: String,
        quantity_ordered: Number,
        cost: Number,
        distribution_plan: String
      }],
      online_advertising: [{
        platform: String, // zillow, realtor_com, facebook_ads, google_ads
        ad_type: String,
        budget: Number,
        start_date: Date,
        end_date: Date,
        performance_metrics: {
          impressions: Number,
          clicks: Number,
          leads_generated: Number,
          cost_per_lead: Number
        }
      }]
    }],
    lead_generation: {
      lead_sources: [{
        source_name: String,
        source_type: String, // website, social_media, referral, advertisement
        leads_generated: Number,
        conversion_rate: Number,
        cost_per_lead: Number,
        roi: Number
      }],
      website_integration: {
        website_url: String,
        idx_enabled: Boolean,
        lead_capture_forms: [{
          form_name: String,
          form_location: String,
          conversion_rate: Number,
          leads_captured: Number
        }]
      }
    }
  },
  financial_tracking: {
    commission_tracking: [{
      transaction_id: String,
      commission_amount: Number,
      commission_percentage: Number,
      split_percentage: Number,
      net_commission: Number,
      payment_date: Date,
      payment_status: String, // pending, paid, disputed
      taxes_withheld: Number
    }],
    expenses: [{
      expense_id: String,
      expense_category: String, // marketing, licensing, education, transportation
      amount: Number,
      date: Date,
      description: String,
      receipt_url: String,
      tax_deductible: Boolean,
      reimbursable: Boolean
    }],
    financial_reports: [{
      report_period: String,
      total_revenue: Number,
      total_expenses: Number,
      net_profit: Number,
      commission_by_agent: mongoose.Schema.Types.Mixed,
      expense_breakdown: mongoose.Schema.Types.Mixed,
      tax_summary: mongoose.Schema.Types.Mixed
    }]
  },
  compliance_regulations: {
    fair_housing: {
      training_records: [{
        agent_id: String,
        training_date: Date,
        training_provider: String,
        certificate_url: String,
        expiration_date: Date
      }],
      complaint_tracking: [{
        complaint_id: String,
        complaint_date: Date,
        complainant: String,
        description: String,
        investigation_status: String,
        resolution: String,
        resolved_date: Date
      }]
    },
    license_management: {
      agency_licenses: [{
        license_type: String,
        license_number: String,
        issuing_state: String,
        issue_date: Date,
        expiration_date: Date,
        renewal_required: Boolean,
        renewal_reminder_sent: Boolean
      }],
      agent_licenses: [{
        agent_id: String,
        license_number: String,
        license_state: String,
        issue_date: Date,
        expiration_date: Date,
        continuing_education: [{
          course_name: String,
          completion_date: Date,
          credit_hours: Number,
          provider: String
        }]
      }]
    },
    data_privacy: {
      gdpr_compliance: Boolean,
      data_retention_policy: String,
      privacy_notice_url: String,
      consent_records: [{
        client_id: String,
        consent_type: String,
        granted: Boolean,
        date_granted: Date,
        ip_address: String
      }]
    }
  },
  reporting_analytics: {
    performance_reports: [{
      report_type: String, // agent_performance, market_analysis, financial_summary
      period: String,
      generated_date: Date,
      data: mongoose.Schema.Types.Mixed,
      recipients: [String]
    }],
    market_analytics: {
      price_trends: [{
        area: String,
        period: String,
        average_price: Number,
        median_price: Number,
        price_appreciation: Number,
        volume_sold: Number
      }],
      inventory_analysis: {
        total_listings: Number,
        new_listings: Number,
        pending_sales: Number,
        closed_sales: Number,
        months_of_inventory: Number,
        absorption_rate: Number
      }
    },
    kpi_tracking: {
      agency_kpis: {
        total_transactions: Number,
        total_volume: Number,
        average_sale_price: Number,
        average_days_on_market: Number,
        list_to_sale_ratio: Number,
        client_satisfaction_score: Number
      },
      agent_kpis: [{
        agent_id: String,
        listings_taken: Number,
        listings_sold: Number,
        buyer_transactions: Number,
        total_volume: Number,
        conversion_rate: Number,
        customer_satisfaction: Number
      }]
    }
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update timestamp on save
realEstateModuleSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Method to create new property listing
realEstateModuleSchema.methods.createProperty = function(propertyData) {
  const property = {
    property_id: new mongoose.Types.ObjectId().toString(),
    ...propertyData,
    created_at: new Date(),
    last_updated: new Date()
  };
  
  this.property_management.properties.push(property);
  return property;
};

// Method to add client
realEstateModuleSchema.methods.addClient = function(clientData) {
  const client = {
    client_id: new mongoose.Types.ObjectId().toString(),
    ...clientData,
    created_at: new Date()
  };
  
  this.client_management.clients.push(client);
  return client;
};

// Method to track property showing
realEstateModuleSchema.methods.recordShowing = function(propertyId, showingData) {
  const property = this.property_management.properties.find(p => p.property_id === propertyId);
  
  if (!property) {
    throw new Error('Property not found');
  }
  
  const showing = {
    showing_id: new mongoose.Types.ObjectId().toString(),
    ...showingData,
    date_time: showingData.date_time || new Date()
  };
  
  property.showing_history.push(showing);
  return showing;
};

// Method to submit offer
realEstateModuleSchema.methods.submitOffer = function(propertyId, offerData) {
  const property = this.property_management.properties.find(p => p.property_id === propertyId);
  
  if (!property) {
    throw new Error('Property not found');
  }
  
  const offer = {
    offer_id: new mongoose.Types.ObjectId().toString(),
    ...offerData,
    offer_date: new Date(),
    status: 'pending'
  };
  
  property.offers.push(offer);
  return offer;
};

// Method to create transaction
realEstateModuleSchema.methods.createTransaction = function(transactionData) {
  const transaction = {
    transaction_id: new mongoose.Types.ObjectId().toString(),
    ...transactionData,
    transaction_status: 'pending'
  };
  
  this.transaction_management.transactions.push(transaction);
  return transaction;
};

// Method to calculate agent performance
realEstateModuleSchema.methods.calculateAgentPerformance = function(agentId, year = new Date().getFullYear()) {
  const agent = this.agents_staff.find(a => a.agent_id === agentId);
  
  if (!agent) {
    throw new Error('Agent not found');
  }
  
  const transactions = this.transaction_management.transactions.filter(t => 
    t.agent_id === agentId && 
    new Date(t.key_dates.contract_date).getFullYear() === year &&
    t.transaction_status === 'closed'
  );
  
  const listings = this.property_management.properties.filter(p => 
    p.basic_info.agent_assigned === agentId &&
    new Date(p.basic_info.listing_date).getFullYear() === year
  );
  
  const performance = {
    agent_id: agentId,
    year: year,
    total_transactions: transactions.length,
    total_volume: transactions.reduce((sum, t) => sum + (t.financial_details.sale_price || 0), 0),
    total_commission: transactions.reduce((sum, t) => sum + (t.financial_details.agent_commission || 0), 0),
    listings_taken: listings.length,
    listings_sold: listings.filter(l => l.basic_info.status === 'sold').length,
    average_days_on_market: this.calculateAverageDaysOnMarket(agentId, year),
    conversion_rate: listings.length > 0 ? 
      (listings.filter(l => l.basic_info.status === 'sold').length / listings.length) * 100 : 0
  };
  
  return performance;
};

// Method to calculate average days on market
realEstateModuleSchema.methods.calculateAverageDaysOnMarket = function(agentId, year) {
  const soldProperties = this.property_management.properties.filter(p => 
    p.basic_info.agent_assigned === agentId &&
    p.basic_info.status === 'sold' &&
    new Date(p.basic_info.listing_date).getFullYear() === year
  );
  
  if (soldProperties.length === 0) return 0;
  
  const totalDays = soldProperties.reduce((sum, property) => {
    const soldTransaction = this.transaction_management.transactions.find(t => 
      t.property_id === property.property_id && t.transaction_status === 'closed'
    );
    
    if (soldTransaction) {
      const listingDate = new Date(property.basic_info.listing_date);
      const closingDate = new Date(soldTransaction.key_dates.closing_date);
      const daysOnMarket = Math.ceil((closingDate - listingDate) / (1000 * 60 * 60 * 24));
      return sum + daysOnMarket;
    }
    
    return sum;
  }, 0);
  
  return Math.round(totalDays / soldProperties.length);
};

// Method to generate market analysis
realEstateModuleSchema.methods.generateMarketAnalysis = function(area, propertyType, timeframe = '6m') {
  const cutoffDate = new Date();
  const months = timeframe === '6m' ? 6 : timeframe === '1y' ? 12 : 3;
  cutoffDate.setMonth(cutoffDate.getMonth() - months);
  
  const comparableSales = this.mls_integration.market_data.comparable_sales.filter(sale =>
    sale.address.includes(area) &&
    new Date(sale.sale_date) >= cutoffDate
  );
  
  if (comparableSales.length === 0) {
    return {
      area: area,
      property_type: propertyType,
      timeframe: timeframe,
      sample_size: 0,
      message: 'Insufficient data for analysis'
    };
  }
  
  const prices = comparableSales.map(sale => sale.sale_price);
  const daysOnMarket = comparableSales.map(sale => sale.days_on_market);
  
  const analysis = {
    area: area,
    property_type: propertyType,
    timeframe: timeframe,
    sample_size: comparableSales.length,
    price_analysis: {
      average_price: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      median_price: this.calculateMedian(prices),
      min_price: Math.min(...prices),
      max_price: Math.max(...prices),
      price_per_sqft: {
        average: comparableSales.reduce((sum, sale) => sum + sale.price_per_sqft, 0) / comparableSales.length,
        median: this.calculateMedian(comparableSales.map(sale => sale.price_per_sqft))
      }
    },
    market_activity: {
      average_days_on_market: daysOnMarket.reduce((sum, days) => sum + days, 0) / daysOnMarket.length,
      median_days_on_market: this.calculateMedian(daysOnMarket),
      fastest_sale: Math.min(...daysOnMarket),
      slowest_sale: Math.max(...daysOnMarket)
    },
    trends: this.calculatePriceTrend(comparableSales),
    generated_at: new Date()
  };
  
  return analysis;
};

// Helper method to calculate median
realEstateModuleSchema.methods.calculateMedian = function(values) {
  const sorted = values.sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
};

// Helper method to calculate price trend
realEstateModuleSchema.methods.calculatePriceTrend = function(sales) {
  // Sort sales by date
  sales.sort((a, b) => new Date(a.sale_date) - new Date(b.sale_date));
  
  if (sales.length < 2) return 'insufficient_data';
  
  const firstHalf = sales.slice(0, Math.floor(sales.length / 2));
  const secondHalf = sales.slice(Math.floor(sales.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, sale) => sum + sale.sale_price, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, sale) => sum + sale.sale_price, 0) / secondHalf.length;
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (change > 5) return 'increasing';
  if (change < -5) return 'decreasing';
  return 'stable';
};

module.exports = mongoose.model('RealEstateModule', realEstateModuleSchema); 