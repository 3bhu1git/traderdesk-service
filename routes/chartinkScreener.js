const express = require('express');
const router = express.Router();
const chartinkScreenerController = require('../controllers/chartinkScreenerController');
const { authenticateToken } = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');

const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

/**
 * @route   POST /api/chartink-screeners
 * @desc    Create a new Chartink screener
 * @access  Private
 */
router.post('/', [
  authenticateToken,
  body('name')
    .notEmpty()
    .withMessage('Screener name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('chartinkUrl')
    .notEmpty()
    .withMessage('Chartink URL is required')
    .matches(/^https?:\/\/(www\.)?chartink\.com\/screener\/.*/)
    .withMessage('Must be a valid Chartink screener URL'),
  body('triggerTime')
    .notEmpty()
    .withMessage('Trigger time is required')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Trigger time must be in HH:MM format (24-hour)'),
  body('frequency')
    .notEmpty()
    .withMessage('Frequency is required')
    .isIn(['daily', 'weekly', 'monthly', 'custom'])
    .withMessage('Frequency must be one of: daily, weekly, monthly, custom'),
  body('customFrequency.interval')
    .if(body('frequency').equals('custom'))
    .notEmpty()
    .withMessage('Custom frequency interval is required when frequency is custom')
    .isInt({ min: 1 })
    .withMessage('Interval must be a positive integer'),
  body('customFrequency.unit')
    .if(body('frequency').equals('custom'))
    .notEmpty()
    .withMessage('Custom frequency unit is required when frequency is custom')
    .isIn(['minutes', 'hours', 'days'])
    .withMessage('Unit must be one of: minutes, hours, days'),
  validateInput
], chartinkScreenerController.createScreener);

/**
 * @route   GET /api/chartink-screeners
 * @desc    Get all Chartink screeners for the authenticated user
 * @access  Private
 */
router.get('/', [
  authenticateToken,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validateInput
], chartinkScreenerController.getScreeners);

/**
 * @route   GET /api/chartink-screeners/:id
 * @desc    Get a specific Chartink screener by ID
 * @access  Private
 */
router.get('/:id', [
  authenticateToken,
  param('id')
    .isMongoId()
    .withMessage('Invalid screener ID'),
  validateInput
], chartinkScreenerController.getScreenerById);

/**
 * @route   PUT /api/chartink-screeners/:id
 * @desc    Update a Chartink screener
 * @access  Private
 */
router.put('/:id', [
  authenticateToken,
  param('id')
    .isMongoId()
    .withMessage('Invalid screener ID'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('chartinkUrl')
    .optional()
    .matches(/^https?:\/\/(www\.)?chartink\.com\/screener\/.*/)
    .withMessage('Must be a valid Chartink screener URL'),
  body('triggerTime')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Trigger time must be in HH:MM format (24-hour)'),
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'custom'])
    .withMessage('Frequency must be one of: daily, weekly, monthly, custom'),
  body('customFrequency.interval')
    .if(body('frequency').equals('custom'))
    .notEmpty()
    .withMessage('Custom frequency interval is required when frequency is custom')
    .isInt({ min: 1 })
    .withMessage('Interval must be a positive integer'),
  body('customFrequency.unit')
    .if(body('frequency').equals('custom'))
    .notEmpty()
    .withMessage('Custom frequency unit is required when frequency is custom')
    .isIn(['minutes', 'hours', 'days'])
    .withMessage('Unit must be one of: minutes, hours, days'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validateInput
], chartinkScreenerController.updateScreener);

/**
 * @route   DELETE /api/chartink-screeners/:id
 * @desc    Delete a Chartink screener
 * @access  Private
 */
router.delete('/:id', [
  authenticateToken,
  param('id')
    .isMongoId()
    .withMessage('Invalid screener ID'),
  validateInput
], chartinkScreenerController.deleteScreener);

/**
 * @route   GET /api/chartink-screeners/:id/results
 * @desc    Get results for a specific screener
 * @access  Private
 */
router.get('/:id/results', [
  authenticateToken,
  param('id')
    .isMongoId()
    .withMessage('Invalid screener ID'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['success', 'error', 'partial'])
    .withMessage('Status must be one of: success, error, partial'),
  validateInput
], chartinkScreenerController.getScreenerResults);

/**
 * @route   GET /api/chartink-screeners/:id/latest-result
 * @desc    Get the latest result for a specific screener
 * @access  Private
 */
router.get('/:id/latest-result', [
  authenticateToken,
  param('id')
    .isMongoId()
    .withMessage('Invalid screener ID'),
  validateInput
], chartinkScreenerController.getLatestResult);

/**
 * @route   POST /api/chartink-screeners/:id/run
 * @desc    Manually trigger a screener run
 * @access  Private
 */
router.post('/:id/run', [
  authenticateToken,
  param('id')
    .isMongoId()
    .withMessage('Invalid screener ID'),
  validateInput
], chartinkScreenerController.runScreenerManually);

module.exports = router;