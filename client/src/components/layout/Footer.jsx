import { Link } from 'react-router-dom';
import { FaChartLine, FaTwitter, FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-shopez">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <FaChartLine style={{ color: 'var(--secondary)', fontSize: '1.25rem' }} />
              <span className="footer-brand">TradeSphere</span>
            </div>
            <p className="footer-text mb-3">
              Trade smarter with real-time market data, advanced charting, and secure portfolio management.
            </p>
            <div>
              <a href="#" className="social-icon" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="social-icon" aria-label="GitHub">
                <FaGithub />
              </a>
              <a href="#" className="social-icon" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="#" className="social-icon" aria-label="Email">
                <FaEnvelope />
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="mb-3" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Platform
            </h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/market" className="footer-link">Market</Link></li>
              <li className="mb-2"><Link to="/portfolio" className="footer-link">Portfolio</Link></li>
              <li className="mb-2"><Link to="/transactions" className="footer-link">Transactions</Link></li>
              <li className="mb-2"><Link to="/dashboard" className="footer-link">Dashboard</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="mb-3" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Company
            </h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="footer-link">About</a></li>
              <li className="mb-2"><a href="#" className="footer-link">Contact</a></li>
              <li className="mb-2"><a href="#" className="footer-link">Careers</a></li>
              <li className="mb-2"><a href="#" className="footer-link">Blog</a></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="mb-3" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Legal
            </h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="footer-link">Terms of Service</a></li>
              <li className="mb-2"><a href="#" className="footer-link">Privacy Policy</a></li>
              <li className="mb-2"><a href="#" className="footer-link">Disclaimer</a></li>
              <li className="mb-2"><a href="#" className="footer-link">Security</a></li>
            </ul>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--border-color)', margin: '2rem 0 1rem' }} />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="footer-text mb-0">
            &copy; {currentYear} TradeSphere. All rights reserved.
          </p>
          <p className="footer-text mb-0 mt-2 mt-md-0">
            Built by <Link to="/about-developer" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: '500' }}>Guduguntla Manikanta</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
