import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import API from '../api/axios';
import { FaChartLine, FaShieldAlt, FaBriefcase, FaArrowUp, FaArrowDown, FaRocket, FaTrophy, FaWallet, FaCheckCircle, FaChevronRight } from 'react-icons/fa';

const TICKER_STOCKS = [
  { symbol: 'AAPL', price: '190.32', change: '+1.25' },
  { symbol: 'GOOGL', price: '140.87', change: '-0.64' },
  { symbol: 'MSFT', price: '415.20', change: '+2.10' },
  { symbol: 'NVDA', price: '880.50', change: '+3.45' },
  { symbol: 'TSLA', price: '175.40', change: '-1.90' },
  { symbol: 'AMZN', price: '180.25', change: '+0.88' },
  { symbol: 'META', price: '480.60', change: '+1.32' },
  { symbol: 'JPM',  price: '195.80', change: '+0.40' },
  { symbol: 'V',    price: '280.15', change: '+0.65' },
  { symbol: 'LLY',  price: '780.90', change: '+2.15' },
];

const PREVIEW_STOCKS = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 190.32,
    change: '+1.25%',
    isUp: true,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    chartPath: 'M 0 85 C 50 95, 100 50, 150 65 S 250 20, 300 15',
    fillPath: 'M 0 85 C 50 95, 100 50, 150 65 S 250 20, 300 15 L 300 100 L 0 100 Z',
    dotX: 300,
    dotY: 15
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    price: 880.50,
    change: '+3.45%',
    isUp: true,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    chartPath: 'M 0 90 C 60 70, 120 85, 180 40 S 240 15, 300 8',
    fillPath: 'M 0 90 C 60 70, 120 85, 180 40 S 240 15, 300 8 L 300 100 L 0 100 Z',
    dotX: 300,
    dotY: 8
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 175.40,
    change: '-1.90%',
    isUp: false,
    color: '#ef5350',
    bgColor: 'rgba(239, 83, 80, 0.1)',
    chartPath: 'M 0 25 C 75 10, 120 70, 180 50 S 240 60, 300 82',
    fillPath: 'M 0 25 C 75 10, 120 70, 180 50 S 240 60, 300 82 L 300 100 L 0 100 Z',
    dotX: 300,
    dotY: 82
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    price: 415.20,
    change: '+2.10%',
    isUp: true,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    chartPath: 'M 0 75 C 50 65, 100 80, 180 45 S 250 30, 300 22',
    fillPath: 'M 0 75 C 50 65, 100 80, 180 45 S 250 30, 300 22 L 300 100 L 0 100 Z',
    dotX: 300,
    dotY: 22
  }
];

