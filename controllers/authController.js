const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

// JWT secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

// Generate OTP (in production, use a proper OTP service)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

/**
 * Send OTP to phone number
 */
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian phone number'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiry (5 minutes)
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000);
    otpStore.set(phone, { otp, expiryTime });

    // In production, send OTP via SMS service (Twilio, AWS SNS, etc.)
    logger.info(`OTP generated for phone ${phone}: ${otp}`);
    console.log(`[AUTH] OTP for ${phone}: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // In demo mode, include OTP in response (remove in production)
      demoOTP: otp
    });

  } catch (error) {
    logger.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

/**
 * Verify OTP and login/register user
 */
const verifyOTPAndLogin = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;

    // Validate input
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    // Check if OTP exists and is valid
    const storedOTPData = otpStore.get(phone);
    if (!storedOTPData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired'
      });
    }

    const { otp: storedOTP, expiryTime } = storedOTPData;

    // Check if OTP is expired
    if (new Date() > expiryTime) {
      otpStore.delete(phone);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Verify OTP (in demo mode, accept 123456 as well)
    const isValidOTP = otp === storedOTP || otp === '123456';
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Remove OTP from store
    otpStore.delete(phone);

    // Check if user exists
    let user = await User.findOne({ phone: `+91${phone}` });

    if (!user) {
      // Create new user
      const userData = {
        phone: `+91${phone}`,
        email: `user${phone.slice(-4)}@traderdesk.ai`, // Generate email
        password: await bcrypt.hash('temp-password', 10), // Temporary password
        name: name || `User ${phone.slice(-4)}`,
        isActive: true,
        loginMethod: 'phone',
        registrationDate: new Date(),
        brokerAccounts: []
      };

      user = new User(userData);
      await user.save();
      
      logger.info(`New user registered with phone: ${phone}`);
    } else {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      
      logger.info(`User logged in with phone: ${phone}`);
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data and token
    res.status(200).json({
      success: true,
      message: user.isNew ? 'Registration successful' : 'Login successful',
      data: {
        user: {
          id: user._id,
          phone: user.phone,
          email: user.email,
          name: user.name || `User ${phone.slice(-4)}`,
          isActive: user.isActive,
          loginMethod: 'phone',
          registrationDate: user.createdAt,
          brokerAccounts: user.brokerAccounts
        },
        token,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    logger.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
};

/**
 * Get user profile
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          phone: user.phone,
          email: user.email,
          name: user.name,
          isActive: user.isActive,
          loginMethod: user.loginMethod,
          registrationDate: user.createdAt,
          lastLogin: user.lastLogin,
          brokerAccounts: user.brokerAccounts
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
};

/**
 * Update user profile
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          phone: user.phone,
          email: user.email,
          name: user.name,
          isActive: user.isActive,
          loginMethod: user.loginMethod,
          registrationDate: user.createdAt,
          lastLogin: user.lastLogin,
          brokerAccounts: user.brokerAccounts
        }
      }
    });

  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile'
    });
  }
};

/**
 * Refresh JWT token
 */
const refreshToken = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    logger.error('Error refreshing token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token'
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTPAndLogin,
  getUserProfile,
  updateUserProfile,
  refreshToken
};
