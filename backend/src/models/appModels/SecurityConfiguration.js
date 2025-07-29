const mongoose = require('mongoose');

const securityConfigurationSchema = new mongoose.Schema({
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  auth_providers: {
    saml: {
      enabled: { type: Boolean, default: false },
      metadata_url: String,
      entity_id: String,
      assertion_consumer_service_url: String,
      x509_cert: String,
      private_key: String,
      signature_algorithm: { type: String, default: 'sha256' },
      digest_algorithm: { type: String, default: 'sha256' },
      attribute_mapping: {
        email: String,
        name: String,
        groups: String
      }
    },
    ldap: {
      enabled: { type: Boolean, default: false },
      url: String,
      bind_dn: String,
      bind_password: String,
      search_base: String,
      search_filter: String,
      group_search_base: String,
      group_search_filter: String,
      attributes: {
        username: { type: String, default: 'uid' },
        email: { type: String, default: 'mail' },
        name: { type: String, default: 'cn' }
      },
      tls: {
        enabled: { type: Boolean, default: false },
        ca_cert: String,
        reject_unauthorized: { type: Boolean, default: true }
      }
    },
    active_directory: {
      enabled: { type: Boolean, default: false },
      domain: String,
      url: String,
      base_dn: String,
      username: String,
      password: String,
      tls_options: mongoose.Schema.Types.Mixed
    },
    oauth: {
      google: {
        enabled: { type: Boolean, default: false },
        client_id: String,
        client_secret: String,
        allowed_domains: [String]
      },
      microsoft: {
        enabled: { type: Boolean, default: false },
        client_id: String,
        client_secret: String,
        tenant_id: String
      },
      github: {
        enabled: { type: Boolean, default: false },
        client_id: String,
        client_secret: String,
        allowed_organizations: [String]
      }
    }
  },
  security_policies: {
    password_policy: {
      min_length: { type: Number, default: 12 },
      require_uppercase: { type: Boolean, default: true },
      require_lowercase: { type: Boolean, default: true },
      require_numbers: { type: Boolean, default: true },
      require_special_chars: { type: Boolean, default: true },
      password_history: { type: Number, default: 5 },
      max_age_days: { type: Number, default: 90 },
      lockout_attempts: { type: Number, default: 5 },
      lockout_duration_minutes: { type: Number, default: 30 }
    },
    session_policy: {
      timeout_minutes: { type: Number, default: 60 },
      concurrent_sessions: { type: Number, default: 3 },
      remember_me_duration_days: { type: Number, default: 30 },
      require_mfa_for_admin: { type: Boolean, default: true }
    },
    ip_restrictions: {
      enabled: { type: Boolean, default: false },
      whitelist: [String],
      blacklist: [String],
      geo_blocking: {
        enabled: { type: Boolean, default: false },
        allowed_countries: [String],
        blocked_countries: [String]
      }
    },
    device_trust: {
      enabled: { type: Boolean, default: false },
      require_device_approval: { type: Boolean, default: false },
      trusted_device_duration_days: { type: Number, default: 90 }
    }
  },
  compliance_settings: {
    soc2: {
      enabled: { type: Boolean, default: false },
      audit_logging: { type: Boolean, default: true },
      encryption_at_rest: { type: Boolean, default: true },
      encryption_in_transit: { type: Boolean, default: true }
    },
    hipaa: {
      enabled: { type: Boolean, default: false },
      phi_encryption: { type: Boolean, default: true },
      access_logging: { type: Boolean, default: true },
      data_retention_days: { type: Number, default: 2555 }
    },
    gdpr: {
      enabled: { type: Boolean, default: false },
      data_portability: { type: Boolean, default: true },
      right_to_erasure: { type: Boolean, default: true },
      consent_management: { type: Boolean, default: true }
    },
    pci_dss: {
      enabled: { type: Boolean, default: false },
      tokenization: { type: Boolean, default: true },
      secure_storage: { type: Boolean, default: true }
    }
  },
  risk_based_authentication: {
    enabled: { type: Boolean, default: false },
    factors: {
      unusual_location: { type: Boolean, default: true },
      new_device: { type: Boolean, default: true },
      impossible_travel: { type: Boolean, default: true },
      suspicious_activity: { type: Boolean, default: true }
    },
    actions: {
      require_mfa: { type: Boolean, default: true },
      send_alert: { type: Boolean, default: true },
      block_access: { type: Boolean, default: false }
    }
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
securityConfigurationSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Encrypt sensitive fields before saving
securityConfigurationSchema.pre('save', async function(next) {
  const crypto = require('crypto');
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-encryption-key-change-this', 'hex');
  
  // List of fields to encrypt
  const fieldsToEncrypt = [
    'auth_providers.saml.private_key',
    'auth_providers.ldap.bind_password',
    'auth_providers.active_directory.password',
    'auth_providers.oauth.google.client_secret',
    'auth_providers.oauth.microsoft.client_secret',
    'auth_providers.oauth.github.client_secret'
  ];
  
  // Encrypt each field if it exists
  fieldsToEncrypt.forEach(fieldPath => {
    const value = this.get(fieldPath);
    if (value && !value.startsWith('encrypted:')) {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      
      let encrypted = cipher.update(value, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      const encryptedValue = `encrypted:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
      
      this.set(fieldPath, encryptedValue);
    }
  });
  
  next();
});

// Decrypt sensitive fields after loading
securityConfigurationSchema.methods.decryptField = function(fieldPath) {
  const crypto = require('crypto');
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-encryption-key-change-this', 'hex');
  
  const value = this.get(fieldPath);
  if (!value || !value.startsWith('encrypted:')) {
    return value;
  }
  
  try {
    const parts = value.split(':');
    const iv = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    const encrypted = parts[3];
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

module.exports = mongoose.model('SecurityConfiguration', securityConfigurationSchema); 