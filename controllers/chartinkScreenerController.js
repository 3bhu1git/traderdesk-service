const { ChartinkScreener, ScreenerResult } = require('../models/ChartinkScreener');
const logger = require('../utils/logger');

const createScreener = async (req, res) => {
  try {
    const { name, description, chartinkUrl, triggerTime, frequency, customFrequency } = req.body;
    const userId = req.user.userId;

    const screenerData = {
      name,
      description,
      chartinkUrl,
      triggerTime,
      frequency,
      createdBy: userId
    };

    if (frequency === 'custom' && customFrequency) {
      screenerData.customFrequency = customFrequency;
    }

    const screener = new ChartinkScreener(screenerData);
    screener.calculateNextRun();
    
    await screener.save();

    logger.info(`Chartink screener created: ${screener._id} by user: ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Chartink screener created successfully',
      data: {
        screener
      }
    });

  } catch (error) {
    logger.error('Error creating Chartink screener:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create Chartink screener'
    });
  }
};

const getScreeners = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, isActive } = req.query;

    const filter = { createdBy: userId };
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const screeners = await ChartinkScreener.find(filter)
      .sort(options.sort)
      .limit(options.limit * options.page)
      .skip((options.page - 1) * options.limit);

    const total = await ChartinkScreener.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        screeners,
        pagination: {
          currentPage: options.page,
          totalPages: Math.ceil(total / options.limit),
          totalItems: total,
          itemsPerPage: options.limit
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching Chartink screeners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Chartink screeners'
    });
  }
};

const getScreenerById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const screener = await ChartinkScreener.findOne({
      _id: id,
      createdBy: userId
    });

    if (!screener) {
      return res.status(404).json({
        success: false,
        message: 'Chartink screener not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        screener
      }
    });

  } catch (error) {
    logger.error('Error fetching Chartink screener:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Chartink screener'
    });
  }
};

const updateScreener = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, chartinkUrl, triggerTime, frequency, customFrequency, isActive } = req.body;
    const userId = req.user.userId;

    const screener = await ChartinkScreener.findOne({
      _id: id,
      createdBy: userId
    });

    if (!screener) {
      return res.status(404).json({
        success: false,
        message: 'Chartink screener not found'
      });
    }

    if (name !== undefined) screener.name = name;
    if (description !== undefined) screener.description = description;
    if (chartinkUrl !== undefined) screener.chartinkUrl = chartinkUrl;
    if (triggerTime !== undefined) screener.triggerTime = triggerTime;
    if (frequency !== undefined) {
      screener.frequency = frequency;
      if (frequency === 'custom' && customFrequency) {
        screener.customFrequency = customFrequency;
      } else {
        screener.customFrequency = undefined;
      }
    }
    if (isActive !== undefined) screener.isActive = isActive;

    if (triggerTime !== undefined || frequency !== undefined) {
      screener.calculateNextRun();
    }

    await screener.save();

    logger.info(`Chartink screener updated: ${id} by user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Chartink screener updated successfully',
      data: {
        screener
      }
    });

  } catch (error) {
    logger.error('Error updating Chartink screener:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update Chartink screener'
    });
  }
};

const deleteScreener = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const screener = await ChartinkScreener.findOneAndDelete({
      _id: id,
      createdBy: userId
    });

    if (!screener) {
      return res.status(404).json({
        success: false,
        message: 'Chartink screener not found'
      });
    }

    await ScreenerResult.deleteMany({ screenerId: id });

    logger.info(`Chartink screener deleted: ${id} by user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Chartink screener deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting Chartink screener:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete Chartink screener'
    });
  }
};

const getScreenerResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.userId;

    const screener = await ChartinkScreener.findOne({
      _id: id,
      createdBy: userId
    });

    if (!screener) {
      return res.status(404).json({
        success: false,
        message: 'Chartink screener not found'
      });
    }

    const filter = { screenerId: id };
    if (status) {
      filter.status = status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { runAt: -1 }
    };

    const results = await ScreenerResult.find(filter)
      .sort(options.sort)
      .limit(options.limit * options.page)
      .skip((options.page - 1) * options.limit);

    const total = await ScreenerResult.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        results,
        pagination: {
          currentPage: options.page,
          totalPages: Math.ceil(total / options.limit),
          totalItems: total,
          itemsPerPage: options.limit
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching screener results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch screener results'
    });
  }
};

const getLatestResult = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const screener = await ChartinkScreener.findOne({
      _id: id,
      createdBy: userId
    });

    if (!screener) {
      return res.status(404).json({
        success: false,
        message: 'Chartink screener not found'
      });
    }

    const latestResult = await ScreenerResult.findOne({
      screenerId: id
    }).sort({ runAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        result: latestResult
      }
    });

  } catch (error) {
    logger.error('Error fetching latest screener result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest screener result'
    });
  }
};

const runScreenerManually = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const screener = await ChartinkScreener.findOne({
      _id: id,
      createdBy: userId
    });

    if (!screener) {
      return res.status(404).json({
        success: false,
        message: 'Chartink screener not found'
      });
    }

    screener.lastRun = new Date();
    screener.runCount += 1;
    screener.calculateNextRun();
    await screener.save();

    const dummyResult = new ScreenerResult({
      screenerId: id,
      results: [],
      totalResults: 0,
      status: 'success',
      runAt: new Date()
    });
    
    await dummyResult.save();

    logger.info(`Manual run initiated for screener: ${id} by user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Screener run initiated successfully',
      data: {
        screener,
        result: dummyResult
      }
    });

  } catch (error) {
    logger.error('Error running screener manually:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run screener manually'
    });
  }
};

module.exports = {
  createScreener,
  getScreeners,
  getScreenerById,
  updateScreener,
  deleteScreener,
  getScreenerResults,
  getLatestResult,
  runScreenerManually
};