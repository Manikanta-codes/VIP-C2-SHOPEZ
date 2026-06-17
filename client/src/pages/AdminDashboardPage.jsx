import { useState, useEffect } from 'react';
import API from '../api/axios';
import UserManagement from '../components/admin/UserManagement';
import StockManagement from '../components/admin/StockManagement';
import ActivityLog from '../components/admin/ActivityLog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend,
} from 'chart.js';
import { FaUsers, FaChartLine, FaExchangeAlt, FaDollarSign, FaCog } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const TABS = [
  { id: 'users', label: 'Users', icon: <FaUsers /> },
  { id: 'stocks', label: 'Stocks', icon: <FaChartLine /> },
  { id: 'transactions', label: 'Transactions', icon: <FaExchangeAlt /> },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard')
      .then(res => setStats(res.data.data || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#8b949e' } },
    },
    scales: {
      x: { ticks: { color: '#6e7681' }, grid: { color: '#21262d' } },
      y: { ticks: { color: '#6e7681' }, grid: { color: '#21262d' } },
    },
  };

  const volumeData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Trade Volume ($)',
      data: [45000, 78000, 62000, 91000, 83000, 34000, 56000],
      backgroundColor: 'rgba(26, 35, 126, 0.7)',
      borderColor: '#3949ab',
      borderWidth: 2,
    }],
  };

  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'New Users',
      data: [10, 25, 18, 40, 35, 60],
      borderColor: '#00bfa5',
      backgroundColor: 'rgba(0, 191, 165, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title"><FaCog className="me-2" /> Admin Dashboard</h1>
          <p className="page-subtitle">Platform management and analytics</p>
        </div>
      </div>

      {/* STATS */}
      {loading ? <LoadingSpinner /> : (
        <div className="admin-stats-grid">
          {[
            { label: 'Total Users', value: stats?.overview?.totalUsers ?? stats?.totalUsers ?? 0, icon: <FaUsers />, color: 'var(--primary-light)' },
            { label: 'Total Stocks', value: stats?.overview?.totalStocks ?? stats?.totalStocks ?? 0, icon: <FaChartLine />, color: 'var(--secondary)' },
            { label: 'Total Transactions', value: stats?.overview?.totalTransactions ?? stats?.totalTransactions ?? 0, icon: <FaExchangeAlt />, color: 'var(--accent)' },
            { label: 'Total Volume', value: fmt(stats?.overview?.totalVolume ?? stats?.totalVolume ?? 0), icon: <FaDollarSign />, color: 'var(--success)' },
          ].map((s, i) => (
            <div key={i} className="stat-card-dash glass-card">
              <div className="stat-card-icon" style={{ color: s.color }}>{s.icon}</div>
              <div className="stat-card-value">{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* CHARTS */}
      <div className="admin-charts-grid">
        <div className="glass-card">
          <h3 className="card-section-title">Weekly Trade Volume</h3>
          <Bar data={volumeData} options={chartOptions} />
        </div>
        <div className="glass-card">
          <h3 className="card-section-title">User Growth (6 months)</h3>
          <Line data={userGrowthData} options={chartOptions} />
        </div>
      </div>

      {/* TABS */}
      <div className="admin-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`admin-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon} <span className="ms-2">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="glass-card admin-content-panel">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'stocks' && <StockManagement />}
        {activeTab === 'transactions' && <ActivityLog />}
      </div>
    </div>
  );
}
