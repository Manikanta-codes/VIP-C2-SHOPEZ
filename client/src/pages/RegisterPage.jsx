import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaChartLine, FaEye, FaEyeSlash } from 'react-icons/fa';

function PasswordStrength({ password }) {
  const getStrength = () => {
    let s = 0;
    if (password.length >= 6) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  };
  const strength = getStrength();
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef5350', '#ffc107', '#00bfa5', '#66bb6a'];
  if (!password) return null;
  return (
    <div className="pw-strength">
      <div className="pw-bars">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="pw-bar" style={{ background: i <= strength ? colors[strength] : '#30363d' }} />
        ))}
      </div>
      <span style={{ color: colors[strength], fontSize: '0.75rem' }}>{labels[strength]}</span>
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to TradeSphere 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field, val) => { setForm({ ...form, [field]: val }); setErrors({ ...errors, [field]: '' }); };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card animate-fadeInUp">
        <div className="auth-logo">
          <FaChartLine size={28} />
          <span>TradeSphere</span>
        </div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Start trading with $100,000 in virtual funds</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group-dark">
            <label className="form-label-dark">Full Name</label>
            <div className="input-icon-wrap">
              <FaUser className="input-icon" />
              <input id="reg-name" type="text" className={`form-control-dark ${errors.name ? 'is-invalid' : ''}`}
                placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group-dark">
            <label className="form-label-dark">Email</label>
            <div className="input-icon-wrap">
              <FaEnvelope className="input-icon" />
              <input id="reg-email" type="email" className={`form-control-dark ${errors.email ? 'is-invalid' : ''}`}
                placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group-dark">
            <label className="form-label-dark">Password</label>
            <div className="input-icon-wrap">
              <FaLock className="input-icon" />
              <input id="reg-password" type={showPw ? 'text' : 'password'} className={`form-control-dark ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
              <button type="button" className="input-icon-btn" onClick={() => setShowPw(!showPw)}>
                {showPw ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <PasswordStrength password={form.password} />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <div className="form-group-dark">
            <label className="form-label-dark">Confirm Password</label>
            <div className="input-icon-wrap">
              <FaLock className="input-icon" />
              <input id="reg-confirm" type="password" className={`form-control-dark ${errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="Repeat password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
            </div>
            {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
          </div>

          <button type="submit" id="reg-submit" disabled={loading} className="btn-auth w-100">
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-link-text mt-3">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
