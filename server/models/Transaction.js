const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: [true, 'Stock is required'],
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
    type: {
      type: String,
      enum: {
        values: ['BUY', 'SELL'],
        message: 'Transaction type must be BUY or SELL',
      },
      required: [true, 'Transaction type is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be a whole number',
      },
    },
    pricePerShare: {
      type: Number,
      required: [true, 'Price per share is required'],
      min: [0, 'Price cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['COMPLETED', 'PENDING', 'CANCELLED'],
        message: 'Status must be COMPLETED, PENDING, or CANCELLED',
      },
      default: 'COMPLETED',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index for efficient user transaction queries
transactionSchema.index({ user: 1, createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
