/**
 * Screener Controller
 * Handles all screener CRUD operations
 */

// In-memory storage for demo (replace with database)
let screeners = [
  {
    id: '1',
    name: 'High Volume Stocks',
    description: 'Stocks with high trading volume above 10M',
    formData: 'max_rows=160&scan_clause=volume%20%3E%2010000000',
    isActive: true,
    schedule: {
      interval: 30,
      startTime: '09:15',
      endTime: '15:30',
      enabled: true
    },
    createdAt: new Date(),
    lastRun: new Date(),
    nextRun: new Date(Date.now() + 30 * 60 * 1000),
    createdBy: 'admin'
  }
];

let results = [
  {
    id: '1',
    screenerId: '1',
    timestamp: new Date(),
    stocks: [
      { symbol: 'RELIANCE', sector: 'Energy', marketCap: 'Large Cap', price: 2450.50, change: 1.2 },
      { symbol: 'TCS', sector: 'IT', marketCap: 'Large Cap', price: 3680.75, change: -0.8 },
      { symbol: 'HDFCBANK', sector: 'Banking', marketCap: 'Large Cap', price: 1520.30, change: 2.1 }
    ],
    totalStocks: 3,
    metadata: {
      executionTime: 2.5,
      success: true,
      sourceUrl: 'https://chartink.com/screener/...'
    }
  }
];

// GET /api/admin/screeners - Get all screeners
const getAllScreeners = (req, res) => {
  console.log('[SCREENER CONTROLLER] getAllScreeners called');
  
  try {
    res.json({
      success: true,
      screeners: screeners,
      results: results,
      timestamp: new Date().toISOString(),
      total: screeners.length
    });
  } catch (error) {
    console.error('[SCREENER CONTROLLER] Error in getAllScreeners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve screeners',
      error: error.message
    });
  }
};

// GET /api/admin/screeners/:id - Get screener by ID
const getScreenerById = (req, res) => {
  console.log('[SCREENER CONTROLLER] getScreenerById called:', req.params.id);
  
  try {
    const { id } = req.params;
    const screener = screeners.find(s => s.id === id);
    
    if (!screener) {
      return res.status(404).json({
        success: false,
        message: 'Screener not found'
      });
    }
    
    res.json({
      success: true,
      screener: screener
    });
  } catch (error) {
    console.error('[SCREENER CONTROLLER] Error in getScreenerById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve screener',
      error: error.message
    });
  }
};

// POST /api/admin/screeners - Create new screener
const createScreener = (req, res) => {
  console.log('[SCREENER CONTROLLER] createScreener called:', req.body);
  
  try {
    const { name, description, formData, schedule, tags } = req.body;

    // Validation
    if (!name || !formData) {
      return res.status(400).json({
        success: false,
        message: 'Name and form data are required',
        errors: {
          name: !name ? 'Name is required' : null,
          formData: !formData ? 'Form data is required' : null
        }
      });
    }

    // Check for duplicate names
    const existingScreener = screeners.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (existingScreener) {
      return res.status(400).json({
        success: false,
        message: 'Screener with this name already exists'
      });
    }

    const newScreener = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description?.trim() || '',
      formData: formData.trim(),
      isActive: true,
      schedule: {
        interval: schedule?.interval || 30,
        startTime: schedule?.startTime || '09:15',
        endTime: schedule?.endTime || '15:30',
        enabled: schedule?.enabled !== false
      },
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastRun: null,
      nextRun: new Date(Date.now() + (schedule?.interval || 30) * 60 * 1000),
      createdBy: req.user?.id || 'admin', // From JWT middleware
      totalRuns: 0,
      successfulRuns: 0
    };

    screeners.push(newScreener);

    res.status(201).json({
      success: true,
      message: 'Screener created successfully',
      screener: newScreener
    });
  } catch (error) {
    console.error('[SCREENER CONTROLLER] Error in createScreener:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create screener',
      error: error.message
    });
  }
};

// PUT /api/admin/screeners/:id - Update screener
const updateScreener = (req, res) => {
  console.log('[SCREENER CONTROLLER] updateScreener called:', req.params.id, req.body);
  
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const screenerIndex = screeners.findIndex(s => s.id === id);
    if (screenerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Screener not found'
      });
    }

    // Validate name uniqueness if name is being updated
    if (updates.name && updates.name !== screeners[screenerIndex].name) {
      const existingScreener = screeners.find(s => 
        s.name.toLowerCase() === updates.name.toLowerCase() && s.id !== id
      );
      if (existingScreener) {
        return res.status(400).json({
          success: false,
          message: 'Screener with this name already exists'
        });
      }
    }

    // Update screener
    const updatedScreener = {
      ...screeners[screenerIndex],
      ...updates,
      updatedAt: new Date(),
      // Preserve certain fields
      id: screeners[screenerIndex].id,
      createdAt: screeners[screenerIndex].createdAt,
      createdBy: screeners[screenerIndex].createdBy,
      totalRuns: screeners[screenerIndex].totalRuns,
      successfulRuns: screeners[screenerIndex].successfulRuns
    };

    screeners[screenerIndex] = updatedScreener;

    res.json({
      success: true,
      message: 'Screener updated successfully',
      screener: updatedScreener
    });
  } catch (error) {
    console.error('[SCREENER CONTROLLER] Error in updateScreener:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update screener',
      error: error.message
    });
  }
};

