const mongoose = require('mongoose');

const workflowEngineSchema = new mongoose.Schema({
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  workflow_name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['sales', 'marketing', 'support', 'operations', 'hr', 'finance', 'custom'],
    default: 'custom'
  },
  trigger: {
    type: {
      type: String,
      enum: ['manual', 'schedule', 'webhook', 'email', 'form_submission', 'data_change', 'api_call'],
      required: true
    },
    config: {
      // For schedule triggers
      cron_expression: String,
      timezone: String,
      
      // For webhook triggers
      webhook_url: String,
      webhook_secret: String,
      
      // For data change triggers
      model_name: String,
      field_name: String,
      condition: String, // equals, contains, greater_than, etc.
      value: mongoose.Schema.Types.Mixed,
      
      // For form submission triggers
      form_id: String,
      
      // For email triggers
      email_filters: {
        from: String,
        subject_contains: String,
        body_contains: String
      }
    }
  },
  steps: [{
    step_id: { type: String, required: true },
    step_name: String,
    step_type: {
      type: String,
      enum: [
        'condition', 'action', 'delay', 'approval', 'notification', 
        'data_transformation', 'api_call', 'email', 'sms', 'webhook',
        'database_operation', 'file_operation', 'integration'
      ],
      required: true
    },
    position: {
      x: Number,
      y: Number
    },
    config: mongoose.Schema.Types.Mixed,
    conditions: [{
      field: String,
      operator: {
        type: String,
        enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty']
      },
      value: mongoose.Schema.Types.Mixed,
      logic_operator: { type: String, enum: ['AND', 'OR'], default: 'AND' }
    }],
    actions: [{
      action_type: {
        type: String,
        enum: [
          'create_record', 'update_record', 'delete_record', 'send_email', 
          'send_sms', 'call_webhook', 'run_script', 'assign_task', 
          'create_ticket', 'update_status', 'calculate_field'
        ]
      },
      target: String, // model name, email address, webhook URL, etc.
      parameters: mongoose.Schema.Types.Mixed
    }],
    next_steps: [{
      step_id: String,
      condition: String // 'success', 'failure', 'custom_condition'
    }],
    timeout_minutes: { type: Number, default: 60 },
    retry_config: {
      max_attempts: { type: Number, default: 3 },
      retry_delay_minutes: { type: Number, default: 5 }
    }
  }],
  variables: [{
    name: String,
    type: { type: String, enum: ['string', 'number', 'boolean', 'date', 'object'] },
    default_value: mongoose.Schema.Types.Mixed,
    description: String
  }],
  permissions: {
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    editors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    approvers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  execution_history: [{
    execution_id: String,
    started_at: Date,
    completed_at: Date,
    status: {
      type: String,
      enum: ['running', 'completed', 'failed', 'cancelled', 'paused'],
      default: 'running'
    },
    trigger_data: mongoose.Schema.Types.Mixed,
    current_step: String,
    steps_completed: [String],
    errors: [{
      step_id: String,
      error_message: String,
      timestamp: Date,
      stack_trace: String
    }],
    execution_time_ms: Number,
    output_data: mongoose.Schema.Types.Mixed
  }],
  statistics: {
    total_executions: { type: Number, default: 0 },
    successful_executions: { type: Number, default: 0 },
    failed_executions: { type: Number, default: 0 },
    average_execution_time_ms: { type: Number, default: 0 },
    last_execution: Date
  },
  settings: {
    enabled: { type: Boolean, default: true },
    max_concurrent_executions: { type: Number, default: 10 },
    execution_timeout_minutes: { type: Number, default: 120 },
    error_notification_email: String,
    debug_mode: { type: Boolean, default: false }
  },
  version: { type: Number, default: 1 },
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
workflowEngineSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Method to execute workflow
workflowEngineSchema.methods.executeWorkflow = async function(triggerData = {}) {
  const executionId = new mongoose.Types.ObjectId().toString();
  
  const execution = {
    execution_id: executionId,
    started_at: new Date(),
    status: 'running',
    trigger_data: triggerData,
    current_step: null,
    steps_completed: [],
    errors: [],
    output_data: {}
  };
  
  this.execution_history.push(execution);
  this.statistics.total_executions += 1;
  
  try {
    // Find the first step (usually the one without incoming connections)
    const firstStep = this.steps.find(step => 
      !this.steps.some(otherStep => 
        otherStep.next_steps.some(next => next.step_id === step.step_id)
      )
    );
    
    if (!firstStep) {
      throw new Error('No starting step found in workflow');
    }
    
    // Execute steps sequentially
    let currentStep = firstStep;
    const context = { ...triggerData, variables: {} };
    
    while (currentStep) {
      execution.current_step = currentStep.step_id;
      
      try {
        // Execute the current step
        const stepResult = await this.executeStep(currentStep, context);
        execution.steps_completed.push(currentStep.step_id);
        
        // Merge step output into context
        Object.assign(context, stepResult.output || {});
        
        // Determine next step based on result
        const nextStepConfig = currentStep.next_steps.find(next => 
          next.condition === stepResult.status || next.condition === 'success'
        );
        
        if (nextStepConfig) {
          currentStep = this.steps.find(step => step.step_id === nextStepConfig.step_id);
        } else {
          currentStep = null; // End of workflow
        }
        
      } catch (stepError) {
        execution.errors.push({
          step_id: currentStep.step_id,
          error_message: stepError.message,
          timestamp: new Date(),
          stack_trace: stepError.stack
        });
        
        // Check if there's an error path
        const errorStepConfig = currentStep.next_steps.find(next => next.condition === 'failure');
        if (errorStepConfig) {
          currentStep = this.steps.find(step => step.step_id === errorStepConfig.step_id);
        } else {
          throw stepError; // No error handling, fail the workflow
        }
      }
    }
    
    execution.status = 'completed';
    execution.output_data = context;
    this.statistics.successful_executions += 1;
    
  } catch (error) {
    execution.status = 'failed';
    execution.errors.push({
      step_id: execution.current_step || 'workflow',
      error_message: error.message,
      timestamp: new Date(),
      stack_trace: error.stack
    });
    this.statistics.failed_executions += 1;
  } finally {
    execution.completed_at = new Date();
    execution.execution_time_ms = execution.completed_at - execution.started_at;
    
    // Update average execution time
    const totalTime = this.statistics.average_execution_time_ms * (this.statistics.total_executions - 1);
    this.statistics.average_execution_time_ms = (totalTime + execution.execution_time_ms) / this.statistics.total_executions;
    this.statistics.last_execution = execution.completed_at;
    
    await this.save();
  }
  
  return execution;
};

// Method to execute individual step
workflowEngineSchema.methods.executeStep = async function(step, context) {
  const stepResult = { status: 'success', output: {} };
  
  switch (step.step_type) {
    case 'condition':
      stepResult.status = this.evaluateConditions(step.conditions, context) ? 'success' : 'failure';
      break;
      
    case 'action':
      for (const action of step.actions) {
        await this.executeAction(action, context, stepResult);
      }
      break;
      
    case 'delay':
      const delayMs = (step.config.delay_minutes || 1) * 60 * 1000;
      await new Promise(resolve => setTimeout(resolve, delayMs));
      break;
      
    case 'notification':
      await this.sendNotification(step.config, context);
      break;
      
    case 'api_call':
      const apiResult = await this.makeApiCall(step.config, context);
      stepResult.output.api_response = apiResult;
      break;
      
    case 'database_operation':
      const dbResult = await this.performDatabaseOperation(step.config, context);
      stepResult.output.db_result = dbResult;
      break;
      
    default:
      console.log(`Step type ${step.step_type} not implemented yet`);
  }
  
  return stepResult;
};

// Method to evaluate conditions
workflowEngineSchema.methods.evaluateConditions = function(conditions, context) {
  if (!conditions || conditions.length === 0) return true;
  
  let result = true;
  let currentLogic = 'AND';
  
  for (const condition of conditions) {
    const fieldValue = this.getNestedValue(context, condition.field);
    const conditionResult = this.evaluateCondition(fieldValue, condition.operator, condition.value);
    
    if (currentLogic === 'AND') {
      result = result && conditionResult;
    } else {
      result = result || conditionResult;
    }
    
    currentLogic = condition.logic_operator || 'AND';
  }
  
  return result;
};

// Method to evaluate single condition
workflowEngineSchema.methods.evaluateCondition = function(fieldValue, operator, compareValue) {
  switch (operator) {
    case 'equals':
      return fieldValue == compareValue;
    case 'not_equals':
      return fieldValue != compareValue;
    case 'contains':
      return String(fieldValue).includes(String(compareValue));
    case 'not_contains':
      return !String(fieldValue).includes(String(compareValue));
    case 'greater_than':
      return Number(fieldValue) > Number(compareValue);
    case 'less_than':
      return Number(fieldValue) < Number(compareValue);
    case 'is_empty':
      return !fieldValue || fieldValue === '';
    case 'is_not_empty':
      return fieldValue && fieldValue !== '';
    default:
      return false;
  }
};

// Helper method to get nested values from objects
workflowEngineSchema.methods.getNestedValue = function(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
};

// Method to execute actions (placeholder)
workflowEngineSchema.methods.executeAction = async function(action, context, stepResult) {
  // This would contain the actual implementation for each action type
  console.log(`Executing action: ${action.action_type}`);
  // Implementation would go here based on action_type
};

// Method to send notifications (placeholder)
workflowEngineSchema.methods.sendNotification = async function(config, context) {
  console.log('Sending notification:', config);
  // Implementation would go here
};

// Method to make API calls (placeholder)
workflowEngineSchema.methods.makeApiCall = async function(config, context) {
  console.log('Making API call:', config);
  // Implementation would go here
  return { success: true };
};

// Method to perform database operations (placeholder)
workflowEngineSchema.methods.performDatabaseOperation = async function(config, context) {
  console.log('Performing database operation:', config);
  // Implementation would go here
  return { success: true };
};

module.exports = mongoose.model('WorkflowEngine', workflowEngineSchema); 