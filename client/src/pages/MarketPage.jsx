import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import StockCard from '../components/stocks/StockCard';
import StockSearch from '../components/stocks/StockSearch';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaSync, FaFilter } from 'react-icons/fa';

const SECTORS = ['All', 'Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer'];
const SORTS = [
  { label: 'Price: High', value: 'price_desc' },
  { label: 'Price: Low', value: 'price_asc' },
  { label: 'Gainers', value: 'change_desc' },
  { label: 'Losers', value: 'change_asc' },
  { label: 'Volume', value: 'volume_desc' },
];

export default function MarketPage() {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState('All');
  const [sort, setSort] = useState('change_desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(null);
  const LIMIT = 12;

  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: LIMIT, page };
      if (sector !== 'All') params.sector = sector;
      const [field, dir] = sort.split('_');
      if (field === 'price') { params.sortBy = 'currentPrice'; params.sortDir = dir; }
      else if (field === 'change') { params.sortBy = 'changePercent'; params.sortDir = dir; }
      else if (field === 'volume') { params.sortBy = 'volume'; params.sortDir = 'desc'; }

      const res = await API.get('/stocks', { params });
      const data = res.data.data || res.data;
      setStocks(Array.isArray(data) ? data : data.stocks || []);
      setTotalPages(res.data.totalPages || Math.ceil((res.data.total || (Array.isArray(data) ? data.length : 0)) / LIMIT));
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sector, sort, page]);

  useEffect(() => { fetchStocks(); }, [fetchStocks]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchStocks, 30000);
    return () => clearInterval(interval);
  }, [fetchStocks]);

  const handleSectorChange = (s) => { setSector(s); setPage(1); };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Market Overview</h1>
          {lastUpdated && (
            <p className="page-subtitle">
              Last updated: {lastUpdated.toLocaleTimeString()} &nbsp;
              <span className="live-badge">● LIVE</span>
            </p>
          )}
        </div>
        <div className="market-controls">
          <StockSearch onSelect={(s) => navigate(`/stock/${s._id}`)} />
          <select
            className="form-select-dark"
            value={sort}
            onChange={e => { setSort(e.target.value); setPage(1); }}
            id="market-sort"
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button className="btn-icon" onClick={fetchStocks} title="Refresh">
            <FaSync />
          </button>
        </div>
      </div>

      {/* SECTOR TABS */}
      <div className="sector-tabs">
        {SECTORS.map(s => (
          <button
            key={s}
            className={`sector-tab ${sector === s ? 'active' : ''}`}
            onClick={() => handleSectorChange(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="stocks-grid-loading">
          {Array(12).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 160, borderRadius: 12 }} />
          ))}
        </div>
      ) : (
        <>
          {stocks.length === 0 ? (
            <div className="empty-state">
              <FaFilter size={48} style={{ color: 'var(--text-muted)' }} />
              <h3>No stocks found</h3>
              <p>Try changing the sector or sort filter</p>
            </div>
          ) : (
            <div className="stocks-grid">
              {stocks.map(stock => (
                <StockCard
                  key={stock._id}
                  stock={stock}
                  onClick={() => navigate(`/stock/${stock._id}`)}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination-bar">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                &larr; Prev
              </button>
              <span className="page-info">Page {page} of {totalPages}</span>
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
