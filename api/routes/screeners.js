const express = require('express');
const router = express.Router();

console.log('📊 Loading admin screener routes...');

// Load controller
let screenerController;
try {
  screenerController = require('../controllers/screenerController');
  console.log('✅ Admin screener controller loaded successfully');
} catch (error) {
  console.error('❌ Failed to load admin screener controller:', error.message);
  throw error;
}

// Middleware for logging screener requests
router.use((req, res, next) => {
  console.log(`[ADMIN SCREENER ROUTER] ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

/**
 * @swagger
 * tags:
 *   name: Screeners
 *   description: Stock screener management API
 */

/**
 * @swagger
 * /api/admin/screeners:
 *   get:
 *     summary: Get all screeners
 *     tags: [Screeners]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of screeners retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 screeners:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Screener'
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ScreenerResult'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', screenerController.getAllScreeners);

/**
 * @swagger
 * /api/admin/screeners:
 *   post:
 *     summary: Create a new screener
 *     tags: [Screeners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateScreenerRequest'
 *     responses:
 *       201:
 *         description: Screener created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 screener:
 *                   $ref: '#/components/schemas/Screener'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', screenerController.createScreener);

/**
 * @swagger
 * /api/admin/screeners/test-chartink:
 *   post:
 *     summary: Test Chartink connection
 *     tags: [Screeners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - formData
 *             properties:
 *               formData:
 *                 type: string
 *                 description: Chartink form data string
 *                 example: "max_rows=160&scan_clause=volume > 10000000"
 *     responses:
 *       200:
 *         description: Connection test successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 sampleCount:
 *                   type: number
 *       400:
 *         description: Invalid form data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/test-chartink', screenerController.testChartink);

/**
 * @swagger
 * /api/admin/screeners/{id}/results:
 *   get:
 *     summary: Get screener results
 *     tags: [Screeners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Screener ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Screener results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ScreenerResult'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       404:
 *         description: Screener not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id/results', screenerController.getScreenerResults);

/**
 * @swagger
 * /api/admin/screeners/{id}/run:
 *   post:
 *     summary: Run screener manually
 *     tags: [Screeners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Screener ID
 *     responses:
 *       200:
 *         description: Screener executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   $ref: '#/components/schemas/ScreenerResult'
 *       404:
 *         description: Screener not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:id/run', screenerController.runScreener);

/**
 * @swagger
 * /api/admin/screeners/{id}:
 *   get:
 *     summary: Get screener by ID
 *     tags: [Screeners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Screener ID
 *     responses:
 *       200:
 *         description: Screener retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 screener:
 *                   $ref: '#/components/schemas/Screener'
 *       404:
 *         description: Screener not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', screenerController.getScreenerById);

/**
 * @swagger
 * /api/admin/screeners/{id}:
 *   put:
 *     summary: Update screener
 *     tags: [Screeners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Screener ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateScreenerRequest'
 *     responses:
 *       200:
 *         description: Screener updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 screener:
 *                   $ref: '#/components/schemas/Screener'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Screener not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:id', screenerController.updateScreener);

/**
 * @swagger
 * /api/admin/screeners/{id}:
 *   delete:
 *     summary: Delete screener
 *     tags: [Screeners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Screener ID
 *     responses:
 *       200:
 *         description: Screener deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Screener not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', screenerController.deleteScreener);

console.log('✅ Admin screener routes registered successfully');

module.exports = router;
