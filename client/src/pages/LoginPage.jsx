import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaChartLine, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card animate-fadeInUp">
        <div className="auth-logo">
          <FaChartLine size={28} />
          <span>TradeSphere</span>
        </div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your trading account</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group-dark">
            <label className="form-label-dark">Email</label>
            <div className="input-icon-wrap">
              <FaEnvelope className="input-icon" />
              <input
                id="login-email"
                type="email"
                className={`form-control-dark ${errors.email ? 'is-invalid' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                autoComplete="email"
              />
            </div>
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group-dark">
            <label className="form-label-dark">Password</label>
            <div className="input-icon-wrap">
              <FaLock className="input-icon" />
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                className={`form-control-dark ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Your password"
                value={form.password}
                onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
                autoComplete="current-password"
              />
              <button type="button" className="input-icon-btn" onClick={() => setShowPw(!showPw)}>
                {showPw ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <button
            type="submit"
            id="login-submit"
            disabled={loading}
            className="btn-auth w-100"
          >
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <div className="demo-credentials glass-card">
          <div className="demo-title">Demo Credentials</div>
          <div className="demo-row">
            <span>User:</span>
            <button className="demo-btn" onClick={() => setForm({ email: 'manikanta@tradesphere.com', password: 'Manikanta123' })}>
              manikanta@tradesphere.com / Manikanta123
            </button>
          </div>
          <div className="demo-row">
            <span>Admin:</span>
            <button className="demo-btn" onClick={() => setForm({ email: 'admin@tradesphere.com', password: 'Admin@123' })}>
              admin@tradesphere.com / Admin@123
            </button>
          </div>
        </div>

        <p className="auth-link-text">
          Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}
