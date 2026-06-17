import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaEnvelope, FaCode, FaUser, FaBriefcase, FaArrowLeft, FaChartLine } from 'react-icons/fa';

export default function AboutDeveloperPage() {
  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Link to="/" className="btn-ghost d-inline-flex align-items-center gap-2 mb-4 text-decoration-none" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 1rem' }}>
            <FaArrowLeft /> Back to Home
          </Link>

          <div className="glass-card p-5 text-center animate-fadeInUp" style={{ borderRadius: '24px', background: 'rgba(13, 20, 38, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div className="mb-4 d-inline-block position-relative">
              <div 
                className="d-flex align-items-center justify-content-center mx-auto" 
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: '#fff',
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  boxShadow: '0 0 25px rgba(139, 92, 246, 0.4)'
                }}
              >
                GM
              </div>
            </div>
            
            <h1 className="fw-bold mb-2" style={{ color: 'var(--text-primary)', fontSize: '2.5rem' }}>
              Guduguntla Manikanta
            </h1>
            <p className="lead mb-4" style={{ color: 'var(--secondary)', fontWeight: '500' }}>
              Full-Stack Software Engineer & FinTech Developer
            </p>
            
            <hr className="my-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            
            <div className="text-start mb-5" style={{ color: 'var(--text-secondary)' }}>
              <h3 className="h5 mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FaUser style={{ color: 'var(--secondary)' }} /> About Me
              </h3>
              <p style={{ lineHeight: '1.7', fontSize: '0.95rem' }}>
                Hello! I am Guduguntla Manikanta, a passionate full-stack developer dedicated to building secure, scalable, and high-performance web applications. My expertise spans across modern technologies like React, Node.js, Express, and MongoDB, with a special focus on creating intuitive user experiences and premium FinTech platforms.
              </p>
              <p style={{ lineHeight: '1.7', fontSize: '0.95rem' }}>
                TradeSphere is one of my projects where I reimagined virtual stock trading by combining real-time simulation, advanced interactive charts, and high-fidelity glassmorphism designs to offer users a realistic and beautiful trading experience.
              </p>
            </div>

            <div className="row g-4 text-start mb-5">
              <div className="col-md-6">
                <div className="p-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 className="h6 mb-2 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <FaCode style={{ color: 'var(--secondary)' }} /> Technical Stack
                  </h4>
                  <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                    React, Node.js, Express, MongoDB, JavaScript (ES6+), Bootstrap, Chart.js, HTML5/CSS3
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 className="h6 mb-2 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <FaBriefcase style={{ color: 'var(--secondary)' }} /> TradeSphere Features
                  </h4>
                  <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                    Real-time market simulation, stock trading mechanics, JWT authentication, responsive charts, and custom glassmorphism design.
                  </p>
                </div>
              </div>
            </div>

            <h3 className="h5 mb-3 text-start" style={{ color: 'var(--text-primary)' }}>Connect With Me</h3>
            <div className="d-flex flex-wrap justify-content-center gap-3 mb-2">
              <a 
                href="https://github.com/GuduguntlaManikanta" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-outline-custom d-flex align-items-center gap-2 px-4 py-2 text-decoration-none"
                style={{ fontSize: '0.95rem' }}
              >
                <FaGithub size={18} /> GitHub
              </a>
              <a 
                href="https://linkedin.com/in/guduguntla-manikanta" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-outline-custom d-flex align-items-center gap-2 px-4 py-2 text-decoration-none"
                style={{ fontSize: '0.95rem' }}
              >
                <FaLinkedin size={18} /> LinkedIn
              </a>
              <a 
                href="mailto:manikanta@tradesphere.com" 
                className="btn-ghost d-flex align-items-center gap-2 px-4 py-2 text-decoration-none"
                style={{ fontSize: '0.95rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              >
                <FaEnvelope size={18} /> Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
