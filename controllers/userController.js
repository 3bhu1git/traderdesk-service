const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, tradingExperience, tradingStyle } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email address is already registered with another account'
        });
      }
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (tradingExperience) user.tradingExperience = tradingExperience;
    if (tradingStyle) user.tradingStyle = tradingStyle;

    // Check if profile is now complete
    const isProfileComplete = !!(
      user.name && 
      user.email && 
      user.tradingExperience && 
      user.tradingStyle &&
      user.name !== `User ${user.phone.slice(-4)}`
    );
    
    user.isProfileComplete = isProfileComplete;

    await user.save();

    logger.info(`User profile updated: ${userId}`);

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
          isProfileComplete: user.isProfileComplete,
          tradingExperience: user.tradingExperience,
          tradingStyle: user.tradingStyle,
          brokerAccounts: user.brokerAccounts
        }
      }
    });

  } catch (error) {
    logger.error('Error updating user profile:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'email') {
        return res.status(400).json({
          success: false,
          message: 'Email address is already registered with another account'
        });
      } else if (field === 'phone') {
        return res.status(400).json({
          success: false,
          message: 'Phone number is already registered with another account'
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile'
    });
  }
};

/**
 * Get user profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
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
          isProfileComplete: user.isProfileComplete,
          tradingExperience: user.tradingExperience,
          tradingStyle: user.tradingStyle,
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

module.exports = {
  updateProfile,
  getProfile
};
