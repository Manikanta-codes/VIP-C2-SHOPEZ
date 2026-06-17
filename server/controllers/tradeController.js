const User = require('../models/User');
const Stock = require('../models/Stock');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');

// @desc    Buy stock
// @route   POST /api/trade/buy
// @access  Private
const buyStock = async (req, res, next) => {
  try {
    const { stockId, quantity } = req.body;

    if (!stockId || !quantity) {
      return res.status(400).json({ success: false, message: 'Please provide stockId and quantity' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
    }

    // Get stock
    const stock = await Stock.findById(stockId);
    if (!stock || !stock.isActive) {
      return res.status(404).json({ success: false, message: 'Stock not found or is inactive' });
    }

    const pricePerShare = stock.currentPrice;
    const totalCost = parseFloat((pricePerShare * qty).toFixed(2));

    // Get user
    const user = await User.findById(req.user._id);
    if (user.virtualBalance < totalCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Required: $${totalCost.toFixed(2)}, Available: $${user.virtualBalance.toFixed(2)}`,
      });
    }

    // Deduct balance
    user.virtualBalance = parseFloat((user.virtualBalance - totalCost).toFixed(2));
    await user.save();

    // Update or create portfolio holding
    let portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user._id, holdings: [], totalInvested: 0 });
    }

    const holdingIndex = portfolio.holdings.findIndex(h => h.stock.toString() === stockId);

    if (holdingIndex >= 0) {
      const holding = portfolio.holdings[holdingIndex];
      const newTotalInvested = holding.totalInvested + totalCost;
      const newQuantity = holding.quantity + qty;
      portfolio.holdings[holdingIndex].quantity = newQuantity;
      portfolio.holdings[holdingIndex].avgBuyPrice = parseFloat((newTotalInvested / newQuantity).toFixed(2));
      portfolio.holdings[holdingIndex].totalInvested = parseFloat(newTotalInvested.toFixed(2));
    } else {
      portfolio.holdings.push({
        stock: stock._id,
        symbol: stock.symbol,
        stockName: stock.name,
        quantity: qty,
        avgBuyPrice: pricePerShare,
        totalInvested: totalCost,
      });
    }

    portfolio.totalInvested = parseFloat(
      portfolio.holdings.reduce((sum, h) => sum + h.totalInvested, 0).toFixed(2)
    );
    await portfolio.save();

    // Create transaction record
    const transaction = await Transaction.create({
      user: req.user._id,
      stock: stock._id,
      symbol: stock.symbol,
      stockName: stock.name,
      type: 'BUY',
      quantity: qty,
      pricePerShare,
      totalAmount: totalCost,
      status: 'COMPLETED',
    });

    res.status(200).json({
      success: true,
      message: `Successfully bought ${qty} share${qty > 1 ? 's' : ''} of ${stock.symbol} at $${pricePerShare.toFixed(2)} each`,
      data: {
        transaction,
        user: { virtualBalance: user.virtualBalance },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sell stock
// @route   POST /api/trade/sell
// @access  Private
const sellStock = async (req, res, next) => {
  try {
    const { stockId, quantity } = req.body;

    if (!stockId || !quantity) {
      return res.status(400).json({ success: false, message: 'Please provide stockId and quantity' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
    }

    // Get stock
    const stock = await Stock.findById(stockId);
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    // Get portfolio
    const portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) {
      return res.status(400).json({ success: false, message: 'You do not have a portfolio' });
    }

    const holdingIndex = portfolio.holdings.findIndex(h => h.stock.toString() === stockId);
    if (holdingIndex < 0) {
      return res.status(400).json({
        success: false,
        message: `You do not hold any shares of ${stock.symbol}`,
      });
    }

    const holding = portfolio.holdings[holdingIndex];
    if (holding.quantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient shares. You hold ${holding.quantity} share${holding.quantity !== 1 ? 's' : ''} of ${stock.symbol}`,
      });
    }

    const pricePerShare = stock.currentPrice;
    const totalProceeds = parseFloat((pricePerShare * qty).toFixed(2));

    // Credit balance
    const user = await User.findById(req.user._id);
    user.virtualBalance = parseFloat((user.virtualBalance + totalProceeds).toFixed(2));
    await user.save();

    // Update portfolio holding
    const newQuantity = holding.quantity - qty;
    if (newQuantity === 0) {
      portfolio.holdings.splice(holdingIndex, 1);
    } else {
      const soldPortion = qty / holding.quantity;
      const investedReduction = parseFloat((holding.totalInvested * soldPortion).toFixed(2));
      portfolio.holdings[holdingIndex].quantity = newQuantity;
      portfolio.holdings[holdingIndex].totalInvested = parseFloat(
        (holding.totalInvested - investedReduction).toFixed(2)
      );
    }

    portfolio.totalInvested = parseFloat(
      portfolio.holdings.reduce((sum, h) => sum + h.totalInvested, 0).toFixed(2)
    );
    await portfolio.save();

    // Create transaction record
    const transaction = await Transaction.create({
      user: req.user._id,
      stock: stock._id,
      symbol: stock.symbol,
      stockName: stock.name,
      type: 'SELL',
      quantity: qty,
      pricePerShare,
      totalAmount: totalProceeds,
      status: 'COMPLETED',
    });

    res.status(200).json({
      success: true,
      message: `Successfully sold ${qty} share${qty > 1 ? 's' : ''} of ${stock.symbol} at $${pricePerShare.toFixed(2)} each`,
      data: {
        transaction,
        user: { virtualBalance: user.virtualBalance },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trade history for the logged-in user
// @route   GET /api/trade/history
// @access  Private
const getTradeHistory = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page, 10)  || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip  = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (req.query.type && ['BUY', 'SELL'].includes(req.query.type.toUpperCase())) {
      filter.type = req.query.type.toUpperCase();
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('stock', 'symbol name currentPrice sector logo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { buyStock, sellStock, getTradeHistory };
