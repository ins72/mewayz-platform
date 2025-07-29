const express = require('express');
const router = express.Router();
const { catchErrors } = require('../../handlers/errorHandlers');
const securityController = require('../../controllers/appControllers/securityController');
const { isValidAdminToken } = require('../../controllers/middlewaresControllers/createAuthMiddleware');

// Security Configuration Routes
router.route('/config')
  .get(isValidAdminToken, catchErrors(securityController.getSecurityConfig))
  .put(isValidAdminToken, catchErrors(securityController.updateSecurityConfig));

// Authentication Provider Testing
router.post('/test/saml', isValidAdminToken, catchErrors(securityController.testSAMLConfig));
router.post('/test/ldap', isValidAdminToken, catchErrors(securityController.testLDAPConfig));
router.post('/test/ad', isValidAdminToken, catchErrors(securityController.testADConfig));

// Compliance
router.get('/compliance/report', isValidAdminToken, catchErrors(securityController.getComplianceReport));

// Risk-Based Authentication
router.put('/risk-auth', isValidAdminToken, catchErrors(securityController.updateRiskBasedAuth));

module.exports = router; 