import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import API from '../api/axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaWallet, FaChartPie, FaArrowUp, FaArrowDown, FaHistory, FaChartLine } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend);

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
const fmtPct = (n) => `${n >= 0 ? '+' : ''}${Number(n || 0).toFixed(2)}%`;

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [portRes, txRes, gainersRes] = await Promise.all([
          API.get('/portfolio'),
          API.get('/trade/history?limit=5'),
          API.get('/stocks/top-gainers'),
        ]);
        setPortfolio(portRes.data.data || portRes.data);
        setTransactions((txRes.data.data || txRes.data).slice(0, 5));
        setTopGainers((gainersRes.data.data || gainersRes.data).slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    refreshUser();
  }, []);

  if (loading) return <LoadingSpinner />;

  const holdings = portfolio?.holdings || [];
  const totalCurrentValue = holdings.reduce((s, h) => s + (h.currentValue || 0), 0);
  const totalInvested = portfolio?.totalInvested || 0;
  const totalPL = totalCurrentValue - totalInvested;
  const totalPLPct = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  const pieData = holdings.length > 0 ? {
    labels: holdings.map(h => h.symbol),
    datasets: [{
      data: holdings.map(h => h.currentValue || 0),
      backgroundColor: ['#1a237e','#00bfa5','#ffc107','#ef5350','#66bb6a','#3949ab','#1de9b6','#ff867c'],
      borderColor: '#161b22',
      borderWidth: 2,
    }],
  } : null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Here's your trading overview</p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/market')}>
          <FaChartLine className="me-2" /> Explore Market
        </button>
      </div>

      {/* BALANCE + STATS */}
      <div className="dashboard-stats-grid">
        <div className="balance-card glass-card">
          <div className="balance-label"><FaWallet className="me-2" /> Available Balance</div>
          <div className="balance-amount">{fmt(user?.virtualBalance)}</div>
          <div className="balance-sub">Virtual Trading Funds</div>
        </div>

        {[
          {
            label: 'Portfolio Value',
            value: fmt(totalCurrentValue),
            icon: <FaChartPie />,
            color: 'var(--secondary)',
          },
          {
            label: "Today's P&L",
            value: fmt(totalPL),
            sub: fmtPct(totalPLPct),
            icon: totalPL >= 0 ? <FaArrowUp /> : <FaArrowDown />,
            color: totalPL >= 0 ? 'var(--success)' : 'var(--danger)',
            valueClass: totalPL >= 0 ? 'price-up' : 'price-down',
          },
          {
            label: 'Total Holdings',
            value: holdings.length,
            sub: 'Stocks owned',
            icon: <FaChartLine />,
            color: 'var(--accent)',
          },
        ].map((s, i) => (
          <div key={i} className="stat-card-dash glass-card">
            <div className="stat-card-icon" style={{ color: s.color }}>{s.icon}</div>
            <div className={`stat-card-value ${s.valueClass || ''}`}>{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
            {s.sub && <div className="stat-card-sub" style={{ color: s.color }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="dashboard-bottom-grid">
        {/* PORTFOLIO CHART */}
        <div className="glass-card">
          <h3 className="card-section-title"><FaChartPie className="me-2" /> Portfolio Allocation</h3>
          {pieData ? (
            <div style={{ maxWidth: 280, margin: '0 auto' }}>
              <Doughnut data={pieData} options={{
                plugins: { legend: { labels: { color: '#8b949e', font: { size: 11 } } } },
                cutout: '65%',
              }} />
            </div>
          ) : (
            <div className="empty-state-sm">
              <p>No holdings yet</p>
              <button className="btn-primary-sm" onClick={() => navigate('/market')}>Start Trading</button>
            </div>
          )}
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="glass-card">
          <div className="card-section-header">
            <h3 className="card-section-title"><FaHistory className="me-2" /> Recent Transactions</h3>
            <button className="btn-link" onClick={() => navigate('/transactions')}>View all</button>
          </div>
          {transactions.length === 0 ? (
            <div className="empty-state-sm"><p>No transactions yet</p></div>
          ) : (
            <div className="tx-list">
              {transactions.map(tx => (
                <div key={tx._id} className="tx-row">
                  <div className="tx-left">
                    <span className={`tx-badge ${tx.type === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>{tx.type}</span>
                    <div>
                      <div className="tx-symbol">{tx.symbol}</div>
                      <div className="tx-date">{new Date(tx.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="tx-right">
                    <div className="tx-amount">{fmt(tx.totalAmount)}</div>
                    <div className="tx-qty">{tx.quantity} shares @ {fmt(tx.pricePerShare)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TOP GAINERS */}
        <div className="glass-card">
          <h3 className="card-section-title"><FaArrowUp className="me-2" style={{ color: 'var(--success)' }} /> Top Gainers</h3>
          <div className="movers-mini-list">
            {topGainers.map(s => (
              <div key={s._id} className="mover-mini-row" onClick={() => navigate(`/stock/${s._id}`)} style={{ cursor: 'pointer' }}>
                <div className="mover-symbol">{s.symbol}</div>
                <div className="mover-price-sm">{fmt(s.currentPrice)}</div>
                <div className="price-up">+{Number(s.changePercent || 0).toFixed(2)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
