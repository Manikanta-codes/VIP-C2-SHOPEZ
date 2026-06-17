import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { FaSearch, FaUserShield, FaUser, FaBan } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.data || res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await API.put(`/admin/users/${user._id}`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u));
      toast.success(`${user.name} is now ${newRole}`);
    } catch {
      toast.error('Failed to update role');
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="admin-panel-header">
        <h4>All Users ({users.length})</h4>
        <div className="input-icon-wrap" style={{ maxWidth: 280 }}>
          <FaSearch className="input-icon" />
          <input
            id="user-search"
            className="form-control-dark"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="table-responsive">
        <table className="stock-table w-100">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Balance</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u._id}>
                <td>
                  <div className="user-cell">
                    <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=1a237e&color=fff`}
                      alt={u.name} className="user-avatar-sm" />
                    <span>{u.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                <td>
                  <span className={`role-badge ${u.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                    {u.role === 'ADMIN' ? <FaUserShield className="me-1" /> : <FaUser className="me-1" />}
                    {u.role}
                  </span>
                </td>
                <td>{fmt(u.virtualBalance)}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className={`btn-sm-action ${u.role === 'ADMIN' ? 'btn-danger-sm' : 'btn-primary-sm'}`}
                    onClick={() => toggleRole(u)}
                  >
                    {u.role === 'ADMIN' ? 'Demote' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state-sm"><p>No users found</p></div>}
      </div>
    </div>
  );
}
