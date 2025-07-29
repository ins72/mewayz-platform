const mongoose = require('mongoose');

const marketingIntelligenceSchema = new mongoose.Schema({
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  customer_segmentation: {
    segments: [{
      segment_id: String,
      segment_name: String,
      description: String,
      criteria: {
        demographic: {
          age_range: { min: Number, max: Number },
          gender: [String],
          income_range: { min: Number, max: Number },
          education_level: [String],
          location: [String],
          job_title: [String]
        },
        behavioral: {
          purchase_frequency: String, // high, medium, low
          average_order_value: { min: Number, max: Number },
          lifetime_value: { min: Number, max: Number },
          product_categories: [String],
          channels_used: [String],
          engagement_level: String // high, medium, low
        },
        psychographic: {
          interests: [String],
          values: [String],
          lifestyle: [String],
          personality_traits: [String]
        },
        technographic: {
          devices_used: [String],
          social_platforms: [String],
          preferred_communication: [String],
          digital_savviness: String
        }
      },
      size: Number,
      growth_rate: Number,
      profitability_score: Number,
      engagement_score: Number,
      churn_risk: String, // high, medium, low
      recommended_strategy: String,
      created_at: { type: Date, default: Date.now },
      last_updated: { type: Date, default: Date.now }
    }]
  },
  customer_journey_mapping: {
    touchpoints: [{
      touchpoint_id: String,
      touchpoint_name: String,
      stage: {
        type: String,
        enum: ['awareness', 'consideration', 'decision', 'purchase', 'retention', 'advocacy']
      },
      channel: String,
      description: String,
      interactions: [{
        interaction_type: String,
        frequency: Number,
        conversion_rate: Number,
        satisfaction_score: Number,
        pain_points: [String],
        opportunities: [String]
      }],
      metrics: {
        traffic: Number,
        engagement_rate: Number,
        conversion_rate: Number,
        bounce_rate: Number,
        time_spent: Number,
        cost_per_interaction: Number
      }
    }],
    customer_paths: [{
      path_id: String,
      path_name: String,
      sequence: [String], // touchpoint IDs
      frequency: Number,
      conversion_rate: Number,
      average_time_to_convert: Number,
      revenue_generated: Number,
      drop_off_points: [String]
    }]
  },
  campaign_analytics: {
    campaigns: [{
      campaign_id: String,
      campaign_name: String,
      campaign_type: {
        type: String,
        enum: ['email', 'social_media', 'ppc', 'content', 'influencer', 'affiliate', 'display', 'video', 'mobile']
      },
      objectives: [String],
      target_segments: [String],
      budget: {
        total_budget: Number,
        spent_budget: Number,
        cost_per_acquisition: Number,
        cost_per_click: Number,
        cost_per_impression: Number
      },
      timeline: {
        start_date: Date,
        end_date: Date,
        duration_days: Number
      },
      creative_assets: [{
        asset_type: String,
        asset_url: String,
        performance_score: Number,
        engagement_rate: Number
      }],
      performance_metrics: {
        impressions: Number,
        clicks: Number,
        click_through_rate: Number,
        conversions: Number,
        conversion_rate: Number,
        revenue: Number,
        return_on_ad_spend: Number,
        reach: Number,
        frequency: Number,
        engagement_rate: Number,
        brand_awareness_lift: Number,
        sentiment_score: Number
      },
      channel_breakdown: [{
        channel: String,
        spend: Number,
        impressions: Number,
        clicks: Number,
        conversions: Number,
        revenue: Number
      }],
      audience_insights: {
        demographics: mongoose.Schema.Types.Mixed,
        interests: [String],
        behaviors: [String],
        devices: [String],
        locations: [String]
      },
      optimization_recommendations: [String],
      a_b_tests: [{
        test_name: String,
        variants: [{
          variant_name: String,
          traffic_allocation: Number,
          metrics: mongoose.Schema.Types.Mixed
        }],
        winner: String,
        confidence_level: Number,
        test_start: Date,
        test_end: Date
      }]
    }]
  },
  content_intelligence: {
    content_performance: [{
      content_id: String,
      content_title: String,
      content_type: String,
      publication_date: Date,
      author: String,
      channels: [String],
      topics: [String],
      keywords: [String],
      metrics: {
        views: Number,
        unique_visitors: Number,
        time_on_page: Number,
        bounce_rate: Number,
        shares: Number,
        comments: Number,
        likes: Number,
        downloads: Number,
        conversions: Number,
        revenue_attributed: Number
      },
      seo_metrics: {
        search_rankings: [{
          keyword: String,
          position: Number,
          search_volume: Number,
          competition: String
        }],
        organic_traffic: Number,
        backlinks: Number,
        domain_authority: Number
      },
      audience_engagement: {
        demographics: mongoose.Schema.Types.Mixed,
        engagement_by_segment: [{
          segment: String,
          engagement_rate: Number,
          conversion_rate: Number
        }],
        sentiment_analysis: {
          positive: Number,
          neutral: Number,
          negative: Number,
          overall_score: Number
        }
      }
    }],
    content_gaps: [{
      topic: String,
      search_volume: Number,
      competition_level: String,
      content_opportunity_score: Number,
      recommended_content_type: String,
      target_keywords: [String]
    }],
    trending_topics: [{
      topic: String,
      trend_score: Number,
      search_volume_change: Number,
      social_mentions: Number,
      opportunity_window: String
    }]
  },
  competitor_analysis: {
    competitors: [{
      competitor_id: String,
      competitor_name: String,
      competitor_url: String,
      market_share: Number,
      category: String,
      analysis_metrics: {
        website_traffic: {
          monthly_visits: Number,
          traffic_sources: [{
            source: String,
            percentage: Number
          }],
          top_pages: [String],
          bounce_rate: Number,
          session_duration: Number
        },
        seo_performance: {
          organic_keywords: Number,
          organic_traffic: Number,
          backlinks: Number,
          domain_authority: Number,
          top_ranking_keywords: [String]
        },
        social_media_presence: [{
          platform: String,
          followers: Number,
          engagement_rate: Number,
          posting_frequency: Number
        }],
        advertising_insights: {
          estimated_ad_spend: Number,
          active_ad_campaigns: Number,
          top_ad_keywords: [String],
          ad_copy_themes: [String]
        },
        content_strategy: {
          content_types: [String],
          publishing_frequency: Number,
          content_themes: [String],
          top_performing_content: [String]
        }
      },
      strengths: [String],
      weaknesses: [String],
      opportunities: [String],
      threats: [String],
      last_analyzed: Date
    }],
    competitive_positioning: {
      market_position: String,
      unique_value_propositions: [String],
      competitive_advantages: [String],
      areas_for_improvement: [String]
    }
  },
  attribution_modeling: {
    attribution_models: [{
      model_name: String,
      model_type: {
        type: String,
        enum: ['first_touch', 'last_touch', 'linear', 'time_decay', 'position_based', 'data_driven']
      },
      description: String,
      weight_distribution: mongoose.Schema.Types.Mixed,
      conversion_credit: [{
        touchpoint: String,
        credit_percentage: Number,
        attributed_revenue: Number,
        attributed_conversions: Number
      }],
      model_performance: {
        accuracy_score: Number,
        r_squared: Number,
        mean_absolute_error: Number
      }
    }],
    conversion_paths: [{
      path_id: String,
      customer_id: String,
      touchpoints: [{
        touchpoint: String,
        timestamp: Date,
        channel: String,
        campaign: String,
        revenue_impact: Number
      }],
      total_conversions: Number,
      total_revenue: Number,
      path_length: Number,
      time_to_convert: Number
    }]
  },
  predictive_analytics: {
    customer_lifetime_value: [{
      segment: String,
      predicted_clv: Number,
      confidence_interval: { lower: Number, upper: Number },
      factors: [{
        factor: String,
        importance: Number,
        impact: String
      }],
      prediction_date: Date,
      model_version: String
    }],
    churn_prediction: [{
      customer_id: String,
      churn_probability: Number,
      churn_risk_level: String,
      contributing_factors: [String],
      recommended_actions: [String],
      predicted_churn_date: Date,
      model_confidence: Number
    }],
    demand_forecasting: [{
      product: String,
      forecast_period: String,
      predicted_demand: Number,
      confidence_level: Number,
      seasonal_factors: [String],
      external_factors: [String],
      forecast_accuracy: Number
    }],
    next_best_action: [{
      customer_id: String,
      recommended_actions: [{
        action_type: String,
        action_description: String,
        expected_outcome: String,
        probability_of_success: Number,
        expected_revenue_impact: Number,
        urgency_level: String
      }],
      generated_at: Date
    }]
  },
  real_time_analytics: {
    live_metrics: {
      current_website_visitors: Number,
      active_campaigns: Number,
      real_time_conversions: Number,
      social_media_mentions: Number,
      trending_content: [String],
      top_traffic_sources: [String],
      geographic_activity: [{
        location: String,
        activity_count: Number
      }],
      device_breakdown: [{
        device_type: String,
        percentage: Number
      }],
      last_updated: Date
    },
    alerts: [{
      alert_id: String,
      alert_type: String,
      metric: String,
      threshold: Number,
      current_value: Number,
      severity: String,
      triggered_at: Date,
      resolved_at: Date,
      actions_taken: [String]
    }],
    anomaly_detection: [{
      metric: String,
      expected_value: Number,
      actual_value: Number,
      deviation_percentage: Number,
      detected_at: Date,
      investigation_status: String,
      root_cause: String
    }]
  },
  reporting_dashboards: [{
    dashboard_id: String,
    dashboard_name: String,
    dashboard_type: String,
    widgets: [{
      widget_id: String,
      widget_type: String,
      data_source: String,
      configuration: mongoose.Schema.Types.Mixed,
      position: { x: Number, y: Number, width: Number, height: Number }
    }],
    filters: [{
      filter_name: String,
      filter_type: String,
      filter_values: [String]
    }],
    scheduled_reports: [{
      report_name: String,
      frequency: String,
      recipients: [String],
      format: String,
      last_sent: Date,
      next_scheduled: Date
    }],
    access_permissions: [{
      user_id: String,
      permission_level: String
    }]
  }],
  integration_settings: {
    data_sources: [{
      source_name: String,
      source_type: String,
      api_endpoint: String,
      authentication: mongoose.Schema.Types.Mixed,
      data_mapping: mongoose.Schema.Types.Mixed,
      sync_frequency: String,
      last_sync: Date,
      status: String
    }],
    third_party_tools: [{
      tool_name: String,
      tool_category: String,
      integration_status: String,
      api_key: { type: String, select: false },
      configuration: mongoose.Schema.Types.Mixed
    }]
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update timestamp on save
marketingIntelligenceSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Method to create customer segment
marketingIntelligenceSchema.methods.createSegment = function(segmentData) {
  const segment = {
    segment_id: new mongoose.Types.ObjectId().toString(),
    ...segmentData,
    created_at: new Date(),
    last_updated: new Date()
  };
  
  this.customer_segmentation.segments.push(segment);
  return segment;
};

// Method to analyze campaign performance
marketingIntelligenceSchema.methods.analyzeCampaignPerformance = function(campaignId) {
  const campaign = this.campaign_analytics.campaigns.find(c => c.campaign_id === campaignId);
  
  if (!campaign) {
    throw new Error('Campaign not found');
  }
  
  const analysis = {
    campaign_id: campaignId,
    performance_summary: {
      total_spend: campaign.budget.spent_budget,
      total_revenue: campaign.performance_metrics.revenue,
      roi: (campaign.performance_metrics.revenue / campaign.budget.spent_budget - 1) * 100,
      conversion_rate: campaign.performance_metrics.conversion_rate,
      ctr: campaign.performance_metrics.click_through_rate,
      cpa: campaign.budget.cost_per_acquisition
    },
    benchmark_comparison: {
      industry_avg_ctr: 2.5,
      industry_avg_conversion: 3.2,
      performance_vs_industry: {}
    },
    optimization_opportunities: []
  };
  
  // Generate optimization recommendations
  if (campaign.performance_metrics.click_through_rate < 2.0) {
    analysis.optimization_opportunities.push('Improve ad creative to increase click-through rate');
  }
  
  if (campaign.performance_metrics.conversion_rate < 2.0) {
    analysis.optimization_opportunities.push('Optimize landing page for better conversion');
  }
  
  return analysis;
};

// Method to predict customer lifetime value
marketingIntelligenceSchema.methods.predictCustomerLifetimeValue = function(customerId) {
  // This would integrate with ML models in production
  // For now, return a placeholder prediction
  
  const prediction = {
    customer_id: customerId,
    predicted_clv: 1250.00,
    confidence_interval: { lower: 900.00, upper: 1600.00 },
    factors: [
      { factor: 'Purchase Frequency', importance: 0.35, impact: 'High' },
      { factor: 'Average Order Value', importance: 0.28, impact: 'High' },
      { factor: 'Customer Tenure', importance: 0.22, impact: 'Medium' },
      { factor: 'Product Category Preference', importance: 0.15, impact: 'Medium' }
    ],
    prediction_date: new Date(),
    model_version: 'v2.1'
  };
  
  this.predictive_analytics.customer_lifetime_value.push(prediction);
  return prediction;
};

// Method to detect content gaps
marketingIntelligenceSchema.methods.detectContentGaps = function() {
  // This would analyze competitor content and search trends
  const gaps = [
    {
      topic: 'AI in Marketing',
      search_volume: 12400,
      competition_level: 'Medium',
      content_opportunity_score: 85,
      recommended_content_type: 'In-depth Guide',
      target_keywords: ['AI marketing tools', 'marketing automation AI', 'AI customer segmentation']
    },
    {
      topic: 'Customer Journey Optimization',
      search_volume: 8900,
      competition_level: 'High',
      content_opportunity_score: 72,
      recommended_content_type: 'Case Study',
      target_keywords: ['customer journey mapping', 'journey optimization', 'customer experience improvement']
    }
  ];
  
  this.content_intelligence.content_gaps = gaps;
  return gaps;
};

// Method to generate marketing insights
marketingIntelligenceSchema.methods.generateInsights = function() {
  const insights = {
    top_performing_segments: this.customer_segmentation.segments
      .sort((a, b) => b.profitability_score - a.profitability_score)
      .slice(0, 3),
    best_performing_campaigns: this.campaign_analytics.campaigns
      .sort((a, b) => b.performance_metrics.return_on_ad_spend - a.performance_metrics.return_on_ad_spend)
      .slice(0, 3),
    content_opportunities: this.content_intelligence.content_gaps
      .sort((a, b) => b.content_opportunity_score - a.content_opportunity_score)
      .slice(0, 5),
    key_recommendations: [],
    generated_at: new Date()
  };
  
  // Generate key recommendations
  insights.key_recommendations = [
    'Focus marketing spend on high-value customer segments for improved ROI',
    'Implement retargeting campaigns for users who abandoned cart',
    'Create content around trending topics to capture organic traffic',
    'Optimize underperforming campaigns by testing new creative variations'
  ];
  
  return insights;
};

module.exports = mongoose.model('MarketingIntelligence', marketingIntelligenceSchema); 