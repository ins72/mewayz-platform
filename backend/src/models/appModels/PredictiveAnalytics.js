const mongoose = require('mongoose');

const predictiveAnalyticsSchema = new mongoose.Schema({
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  model_type: {
    type: String,
    required: true,
    enum: ['sales_forecast', 'churn_prediction', 'clv_prediction', 'demand_forecast', 'lead_scoring', 'revenue_optimization']
  },
  model_config: {
    algorithm: {
      type: String,
      enum: ['linear_regression', 'random_forest', 'neural_network', 'time_series', 'clustering'],
      required: true
    },
    features: [String], // Features used for prediction
    hyperparameters: mongoose.Schema.Types.Mixed,
    training_period_days: { type: Number, default: 365 },
    update_frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    }
  },
  performance_metrics: {
    accuracy: Number,
    precision: Number,
    recall: Number,
    f1_score: Number,
    rmse: Number, // For regression models
    mae: Number, // Mean absolute error
    r2_score: Number, // R-squared for regression
    last_evaluated: Date
  },
  predictions: [{
    entity_id: mongoose.Schema.Types.ObjectId, // Customer, Product, Lead, etc.
    entity_type: String,
    prediction_date: Date,
    predicted_value: Number,
    confidence_score: Number,
    actual_value: Number, // For tracking accuracy
    features_snapshot: mongoose.Schema.Types.Mixed // Features at prediction time
  }],
  training_data: {
    last_training_date: Date,
    training_size: Number,
    validation_size: Number,
    test_size: Number,
    data_quality_score: Number
  },
  status: {
    type: String,
    enum: ['active', 'training', 'failed', 'inactive'],
    default: 'inactive'
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
predictiveAnalyticsSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Method to calculate prediction accuracy
predictiveAnalyticsSchema.methods.calculateAccuracy = function() {
  const recentPredictions = this.predictions.filter(p => 
    p.actual_value !== null && 
    p.prediction_date > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
  );
  
  if (recentPredictions.length === 0) return null;
  
  // For classification models (churn, lead scoring)
  if (['churn_prediction', 'lead_scoring'].includes(this.model_type)) {
    const correct = recentPredictions.filter(p => 
      Math.round(p.predicted_value) === Math.round(p.actual_value)
    ).length;
    return (correct / recentPredictions.length) * 100;
  }
  
  // For regression models (sales, revenue, CLV)
  const mape = recentPredictions.reduce((sum, p) => {
    return sum + Math.abs((p.actual_value - p.predicted_value) / p.actual_value);
  }, 0) / recentPredictions.length;
  
  return (1 - mape) * 100; // Convert to accuracy percentage
};

module.exports = mongoose.model('PredictiveAnalytics', predictiveAnalyticsSchema); 