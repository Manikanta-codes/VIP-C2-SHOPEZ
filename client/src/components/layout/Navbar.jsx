import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaChartLine, FaWallet, FaSignOutAlt, FaUserCircle, FaCog, FaShieldAlt, FaBars } from 'react-icons/fa';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const formatCurrency = (amount) => {
    if (amount == null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-shopez">
      <div className="container">
        <Link className="navbar-brand" to="/" aria-label="TradeSphere Home">
          <FaChartLine className="brand-icon" />
          <span className="brand-text">TradeSphere</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-controls="navbarContent"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <FaBars />
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/dashboard" onClick={() => setIsOpen(false)}>
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/market" onClick={() => setIsOpen(false)}>
                    Market
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/portfolio" onClick={() => setIsOpen(false)}>
                    Portfolio
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/transactions" onClick={() => setIsOpen(false)}>
                    History
                  </NavLink>
                </li>
                {isAdmin && (
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/admin" onClick={() => setIsOpen(false)}>
                      <FaShieldAlt className="me-1" />
                      Admin
                    </NavLink>
                  </li>
                )}
              </>
            )}
            <li className="nav-item">
              <NavLink className="nav-link" to="/about-developer" onClick={() => setIsOpen(false)}>
                About Developer
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="navbar-balance d-none d-md-flex">
                  <FaWallet className="balance-icon" />
                  <span>{formatCurrency(user?.virtualBalance)}</span>
                </div>

                <div className="dropdown">
                  <div
                    className="user-avatar dropdown-toggle"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    aria-label="User menu"
                  >
                    {getInitials(user?.name)}
                  </div>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark-custom">
                    <li className="px-3 py-2">
                      <div className="fw-600" style={{ fontSize: '0.9rem' }}>{user?.name}</div>
                      <div className="text-muted-c" style={{ fontSize: '0.75rem' }}>{user?.email}</div>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li className="d-md-none px-3 py-1">
                      <div className="d-flex align-items-center gap-2 text-secondary-c" style={{ fontSize: '0.85rem' }}>
                        <FaWallet className="text-accent-c" />
                        {formatCurrency(user?.virtualBalance)}
                      </div>
                    </li>
                    <li className="d-md-none"><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2" to="/dashboard" onClick={() => setIsOpen(false)}>
                        <FaUserCircle /> Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2" to="/portfolio" onClick={() => setIsOpen(false)}>
                        <FaCog /> Settings
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item d-flex align-items-center gap-2 text-danger-c" onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost" onClick={() => setIsOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-outline-custom" onClick={() => setIsOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
