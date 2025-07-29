const mongoose = require('mongoose');

const apiManagementPlatformSchema = new mongoose.Schema({
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  api_catalog: {
    apis: [{
      api_id: String,
      api_name: String,
      description: String,
      version: String,
      status: {
        type: String,
        enum: ['development', 'testing', 'staging', 'production', 'deprecated', 'retired']
      },
      api_type: {
        type: String,
        enum: ['rest', 'graphql', 'soap', 'websocket', 'grpc']
      },
      base_url: String,
      documentation_url: String,
      swagger_spec: mongoose.Schema.Types.Mixed,
      openapi_spec: mongoose.Schema.Types.Mixed,
      endpoints: [{
        endpoint_id: String,
        path: String,
        method: String, // GET, POST, PUT, DELETE, PATCH
        description: String,
        parameters: [{
          name: String,
          type: String,
          required: Boolean,
          description: String,
          example: String,
          validation_rules: String
        }],
        request_schema: mongoose.Schema.Types.Mixed,
        response_schema: mongoose.Schema.Types.Mixed,
        error_codes: [{
          code: Number,
          message: String,
          description: String
        }],
        rate_limit: {
          requests_per_minute: Number,
          requests_per_hour: Number,
          requests_per_day: Number
        },
        authentication_required: Boolean,
        authorization_scopes: [String],
        caching_policy: {
          cache_enabled: Boolean,
          cache_ttl_seconds: Number,
          cache_key_pattern: String
        }
      }],
      ownership: {
        team: String,
        primary_contact: String,
        technical_lead: String,
        product_owner: String
      },
      lifecycle: {
        created_date: Date,
        last_updated: Date,
        deprecation_date: Date,
        retirement_date: Date,
        breaking_changes: [{
          version: String,
          change_description: String,
          migration_guide: String,
          effective_date: Date
        }]
      },
      dependencies: [{
        dependency_type: String, // internal_api, external_service, database
        name: String,
        version: String,
        criticality: String // critical, high, medium, low
      }],
      sla_requirements: {
        availability_percentage: Number,
        response_time_ms: Number,
        throughput_rps: Number,
        error_rate_percentage: Number
      }
    }]
  },
  api_gateway: {
    gateway_config: {
      gateway_url: String,
      load_balancing: {
        algorithm: String, // round_robin, least_connections, weighted_round_robin
        health_check_enabled: Boolean,
        health_check_interval_seconds: Number,
        health_check_timeout_seconds: Number
      },
      ssl_termination: {
        enabled: Boolean,
        certificate_path: String,
        ssl_protocols: [String],
        cipher_suites: [String]
      },
      cors_settings: {
        enabled: Boolean,
        allowed_origins: [String],
        allowed_methods: [String],
        allowed_headers: [String],
        expose_headers: [String],
        max_age_seconds: Number
      }
    },
    routing_rules: [{
      rule_id: String,
      priority: Number,
      conditions: [{
        type: String, // path, header, query_param, client_ip
        operator: String, // equals, contains, regex, in_range
        value: String,
        case_sensitive: Boolean
      }],
      actions: [{
        type: String, // route, redirect, block, transform
        target_url: String,
        response_code: Number,
        headers_to_add: mongoose.Schema.Types.Mixed,
        headers_to_remove: [String],
        body_transformation: String
      }],
      enabled: Boolean
    }],
    middleware: [{
      middleware_id: String,
      middleware_name: String,
      type: String, // authentication, authorization, rate_limiting, logging, validation
      order: Number,
      configuration: mongoose.Schema.Types.Mixed,
      enabled: Boolean,
      apply_to_apis: [String] // API IDs or 'all'
    }]
  },
  security_policies: {
    authentication: {
      methods: [{
        method_type: String, // api_key, oauth2, jwt, basic_auth, custom
        configuration: mongoose.Schema.Types.Mixed,
        enabled: Boolean,
        default_method: Boolean
      }],
      oauth2_config: {
        authorization_server_url: String,
        token_endpoint: String,
        scopes: [{
          scope_name: String,
          description: String,
          permissions: [String]
        }],
        token_validation: {
          introspection_endpoint: String,
          jwks_uri: String,
          issuer: String,
          audience: String
        }
      },
      jwt_config: {
        signing_algorithm: String,
        public_key: String,
        private_key: { type: String, select: false },
        token_expiration_seconds: Number,
        refresh_token_enabled: Boolean
      }
    },
    authorization: {
      rbac_enabled: Boolean,
      roles: [{
        role_name: String,
        description: String,
        permissions: [String],
        api_access: [{
          api_id: String,
          endpoints: [String],
          methods: [String]
        }]
      }],
      policies: [{
        policy_id: String,
        policy_name: String,
        description: String,
        rules: [{
          resource: String,
          action: String,
          condition: String,
          effect: String // allow, deny
        }],
        applicable_apis: [String]
      }]
    },
    rate_limiting: {
      global_limits: {
        requests_per_second: Number,
        requests_per_minute: Number,
        requests_per_hour: Number,
        requests_per_day: Number
      },
      api_specific_limits: [{
        api_id: String,
        limits: mongoose.Schema.Types.Mixed
      }],
      client_limits: [{
        client_id: String,
        custom_limits: mongoose.Schema.Types.Mixed,
        burst_allowance: Number
      }],
      throttling_behavior: {
        algorithm: String, // token_bucket, sliding_window, fixed_window
        rejection_response: {
          status_code: Number,
          message: String,
          headers: mongoose.Schema.Types.Mixed
        }
      }
    },
    data_protection: {
      encryption_in_transit: Boolean,
      encryption_at_rest: Boolean,
      pii_detection: Boolean,
      data_masking: {
        enabled: Boolean,
        fields_to_mask: [String],
        masking_patterns: mongoose.Schema.Types.Mixed
      },
      gdpr_compliance: {
        right_to_be_forgotten: Boolean,
        data_portability: Boolean,
        consent_management: Boolean,
        data_retention_days: Number
      }
    }
  },
  monitoring_analytics: {
    performance_metrics: [{
      timestamp: Date,
      api_id: String,
      endpoint: String,
      method: String,
      response_time_ms: Number,
      status_code: Number,
      request_size_bytes: Number,
      response_size_bytes: Number,
      client_ip: String,
      user_agent: String,
      client_id: String
    }],
    usage_analytics: {
      total_requests: Number,
      unique_clients: Number,
      top_apis: [{
        api_id: String,
        request_count: Number,
        error_rate: Number,
        avg_response_time: Number
      }],
      traffic_patterns: [{
        hour: Number,
        request_count: Number,
        error_count: Number
      }],
      geographic_distribution: [{
        country: String,
        region: String,
        request_count: Number
      }]
    },
    error_tracking: [{
      timestamp: Date,
      api_id: String,
      endpoint: String,
      error_type: String,
      error_message: String,
      stack_trace: String,
      request_id: String,
      client_id: String,
      severity: String, // critical, high, medium, low
      resolved: Boolean,
      resolution_notes: String
    }],
    alerting: {
      alert_rules: [{
        rule_id: String,
        rule_name: String,
        metric: String, // response_time, error_rate, request_count
        threshold: Number,
        comparison: String, // greater_than, less_than, equals
        time_window_minutes: Number,
        notification_channels: [String],
        enabled: Boolean
      }],
      notifications: [{
        notification_id: String,
        alert_rule_id: String,
        triggered_at: Date,
        resolved_at: Date,
        severity: String,
        message: String,
        acknowledgments: [{
          user: String,
          acknowledged_at: Date,
          notes: String
        }]
      }]
    },
    sla_monitoring: [{
      api_id: String,
      period: String, // daily, weekly, monthly
      availability_percentage: Number,
      avg_response_time_ms: Number,
      error_rate_percentage: Number,
      throughput_rps: Number,
      sla_met: Boolean,
      violations: [{
        violation_type: String,
        start_time: Date,
        end_time: Date,
        description: String
      }]
    }]
  },
  developer_portal: {
    portal_config: {
      portal_url: String,
      custom_domain: String,
      branding: {
        logo_url: String,
        primary_color: String,
        secondary_color: String,
        custom_css: String
      },
      authentication: {
        self_registration: Boolean,
        email_verification: Boolean,
        approval_required: Boolean,
        social_login: [{
          provider: String, // google, github, microsoft
          enabled: Boolean,
          client_id: String,
          client_secret: { type: String, select: false }
        }]
      }
    },
    api_documentation: [{
      api_id: String,
      documentation: {
        overview: String,
        getting_started: String,
        authentication_guide: String,
        code_samples: [{
          language: String,
          code: String,
          description: String
        }],
        tutorials: [{
          title: String,
          content: String,
          difficulty_level: String,
          estimated_time_minutes: Number
        }],
        changelog: [{
          version: String,
          date: Date,
          changes: [String],
          breaking_changes: [String]
        }]
      },
      interactive_console: {
        enabled: Boolean,
        sandbox_environment: String,
        test_data_sets: [mongoose.Schema.Types.Mixed]
      }
    }],
    developer_registration: [{
      developer_id: String,
      personal_info: {
        first_name: String,
        last_name: String,
        email: String,
        company: String,
        job_title: String,
        phone: String
      },
      account_status: String, // pending, active, suspended, banned
      registration_date: Date,
      last_login: Date,
      email_verified: Boolean,
      applications: [{
        app_id: String,
        app_name: String,
        description: String,
        app_type: String, // web, mobile, server_to_server
        callback_urls: [String],
        api_subscriptions: [String],
        api_keys: [{
          key_id: String,
          key_value: { type: String, select: false },
          created_date: Date,
          expiration_date: Date,
          status: String, // active, revoked, expired
          usage_limits: mongoose.Schema.Types.Mixed
        }]
      }]
    }],
    feedback_support: {
      feedback_forms: [{
        form_id: String,
        api_id: String,
        developer_id: String,
        feedback_type: String, // bug_report, feature_request, documentation, general
        subject: String,
        description: String,
        priority: String,
        status: String, // open, in_progress, resolved, closed
        submitted_date: Date,
        assigned_to: String,
        resolution_notes: String,
        satisfaction_rating: Number
      }],
      support_tickets: [{
        ticket_id: String,
        developer_id: String,
        subject: String,
        description: String,
        category: String,
        priority: String,
        status: String,
        created_date: Date,
        updated_date: Date,
        assigned_agent: String,
        resolution_time_hours: Number,
        customer_satisfaction: Number
      }]
    }
  },
  api_lifecycle: {
    version_management: [{
      api_id: String,
      versions: [{
        version_number: String,
        status: String,
        release_date: Date,
        deprecation_date: Date,
        retirement_date: Date,
        change_summary: String,
        migration_guide: String,
        backward_compatible: Boolean
      }]
    }],
    deployment_pipelines: [{
      pipeline_id: String,
      api_id: String,
      stages: [{
        stage_name: String,
        environment: String, // dev, test, staging, prod
        deployment_config: mongoose.Schema.Types.Mixed,
        approval_required: Boolean,
        approvers: [String],
        automated_tests: [{
          test_type: String,
          test_suite: String,
          pass_criteria: String
        }]
      }],
      triggers: [{
        trigger_type: String, // manual, git_push, schedule
        configuration: mongoose.Schema.Types.Mixed
      }],
      deployment_history: [{
        deployment_id: String,
        version: String,
        environment: String,
        deployed_at: Date,
        deployed_by: String,
        status: String, // success, failed, rolled_back
        logs: [String]
      }]
    }],
    testing_automation: {
      test_suites: [{
        suite_id: String,
        suite_name: String,
        api_id: String,
        test_cases: [{
          test_id: String,
          test_name: String,
          description: String,
          test_type: String, // functional, performance, security
          request: mongoose.Schema.Types.Mixed,
          expected_response: mongoose.Schema.Types.Mixed,
          assertions: [String]
        }],
        execution_schedule: String,
        last_execution: Date,
        pass_rate: Number
      }],
      performance_testing: {
        load_test_configs: [{
          config_id: String,
          api_id: String,
          concurrent_users: Number,
          test_duration_minutes: Number,
          ramp_up_time_minutes: Number,
          success_criteria: {
            max_response_time_ms: Number,
            max_error_rate_percentage: Number,
            min_throughput_rps: Number
          }
        }]
      }
    }
  },
  business_intelligence: {
    revenue_analytics: [{
      period: String,
      api_usage_revenue: Number,
      subscription_revenue: Number,
      premium_feature_revenue: Number,
      total_revenue: Number,
      cost_per_request: Number,
      profit_margin: Number
    }],
    adoption_metrics: {
      new_developers_count: Number,
      active_developers_count: Number,
      api_adoption_rate: Number,
      feature_adoption: [{
        feature_name: String,
        adoption_percentage: Number,
        usage_growth_rate: Number
      }],
      churn_rate: Number,
      retention_rate: Number
    },
    operational_metrics: {
      infrastructure_costs: Number,
      support_ticket_volume: Number,
      average_resolution_time_hours: Number,
      customer_satisfaction_score: Number,
      system_reliability_percentage: Number
    }
  },
  compliance_governance: {
    api_governance: {
      design_standards: [{
        standard_name: String,
        description: String,
        rules: [String],
        compliance_level: String, // mandatory, recommended, optional
        violations: [{
          api_id: String,
          violation_type: String,
          description: String,
          severity: String,
          detected_date: Date,
          resolved: Boolean
        }]
      }],
      security_standards: [{
        standard_name: String,
        requirements: [String],
        audit_frequency: String,
        last_audit_date: Date,
        compliance_score: Number
      }]
    },
    audit_trail: [{
      timestamp: Date,
      user_id: String,
      action: String,
      resource_type: String,
      resource_id: String,
      changes: mongoose.Schema.Types.Mixed,
      ip_address: String,
      user_agent: String
    }],
    compliance_reports: [{
      report_id: String,
      report_type: String, // security, privacy, governance
      generated_date: Date,
      period_covered: String,
      findings: [String],
      recommendations: [String],
      compliance_score: Number,
      generated_by: String
    }]
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update timestamp on save
apiManagementPlatformSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Method to register new API
apiManagementPlatformSchema.methods.registerAPI = function(apiData) {
  const api = {
    api_id: new mongoose.Types.ObjectId().toString(),
    ...apiData,
    lifecycle: {
      created_date: new Date(),
      last_updated: new Date()
    }
  };
  
  this.api_catalog.apis.push(api);
  return api;
};

// Method to track API usage
apiManagementPlatformSchema.methods.logAPIUsage = function(apiId, endpoint, method, responseTime, statusCode, clientId, requestSize, responseSize, clientIp, userAgent) {
  this.monitoring_analytics.performance_metrics.push({
    timestamp: new Date(),
    api_id: apiId,
    endpoint: endpoint,
    method: method,
    response_time_ms: responseTime,
    status_code: statusCode,
    request_size_bytes: requestSize,
    response_size_bytes: responseSize,
    client_ip: clientIp,
    user_agent: userAgent,
    client_id: clientId
  });
};

// Method to generate API analytics report
apiManagementPlatformSchema.methods.generateAnalyticsReport = function(apiId, timeRange = '7d') {
  const api = this.api_catalog.apis.find(a => a.api_id === apiId);
  
  if (!api) {
    throw new Error('API not found');
  }
  
  const metrics = this.monitoring_analytics.performance_metrics.filter(m => 
    m.api_id === apiId && 
    m.timestamp >= new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)) // Last 7 days
  );
  
  const report = {
    api_info: {
      api_name: api.api_name,
      version: api.version,
      status: api.status
    },
    usage_summary: {
      total_requests: metrics.length,
      unique_clients: [...new Set(metrics.map(m => m.client_id))].length,
      average_response_time: metrics.reduce((sum, m) => sum + m.response_time_ms, 0) / metrics.length || 0,
      error_rate: (metrics.filter(m => m.status_code >= 400).length / metrics.length) * 100 || 0
    },
    endpoint_performance: {},
    time_series_data: this.generateTimeSeriesData(metrics),
    top_clients: this.getTopClients(metrics),
    error_analysis: this.analyzeErrors(apiId),
    sla_compliance: this.checkSLACompliance(apiId),
    generated_at: new Date()
  };
  
  return report;
};

// Method to check rate limits
apiManagementPlatformSchema.methods.checkRateLimit = function(clientId, apiId, endpoint) {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60000);
  
  const recentRequests = this.monitoring_analytics.performance_metrics.filter(m =>
    m.client_id === clientId &&
    m.api_id === apiId &&
    m.endpoint === endpoint &&
    m.timestamp >= oneMinuteAgo
  );
  
  // Get rate limit for this API/endpoint
  const api = this.api_catalog.apis.find(a => a.api_id === apiId);
  const endpointConfig = api?.endpoints.find(e => e.path === endpoint);
  const rateLimit = endpointConfig?.rate_limit?.requests_per_minute || 
                   this.security_policies.rate_limiting.global_limits.requests_per_minute || 
                   100;
  
  return {
    allowed: recentRequests.length < rateLimit,
    current_count: recentRequests.length,
    limit: rateLimit,
    reset_time: new Date(now.getTime() + (60000 - (now.getTime() % 60000)))
  };
};

