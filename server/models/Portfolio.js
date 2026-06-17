const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema(
  {
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    stockName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
    },
    avgBuyPrice: {
      type: Number,
      required: true,
      min: [0, 'Average buy price cannot be negative'],
    },
    totalInvested: {
      type: Number,
      required: true,
      min: [0, 'Total invested cannot be negative'],
    },
  },
  { _id: false }
);

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      unique: true,
      index: true,
    },
    holdings: [holdingSchema],
    totalInvested: {
      type: Number,
      default: 0,
      min: [0, 'Total invested cannot be negative'],
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Update the updatedAt field before saving
portfolioSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;
