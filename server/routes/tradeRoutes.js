const express = require('express');
const router = express.Router();
const {
  buyStock,
  sellStock,
  getTradeHistory,
} = require('../controllers/tradeController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.post('/buy', buyStock);
router.post('/sell', sellStock);
router.get('/history', getTradeHistory);

module.exports = router;
