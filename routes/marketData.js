const express = require('express');
const router = express.Router();
const marketFeedController = require('../controllers/marketFeedController');

// Fix: Change route to include /live prefix
router.get('/live/:index', (req, res) => {
    const controller = new marketFeedController();
    controller.subscribeLiveIndex(req, res);
});

module.exports = router;