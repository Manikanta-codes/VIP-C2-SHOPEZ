const mongoose = require('mongoose');

const historicalDataSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    open: {
      type: Number,
      required: true,
    },
    high: {
      type: Number,
      required: true,
    },
    low: {
      type: Number,
      required: true,
    },
    close: {
      type: Number,
      required: true,
    },
    volume: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, 'Stock symbol is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
      maxlength: [10, 'Symbol cannot exceed 10 characters'],
    },
    name: {
      type: String,
      required: [true, 'Stock name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    sector: {
      type: String,
      required: [true, 'Sector is required'],
      trim: true,
      enum: {
        values: [
          'Technology',
          'Healthcare',
          'Finance',
          'Energy',
          'Consumer',
          'Industrial',
          'Utilities',
          'Real Estate',
          'Materials',
          'Telecom',
        ],
        message: 'Invalid sector',
      },
    },
    currentPrice: {
      type: Number,
      required: [true, 'Current price is required'],
      min: [0, 'Price cannot be negative'],
    },
    previousClose: {
      type: Number,
      default: 0,
      min: [0, 'Previous close cannot be negative'],
    },
    dayHigh: {
      type: Number,
      default: 0,
    },
    dayLow: {
      type: Number,
      default: 0,
    },
    openPrice: {
      type: Number,
      default: 0,
    },
    volume: {
      type: Number,
      default: 0,
    },
    marketCap: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    logo: {
      type: String,
      default: '',
    },
    historicalData: [historicalDataSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: price change from previous close
stockSchema.virtual('change').get(function () {
  if (this.previousClose && this.previousClose > 0) {
    return parseFloat((this.currentPrice - this.previousClose).toFixed(2));
  }
  return 0;
});

// Virtual: percentage change from previous close
stockSchema.virtual('changePercent').get(function () {
  if (this.previousClose && this.previousClose > 0) {
    return parseFloat(
      (((this.currentPrice - this.previousClose) / this.previousClose) * 100).toFixed(2)
    );
  }
  return 0;
});

// Update the updatedAt field before saving
stockSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