// Method to validate API key
apiManagementPlatformSchema.methods.validateAPIKey = function(apiKey, apiId) {
  const developer = this.developer_portal.developer_registration.find(dev =>
    dev.applications.some(app =>
      app.api_keys.some(key => 
        key.key_value === apiKey && 
        key.status === 'active' &&
        (!key.expiration_date || key.expiration_date > new Date()) &&
        app.api_subscriptions.includes(apiId)
      )
    )
  );
  
  if (!developer) {
    return { valid: false, reason: 'Invalid or expired API key' };
  }
  
  const application = developer.applications.find(app =>
    app.api_keys.some(key => key.key_value === apiKey)
  );
  
  return {
    valid: true,
    developer_id: developer.developer_id,
    app_id: application.app_id,
    app_name: application.app_name
  };
};

// Method to generate time series data
apiManagementPlatformSchema.methods.generateTimeSeriesData = function(metrics) {
  const timeSeriesData = {};
  
  metrics.forEach(metric => {
    const hour = new Date(metric.timestamp).getHours();
    if (!timeSeriesData[hour]) {
      timeSeriesData[hour] = {
        requests: 0,
        errors: 0,
        total_response_time: 0
      };
    }
    
    timeSeriesData[hour].requests++;
    if (metric.status_code >= 400) {
      timeSeriesData[hour].errors++;
    }
    timeSeriesData[hour].total_response_time += metric.response_time_ms;
  });
  
  return timeSeriesData;
};

