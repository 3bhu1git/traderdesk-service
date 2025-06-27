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
