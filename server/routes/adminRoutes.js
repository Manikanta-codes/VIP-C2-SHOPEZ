const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUser,
  addStock,
  updateStock,
  deleteStock,
  getAllTransactions,
  getDashboardStats,
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication + ADMIN role
router.use(auth);
router.use(roleCheck('ADMIN'));

// User management
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);

// Stock management
router.post('/stocks', addStock);
router.put('/stocks/:id', updateStock);
router.delete('/stocks/:id', deleteStock);

// Transaction & Dashboard
router.get('/transactions', getAllTransactions);
router.get('/dashboard', getDashboardStats);

module.exports = router;
