import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

export default function StockCard({ stock, onClick }) {
  const {
    _id,
    symbol = 'N/A',
    name = 'Unknown Stock',
    sector = '',
    currentPrice = 0,
    change = 0,
    changePercent = 0,
  } = stock || {};

  // Support both virtual and computed changePercent
  const pct  = Number(changePercent || 0);
  const chg  = Number(change || 0);
  const isUp   = chg > 0;
  const isDown = chg < 0;
  const priceClass = isUp ? 'price-up' : isDown ? 'price-down' : '';

  const handleClick = () => onClick ? onClick() : null;

  return (
    <div
      className="stock-card animate-fadeInUp"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      aria-label={`${symbol} – ${fmt(currentPrice)} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)`}
    >
      <div className="stock-card-header">
        <div>
          <div className="stock-symbol">{symbol}</div>
          {sector && <div className="stock-sector-chip">{sector}</div>}
        </div>
        <div
          style={{
            width: 32, height: 32,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isUp ? 'rgba(102,187,106,0.12)' : isDown ? 'rgba(239,83,80,0.12)' : 'rgba(255,255,255,0.05)',
            fontSize: '0.8rem',
          }}
          className={priceClass}
        >
          {isUp ? <FaArrowUp /> : isDown ? <FaArrowDown /> : <FaMinus />}
        </div>
      </div>

      <div className="stock-name">{name}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div className="stock-price">{fmt(currentPrice)}</div>
        <div className={`stock-change ${priceClass}`}>
          {isUp ? <FaArrowUp style={{ fontSize: '0.7rem' }} /> : isDown ? <FaArrowDown style={{ fontSize: '0.7rem' }} /> : null}
          {' '}{isUp ? '+' : ''}{chg.toFixed(2)} ({isUp ? '+' : ''}{pct.toFixed(2)}%)
        </div>
      </div>
    </div>
  );
}
