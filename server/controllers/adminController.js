const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');

// @desc    Get all users (paginated)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // By default exclude admin users
    const filter = {};
    if (req.query.includeAdmin !== 'true') {
      filter.role = 'USER';
    }

    // Search by name or email
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (role, ban, etc.)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { role, virtualBalance, name, email } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent modifying yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot modify your own admin account through this endpoint',
      });
    }

    if (role) user.role = role;
    if (virtualBalance !== undefined)
      user.virtualBalance = parseFloat(virtualBalance);
    if (name) user.name = name;
    if (email) user.email = email;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new stock
// @route   POST /api/admin/stocks
// @access  Private/Admin
const addStock = async (req, res, next) => {
  try {
    const {
      symbol,
      name,
      sector,
      currentPrice,
      previousClose,
      dayHigh,
      dayLow,
      openPrice,
      volume,
      marketCap,
      description,
      logo,
    } = req.body;

    // Validate required fields
    if (!symbol || !name || !sector || !currentPrice) {
      return res.status(400).json({
        success: false,
        message: 'Please provide symbol, name, sector, and currentPrice',
      });
    }

    // Check if stock already exists
    const existingStock = await Stock.findOne({
      symbol: symbol.toUpperCase(),
    });
    if (existingStock) {
      return res.status(400).json({
        success: false,
        message: `Stock with symbol '${symbol.toUpperCase()}' already exists`,
      });
    }

    const stock = await Stock.create({
      symbol,
      name,
      sector,
      currentPrice,
      previousClose: previousClose || currentPrice,
      dayHigh: dayHigh || currentPrice,
      dayLow: dayLow || currentPrice,
      openPrice: openPrice || currentPrice,
      volume: volume || 0,
      marketCap: marketCap || 0,
      description: description || '',
      logo: logo || '',
    });

    res.status(201).json({
      success: true,
      message: 'Stock added successfully',
      data: stock,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update stock details
// @route   PUT /api/admin/stocks/:id
// @access  Private/Admin
const updateStock = async (req, res, next) => {
  try {
    const stock = await Stock.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found',
      });
    }

    const allowedUpdates = [
      'name',
      'sector',
      'currentPrice',
      'previousClose',
      'dayHigh',
      'dayLow',
      'openPrice',
      'volume',
      'marketCap',
      'description',
      'logo',
      'isActive',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        stock[field] = req.body[field];
      }
    });

    const updatedStock = await stock.save();

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: updatedStock,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete stock (set isActive to false)
// @route   DELETE /api/admin/stocks/:id
// @access  Private/Admin
const deleteStock = async (req, res, next) => {
  try {
    const stock = await Stock.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found',
      });
    }

    stock.isActive = false;
    await stock.save();

    res.status(200).json({
      success: true,
      message: `Stock ${stock.symbol} has been deactivated`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions (paginated, filterable)
// @route   GET /api/admin/transactions
// @access  Private/Admin
const getAllTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by type
    if (req.query.type && ['BUY', 'SELL'].includes(req.query.type.toUpperCase())) {
      filter.type = req.query.type.toUpperCase();
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    // Filter by user
    if (req.query.userId) {
      filter.user = req.query.userId;
    }

    // Filter by stock symbol
    if (req.query.symbol) {
      filter.symbol = req.query.symbol.toUpperCase();
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('user', 'name email')
        .populate('stock', 'symbol name currentPrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    // Get basic counts
    const [totalUsers, totalStocks, totalTransactions] = await Promise.all([
      User.countDocuments({ role: 'USER' }),
      Stock.countDocuments({ isActive: true }),
      Transaction.countDocuments(),
    ]);

    // Aggregate transaction stats
    const transactionStats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalVolume: { $sum: '$totalAmount' },
          totalBuys: {
            $sum: { $cond: [{ $eq: ['$type', 'BUY'] }, 1, 0] },
          },
          totalSells: {
            $sum: { $cond: [{ $eq: ['$type', 'SELL'] }, 1, 0] },
          },
          totalBuyVolume: {
            $sum: {
              $cond: [{ $eq: ['$type', 'BUY'] }, '$totalAmount', 0],
            },
          },
          totalSellVolume: {
            $sum: {
              $cond: [{ $eq: ['$type', 'SELL'] }, '$totalAmount', 0],
            },
          },
        },
      },
    ]);

    // Daily stats (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          transactions: { $sum: 1 },
          volume: { $sum: '$totalAmount' },
          buys: {
            $sum: { $cond: [{ $eq: ['$type', 'BUY'] }, 1, 0] },
          },
          sells: {
            $sum: { $cond: [{ $eq: ['$type', 'SELL'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // New users in last 7 days
    const newUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      role: 'USER',
    });

    // Top traded stocks
    const topTradedStocks = await Transaction.aggregate([
      {
        $group: {
          _id: '$symbol',
          totalTrades: { $sum: 1 },
          totalVolume: { $sum: '$totalAmount' },
        },
      },
      { $sort: { totalTrades: -1 } },
      { $limit: 10 },
    ]);

    const stats = transactionStats[0] || {
      totalVolume: 0,
      totalBuys: 0,
      totalSells: 0,
      totalBuyVolume: 0,
      totalSellVolume: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalStocks,
          totalTransactions,
          totalVolume: parseFloat((stats.totalVolume || 0).toFixed(2)),
          totalBuys: stats.totalBuys || 0,
          totalSells: stats.totalSells || 0,
          totalBuyVolume: parseFloat((stats.totalBuyVolume || 0).toFixed(2)),
          totalSellVolume: parseFloat((stats.totalSellVolume || 0).toFixed(2)),
        },
        newUsersLast7Days: newUsers,
        dailyStats,
        topTradedStocks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  addStock,
  updateStock,
  deleteStock,
  getAllTransactions,
  getDashboardStats,
};
