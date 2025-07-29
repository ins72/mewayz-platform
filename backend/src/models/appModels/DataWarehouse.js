const mongoose = require('mongoose');

const dataWarehouseSchema = new mongoose.Schema({
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  warehouse_name: {
    type: String,
    required: true
  },
  description: String,
  data_sources: [{
    source_id: String,
    source_name: String,
    source_type: {
      type: String,
      enum: [
        'postgresql', 'mysql', 'mongodb', 'redis', 'sqlite',
        'amazon_redshift', 'google_bigquery', 'snowflake', 'azure_synapse',
        'csv_file', 'json_file', 'excel_file', 'api_endpoint',
        'salesforce', 'hubspot', 'stripe', 'google_analytics'
      ],
      required: true
    },
    connection_config: {
      // Database connections
      host: String,
      port: Number,
      database: String,
      username: String,
      password: { type: String, select: false }, // Encrypted
      ssl: { type: Boolean, default: false },
      
      // Cloud warehouse connections
      warehouse_url: String,
      account_id: String,
      warehouse_id: String,
      role: String,
      
      // API connections
      api_url: String,
      api_key: { type: String, select: false }, // Encrypted
      oauth_token: { type: String, select: false }, // Encrypted
      
      // File connections
      file_path: String,
      s3_bucket: String,
      azure_container: String,
      gcs_bucket: String
    },
    tables_schemas: [{
      table_name: String,
      schema: [{
        column_name: String,
        data_type: String,
        is_nullable: Boolean,
        is_primary_key: Boolean,
        default_value: String
      }]
    }],
    sync_config: {
      sync_frequency: {
        type: String,
        enum: ['realtime', 'every_15_min', 'hourly', 'daily', 'weekly', 'manual'],
        default: 'daily'
      },
      incremental_sync: { type: Boolean, default: true },
      incremental_column: String, // timestamp or id column for incremental sync
      batch_size: { type: Number, default: 1000 },
      last_sync: Date,
      next_sync: Date
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'error', 'syncing'],
      default: 'active'
    }
  }],
  etl_pipelines: [{
    pipeline_id: String,
    pipeline_name: String,
    description: String,
    source_tables: [String],
    target_table: String,
    transformations: [{
      transformation_type: {
        type: String,
        enum: [
          'filter', 'aggregate', 'join', 'union', 'pivot', 'unpivot',
          'sort', 'dedup', 'clean', 'validate', 'enrich', 'custom_sql'
        ]
      },
      config: mongoose.Schema.Types.Mixed,
      sql_query: String, // For custom SQL transformations
      order: Number
    }],
    schedule: {
      cron_expression: String,
      timezone: String,
      enabled: { type: Boolean, default: true }
    },
    execution_history: [{
      execution_id: String,
      started_at: Date,
      completed_at: Date,
      status: {
        type: String,
        enum: ['running', 'completed', 'failed', 'cancelled']
      },
      records_processed: Number,
      errors: [String],
      execution_time_ms: Number
    }],
    data_quality_rules: [{
      rule_name: String,
      rule_type: {
        type: String,
        enum: ['not_null', 'unique', 'range', 'format', 'custom']
      },
      column_name: String,
      parameters: mongoose.Schema.Types.Mixed,
      severity: {
        type: String,
        enum: ['error', 'warning', 'info'],
        default: 'warning'
      }
    }],
    alerts: [{
      alert_type: {
        type: String,
        enum: ['failure', 'data_quality', 'performance', 'completion']
      },
      notification_channels: [String], // email, slack, webhook
      conditions: mongoose.Schema.Types.Mixed
    }]
  }],
  data_models: [{
    model_name: String,
    model_type: {
      type: String,
      enum: ['dimension', 'fact', 'aggregate', 'staging', 'mart']
    },
    base_table: String,
    columns: [{
      column_name: String,
      data_type: String,
      description: String,
      is_key: Boolean,
      is_measure: Boolean,
      aggregation_type: String, // sum, avg, count, etc.
      format: String,
      business_name: String
    }],
    relationships: [{
      target_model: String,
      relationship_type: {
        type: String,
        enum: ['one_to_one', 'one_to_many', 'many_to_many']
      },
      join_keys: [{
        source_column: String,
        target_column: String
      }]
    }],
    filters: [{
      column_name: String,
      filter_type: String,
      default_value: mongoose.Schema.Types.Mixed
    }]
  }],
  analytics_views: [{
    view_name: String,
    description: String,
    sql_query: String,
    parameters: [{
      param_name: String,
      param_type: String,
      default_value: mongoose.Schema.Types.Mixed,
      required: Boolean
    }],
    refresh_schedule: String, // cron expression
    materialized: { type: Boolean, default: false },
    cache_ttl_minutes: { type: Number, default: 60 }
  }],
  performance_monitoring: {
    query_performance: [{
      query_id: String,
      query_sql: String,
      execution_time_ms: Number,
      rows_affected: Number,
      executed_at: Date,
      user_id: String
    }],
    resource_usage: [{
      timestamp: Date,
      cpu_usage_percent: Number,
      memory_usage_mb: Number,
      storage_usage_gb: Number,
      active_connections: Number
    }],
    alerts: [{
      alert_type: String,
      threshold: Number,
      current_value: Number,
      triggered_at: Date,
      resolved_at: Date
    }]
  },
  data_governance: {
    data_classification: [{
      table_name: String,
      column_name: String,
      classification: {
        type: String,
        enum: ['public', 'internal', 'confidential', 'restricted', 'pii', 'phi']
      },
      tags: [String],
      retention_days: Number
    }],
    access_policies: [{
      policy_name: String,
      tables: [String],
      users: [String],
      roles: [String],
      permissions: {
        type: [String],
        enum: ['read', 'write', 'delete', 'admin']
      },
      conditions: mongoose.Schema.Types.Mixed // row-level security
    }],
    audit_logs: [{
      timestamp: Date,
      user_id: String,
      action: String,
      resource: String,
      details: mongoose.Schema.Types.Mixed
    }],
    lineage_tracking: [{
      source_table: String,
      source_column: String,
      target_table: String,
      target_column: String,
      transformation: String,
      pipeline_id: String
    }]
  },
  backup_config: {
    enabled: { type: Boolean, default: true },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    retention_days: { type: Number, default: 30 },
    storage_location: String,
    encryption_enabled: { type: Boolean, default: true }
  },
  settings: {
    auto_schema_discovery: { type: Boolean, default: true },
    parallel_processing: { type: Boolean, default: true },
    max_concurrent_pipelines: { type: Number, default: 5 },
    query_timeout_minutes: { type: Number, default: 30 },
    result_cache_enabled: { type: Boolean, default: true }
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
dataWarehouseSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Method to test connection to data source
dataWarehouseSchema.methods.testConnection = async function(sourceId) {
  const source = this.data_sources.find(ds => ds.source_id === sourceId);
  if (!source) {
    throw new Error('Data source not found');
  }
  
  try {
    // Implementation would vary based on source_type
    // This is a placeholder for the actual connection testing logic
    
    switch (source.source_type) {
      case 'postgresql':
      case 'mysql':
        // Test database connection
        break;
      case 'mongodb':
        // Test MongoDB connection
        break;
      case 'api_endpoint':
        // Test API endpoint
        break;
      default:
        console.log(`Connection test for ${source.source_type} not implemented yet`);
    }
    
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Method to run ETL pipeline
dataWarehouseSchema.methods.runETLPipeline = async function(pipelineId) {
  const pipeline = this.etl_pipelines.find(p => p.pipeline_id === pipelineId);
  if (!pipeline) {
    throw new Error('Pipeline not found');
  }
  
  const execution = {
    execution_id: new mongoose.Types.ObjectId().toString(),
    started_at: new Date(),
    status: 'running',
    records_processed: 0,
    errors: []
  };
  
  pipeline.execution_history.push(execution);
  
  try {
    // Execute transformations in order
    for (const transformation of pipeline.transformations.sort((a, b) => a.order - b.order)) {
      await this.executeTransformation(transformation);
    }
    
    execution.status = 'completed';
    execution.records_processed = 1000; // Placeholder
    
  } catch (error) {
    execution.status = 'failed';
    execution.errors.push(error.message);
  } finally {
    execution.completed_at = new Date();
    execution.execution_time_ms = execution.completed_at - execution.started_at;
    await this.save();
  }
  
  return execution;
};

// Method to execute transformation (placeholder)
dataWarehouseSchema.methods.executeTransformation = async function(transformation) {
  console.log(`Executing transformation: ${transformation.transformation_type}`);
  // Implementation would go here based on transformation_type
};

// Method to run data quality checks
dataWarehouseSchema.methods.runDataQualityChecks = async function(pipelineId) {
  const pipeline = this.etl_pipelines.find(p => p.pipeline_id === pipelineId);
  if (!pipeline) {
    throw new Error('Pipeline not found');
  }
  
  const results = [];
  
  for (const rule of pipeline.data_quality_rules) {
    try {
      const result = await this.executeDataQualityRule(rule);
      results.push({
        rule_name: rule.rule_name,
        passed: result.passed,
        errors: result.errors,
        warning_count: result.warning_count
      });
    } catch (error) {
      results.push({
        rule_name: rule.rule_name,
        passed: false,
        errors: [error.message]
      });
    }
  }
  
  return results;
};

// Method to execute data quality rule (placeholder)
dataWarehouseSchema.methods.executeDataQualityRule = async function(rule) {
  console.log(`Executing data quality rule: ${rule.rule_name}`);
  // Implementation would go here based on rule_type
  return { passed: true, errors: [], warning_count: 0 };
};

// Method to get data lineage
dataWarehouseSchema.methods.getDataLineage = function(tableName, columnName) {
  return this.data_governance.lineage_tracking.filter(lineage => 
    lineage.target_table === tableName && 
    (!columnName || lineage.target_column === columnName)
  );
};

module.exports = mongoose.model('DataWarehouse', dataWarehouseSchema); 