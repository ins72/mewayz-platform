const mongoose = require('mongoose');

const aiContentGeneratorSchema = new mongoose.Schema({
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  content_project_name: {
    type: String,
    required: true
  },
  content_type: {
    type: String,
    enum: [
      'blog_post', 'product_description', 'email_campaign', 'social_media_post',
      'ad_copy', 'landing_page', 'press_release', 'newsletter', 'video_script',
      'podcast_script', 'course_content', 'documentation', 'sales_copy', 
      'seo_content', 'meta_descriptions', 'product_reviews', 'faq_content'
    ],
    required: true
  },
  content_parameters: {
    target_audience: {
      demographics: {
        age_range: String,
        gender: String,
        income_level: String,
        education: String,
        location: String
      },
      psychographics: {
        interests: [String],
        values: [String],
        lifestyle: String,
        personality_traits: [String]
      },
      behavioral_data: {
        purchase_history: [String],
        brand_loyalty: String,
        online_behavior: String,
        preferred_channels: [String]
      }
    },
    brand_voice: {
      tone: {
        type: String,
        enum: ['professional', 'casual', 'friendly', 'authoritative', 'conversational', 'playful', 'serious', 'inspirational'],
        default: 'professional'
      },
      style: {
        type: String,
        enum: ['formal', 'informal', 'technical', 'simple', 'creative', 'data-driven', 'storytelling'],
        default: 'professional'
      },
      personality: [String], // witty, empathetic, confident, etc.
      prohibited_words: [String],
      preferred_phrases: [String],
      brand_values: [String]
    },
    content_goals: {
      primary_objective: {
        type: String,
        enum: ['awareness', 'engagement', 'conversion', 'retention', 'education', 'entertainment', 'lead_generation'],
        required: true
      },
      secondary_objectives: [String],
      success_metrics: [String],
      call_to_action: String,
      conversion_target: String
    },
    seo_requirements: {
      primary_keywords: [String],
      secondary_keywords: [String],
      long_tail_keywords: [String],
      meta_title_template: String,
      meta_description_template: String,
      target_word_count: Number,
      readability_score: String, // Grade 8, Grade 12, etc.
      semantic_keywords: [String]
    },
    format_specifications: {
      word_count: {
        min: Number,
        max: Number,
        target: Number
      },
      structure: {
        introduction_length: String,
        body_sections: Number,
        conclusion_length: String,
        include_bullet_points: Boolean,
        include_numbered_lists: Boolean,
        include_subheadings: Boolean
      },
      multimedia_requirements: {
        include_images: Boolean,
        image_count: Number,
        include_videos: Boolean,
        include_infographics: Boolean,
        alt_text_required: Boolean
      }
    }
  },
  ai_model_config: {
    model_provider: {
      type: String,
      enum: ['openai', 'anthropic', 'cohere', 'huggingface', 'custom'],
      default: 'openai'
    },
    model_name: String,
    temperature: { type: Number, default: 0.7 }, // Creativity level
    max_tokens: { type: Number, default: 2000 },
    top_p: { type: Number, default: 0.9 },
    frequency_penalty: { type: Number, default: 0.0 },
    presence_penalty: { type: Number, default: 0.0 },
    custom_instructions: String,
    fine_tuning_data: String // Path to custom training data
  },
  generated_content: [{
    generation_id: String,
    content_variant: Number, // Multiple versions generated
    generated_text: String,
    metadata: {
      word_count: Number,
      readability_score: String,
      seo_score: Number,
      sentiment_score: Number,
      keyword_density: mongoose.Schema.Types.Mixed,
      content_quality_score: Number
    },
    performance_data: {
      engagement_rate: Number,
      click_through_rate: Number,
      conversion_rate: Number,
      social_shares: Number,
      time_on_page: Number,
      bounce_rate: Number
    },
    approval_status: {
      type: String,
      enum: ['draft', 'pending_review', 'approved', 'rejected', 'published'],
      default: 'draft'
    },
    reviewer_feedback: String,
    revisions: [{
      revision_number: Number,
      changes_made: String,
      revised_content: String,
      revised_at: Date,
      revised_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    generated_at: { type: Date, default: Date.now },
    published_at: Date,
    published_channels: [String]
  }],
  content_templates: [{
    template_name: String,
    template_type: String,
    template_structure: String, // JSON structure
    placeholder_variables: [String],
    usage_count: { type: Number, default: 0 },
    effectiveness_score: Number
  }],
  automated_workflows: [{
    workflow_name: String,
    trigger_conditions: {
      schedule: String, // cron expression
      data_triggers: [String], // specific data changes
      manual_triggers: [String]
    },
    content_pipeline: [{
      step_order: Number,
      step_type: {
        type: String,
        enum: ['generate', 'review', 'optimize', 'publish', 'analyze']
      },
      step_config: mongoose.Schema.Types.Mixed,
      approval_required: Boolean,
      assigned_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    output_channels: [{
      channel_type: {
        type: String,
        enum: ['website', 'blog', 'email', 'social_media', 'advertising', 'print']
      },
      channel_config: mongoose.Schema.Types.Mixed,
      auto_publish: Boolean,
      publish_schedule: String
    }]
  }],
  analytics_tracking: {
    content_performance: [{
      content_id: String,
      channel: String,
      impressions: Number,
      clicks: Number,
      conversions: Number,
      revenue_attributed: Number,
      engagement_metrics: mongoose.Schema.Types.Mixed,
      timestamp: Date
    }],
    a_b_tests: [{
      test_name: String,
      variant_a: String, // content ID
      variant_b: String, // content ID
      test_metrics: [String],
      sample_size: Number,
      confidence_level: Number,
      test_results: mongoose.Schema.Types.Mixed,
      winner: String,
      test_started: Date,
      test_ended: Date
    }],
    optimization_suggestions: [{
      suggestion_type: String,
      current_performance: mongoose.Schema.Types.Mixed,
      suggested_changes: String,
      expected_improvement: String,
      confidence_score: Number,
      generated_at: Date
    }]
  },
  integration_settings: {
    cms_integration: {
      platform: String, // WordPress, Drupal, etc.
      api_endpoint: String,
      authentication: mongoose.Schema.Types.Mixed,
      auto_publish: Boolean
    },
    social_media_integration: {
      platforms: [{
        platform_name: String,
        account_id: String,
        access_token: { type: String, select: false },
        auto_post: Boolean,
        post_schedule: String
      }]
    },
    email_marketing_integration: {
      platform: String, // Mailchimp, SendGrid, etc.
      api_key: { type: String, select: false },
      list_ids: [String],
      campaign_templates: [String]
    },
    analytics_integration: {
      google_analytics: {
        tracking_id: String,
        goals: [String]
      },
      custom_tracking: mongoose.Schema.Types.Mixed
    }
  },
  quality_assurance: {
    plagiarism_check: {
      enabled: Boolean,
      threshold: Number, // percentage
      last_check: Date,
      service_provider: String
    },
    fact_checking: {
      enabled: Boolean,
      sources: [String],
      verification_level: String
    },
    brand_compliance: {
      guidelines_checklist: [String],
      auto_compliance_check: Boolean,
      compliance_score: Number
    },
    legal_review: {
      required_for_types: [String],
      reviewer_assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      compliance_frameworks: [String]
    }
  },
  cost_tracking: {
    api_usage_costs: [{
      date: Date,
      provider: String,
      tokens_used: Number,
      cost: Number,
      content_generated: Number
    }],
    total_monthly_cost: Number,
    cost_per_content_piece: Number,
    budget_alerts: {
      monthly_limit: Number,
      current_usage: Number,
      alert_thresholds: [Number]
    }
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update timestamp on save
aiContentGeneratorSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Method to generate content using AI
aiContentGeneratorSchema.methods.generateContent = async function(customPrompt = '') {
  try {
    const prompt = this.buildPrompt(customPrompt);
    
    // Placeholder for actual AI API call
    // In production, this would call OpenAI, Anthropic, etc.
    const generatedContent = await this.callAIProvider(prompt);
    
    const contentAnalysis = await this.analyzeContent(generatedContent);
    
    const newContent = {
      generation_id: new mongoose.Types.ObjectId().toString(),
      content_variant: this.generated_content.length + 1,
      generated_text: generatedContent,
      metadata: contentAnalysis,
      generated_at: new Date()
    };
    
    this.generated_content.push(newContent);
    await this.save();
    
    return newContent;
  } catch (error) {
    console.error('Content generation failed:', error);
    throw error;
  }
};

// Method to build AI prompt based on parameters
aiContentGeneratorSchema.methods.buildPrompt = function(customPrompt) {
  const params = this.content_parameters;
  
  let prompt = `Create ${this.content_type.replace('_', ' ')} content with the following specifications:\n\n`;
  
  // Add target audience
  if (params.target_audience) {
    prompt += `Target Audience: ${JSON.stringify(params.target_audience, null, 2)}\n\n`;
  }
  
  // Add brand voice
  if (params.brand_voice) {
    prompt += `Brand Voice: ${params.brand_voice.tone} tone, ${params.brand_voice.style} style\n`;
    if (params.brand_voice.personality.length > 0) {
      prompt += `Personality: ${params.brand_voice.personality.join(', ')}\n\n`;
    }
  }
  
  // Add content goals
  if (params.content_goals) {
    prompt += `Primary Objective: ${params.content_goals.primary_objective}\n`;
    if (params.content_goals.call_to_action) {
      prompt += `Call to Action: ${params.content_goals.call_to_action}\n\n`;
    }
  }
  
  // Add SEO requirements
  if (params.seo_requirements) {
    prompt += `SEO Keywords: ${params.seo_requirements.primary_keywords.join(', ')}\n`;
    if (params.seo_requirements.target_word_count) {
      prompt += `Target Word Count: ${params.seo_requirements.target_word_count}\n\n`;
    }
  }
  
  // Add format specifications
  if (params.format_specifications) {
    prompt += `Format Requirements: ${JSON.stringify(params.format_specifications, null, 2)}\n\n`;
  }
  
  if (customPrompt) {
    prompt += `Additional Instructions: ${customPrompt}\n\n`;
  }
  
  return prompt;
};

// Method to call AI provider (placeholder)
aiContentGeneratorSchema.methods.callAIProvider = async function(prompt) {
  // This would be replaced with actual AI API calls
  console.log('Calling AI provider with prompt:', prompt.substring(0, 100) + '...');
  
  // Simulate AI response
  return `Generated content based on the provided parameters. This would be replaced with actual AI-generated content in production.`;
};

// Method to analyze generated content
aiContentGeneratorSchema.methods.analyzeContent = async function(content) {
  // Placeholder for content analysis
  // In production, this would use tools like:
  // - Readability analyzers
  // - SEO analyzers
  // - Sentiment analysis
  // - Keyword density calculators
  
  return {
    word_count: content.split(' ').length,
    readability_score: 'Grade 8',
    seo_score: 85,
    sentiment_score: 0.7,
    keyword_density: {},
    content_quality_score: 88
  };
};

// Method to optimize content based on performance data
aiContentGeneratorSchema.methods.optimizeContent = async function(contentId) {
  const content = this.generated_content.find(c => c.generation_id === contentId);
  
  if (!content) {
    throw new Error('Content not found');
  }
  
  // Analyze performance and suggest optimizations
  const optimizations = {
    seo_improvements: [],
    engagement_improvements: [],
    conversion_improvements: []
  };
  
  // Add to analytics tracking
  this.analytics_tracking.optimization_suggestions.push({
    suggestion_type: 'performance_optimization',
    current_performance: content.performance_data,
    suggested_changes: JSON.stringify(optimizations),
    expected_improvement: '15-25% increase in engagement',
    confidence_score: 0.85,
    generated_at: new Date()
  });
  
  await this.save();
  return optimizations;
};

// Method to run A/B test
aiContentGeneratorSchema.methods.runABTest = async function(variantAId, variantBId, testMetrics) {
  const test = {
    test_name: `A/B Test ${Date.now()}`,
    variant_a: variantAId,
    variant_b: variantBId,
    test_metrics: testMetrics,
    sample_size: 1000,
    confidence_level: 0.95,
    test_started: new Date()
  };
  
  this.analytics_tracking.a_b_tests.push(test);
  await this.save();
  
  return test;
};

module.exports = mongoose.model('AIContentGenerator', aiContentGeneratorSchema); 