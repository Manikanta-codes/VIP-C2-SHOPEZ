const express = require('express');
const router = express.Router();
const {
  getPortfolio,
  getPerformance,
} = require('../controllers/portfolioController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/', getPortfolio);
router.get('/performance', getPerformance);

module.exports = router;
