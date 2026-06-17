import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import HoldingsTable from '../components/portfolio/HoldingsTable';
import ProfitLossChart from '../components/portfolio/ProfitLossChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { FaChartPie, FaArrowUp, FaArrowDown, FaWallet, FaChartLine } from 'react-icons/fa';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

export default function PortfolioPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/portfolio')
      .then(res => setPortfolio(res.data.data || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const holdings = portfolio?.holdings || [];
  const totalCurrentValue = holdings.reduce((s, h) => s + (h.currentValue || 0), 0);
  const totalInvested = portfolio?.totalInvested || holdings.reduce((s, h) => s + (h.totalInvested || 0), 0);
  const totalPL = totalCurrentValue - totalInvested;
  const totalPLPct = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  const summaryCards = [
    {
      label: 'Total Value',
      value: fmt(totalCurrentValue),
      icon: <FaWallet />,
      color: 'var(--secondary)',
    },
    {
      label: 'Total Invested',
      value: fmt(totalInvested),
      icon: <FaChartLine />,
      color: 'var(--primary-light)',
    },
    {
      label: 'Total P&L',
      value: fmt(totalPL),
      sub: `${totalPL >= 0 ? '+' : ''}${totalPLPct.toFixed(2)}%`,
      icon: totalPL >= 0 ? <FaArrowUp /> : <FaArrowDown />,
      color: totalPL >= 0 ? 'var(--success)' : 'var(--danger)',
      valueClass: totalPL >= 0 ? 'price-up' : 'price-down',
    },
    {
      label: 'Cash Balance',
      value: fmt(user?.virtualBalance),
      icon: <FaWallet />,
      color: 'var(--accent)',
    },
  ];

  if (holdings.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">My Portfolio</h1>
        </div>
        <div className="empty-state glass-card">
          <FaChartPie size={64} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>Your portfolio is empty</h3>
          <p>Start trading to see your holdings here</p>
          <button className="btn-primary-hero mt-3" onClick={() => navigate('/market')}>
            Explore Market
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Portfolio</h1>
          <p className="page-subtitle">{holdings.length} stock{holdings.length !== 1 ? 's' : ''} in your portfolio</p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/market')}>
          <FaChartLine className="me-2" /> Trade More
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="portfolio-stats-grid">
        {summaryCards.map((c, i) => (
          <div key={i} className="stat-card-dash glass-card">
            <div className="stat-card-icon" style={{ color: c.color }}>{c.icon}</div>
            <div className={`stat-card-value ${c.valueClass || ''}`}>{c.value}</div>
            <div className="stat-card-label">{c.label}</div>
            {c.sub && <div className="stat-card-sub" style={{ color: c.color }}>{c.sub}</div>}
          </div>
        ))}
      </div>

      {/* CHART + TABLE */}
      <div className="portfolio-main-grid">
        <div className="glass-card">
          <h3 className="card-section-title"><FaChartPie className="me-2" /> Allocation</h3>
          <ProfitLossChart holdings={holdings} />
        </div>
        <div className="glass-card portfolio-table-card">
          <h3 className="card-section-title">Holdings</h3>
          <HoldingsTable holdings={holdings} onStockClick={(id) => navigate(`/stock/${id}`)} />
        </div>
      </div>
    </div>
  );
}
