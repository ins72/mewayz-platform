const mongoose = require('mongoose');

const whiteLabelConfigSchema = new mongoose.Schema({
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    unique: true
  },
  brand_config: {
    company_name: String,
    company_description: String,
    logo_url: String,
    favicon_url: String,
    brand_colors: {
      primary: { type: String, default: '#1976d2' },
      secondary: { type: String, default: '#dc004e' },
      accent: { type: String, default: '#82b1ff' },
      background: { type: String, default: '#ffffff' },
      surface: { type: String, default: '#f5f5f5' },
      text_primary: { type: String, default: '#000000' },
      text_secondary: { type: String, default: '#666666' }
    },
    typography: {
      font_family: { type: String, default: 'Inter, sans-serif' },
      heading_font: { type: String, default: 'Inter, sans-serif' },
      body_font: { type: String, default: 'Inter, sans-serif' },
      font_sizes: {
        xs: { type: String, default: '0.75rem' },
        sm: { type: String, default: '0.875rem' },
        base: { type: String, default: '1rem' },
        lg: { type: String, default: '1.125rem' },
        xl: { type: String, default: '1.25rem' },
        '2xl': { type: String, default: '1.5rem' },
        '3xl': { type: String, default: '1.875rem' }
      }
    },
    custom_css: String,
    custom_js: String
  },
  domain_config: {
    custom_domain: String,
    subdomain: String,
    ssl_enabled: { type: Boolean, default: true },
    ssl_certificate: String,
    dns_records: [{
      type: { type: String, enum: ['A', 'CNAME', 'TXT', 'MX'] },
      name: String,
      value: String,
      ttl: { type: Number, default: 3600 }
    }],
    domain_verification: {
      verified: { type: Boolean, default: false },
      verification_token: String,
      verified_at: Date
    }
  },
  ui_customization: {
    layout_style: {
      type: String,
      enum: ['modern', 'classic', 'minimal', 'corporate'],
      default: 'modern'
    },
    navigation: {
      position: { type: String, enum: ['top', 'side', 'both'], default: 'side' },
      style: { type: String, enum: ['dark', 'light', 'auto'], default: 'auto' },
      collapsed_by_default: { type: Boolean, default: false }
    },
    dashboard: {
      default_widgets: [String],
      widget_layout: mongoose.Schema.Types.Mixed,
      show_welcome_message: { type: Boolean, default: true },
      welcome_message: String
    },
    footer: {
      show_footer: { type: Boolean, default: true },
      footer_text: String,
      footer_links: [{
        text: String,
        url: String
      }]
    },
    header: {
      show_search: { type: Boolean, default: true },
      show_notifications: { type: Boolean, default: true },
      show_user_menu: { type: Boolean, default: true },
      custom_menu_items: [{
        text: String,
        url: String,
        icon: String
      }]
    }
  },
  email_branding: {
    sender_name: String,
    sender_email: String,
    email_signature: String,
    email_templates: [{
      template_name: String,
      template_type: {
        type: String,
        enum: ['welcome', 'password_reset', 'notification', 'invoice', 'receipt', 'custom']
      },
      subject: String,
      html_content: String,
      text_content: String,
      variables: [String] // Template variables
    }],
    smtp_config: {
      host: String,
      port: Number,
      secure: { type: Boolean, default: true },
      username: String,
      password: { type: String, select: false }, // Encrypted
      from_email: String,
      from_name: String
    }
  },
  mobile_app_config: {
    app_name: String,
    app_description: String,
    bundle_id: String,
    app_icon_url: String,
    splash_screen_url: String,
    app_store_url: String,
    play_store_url: String,
    deep_link_scheme: String,
    push_notification_config: {
      firebase_config: mongoose.Schema.Types.Mixed,
      apns_config: mongoose.Schema.Types.Mixed,
      default_sound: String,
      icon_url: String
    },
    app_features: {
      offline_mode: { type: Boolean, default: true },
      biometric_auth: { type: Boolean, default: true },
      camera_access: { type: Boolean, default: true },
      location_services: { type: Boolean, default: false },
      file_upload: { type: Boolean, default: true }
    }
  },
  api_branding: {
    api_name: String,
    api_description: String,
    api_documentation_url: String,
    custom_api_domain: String,
    rate_limiting: {
      requests_per_minute: { type: Number, default: 100 },
      requests_per_hour: { type: Number, default: 1000 },
      burst_limit: { type: Number, default: 200 }
    },
    webhook_endpoints: [{
      name: String,
      url: String,
      events: [String],
      secret: String,
      enabled: { type: Boolean, default: true }
    }]
  },
  content_customization: {
    terms_of_service: String,
    privacy_policy: String,
    about_us: String,
    contact_info: {
      email: String,
      phone: String,
      address: String,
      support_hours: String
    },
    social_media: {
      facebook: String,
      twitter: String,
      linkedin: String,
      instagram: String,
      youtube: String
    },
    help_center: {
      knowledge_base_url: String,
      support_email: String,
      live_chat_enabled: { type: Boolean, default: true },
      phone_support_enabled: { type: Boolean, default: false }
    }
  },
  feature_flags: {
    features: [{
      feature_name: String,
      enabled: { type: Boolean, default: true },
      rollout_percentage: { type: Number, default: 100 },
      user_groups: [String], // Which user groups have access
      environments: {
        type: [String],
        enum: ['development', 'staging', 'production'],
        default: ['production']
      }
    }]
  },
  analytics_config: {
    google_analytics_id: String,
    facebook_pixel_id: String,
    custom_tracking_scripts: [String],
    privacy_compliance: {
      gdpr_enabled: { type: Boolean, default: false },
      ccpa_enabled: { type: Boolean, default: false },
      cookie_consent_required: { type: Boolean, default: true }
    }
  },
  reseller_config: {
    is_reseller: { type: Boolean, default: false },
    reseller_name: String,
    reseller_contact: String,
    commission_rate: { type: Number, default: 0 }, // Percentage
    sub_organizations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }],
    pricing_override: {
      enabled: { type: Boolean, default: false },
      custom_pricing: mongoose.Schema.Types.Mixed
    }
  },
  security_config: {
    allowed_domains: [String], // CORS domains
    ip_whitelist: [String],
    custom_authentication: {
      enabled: { type: Boolean, default: false },
      provider_name: String,
      provider_config: mongoose.Schema.Types.Mixed
    },
    session_timeout: { type: Number, default: 3600 }, // seconds
    require_2fa: { type: Boolean, default: false }
  },
  backup_settings: {
    auto_backup: { type: Boolean, default: true },
    backup_frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    retention_days: { type: Number, default: 30 },
    backup_location: String // S3 bucket, etc.
  },
  compliance_settings: {
    data_residency: {
      type: String,
      enum: ['us', 'eu', 'asia', 'australia', 'canada'],
      default: 'us'
    },
    compliance_frameworks: {
      type: [String],
      enum: ['gdpr', 'ccpa', 'hipaa', 'sox', 'pci_dss'],
      default: []
    },
    audit_logging: { type: Boolean, default: true },
    data_encryption: { type: Boolean, default: true }
  },
  deployment_config: {
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'production'
    },
    cdn_enabled: { type: Boolean, default: true },
    cache_strategy: {
      type: String,
      enum: ['aggressive', 'moderate', 'conservative'],
      default: 'moderate'
    },
    auto_scaling: { type: Boolean, default: true },
    load_balancing: { type: Boolean, default: true }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_approval'],
    default: 'pending_approval'
  },
  activation_date: Date,
  expiry_date: Date,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
whiteLabelConfigSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Method to generate CSS variables from brand colors
whiteLabelConfigSchema.methods.generateCSSVariables = function() {
  const colors = this.brand_config.brand_colors;
  const typography = this.brand_config.typography;
  
  let css = ':root {\n';
  
  // Color variables
  Object.keys(colors).forEach(key => {
    const cssKey = key.replace(/_/g, '-');
    css += `  --color-${cssKey}: ${colors[key]};\n`;
  });
  
  // Typography variables
  css += `  --font-family: ${typography.font_family};\n`;
  css += `  --heading-font: ${typography.heading_font};\n`;
  css += `  --body-font: ${typography.body_font};\n`;
  
  Object.keys(typography.font_sizes).forEach(key => {
    css += `  --font-size-${key}: ${typography.font_sizes[key]};\n`;
  });
  
  css += '}\n';
  
  if (this.brand_config.custom_css) {
    css += '\n' + this.brand_config.custom_css;
  }
  
  return css;
};

// Method to validate domain configuration
whiteLabelConfigSchema.methods.validateDomain = async function() {
  const domain = this.domain_config.custom_domain;
  
  if (!domain) {
    return { valid: false, error: 'No domain configured' };
  }
  
  try {
    // This would include actual DNS validation logic
    // For now, just check basic format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    
    if (!domainRegex.test(domain)) {
      return { valid: false, error: 'Invalid domain format' };
    }
    
    // In a real implementation, you would:
    // 1. Check DNS records
    // 2. Verify SSL certificate
    // 3. Test domain accessibility
    
    this.domain_config.domain_verification.verified = true;
    this.domain_config.domain_verification.verified_at = new Date();
    await this.save();
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Method to generate mobile app config
whiteLabelConfigSchema.methods.generateMobileAppConfig = function() {
  const config = this.mobile_app_config;
  const brand = this.brand_config;
  
  return {
    app: {
      name: config.app_name || brand.company_name,
      description: config.app_description || brand.company_description,
      version: '1.0.0',
      build: 1
    },
    theme: {
      colors: brand.brand_colors,
      typography: brand.typography
    },
    features: config.app_features,
    api: {
      baseUrl: this.api_branding.custom_api_domain || 'https://api.mewayz.com',
      timeout: 30000
    },
    push: config.push_notification_config
  };
};

// Method to check feature flag
whiteLabelConfigSchema.methods.isFeatureEnabled = function(featureName, userId = null, userGroup = null) {
  const feature = this.feature_flags.features.find(f => f.feature_name === featureName);
  
  if (!feature) {
    return false; // Feature doesn't exist
  }
  
  if (!feature.enabled) {
    return false; // Feature disabled
  }
  
  // Check user group access
  if (userGroup && feature.user_groups.length > 0) {
    if (!feature.user_groups.includes(userGroup)) {
      return false;
    }
  }
  
  // Check rollout percentage
  if (feature.rollout_percentage < 100) {
    // Simple hash-based rollout (in production, use more sophisticated logic)
    const hash = userId ? userId.toString().charCodeAt(0) % 100 : Math.random() * 100;
    if (hash >= feature.rollout_percentage) {
      return false;
    }
  }
  
  return true;
};

module.exports = mongoose.model('WhiteLabelConfig', whiteLabelConfigSchema); 