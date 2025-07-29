const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');

/**
 * Generate MFA secret for user
 */
const generateMFASecret = async (userId) => {
  try {
    const secret = speakeasy.generateSecret({
      name: 'MEWAYZ Platform',
      issuer: 'MEWAYZ',
      length: 32
    });

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.security.twoFactorSecret = secret.base32;
    user.security.twoFactorEnabled = false; // Will be enabled after verification
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      otpauthUrl: secret.otpauth_url
    };
  } catch (error) {
    throw new Error(`Failed to generate MFA secret: ${error.message}`);
  }
};

/**
 * Verify MFA token
 */
const verifyMFAToken = (token, secret) => {
  try {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps (60 seconds) for clock skew
    });
  } catch (error) {
    return false;
  }
};

/**
 * Enable MFA for user
 */
const enableMFA = async (userId, token) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.security.twoFactorSecret) {
      throw new Error('MFA secret not generated');
    }

    // Verify the token
    const isValid = verifyMFAToken(token, user.security.twoFactorSecret);
    if (!isValid) {
      throw new Error('Invalid MFA token');
    }

    user.security.twoFactorEnabled = true;
    await user.save();

    return true;
  } catch (error) {
    throw new Error(`Failed to enable MFA: ${error.message}`);
  }
};

/**
 * Disable MFA for user
 */
const disableMFA = async (userId, token) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.security.twoFactorEnabled) {
      throw new Error('MFA is not enabled');
    }

    // Verify the token
    const isValid = verifyMFAToken(token, user.security.twoFactorSecret);
    if (!isValid) {
      throw new Error('Invalid MFA token');
    }

    user.security.twoFactorEnabled = false;
    user.security.twoFactorSecret = null;
    await user.save();

    return true;
  } catch (error) {
    throw new Error(`Failed to disable MFA: ${error.message}`);
  }
};

/**
 * MFA middleware for protected routes
 */
const requireMFA = async (req, res, next) => {
  try {
    const token = req.headers['x-mfa-token'];
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // If MFA is not enabled, skip verification
    if (!user.security.twoFactorEnabled) {
      return next();
    }

    // If MFA is enabled but no token provided
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'MFA token required',
        requiresMFA: true
      });
    }

    // Verify MFA token
    const isValid = verifyMFAToken(token, user.security.twoFactorSecret);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid MFA token'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'MFA verification failed'
    });
  }
};

/**
 * MFA setup middleware
 */
const setupMFA = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // If MFA is already enabled, return error
    if (user.security.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        error: 'MFA is already enabled'
      });
    }

    // Generate new MFA secret
    const mfaData = await generateMFASecret(userId);

    res.status(200).json({
      success: true,
      data: {
        secret: mfaData.secret,
        qrCode: mfaData.qrCode,
        otpauthUrl: mfaData.otpauthUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * MFA verification middleware
 */
const verifyMFA = async (req, res, next) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'MFA token is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // If MFA is not enabled, return error
    if (!user.security.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        error: 'MFA is not enabled'
      });
    }

    // Verify MFA token
    const isValid = verifyMFAToken(token, user.security.twoFactorSecret);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid MFA token'
      });
    }

    // Generate temporary MFA session token
    const mfaSessionToken = jwt.sign(
      { 
        userId: user._id, 
        mfaVerified: true,
        type: 'mfa_session'
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({
      success: true,
      data: {
        mfaSessionToken,
        message: 'MFA verification successful'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * MFA session verification middleware
 */
const verifyMFASession = async (req, res, next) => {
  try {
    const mfaSessionToken = req.headers['x-mfa-session-token'];
    
    if (!mfaSessionToken) {
      return res.status(401).json({
        success: false,
        error: 'MFA session token required'
      });
    }

    const decoded = jwt.verify(mfaSessionToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'mfa_session' || !decoded.mfaVerified) {
      return res.status(401).json({
        success: false,
        error: 'Invalid MFA session token'
      });
    }

    // Add MFA verification to request
    req.mfaVerified = true;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid MFA session token'
    });
  }
};

/**
 * Backup codes generation
 */
const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(Math.random().toString(36).substr(2, 8).toUpperCase());
  }
  return codes;
};

/**
 * Verify backup code
 */
const verifyBackupCode = async (userId, code) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.backupCodes) {
      return false;
    }

    const codeIndex = user.backupCodes.indexOf(code);
    if (codeIndex === -1) {
      return false;
    }

    // Remove used backup code
    user.backupCodes.splice(codeIndex, 1);
    await user.save();

    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  generateMFASecret,
  verifyMFAToken,
  enableMFA,
  disableMFA,
  requireMFA,
  setupMFA,
  verifyMFA,
  verifyMFASession,
  generateBackupCodes,
  verifyBackupCode
}; 