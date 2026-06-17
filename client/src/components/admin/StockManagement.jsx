import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

const EMPTY_FORM = { symbol: '', name: '', sector: 'Technology', currentPrice: '', previousClose: '', volume: '', marketCap: '', description: '' };
const SECTORS = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer'];

export default function StockManagement() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchStocks = async () => {
    try {
      const res = await API.get('/stocks', { params: { limit: 100 } });
      const data = res.data.data || res.data;
      setStocks(Array.isArray(data) ? data : data.stocks || []);
    } catch { toast.error('Failed to load stocks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStocks(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.symbol || !form.name || !form.currentPrice) {
      toast.error('Symbol, name, and price are required'); return;
    }
    setSaving(true);
    try {
      if (editId) {
        await API.put(`/admin/stocks/${editId}`, form);
        toast.success('Stock updated');
      } else {
        await API.post('/admin/stocks', form);
        toast.success('Stock added');
      }
      setShowForm(false); setEditId(null); setForm(EMPTY_FORM);
      fetchStocks();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleEdit = (s) => {
    setForm({ symbol: s.symbol, name: s.name, sector: s.sector, currentPrice: s.currentPrice, previousClose: s.previousClose || '', volume: s.volume || '', marketCap: s.marketCap || '', description: s.description || '' });
    setEditId(s._id); setShowForm(true);
  };

  const handleDelete = async (id, symbol) => {
    if (!confirm(`Deactivate ${symbol}?`)) return;
    try {
      await API.delete(`/admin/stocks/${id}`);
      toast.success(`${symbol} deactivated`);
      fetchStocks();
    } catch { toast.error('Failed to deactivate'); }
  };

  const filtered = stocks.filter(s =>
    s.symbol?.toLowerCase().includes(search.toLowerCase()) ||
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="admin-panel-header">
        <h4>All Stocks ({stocks.length})</h4>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="input-icon-wrap" style={{ maxWidth: 240 }}>
            <FaSearch className="input-icon" />
            <input className="form-control-dark" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn-primary-sm" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}>
            <FaPlus className="me-1" /> Add Stock
          </button>
        </div>
      </div>

      {showForm && (
        <div className="admin-form-overlay">
          <div className="admin-form-card glass-card">
            <h4 className="mb-4">{editId ? 'Edit Stock' : 'Add New Stock'}</h4>
            <form onSubmit={handleSave}>
              <div className="admin-form-grid">
                {[
                  { label: 'Symbol', key: 'symbol', placeholder: 'AAPL' },
                  { label: 'Company Name', key: 'name', placeholder: 'Apple Inc.' },
                  { label: 'Current Price', key: 'currentPrice', placeholder: '190.00', type: 'number' },
                  { label: 'Previous Close', key: 'previousClose', placeholder: '188.50', type: 'number' },
                  { label: 'Volume', key: 'volume', placeholder: '50000000', type: 'number' },
                  { label: 'Market Cap', key: 'marketCap', placeholder: '3000000000000', type: 'number' },
                ].map(f => (
                  <div key={f.key} className="form-group-dark">
                    <label className="form-label-dark">{f.label}</label>
                    <input className="form-control-dark" type={f.type || 'text'} placeholder={f.placeholder}
                      value={form[f.key]} onChange={e => set(f.key, e.target.value)} />
                  </div>
                ))}
                <div className="form-group-dark">
                  <label className="form-label-dark">Sector</label>
                  <select className="form-select-dark" value={form.sector} onChange={e => set('sector', e.target.value)}>
                    {SECTORS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group-dark">
                <label className="form-label-dark">Description</label>
                <textarea className="form-control-dark" rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div className="admin-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-auth" disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  {editId ? 'Save Changes' : 'Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="stock-table w-100">
          <thead>
            <tr><th>Symbol</th><th>Name</th><th>Sector</th><th>Price</th><th>Volume</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s._id}>
                <td><span className="tx-symbol">{s.symbol}</span></td>
                <td>{s.name}</td>
                <td><span className="sector-badge">{s.sector}</span></td>
                <td>{fmt(s.currentPrice)}</td>
                <td>{(s.volume / 1e6).toFixed(1)}M</td>
                <td><span className={s.isActive !== false ? 'status-badge status-completed' : 'status-badge status-cancelled'}>
                  {s.isActive !== false ? 'Active' : 'Inactive'}
                </span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-icon-sm" onClick={() => handleEdit(s)}><FaEdit /></button>
                    <button className="btn-icon-sm btn-danger-icon" onClick={() => handleDelete(s._id, s.symbol)}><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state-sm"><p>No stocks found</p></div>}
      </div>
    </div>
  );
}
