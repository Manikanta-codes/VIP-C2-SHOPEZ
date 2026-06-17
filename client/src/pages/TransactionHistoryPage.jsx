import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaHistory, FaArrowUp, FaArrowDown, FaFilter } from 'react-icons/fa';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 15;

  const fetchTx = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, page };
      if (filter !== 'ALL') params.type = filter;
      const res = await API.get('/trade/history', { params });
      const data = res.data.data || res.data;
      setTransactions(Array.isArray(data) ? data : data.transactions || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { fetchTx(); }, [fetchTx]);

  const handleFilterChange = (f) => { setFilter(f); setPage(1); };

  const exportCSV = () => {
    const headers = ['Date', 'Symbol', 'Name', 'Type', 'Quantity', 'Price', 'Total', 'Status'];
    const rows = transactions.map(tx => [
      new Date(tx.createdAt).toLocaleDateString(),
      tx.symbol,
      tx.stockName || '',
      tx.type,
      tx.quantity,
      tx.pricePerShare,
      tx.totalAmount,
      tx.status,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title"><FaHistory className="me-2" /> Transaction History</h1>
          <p className="page-subtitle">All your buy and sell orders</p>
        </div>
        <button className="btn-secondary" onClick={exportCSV}>Export CSV</button>
      </div>

      {/* FILTER PILLS */}
      <div className="filter-pills">
        {['ALL', 'BUY', 'SELL'].map(f => (
          <button
            key={f}
            className={`filter-pill ${filter === f ? 'active' : ''} ${f === 'BUY' ? 'pill-buy' : f === 'SELL' ? 'pill-sell' : ''}`}
            onClick={() => handleFilterChange(f)}
          >
            {f === 'BUY' && <FaArrowUp className="me-1" />}
            {f === 'SELL' && <FaArrowDown className="me-1" />}
            {f}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="glass-card">
          {transactions.length === 0 ? (
            <div className="empty-state-sm">
              <FaFilter size={32} style={{ color: 'var(--text-muted)' }} />
              <p>No transactions found</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="stock-table w-100">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Stock</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Price / Share</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx._id}>
                        <td>
                          <div>{new Date(tx.createdAt).toLocaleDateString()}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(tx.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td>
                          <div className="tx-symbol">{tx.symbol}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tx.stockName}</div>
                        </td>
                        <td>
                          <span className={`tx-badge ${tx.type === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>
                            {tx.type === 'BUY' ? <FaArrowUp className="me-1" /> : <FaArrowDown className="me-1" />}
                            {tx.type}
                          </span>
                        </td>
                        <td>{tx.quantity.toLocaleString()}</td>
                        <td>{fmt(tx.pricePerShare)}</td>
                        <td className="fw-600">{fmt(tx.totalAmount)}</td>
                        <td>
                          <span className={`status-badge status-${tx.status?.toLowerCase()}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="pagination-bar">
                  <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>&larr; Prev</button>
                  <span className="page-info">Page {page} of {totalPages}</span>
                  <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next &rarr;</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
