const Stock = require('../models/Stock');

// Helper: add computed change/changePercent to a plain stock object
const addChangeFields = (stock) => {
  const change = stock.previousClose
    ? stock.currentPrice - stock.previousClose
    : 0;
  const changePercent = stock.previousClose
    ? (change / stock.previousClose) * 100
    : 0;
  return { ...stock, change: parseFloat(change.toFixed(2)), changePercent: parseFloat(changePercent.toFixed(2)) };
};

// @desc    Get all stocks (paginated, filterable, sortable)
// @route   GET /api/stocks
// @access  Private
const getAllStocks = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page, 10)  || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip  = (page - 1) * limit;

    const filter = { isActive: true };
    if (req.query.sector) filter.sector = req.query.sector;

    let sort = {};
    if (req.query.sortBy) {
      const dir = req.query.sortDir === 'desc' || req.query.order === 'desc' ? -1 : 1;
      sort[req.query.sortBy] = dir;
    } else {
      sort = { symbol: 1 };
    }

    const [stocks, total] = await Promise.all([
      Stock.find(filter).select('-historicalData').sort(sort).skip(skip).limit(limit).lean(),
      Stock.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: stocks.map(addChangeFields),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search stocks by symbol or name
// @route   GET /api/stocks/search
// @access  Private
const searchStocks = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Please provide a search query (q parameter)' });
    }
    const regex = new RegExp(q, 'i');
    const stocks = await Stock.find({ isActive: true, $or: [{ symbol: regex }, { name: regex }] })
      .select('-historicalData').limit(20).lean();

    res.status(200).json({ success: true, count: stocks.length, data: stocks.map(addChangeFields) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock by ID (with historical data)
// @route   GET /api/stocks/:id
// @access  Private
const getStockById = async (req, res, next) => {
  try {
    const stock = await Stock.findById(req.params.id).lean();
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }
    res.status(200).json({ success: true, data: addChangeFields(stock) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top 10 gaining stocks
// @route   GET /api/stocks/top-gainers
// @access  Private
const getTopGainers = async (req, res, next) => {
  try {
    const stocks = await Stock.find({ isActive: true, previousClose: { $gt: 0 } })
      .select('-historicalData').lean();

    const sorted = stocks
      .map(addChangeFields)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 10);

    res.status(200).json({ success: true, data: sorted });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top 10 losing stocks
// @route   GET /api/stocks/top-losers
// @access  Private
const getTopLosers = async (req, res, next) => {
  try {
    const stocks = await Stock.find({ isActive: true, previousClose: { $gt: 0 } })
      .select('-historicalData').lean();

    const sorted = stocks
      .map(addChangeFields)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 10);

    res.status(200).json({ success: true, data: sorted });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sectors with stock counts
// @route   GET /api/stocks/sectors
// @access  Private
const getSectors = async (req, res, next) => {
  try {
    const sectors = await Stock.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$sector', count: { $sum: 1 }, avgPrice: { $avg: '$currentPrice' }, totalMarketCap: { $sum: '$marketCap' } } },
      { $project: { _id: 0, sector: '$_id', count: 1, avgPrice: { $round: ['$avgPrice', 2] }, totalMarketCap: 1 } },
      { $sort: { sector: 1 } },
    ]);
    res.status(200).json({ success: true, data: sectors });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllStocks, searchStocks, getStockById, getTopGainers, getTopLosers, getSectors };
