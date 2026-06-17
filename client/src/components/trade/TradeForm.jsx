import { useState, useEffect } from 'react';
import { FaPlus, FaMinus, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

export default function TradeForm({ stock, holding, onTradeComplete }) {
  const { user, refreshUser } = useAuth();
  const [tradeType, setTradeType] = useState('BUY');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const price         = stock?.currentPrice || 0;
  const totalAmount   = quantity * price;
  const balance       = user?.virtualBalance || 0;
  const sharesOwned   = holding?.quantity || 0;

  // Reset error when switching trade type
  useEffect(() => { setError(''); setQuantity(1); }, [tradeType]);

  const validate = () => {
    if (!quantity || quantity <= 0) {
      setError('Quantity must be at least 1'); return false;
    }
    if (tradeType === 'BUY' && totalAmount > balance) {
      setError(`Insufficient balance. Need ${fmt(totalAmount)}, have ${fmt(balance)}`); return false;
    }
    if (tradeType === 'SELL' && quantity > sharesOwned) {
      setError(`You only own ${sharesOwned} share${sharesOwned !== 1 ? 's' : ''}`); return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      const endpoint = tradeType === 'BUY' ? '/trade/buy' : '/trade/sell';
      await API.post(endpoint, {
        stockId:  stock._id,
        quantity: Number(quantity),
      });
      toast.success(
        `✅ ${tradeType === 'BUY' ? 'Bought' : 'Sold'} ${quantity} share${quantity > 1 ? 's' : ''} of ${stock.symbol} for ${fmt(totalAmount)}`
      );
      setQuantity(1);
      if (refreshUser) await refreshUser();
      if (onTradeComplete) await onTradeComplete();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Trade failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const changeQty = delta => setQuantity(q => Math.max(1, (q || 0) + delta));

  const isUp = (stock?.changePercent ?? stock?.change ?? 0) >= 0;

  return (
    <div className="glass-card trade-form-card">
      {/* BUY / SELL TOGGLE */}
      <div className="trade-toggle">
        <button
          type="button"
          className={`trade-toggle-btn buy ${tradeType === 'BUY' ? 'active' : ''}`}
          onClick={() => setTradeType('BUY')}
        >
          <FaArrowUp className="me-1" /> Buy
        </button>
        <button
          type="button"
          className={`trade-toggle-btn sell ${tradeType === 'SELL' ? 'active' : ''}`}
          onClick={() => setTradeType('SELL')}
        >
          <FaArrowDown className="me-1" /> Sell
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* STOCK HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{stock?.symbol}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{stock?.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{fmt(price)}</div>
            <div className={isUp ? 'price-up' : 'price-down'} style={{ fontSize: '0.8rem' }}>
              {isUp ? '+' : ''}{Number(stock?.changePercent || 0).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* QUANTITY */}
        <div className="form-group-dark">
          <label className="form-label-dark">Quantity (shares)</label>
          <div className="qty-input-wrap">
            <button type="button" className="qty-btn" onClick={() => changeQty(-1)}>
              <FaMinus size={12} />
            </button>
            <input
              id="trade-quantity"
              type="number"
              className="qty-input"
              value={quantity}
              min={1}
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <button type="button" className="qty-btn" onClick={() => changeQty(1)}>
              <FaPlus size={12} />
            </button>
          </div>
        </div>

        {/* TRADE INFO */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div className="trade-info-row">
            <span className="trade-info-label">Price per share</span>
            <span className="trade-info-value">{fmt(price)}</span>
          </div>
          {tradeType === 'BUY' ? (
            <div className="trade-info-row">
              <span className="trade-info-label">Available balance</span>
              <span className="trade-info-value" style={{ color: 'var(--secondary)' }}>{fmt(balance)}</span>
            </div>
          ) : (
            <div className="trade-info-row">
              <span className="trade-info-label">Shares owned</span>
              <span className="trade-info-value" style={{ color: 'var(--accent)' }}>{sharesOwned}</span>
            </div>
          )}
        </div>

        {/* TOTAL BOX */}
        <div className="trade-total-box">
          <span className="trade-total-label">Estimated Total</span>
          <span
            className="trade-total-value"
            style={{ color: tradeType === 'BUY' ? 'var(--danger)' : 'var(--success)' }}
          >
            {fmt(totalAmount)}
          </span>
        </div>

        {/* ERROR */}
        {error && (
          <div style={{
            background: 'rgba(239,83,80,0.1)',
            border: '1px solid rgba(239,83,80,0.3)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--danger)',
            padding: '0.65rem 0.875rem',
            fontSize: '0.82rem',
            marginBottom: '0.75rem',
          }}>
            {error}
          </div>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          id="trade-submit"
          disabled={loading || quantity < 1}
          className={tradeType === 'BUY' ? 'btn-trade-buy' : 'btn-trade-sell'}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span className="spinner-border spinner-border-sm" /> Processing...
            </span>
          ) : (
            `${tradeType === 'BUY' ? '🟢 Buy' : '🔴 Sell'} ${quantity} × ${stock?.symbol}`
          )}
        </button>
      </form>
    </div>
  );
}
