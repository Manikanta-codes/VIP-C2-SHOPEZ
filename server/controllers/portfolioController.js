const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');

// @desc    Get user's portfolio with current values and P&L
// @route   GET /api/portfolio
// @access  Private
const getPortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id }).populate({
      path: 'holdings.stock',
      select: 'symbol name currentPrice previousClose sector logo',
    });

    if (!portfolio) {
      return res.status(200).json({
        success: true,
        data: {
          holdings: [],
          totalInvested: 0,
          totalCurrentValue: 0,
          totalPnL: 0,
          totalPnLPercent: 0,
        },
      });
    }

    // Calculate current values and P&L for each holding
    let totalCurrentValue = 0;
    let totalInvested = 0;

    const holdings = portfolio.holdings.map((holding) => {
      const currentPrice = holding.stock ? holding.stock.currentPrice : 0;
      const currentValue = parseFloat((currentPrice * holding.quantity).toFixed(2));
      const pnl = parseFloat((currentValue - holding.totalInvested).toFixed(2));
      const pnlPercent =
        holding.totalInvested > 0
          ? parseFloat(
              ((pnl / holding.totalInvested) * 100).toFixed(2)
            )
          : 0;

      totalCurrentValue += currentValue;
      totalInvested += holding.totalInvested;

      return {
        stock: holding.stock,
        symbol: holding.symbol,
        stockName: holding.stockName,
        quantity: holding.quantity,
        avgBuyPrice: holding.avgBuyPrice,
        totalInvested: holding.totalInvested,
        currentPrice,
        currentValue,
        pnl,
        pnlPercent,
      };
    });

    const totalPnL = parseFloat((totalCurrentValue - totalInvested).toFixed(2));
    const totalPnLPercent =
      totalInvested > 0
        ? parseFloat(((totalPnL / totalInvested) * 100).toFixed(2))
        : 0;

    res.status(200).json({
      success: true,
      data: {
        holdings,
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        totalCurrentValue: parseFloat(totalCurrentValue.toFixed(2)),
        totalPnL,
        totalPnLPercent,
        balance: req.user.virtualBalance,
        totalPortfolioValue: parseFloat(
          (totalCurrentValue + req.user.virtualBalance).toFixed(2)
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get portfolio performance over time
// @route   GET /api/portfolio/performance
// @access  Private
const getPerformance = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all transactions for this user within the time period
    const transactions = await Transaction.find({
      user: req.user._id,
      createdAt: { $gte: startDate },
      status: 'COMPLETED',
    }).sort({ createdAt: 1 });

    // Build daily performance data
    const performanceMap = new Map();
    let runningInvested = 0;

    // Get initial invested amount from transactions before start date
    const priorTransactions = await Transaction.find({
      user: req.user._id,
      createdAt: { $lt: startDate },
      status: 'COMPLETED',
    });

    for (const txn of priorTransactions) {
      if (txn.type === 'BUY') {
        runningInvested += txn.totalAmount;
      } else {
        runningInvested -= txn.totalAmount;
      }
    }

    // Process transactions in the time period
    for (const txn of transactions) {
      const dateKey = txn.createdAt.toISOString().split('T')[0];

      if (txn.type === 'BUY') {
        runningInvested += txn.totalAmount;
      } else {
        runningInvested -= txn.totalAmount;
      }

      performanceMap.set(dateKey, {
        date: dateKey,
        invested: parseFloat(Math.max(0, runningInvested).toFixed(2)),
        transactions: (performanceMap.get(dateKey)?.transactions || 0) + 1,
        volume:
          (performanceMap.get(dateKey)?.volume || 0) + txn.totalAmount,
      });
    }

    // Fill in missing dates
    const performance = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    let lastKnownInvested = 0;

    // Get the first known invested value
    if (priorTransactions.length > 0) {
      lastKnownInvested = Math.max(0, runningInvested - transactions.reduce((sum, t) => {
        return sum + (t.type === 'BUY' ? t.totalAmount : -t.totalAmount);
      }, 0));
    }

    while (currentDate <= today) {
      const dateKey = currentDate.toISOString().split('T')[0];

      if (performanceMap.has(dateKey)) {
        const entry = performanceMap.get(dateKey);
        lastKnownInvested = entry.invested;
        performance.push(entry);
      } else {
        performance.push({
          date: dateKey,
          invested: parseFloat(lastKnownInvested.toFixed(2)),
          transactions: 0,
          volume: 0,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get current portfolio value
    const portfolio = await Portfolio.findOne({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        performance,
        summary: {
          totalTransactions: transactions.length,
          totalBuys: transactions.filter((t) => t.type === 'BUY').length,
          totalSells: transactions.filter((t) => t.type === 'SELL').length,
          totalVolume: parseFloat(
            transactions.reduce((sum, t) => sum + t.totalAmount, 0).toFixed(2)
          ),
          currentInvested: portfolio ? portfolio.totalInvested : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPortfolio,
  getPerformance,
};
