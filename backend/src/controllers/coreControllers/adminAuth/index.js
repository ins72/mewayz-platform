const Admin = require('../../../models/coreModels/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { catchErrors } = require('../../../handlers/errorHandlers');

// Login admin
exports.login = catchErrors(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  const token = jwt.sign(
    { id: admin._id, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(200).json({
    success: true,
    result: {
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name
      }
    },
    message: 'Login successful'
  });
});

// Forget password
exports.forgetPassword = catchErrors(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  // Generate reset token
  const resetToken = jwt.sign(
    { id: admin._id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // In a real application, you would send this token via email
  res.status(200).json({
    success: true,
    message: 'Password reset instructions sent to email',
    result: { resetToken }
  });
});

// Reset password
exports.resetPassword = catchErrors(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Token and new password are required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

// Logout
exports.logout = catchErrors(async (req, res) => {
  // In a real application, you might want to blacklist the token
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

// Middleware to validate admin token
exports.isValidAuthToken = catchErrors(async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});