// DELETE /api/admin/screeners/:id - Delete screener
const deleteScreener = (req, res) => {
  console.log('[SCREENER CONTROLLER] deleteScreener called:', req.params.id);
  
  try {
    const { id } = req.params;
    
    const screenerIndex = screeners.findIndex(s => s.id === id);
    if (screenerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Screener not found'
      });
    }

    const deletedScreener = screeners[screenerIndex];
    
    // Remove screener and its results
    screeners.splice(screenerIndex, 1);
    const removedResultsCount = results.filter(r => r.screenerId === id).length;
    results = results.filter(r => r.screenerId !== id);

    res.json({
      success: true,
      message: 'Screener and its results deleted successfully',
      deletedScreener: {
        id: deletedScreener.id,
        name: deletedScreener.name
      },
      removedResultsCount
    });
  } catch (error) {
    console.error('[SCREENER CONTROLLER] Error in deleteScreener:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete screener',
      error: error.message
    });
  }
};

// POST /api/admin/screeners/:id/run - Run screener manually
const runScreener = (req, res) => {
  console.log('[SCREENER CONTROLLER] runScreener called:', req.params.id);
  
  try {
    const { id } = req.params;
    
    const screenerIndex = screeners.findIndex(s => s.id === id);
    if (screenerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Screener not found'
      });
    }

    const screener = screeners[screenerIndex];

    // Check if screener is active
    if (!screener.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot run inactive screener'
      });
    }

    // Simulate screener execution (replace with actual Chartink API call)
    const mockStocks = [
      { symbol: 'RELIANCE', sector: 'Energy', marketCap: 'Large Cap', price: 2450.50, change: 1.2 },
      { symbol: 'TCS', sector: 'IT', marketCap: 'Large Cap', price: 3680.75, change: -0.8 },
      { symbol: 'INFY', sector: 'IT', marketCap: 'Large Cap', price: 1820.90, change: 2.3 },
      { symbol: 'HDFCBANK', sector: 'Banking', marketCap: 'Large Cap', price: 1520.30, change: 2.1 },
      { symbol: 'ICICIBANK', sector: 'Banking', marketCap: 'Large Cap', price: 950.40, change: -1.5 }
    ];

    const result = {
      id: Date.now().toString(),
      screenerId: id,
      timestamp: new Date(),
      stocks: mockStocks,
      totalStocks: mockStocks.length,
      metadata: {
        executionTime: Math.random() * 3 + 1, // 1-4 seconds
        success: true,
        sourceUrl: `https://chartink.com/screener/${id}`,
        criteria: screener.formData
      }
    };

    // Add result to results array
    results.unshift(result);

    // Update screener stats
    screeners[screenerIndex] = {
      ...screener,
      lastRun: new Date(),
      totalRuns: (screener.totalRuns || 0) + 1,
      successfulRuns: (screener.successfulRuns || 0) + 1,
      nextRun: screener.schedule.enabled ? 
        new Date(Date.now() + screener.schedule.interval * 60 * 1000) : null
    };

    res.json({
      success: true,
      message: 'Screener executed successfully',
      result,
      screener: screeners[screenerIndex]
    });
  } catch (error) {
    console.error('[SCREENER CONTROLLER] Error in runScreener:', error);
    
    // Update screener with failed run
    const screenerIndex = screeners.findIndex(s => s.id === req.params.id);
    if (screenerIndex !== -1) {
      screeners[screenerIndex] = {
        ...screeners[screenerIndex],
        lastRun: new Date(),
        totalRuns: (screeners[screenerIndex].totalRuns || 0) + 1
      };
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to execute screener',
      error: error.message
    });
  }
};

// POST /api/admin/screeners/test-chartink - Test Chartink connection
const testChartink = (req, res) => {
  console.log('[SCREENER CONTROLLER] testChartink called');
  
  try {
    const { formData } = req.body;

    if (!formData) {
      return res.status(400).json({
        success: false,
        message: 'Form data is required'
      });
    }

    // Simulate Chartink API test (replace with actual API call)
    const isValid = formData.includes('scan_clause') || formData.includes('condition');
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid form data format. Must include scan_clause or condition.'
      });
    }

    // Mock successful test
    res.json({
      success: true,
      message: 'Chartink connection successful',
      sampleCount: Math.floor(Math.random() * 100) + 10, // 10-110 results
      testResult: {
        validFormat: true,
        estimatedResults: Math.floor(Math.random() * 50) + 5,
        responseTime: Math.floor(Math.random() * 2000) + 500 // 500-2500ms
      }
    });
  } catch (error) {
    console.error('[SCREENER CONTROLLER] Error in testChartink:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test Chartink connection',
      error: error.message
    });
  }
};

// GET /api/admin/screeners/:id/results - Get screener results
const getScreenerResults = (req, res) => {
  console.log('[SCREENER CONTROLLER] getScreenerResults called:', req.params.id);
  
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, sortBy = 'timestamp', sortOrder = 'desc' } = req.query;

    // Check if screener exists
    const screener = screeners.find(s => s.id === id);
    if (!screener) {
      return res.status(404).json({
        success: false,
        message: 'Screener not found'
      });
    }

    // Filter results for this screener
    let screenerResults = results.filter(r => r.screenerId === id);

    // Sort results
    screenerResults.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    // Paginate results
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = screenerResults.slice(startIndex, endIndex);

    res.json({
      success: true,
      results: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: screenerResults.length,
        pages: Math.ceil(screenerResults.length / parseInt(limit)),
        hasNext: endIndex < screenerResults.length,
        hasPrev: startIndex > 0
      },
      screener: {
        id: screener.id,
        name: screener.name,
        description: screener.description
      }
    });
  } catch (error) {
    console.error('[SCREENER CONTROLLER] Error in getScreenerResults:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve screener results',
      error: error.message
    });
  }
};

module.exports = {
  getAllScreeners,
  getScreenerById,
  createScreener,
  updateScreener,
  deleteScreener,
  runScreener,
  testChartink,
  getScreenerResults
};
