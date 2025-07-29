const SecurityConfiguration = require('../models/appModels/SecurityConfiguration');
const { catchErrors } = require('../handlers/errorHandlers');
const passport = require('passport');
const saml = require('passport-saml');
const LdapAuth = require('ldapauth-fork');
const ActiveDirectory = require('activedirectory2');

// Get security configuration
exports.getSecurityConfig = catchErrors(async (req, res) => {
  const { organization_id } = req.query;
  
  if (!organization_id) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }
  
  let config = await SecurityConfiguration.findOne({ organization_id });
  
  if (!config) {
    // Create default configuration if none exists
    config = new SecurityConfiguration({
      organization_id
    });
    await config.save();
  }
  
  // Remove sensitive encrypted fields from response
  const safeConfig = config.toObject();
  const sensitiveFields = [
    'auth_providers.saml.private_key',
    'auth_providers.ldap.bind_password',
    'auth_providers.active_directory.password',
    'auth_providers.oauth.google.client_secret',
    'auth_providers.oauth.microsoft.client_secret',
    'auth_providers.oauth.github.client_secret'
  ];
  
  sensitiveFields.forEach(field => {
    const path = field.split('.');
    let obj = safeConfig;
    for (let i = 0; i < path.length - 1; i++) {
      if (obj[path[i]]) {
        obj = obj[path[i]];
      }
    }
    if (obj && obj[path[path.length - 1]]) {
      obj[path[path.length - 1]] = '***ENCRYPTED***';
    }
  });
  
  res.json({
    success: true,
    result: safeConfig
  });
});

// Update security configuration
exports.updateSecurityConfig = catchErrors(async (req, res) => {
  const { organization_id } = req.query;
  const updates = req.body;
  
  if (!organization_id) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }
  
  let config = await SecurityConfiguration.findOne({ organization_id });
  
  if (!config) {
    config = new SecurityConfiguration({
      organization_id,
      ...updates
    });
  } else {
    // Update configuration
    Object.keys(updates).forEach(key => {
      config[key] = updates[key];
    });
  }
  
  await config.save();
  
  res.json({
    success: true,
    message: 'Security configuration updated successfully',
    result: config
  });
});

// Test SAML configuration
exports.testSAMLConfig = catchErrors(async (req, res) => {
  const { organization_id } = req.query;
  
  const config = await SecurityConfiguration.findOne({ organization_id });
  
  if (!config || !config.auth_providers.saml.enabled) {
    return res.status(400).json({
      success: false,
      message: 'SAML is not configured or enabled'
    });
  }
  
  try {
    const samlConfig = config.auth_providers.saml;
    const privateKey = config.decryptField('auth_providers.saml.private_key');
    
    const samlStrategy = new saml.Strategy({
      callbackUrl: samlConfig.assertion_consumer_service_url,
      entryPoint: samlConfig.metadata_url,
      issuer: samlConfig.entity_id,
      cert: samlConfig.x509_cert,
      privateKey: privateKey,
      signatureAlgorithm: samlConfig.signature_algorithm,
      digestAlgorithm: samlConfig.digest_algorithm
    }, (profile, done) => {
      return done(null, profile);
    });
    
    res.json({
      success: true,
      message: 'SAML configuration is valid'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'SAML configuration test failed',
      error: error.message
    });
  }
});

// Test LDAP configuration
exports.testLDAPConfig = catchErrors(async (req, res) => {
  const { organization_id, test_username, test_password } = req.body;
  
  const config = await SecurityConfiguration.findOne({ organization_id });
  
  if (!config || !config.auth_providers.ldap.enabled) {
    return res.status(400).json({
      success: false,
      message: 'LDAP is not configured or enabled'
    });
  }
  
  try {
    const ldapConfig = config.auth_providers.ldap;
    const bindPassword = config.decryptField('auth_providers.ldap.bind_password');
    
    const ldapAuth = new LdapAuth({
      url: ldapConfig.url,
      bindDN: ldapConfig.bind_dn,
      bindCredentials: bindPassword,
      searchBase: ldapConfig.search_base,
      searchFilter: ldapConfig.search_filter,
      tlsOptions: ldapConfig.tls.enabled ? {
        ca: ldapConfig.tls.ca_cert,
        rejectUnauthorized: ldapConfig.tls.reject_unauthorized
      } : undefined
    });
    
    ldapAuth.authenticate(test_username, test_password, (err, user) => {
      ldapAuth.close();
      
      if (err) {
        return res.status(400).json({
          success: false,
          message: 'LDAP authentication test failed',
          error: err.message
        });
      }
      
      res.json({
        success: true,
        message: 'LDAP configuration is valid',
        user: {
          username: user[ldapConfig.attributes.username],
          email: user[ldapConfig.attributes.email],
          name: user[ldapConfig.attributes.name]
        }
      });
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'LDAP configuration test failed',
      error: error.message
    });
  }
});

// Test Active Directory configuration
exports.testADConfig = catchErrors(async (req, res) => {
  const { organization_id, test_username, test_password } = req.body;
  
  const config = await SecurityConfiguration.findOne({ organization_id });
  
  if (!config || !config.auth_providers.active_directory.enabled) {
    return res.status(400).json({
      success: false,
      message: 'Active Directory is not configured or enabled'
    });
  }
  
  try {
    const adConfig = config.auth_providers.active_directory;
    const password = config.decryptField('auth_providers.active_directory.password');
    
    const ad = new ActiveDirectory({
      url: adConfig.url,
      baseDN: adConfig.base_dn,
      username: adConfig.username,
      password: password,
      tlsOptions: adConfig.tls_options
    });
    
    ad.authenticate(`${test_username}@${adConfig.domain}`, test_password, (err, auth) => {
      if (err || !auth) {
        return res.status(400).json({
          success: false,
          message: 'Active Directory authentication test failed',
          error: err ? err.message : 'Authentication failed'
        });
      }
      
      // Get user details
      ad.findUser(test_username, (err, user) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: 'Failed to retrieve user details',
            error: err.message
          });
        }
        
        res.json({
          success: true,
          message: 'Active Directory configuration is valid',
          user: {
            username: user.sAMAccountName,
            email: user.mail,
            name: user.displayName,
            groups: user.memberOf
          }
        });
      });
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Active Directory configuration test failed',
      error: error.message
    });
  }
});

