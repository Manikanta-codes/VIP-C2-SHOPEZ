import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import StockChart from '../components/stocks/StockChart';
import TradeForm from '../components/trade/TradeForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { FaArrowLeft, FaArrowUp, FaArrowDown, FaBuilding } from 'react-icons/fa';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
const fmtLarge = (n) => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return fmt(n);
};
const fmtVol = (n) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return String(n || 0);
};

export default function StockDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [stock, setStock] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [sRes, pRes] = await Promise.all([
        API.get(`/stocks/${id}`),
        API.get('/portfolio'),
      ]);
      setStock(sRes.data.data || sRes.data);
      setPortfolio(pRes.data.data || pRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleTradeComplete = async () => {
    await fetchData();
    await refreshUser();
  };

  if (loading) return <LoadingSpinner />;
  if (!stock) return <div className="page-container"><div className="empty-state"><h3>Stock not found</h3></div></div>;

  const change = stock.change ?? (stock.currentPrice - (stock.previousClose || stock.currentPrice));
  const changePct = stock.changePercent ?? (stock.previousClose ? (change / stock.previousClose) * 100 : 0);
  const isUp = change >= 0;

  const holding = portfolio?.holdings?.find(h => h.stock === id || h.stock?._id === id || h.symbol === stock.symbol);

  const statCards = [
    { label: 'Open', value: fmt(stock.openPrice) },
    { label: 'Day High', value: fmt(stock.dayHigh) },
    { label: 'Day Low', value: fmt(stock.dayLow) },
    { label: 'Prev Close', value: fmt(stock.previousClose) },
    { label: 'Volume', value: fmtVol(stock.volume) },
    { label: 'Market Cap', value: fmtLarge(stock.marketCap) },
  ];

  return (
    <div className="page-container">
      <button className="btn-back" onClick={() => navigate('/market')}>
        <FaArrowLeft className="me-2" /> Back to Market
      </button>

      {/* STOCK HEADER */}
      <div className="stock-detail-header glass-card">
        <div className="stock-detail-left">
          <div className="stock-detail-symbol">{stock.symbol}</div>
          <div className="stock-detail-name">{stock.name}</div>
          <span className="sector-badge">{stock.sector}</span>
        </div>
        <div className="stock-detail-right">
          <div className="stock-detail-price">{fmt(stock.currentPrice)}</div>
          <div className={`stock-detail-change ${isUp ? 'price-up' : 'price-down'}`}>
            {isUp ? <FaArrowUp className="me-1" /> : <FaArrowDown className="me-1" />}
            {fmt(Math.abs(change))} ({isUp ? '+' : ''}{Number(changePct).toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* CHART + TRADE FORM */}
      <div className="stock-detail-main">
        <div className="stock-chart-panel glass-card">
          <StockChart historicalData={stock.historicalData || []} symbol={stock.symbol} isUp={isUp} />
        </div>
        <div className="stock-trade-panel">
          <TradeForm stock={stock} holding={holding} onTradeComplete={handleTradeComplete} />
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stock-stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="stock-stat-card glass-card">
            <div className="stock-stat-label">{s.label}</div>
            <div className="stock-stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* DESCRIPTION */}
      {stock.description && (
        <div className="glass-card mt-4">
          <h3 className="card-section-title"><FaBuilding className="me-2" /> About {stock.name}</h3>
          <p className="stock-description">{stock.description}</p>
        </div>
      )}
    </div>
  );
}
