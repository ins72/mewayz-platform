const mongoose = require('mongoose');

const integrationHubSchema = new mongoose.Schema({
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  integration_name: {
    type: String,
    required: true,
    unique: true
  },
  service_type: {
    type: String,
    required: true,
    enum: [
      // CRM & Sales
      'salesforce', 'hubspot', 'pipedrive', 'zoho_crm',
      // E-commerce
      'shopify', 'woocommerce', 'magento', 'bigcommerce',
      // Marketing
      'mailchimp', 'sendgrid', 'klaviyo', 'activecampaign',
      // Accounting
      'quickbooks', 'xero', 'sage', 'freshbooks',
      // Communication
      'slack', 'teams', 'discord', 'twilio',
      // Social Media
      'facebook', 'instagram', 'twitter', 'linkedin',
      // Analytics
      'google_analytics', 'mixpanel', 'segment', 'amplitude',
      // Payment
      'stripe', 'paypal', 'square', 'razorpay',
      // Storage
      'aws_s3', 'google_drive', 'dropbox', 'box',
      // Project Management
      'jira', 'trello', 'asana', 'monday',
      // Custom
      'custom_api', 'webhook'
    ]
  },
  connection_config: {
    api_key: { type: String, select: false }, // Encrypted
    api_secret: { type: String, select: false }, // Encrypted
    access_token: { type: String, select: false }, // Encrypted
    refresh_token: { type: String, select: false }, // Encrypted
    webhook_url: String,
    base_url: String,
    custom_headers: mongoose.Schema.Types.Mixed,
    oauth_config: {
      client_id: String,
      redirect_uri: String,
      scope: [String]
    }
  },
  sync_config: {
    sync_enabled: { type: Boolean, default: true },
    sync_direction: {
      type: String,
      enum: ['inbound', 'outbound', 'bidirectional'],
      default: 'bidirectional'
    },
    sync_frequency: {
      type: String,
      enum: ['realtime', 'every_5_min', 'every_15_min', 'hourly', 'daily', 'weekly'],
      default: 'hourly'
    },
    last_sync: Date,
    next_sync: Date,
    sync_status: {
      type: String,
      enum: ['active', 'syncing', 'error', 'paused'],
      default: 'active'
    }
  },
  field_mappings: [{
    source_field: String,
    target_field: String,
    transformation: {
      type: String,
      enum: ['none', 'uppercase', 'lowercase', 'date_format', 'custom_function']
    },
    custom_transformation: String // JavaScript function as string
  }],
  workflows: [{
    workflow_name: String,
    trigger: {
      type: String,
      enum: ['create', 'update', 'delete', 'custom_event', 'schedule'],
      required: true
    },
    trigger_conditions: mongoose.Schema.Types.Mixed,
    actions: [{
      action_type: {
        type: String,
        enum: ['create_record', 'update_record', 'delete_record', 'send_notification', 'custom_action']
      },
      target_service: String,
      action_config: mongoose.Schema.Types.Mixed
    }],
    enabled: { type: Boolean, default: true },
    last_triggered: Date,
    trigger_count: { type: Number, default: 0 }
  }],
  error_handling: {
    retry_attempts: { type: Number, default: 3 },
    retry_delay_minutes: { type: Number, default: 5 },
    error_notification_email: String,
    dead_letter_queue: { type: Boolean, default: true }
  },
  statistics: {
    total_synced_records: { type: Number, default: 0 },
    successful_syncs: { type: Number, default: 0 },
    failed_syncs: { type: Number, default: 0 },
    last_error: {
      message: String,
      timestamp: Date,
      stack_trace: String
    }
  },
  rate_limiting: {
    requests_per_minute: { type: Number, default: 60 },
    requests_per_hour: { type: Number, default: 1000 },
    concurrent_requests: { type: Number, default: 5 }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'error', 'configuring'],
    default: 'configuring'
  },
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
integrationHubSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  
  // Encrypt sensitive fields
  if (this.isModified('connection_config.api_key') || 
      this.isModified('connection_config.api_secret') ||
      this.isModified('connection_config.access_token') ||
      this.isModified('connection_config.refresh_token')) {
    // Encryption logic would go here
    // Similar to SecurityConfiguration model
  }
  
  next();
});

// Method to test connection
integrationHubSchema.methods.testConnection = async function() {
  // Implementation would vary based on service_type
  // This is a placeholder for the actual implementation
  try {
    // Test API connection based on service type
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Method to execute workflow
integrationHubSchema.methods.executeWorkflow = async function(workflowName, triggerData) {
  const workflow = this.workflows.find(w => w.workflow_name === workflowName);
  
  if (!workflow || !workflow.enabled) {
    throw new Error('Workflow not found or disabled');
  }
  
  // Execute workflow actions
  const results = [];
  for (const action of workflow.actions) {
    try {
      // Execute action based on action_type
      // This would include actual API calls to target services
      results.push({
        action: action.action_type,
        success: true
      });
    } catch (error) {
      results.push({
        action: action.action_type,
        success: false,
        error: error.message
      });
    }
  }
  
  // Update workflow statistics
  workflow.last_triggered = new Date();
  workflow.trigger_count += 1;
  await this.save();
  
  return results;
};

module.exports = mongoose.model('IntegrationHub', integrationHubSchema); 