function StatCounter({ end, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [loadingMovers, setLoadingMovers] = useState(true);
  
  // Interactive Dashboard States
  const [activeStock, setActiveStock] = useState(PREVIEW_STOCKS[0]);
  const [demoQty, setDemoQty] = useState(10);
  const [showDemoNotification, setShowDemoNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  const handleDemoBuy = (e) => {
    e.preventDefault();
    const cost = activeStock.price * demoQty;
    setNotificationMsg(`Success! Simulating purchase of ${demoQty} shares of ${activeStock.symbol} for $${cost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}.`);
    setShowDemoNotification(true);
    setTimeout(() => {
      setShowDemoNotification(false);
    }, 4000);
  };

  const handleViewDemo = (e) => {
    e.preventDefault();
    const previewEl = document.getElementById('dashboard-preview');
    if (previewEl) {
      previewEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const card = previewEl.querySelector('.glass-dashboard-card');
      if (card) {
        card.style.borderColor = 'rgba(16, 185, 129, 0.6)';
        card.style.boxShadow = '0 0 40px rgba(16, 185, 129, 0.3)';
        setTimeout(() => {
          card.style.borderColor = '';
          card.style.boxShadow = '';
        }, 1500);
      }
    }
  };

  useEffect(() => {
    const fetchMovers = async () => {
      try {
        const [gainersRes, losersRes] = await Promise.all([
          API.get('/stocks/top-gainers'),
          API.get('/stocks/top-losers'),
        ]);
        setTopGainers((gainersRes.data.data || gainersRes.data).slice(0, 5));
        setTopLosers((losersRes.data.data || losersRes.data).slice(0, 5));
      } catch {
        // Use static fallback if not logged in or API unavailable
      } finally {
        setLoadingMovers(false);
      }
    };
    if (isAuthenticated) fetchMovers();
    else setLoadingMovers(false);
  }, [isAuthenticated]);

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <section className="hero-section">
        {/* Animated Background Glows */}
        <div className="glow-bg-circle glow-circle-blue" />
        <div className="glow-bg-circle glow-circle-emerald" />
        
        <div className="container hero-content">
          <div className="hero-grid">
            {/* Left Column: Typography & CTAs */}
            <div className="hero-left">
              <div className="fintech-badge animate-fadeInUp">
                <FaRocket className="me-2" /> Live Market Simulations
              </div>
              <h1 className="fintech-title animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                Master Virtual Trading <br />
                with <span className="gradient-blue-emerald">Confidence</span>
              </h1>
              <p className="fintech-subtitle animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                Practice stock trading with real-time market simulations, track portfolio performance, and build investing skills without financial risk.
              </p>
              
              <div className="fintech-cta-group animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                {isAuthenticated ? (
                  <>
                    <button onClick={() => navigate('/dashboard')} className="btn-fintech-primary">
                      Start Trading <FaChevronRight size={14} />
                    </button>
                    <button onClick={handleViewDemo} className="btn-fintech-outline">
                      View Demo
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="btn-fintech-primary">
                      Start Trading <FaChevronRight size={14} />
                    </Link>
                    <button onClick={handleViewDemo} className="btn-fintech-outline">
                      View Demo
                    </button>
                  </>
                )}
              </div>
              
              <div className="fintech-quick-features animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                <div className="fintech-quick-feature-item">
                  <FaWallet size={16} />
                  <span>$100,000 Virtual Balance</span>
                </div>
                <div className="fintech-quick-feature-item">
                  <FaBriefcase size={16} />
                  <span>50+ Listed Stocks</span>
                </div>
                <div className="fintech-quick-feature-item">
                  <FaChartLine size={16} />
                  <span>Real-Time Performance</span>
                </div>
              </div>
            </div>
            
            {/* Right Column: Modern Dashboard Preview */}
            <div className="hero-right" id="dashboard-preview">
              <div className="glass-dashboard-card animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                
                {/* Click-to-trade Notification Pop-up */}
                {showDemoNotification && (
                  <div className="preview-trade-notification">
                    <FaCheckCircle size={16} />
                    <span>{notificationMsg}</span>
                  </div>
                )}
                
                <div className="preview-card-header">
                  <div className="preview-portfolio-info">
                    <span className="preview-portfolio-label">Virtual Net Worth</span>
                    <span className="preview-portfolio-value">$124,580.42</span>
                  </div>
                  <span className="preview-portfolio-change preview-badge-green">
                    <FaArrowUp size={10} /> +2.82% Today
                  </span>
                </div>
                
                {/* SVG Sparkline chart representing active stock */}
                <div className="preview-chart-wrapper">
                  <svg viewBox="0 0 300 100" className="preview-chart-svg" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`gradient-${activeStock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={activeStock.color} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={activeStock.color} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Fill Area Under Trend Line */}
                    <path
                      key={`fill-${activeStock.symbol}`}
                      d={activeStock.fillPath}
                      fill={`url(#gradient-${activeStock.symbol})`}
                    />
                    
                    {/* Glowing Trend Line */}
                    <path
                      key={`line-${activeStock.symbol}`}
                      d={activeStock.chartPath}
                      fill="none"
                      stroke={activeStock.color}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="preview-chart-line"
                    />
                    
                    {/* Glow Pulse Dot at End of Chart */}
                    <circle
                      cx={activeStock.dotX}
                      cy={activeStock.dotY}
                      r="4"
                      fill={activeStock.color}
                      className="preview-chart-dot"
                    />
                  </svg>
                </div>
                
                {/* Stock Selector Tabs inside Dashboard */}
                <div className="preview-stock-list">
                  {PREVIEW_STOCKS.map((stock) => (
                    <div
                      key={stock.symbol}
                      className={`preview-stock-item ${activeStock.symbol === stock.symbol ? 'active' : ''}`}
                      onClick={() => setActiveStock(stock)}
                    >
                      <div className="preview-stock-left">
                        <div
                          className="preview-stock-icon-box"
                          style={{ backgroundColor: stock.bgColor, color: stock.color }}
                        >
                          {stock.symbol.substring(0, 2)}
                        </div>
                        <div className="preview-stock-meta">
                          <span className="preview-stock-symbol">{stock.symbol}</span>
                          <span className="preview-stock-name">{stock.name}</span>
                        </div>
                      </div>
                      <div className="preview-stock-right">
                        <span className="preview-stock-price">${stock.price.toFixed(2)}</span>
                        <span className={`preview-stock-change ${stock.isUp ? 'price-up' : 'price-down'}`}>
                          {stock.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Click-to-Trade Interactive Form Widget */}
                <form onSubmit={handleDemoBuy} className="preview-order-widget">
                  <div className="preview-order-input-wrap">
                    <span className="preview-order-label">QTY</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="preview-order-input"
                      value={demoQty}
                      onChange={(e) => setDemoQty(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>
                  <button type="submit" className="preview-order-btn-buy">
                    Buy {activeStock.symbol}
                  </button>
                </form>
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER TAPE */}
      <div className="ticker-wrapper">
        <div className="ticker-tape">
          {[...TICKER_STOCKS, ...TICKER_STOCKS].map((s, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-symbol">{s.symbol}</span>
              <span className="ticker-price">${s.price}</span>
              <span className={s.change.startsWith('+') ? 'ticker-up' : 'ticker-down'}>
                {s.change.startsWith('+') ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                {s.change}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* FEATURES SECTION */}
      <section className="features-section container">
        <div className="section-header text-center">
          <h2 className="section-title">Everything You Need to Trade</h2>
          <p className="section-subtitle">A complete ecosystem for virtual stock trading and portfolio management</p>
        </div>
        <div className="features-grid">
          {[
            {
              icon: <FaChartLine size={32} />,
              title: 'Live Market Data',
              desc: 'Real-time simulated price updates across 50+ stocks spanning Technology, Healthcare, Finance, Energy, and Consumer sectors.',
              color: 'var(--secondary)',
            },
            {
              icon: <FaShieldAlt size={32} />,
              title: 'Secure Trading',
              desc: 'JWT-based authentication with bcrypt encryption, role-based access control, and fully protected API endpoints.',
              color: 'var(--accent)',
            },
            {
              icon: <FaBriefcase size={32} />,
              title: 'Portfolio Tracking',
              desc: 'Monitor your holdings in real-time, track P&L per stock, visualize allocation with interactive charts.',
              color: 'var(--success)',
            },
          ].map((f, i) => (
            <div key={i} className="feature-card glass-card animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon" style={{ color: f.color }}>{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TOP MOVERS */}
      {isAuthenticated && !loadingMovers && (topGainers.length > 0 || topLosers.length > 0) && (
        <section className="movers-section container">
          <div className="section-header text-center">
            <h2 className="section-title">Today's Top Movers</h2>
            <p className="section-subtitle">Stocks making the biggest moves right now</p>
          </div>
          <div className="movers-grid">
            <div className="movers-panel glass-card">
              <div className="movers-panel-header gainers">
                <FaArrowUp className="me-2" /> Top Gainers
              </div>
              {topGainers.map((s) => (
                <div key={s._id} className="mover-row" onClick={() => navigate(`/stock/${s._id}`)} style={{ cursor: 'pointer' }}>
                  <div>
                    <div className="mover-symbol">{s.symbol}</div>
                    <div className="mover-name">{s.name}</div>
                  </div>
                  <div className="text-end">
                    <div className="mover-price">${Number(s.currentPrice).toFixed(2)}</div>
                    <div className="price-up">+{Number(s.changePercent || 0).toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="movers-panel glass-card">
              <div className="movers-panel-header losers">
                <FaArrowDown className="me-2" /> Top Losers
              </div>
              {topLosers.map((s) => (
                <div key={s._id} className="mover-row" onClick={() => navigate(`/stock/${s._id}`)} style={{ cursor: 'pointer' }}>
                  <div>
                    <div className="mover-symbol">{s.symbol}</div>
                    <div className="mover-name">{s.name}</div>
                  </div>
                  <div className="text-end">
                    <div className="mover-price">${Number(s.currentPrice).toFixed(2)}</div>
                    <div className="price-down">{Number(s.changePercent || 0).toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* STATS SECTION */}
      <section className="stats-section">
        <div className="container stats-grid">
          {[
            { icon: <FaChartLine size={28} />, end: 50, suffix: '+', label: 'Stocks Listed' },
            { icon: <FaTrophy size={28} />, end: 1000, suffix: '+', label: 'Virtual Trades' },
            { icon: <FaBriefcase size={28} />, end: 5, label: 'Market Sectors' },
            { icon: <FaShieldAlt size={28} />, end: 99, suffix: '%', label: 'Uptime' },
          ].map((s, i) => (
            <div key={i} className="stat-card glass-card text-center">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">
                <StatCounter end={s.end} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      {!isAuthenticated && (
        <section className="cta-section container text-center">
          <div className="cta-card glass-card">
            <h2 className="cta-title">Ready to Start Trading?</h2>
            <p className="cta-subtitle">Join TradeSphere today and get $100,000 in virtual funds to practice trading with zero risk.</p>
            <Link to="/register" className="btn-primary-hero">Create Free Account</Link>
          </div>
        </section>
      )}
    </div>
  );
}
