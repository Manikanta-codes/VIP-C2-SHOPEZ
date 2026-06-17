const Stock = require('../models/Stock');

/**
 * Generate a random number from a standard normal distribution
 * using the Box-Muller transform.
 */
function randomGaussian() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Simulate stock price movements using a random walk model.
 * Each stock's price is adjusted by a small random percentage.
 */
const simulateStockPrices = async () => {
  try {
    const stocks = await Stock.find({ isActive: true });

    if (stocks.length === 0) {
      return;
    }

    const bulkOps = [];

    for (const stock of stocks) {
      const currentPrice = stock.currentPrice;

      // Random walk: newPrice = currentPrice * (1 + gaussian * 0.015)
      let changePercent = randomGaussian() * 0.015;

      // Clamp change to ±3%
      changePercent = Math.max(-0.03, Math.min(0.03, changePercent));

      let newPrice = currentPrice * (1 + changePercent);

      // Ensure price doesn't go below $0.01
      newPrice = Math.max(0.01, parseFloat(newPrice.toFixed(2)));

      // Update day high and day low
      const dayHigh = Math.max(stock.dayHigh || newPrice, newPrice);
      const dayLow =
        stock.dayLow > 0 ? Math.min(stock.dayLow, newPrice) : newPrice;

      // Update volume with random variation (±30%)
      const volumeChange = 1 + (Math.random() - 0.5) * 0.6;
      const newVolume = Math.max(
        1000,
        Math.floor((stock.volume || 1000000) * volumeChange * 0.01)
      );

      // Update market cap proportionally
      const priceRatio = newPrice / (currentPrice || 1);
      const newMarketCap = Math.floor((stock.marketCap || 0) * priceRatio);

      bulkOps.push({
        updateOne: {
          filter: { _id: stock._id },
          update: {
            $set: {
              currentPrice: newPrice,
              dayHigh: dayHigh,
              dayLow: dayLow,
              volume: stock.volume + newVolume,
              marketCap: newMarketCap,
              updatedAt: new Date(),
            },
          },
        },
      });
    }

    if (bulkOps.length > 0) {
      await Stock.bulkWrite(bulkOps);
    }
  } catch (error) {
    console.error('Stock simulation error:', error.message);
  }
};

/**
 * Start the stock price simulator on a recurring interval.
 * @param {number} intervalMs - Interval in milliseconds (default: 30000ms / 30s)
 * @returns {NodeJS.Timeout} - The interval timer ID
 */
const startSimulator = (intervalMs = 30000) => {
  console.log(
    `Stock simulator started. Updating prices every ${intervalMs / 1000}s`
  );

  // Run once immediately
  simulateStockPrices();

  // Then run on interval
  const timerId = setInterval(simulateStockPrices, intervalMs);

  return timerId;
};

module.exports = {
  simulateStockPrices,
  startSimulator,
};
