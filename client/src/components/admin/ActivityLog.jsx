import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

export default function ActivityLog() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTx = async () => {
    try {
      const params = { limit: 20, page };
      if (filter !== 'ALL') params.type = filter;
      const res = await API.get('/admin/transactions', { params });
      const data = res.data.data || res.data;
      setTransactions(Array.isArray(data) ? data : data.transactions || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTx(); }, [filter, page]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="admin-panel-header">
        <h4>All Transactions ({transactions.length})</h4>
        <div className="filter-pills">
          {['ALL', 'BUY', 'SELL'].map(f => (
            <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => { setFilter(f); setPage(1); }}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="table-responsive">
        <table className="stock-table w-100">
          <thead>
            <tr><th>Date</th><th>User</th><th>Stock</th><th>Type</th><th>Qty</th><th>Price</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx._id}>
                <td style={{ fontSize: '0.8rem' }}>{new Date(tx.createdAt).toLocaleString()}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {tx.user?.name || 'Unknown'}
                </td>
                <td><span className="tx-symbol">{tx.symbol}</span></td>
                <td>
                  <span className={`tx-badge ${tx.type === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>
                    {tx.type === 'BUY' ? <FaArrowUp className="me-1" /> : <FaArrowDown className="me-1" />}
                    {tx.type}
                  </span>
                </td>
                <td>{tx.quantity}</td>
                <td>{fmt(tx.pricePerShare)}</td>
                <td className="fw-600">{fmt(tx.totalAmount)}</td>
                <td><span className={`status-badge status-${tx.status?.toLowerCase()}`}>{tx.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && <div className="empty-state-sm"><p>No transactions found</p></div>}
      </div>
      {totalPages > 1 && (
        <div className="pagination-bar">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>&larr;</button>
          <span className="page-info">Page {page} of {totalPages}</span>
          <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>&rarr;</button>
        </div>
      )}
    </div>
  );
}
