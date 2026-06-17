import { useNavigate } from 'react-router-dom';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

export default function HoldingsTable({ holdings, onStockClick }) {
  const totalValue = holdings.reduce((s, h) => s + (h.currentValue || 0), 0);
  const totalPL = holdings.reduce((s, h) => s + ((h.currentValue || 0) - (h.totalInvested || 0)), 0);

  return (
    <div className="table-responsive">
      <table className="stock-table w-100">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Company</th>
            <th>Qty</th>
            <th>Avg Price</th>
            <th>Curr. Price</th>
            <th>Current Value</th>
            <th>P&amp;L</th>
            <th>P&amp;L %</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map(h => {
            const pl = (h.currentValue || 0) - (h.totalInvested || 0);
            const plPct = h.totalInvested > 0 ? (pl / h.totalInvested) * 100 : 0;
            const isUp = pl >= 0;
            const stockId = h.stock?._id || h.stock;
            return (
              <tr key={h.symbol} onClick={() => onStockClick && stockId && onStockClick(stockId)} style={{ cursor: 'pointer' }}>
                <td><span className="tx-symbol">{h.symbol}</span></td>
                <td style={{ color: 'var(--text-secondary)' }}>{h.stockName}</td>
                <td>{h.quantity}</td>
                <td>{fmt(h.avgBuyPrice)}</td>
                <td>{fmt(h.currentPrice)}</td>
                <td className="fw-600">{fmt(h.currentValue)}</td>
                <td className={isUp ? 'price-up' : 'price-down'}>
                  {isUp ? <FaArrowUp size={10} className="me-1" /> : <FaArrowDown size={10} className="me-1" />}
                  {fmt(Math.abs(pl))}
                </td>
                <td className={isUp ? 'price-up' : 'price-down'}>
                  {isUp ? '+' : ''}{plPct.toFixed(2)}%
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="table-total-row">
            <td colSpan={5} className="fw-600">Total</td>
            <td className="fw-600">{fmt(totalValue)}</td>
            <td className={totalPL >= 0 ? 'price-up fw-600' : 'price-down fw-600'}>{fmt(totalPL)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