// Method to get top clients
apiManagementPlatformSchema.methods.getTopClients = function(metrics) {
  const clientStats = {};
  
  metrics.forEach(metric => {
    if (!clientStats[metric.client_id]) {
      clientStats[metric.client_id] = {
        requests: 0,
        errors: 0,
        total_response_time: 0
      };
    }
    
    clientStats[metric.client_id].requests++;
    if (metric.status_code >= 400) {
      clientStats[metric.client_id].errors++;
    }
    clientStats[metric.client_id].total_response_time += metric.response_time_ms;
  });
  
  return Object.entries(clientStats)
    .map(([clientId, stats]) => ({
      client_id: clientId,
      requests: stats.requests,
      error_rate: (stats.errors / stats.requests) * 100,
      avg_response_time: stats.total_response_time / stats.requests
    }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 10);
};

// Method to analyze errors
apiManagementPlatformSchema.methods.analyzeErrors = function(apiId) {
  const errors = this.monitoring_analytics.error_tracking.filter(e => e.api_id === apiId);
  
  const errorSummary = {
    total_errors: errors.length,
    unresolved_errors: errors.filter(e => !e.resolved).length,
    error_types: {},
    critical_errors: errors.filter(e => e.severity === 'critical').length
  };
  
  errors.forEach(error => {
    if (!errorSummary.error_types[error.error_type]) {
      errorSummary.error_types[error.error_type] = 0;
    }
    errorSummary.error_types[error.error_type]++;
  });
  
  return errorSummary;
};

// Method to check SLA compliance
apiManagementPlatformSchema.methods.checkSLACompliance = function(apiId) {
  const api = this.api_catalog.apis.find(a => a.api_id === apiId);
  
  if (!api || !api.sla_requirements) {
    return { compliant: true, message: 'No SLA requirements defined' };
  }
  
  const recentMetrics = this.monitoring_analytics.performance_metrics.filter(m =>
    m.api_id === apiId &&
    m.timestamp >= new Date(Date.now() - (24 * 60 * 60 * 1000)) // Last 24 hours
  );
  
  if (recentMetrics.length === 0) {
    return { compliant: true, message: 'No recent data available' };
  }
  
  const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.response_time_ms, 0) / recentMetrics.length;
  const errorRate = (recentMetrics.filter(m => m.status_code >= 400).length / recentMetrics.length) * 100;
  
  const compliance = {
    response_time_compliant: avgResponseTime <= api.sla_requirements.response_time_ms,
    error_rate_compliant: errorRate <= api.sla_requirements.error_rate_percentage,
    current_response_time: avgResponseTime,
    current_error_rate: errorRate,
    sla_response_time: api.sla_requirements.response_time_ms,
    sla_error_rate: api.sla_requirements.error_rate_percentage
  };
  
  compliance.overall_compliant = compliance.response_time_compliant && compliance.error_rate_compliant;
  
  return compliance;
};

module.exports = mongoose.model('APIManagementPlatform', apiManagementPlatformSchema); 