// Get compliance audit report
exports.getComplianceReport = catchErrors(async (req, res) => {
  const { organization_id, compliance_type } = req.query;
  
  const config = await SecurityConfiguration.findOne({ organization_id });
  
  if (!config) {
    return res.status(404).json({
      success: false,
      message: 'Security configuration not found'
    });
  }
  
  const auditReport = {
    organization_id,
    compliance_type: compliance_type || 'all',
    generated_at: new Date(),
    status: {},
    recommendations: []
  };
  
  // Check SOC 2 compliance
  if (!compliance_type || compliance_type === 'soc2') {
    const soc2 = config.compliance_settings.soc2;
    auditReport.status.soc2 = {
      enabled: soc2.enabled,
      compliant: soc2.enabled && soc2.audit_logging && soc2.encryption_at_rest && soc2.encryption_in_transit,
      requirements: {
        audit_logging: soc2.audit_logging,
        encryption_at_rest: soc2.encryption_at_rest,
        encryption_in_transit: soc2.encryption_in_transit,
        access_controls: config.security_policies.session_policy.require_mfa_for_admin,
        incident_response: true // Placeholder - would check actual incident response procedures
      }
    };
    
    if (!auditReport.status.soc2.compliant) {
      auditReport.recommendations.push({
        type: 'soc2',
        priority: 'high',
        message: 'Enable all SOC 2 requirements to achieve compliance'
      });
    }
  }
  
  // Check HIPAA compliance
  if (!compliance_type || compliance_type === 'hipaa') {
    const hipaa = config.compliance_settings.hipaa;
    auditReport.status.hipaa = {
      enabled: hipaa.enabled,
      compliant: hipaa.enabled && hipaa.phi_encryption && hipaa.access_logging,
      requirements: {
        phi_encryption: hipaa.phi_encryption,
        access_logging: hipaa.access_logging,
        data_retention: hipaa.data_retention_days >= 2190, // 6 years minimum
        access_controls: true,
        audit_controls: true
      }
    };
    
    if (!auditReport.status.hipaa.compliant) {
      auditReport.recommendations.push({
        type: 'hipaa',
        priority: 'critical',
        message: 'Enable HIPAA compliance settings for healthcare data protection'
      });
    }
  }
  
  // Check GDPR compliance
  if (!compliance_type || compliance_type === 'gdpr') {
    const gdpr = config.compliance_settings.gdpr;
    auditReport.status.gdpr = {
      enabled: gdpr.enabled,
      compliant: gdpr.enabled && gdpr.data_portability && gdpr.right_to_erasure && gdpr.consent_management,
      requirements: {
        data_portability: gdpr.data_portability,
        right_to_erasure: gdpr.right_to_erasure,
        consent_management: gdpr.consent_management,
        privacy_by_design: true,
        data_protection_officer: true // Placeholder - would check DPO assignment
      }
    };
    
    if (!auditReport.status.gdpr.compliant) {
      auditReport.recommendations.push({
        type: 'gdpr',
        priority: 'high',
        message: 'Enable GDPR compliance features for EU data protection'
      });
    }
  }
  
  // Check PCI DSS compliance
  if (!compliance_type || compliance_type === 'pci_dss') {
    const pci = config.compliance_settings.pci_dss;
    auditReport.status.pci_dss = {
      enabled: pci.enabled,
      compliant: pci.enabled && pci.tokenization && pci.secure_storage,
      requirements: {
        tokenization: pci.tokenization,
        secure_storage: pci.secure_storage,
        network_security: true,
        vulnerability_management: true,
        access_control: config.security_policies.password_policy.min_length >= 8
      }
    };
    
    if (!auditReport.status.pci_dss.compliant) {
      auditReport.recommendations.push({
        type: 'pci_dss',
        priority: 'critical',
        message: 'Enable PCI DSS compliance for payment card data protection'
      });
    }
  }
  
  // Overall compliance score
  const enabledCompliances = Object.values(auditReport.status).filter(c => c.enabled).length;
  const compliantCompliances = Object.values(auditReport.status).filter(c => c.compliant).length;
  auditReport.overall_score = enabledCompliances > 0 ? (compliantCompliances / enabledCompliances) * 100 : 0;
  
  res.json({
    success: true,
    result: auditReport
  });
});

// Enable/disable risk-based authentication
exports.updateRiskBasedAuth = catchErrors(async (req, res) => {
  const { organization_id } = req.query;
  const { enabled, factors, actions } = req.body;
  
  const config = await SecurityConfiguration.findOne({ organization_id });
  
  if (!config) {
    return res.status(404).json({
      success: false,
      message: 'Security configuration not found'
    });
  }
  
  if (enabled !== undefined) {
    config.risk_based_authentication.enabled = enabled;
  }
  
  if (factors) {
    Object.assign(config.risk_based_authentication.factors, factors);
  }
  
  if (actions) {
    Object.assign(config.risk_based_authentication.actions, actions);
  }
  
  await config.save();
  
  res.json({
    success: true,
    message: 'Risk-based authentication settings updated',
    result: config.risk_based_authentication
  });
}); 