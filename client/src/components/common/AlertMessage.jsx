import { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const AlertMessage = ({ type = 'info', message, onClose, autoDismiss = false, dismissTime = 5000 }) => {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        handleClose();
      }, dismissTime);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, dismissTime]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!visible || !message) return null;

  const iconMap = {
    success: <FaCheckCircle />,
    danger: <FaExclamationCircle />,
    warning: <FaExclamationTriangle />,
    info: <FaInfoCircle />,
    error: <FaExclamationCircle />,
  };

  const alertType = type === 'error' ? 'danger' : type;

  return (
    <div
      className={`alert alert-${alertType} d-flex align-items-center`}
      role="alert"
      style={{
        animation: exiting ? 'fadeOut 0.3s ease forwards' : 'fadeInDown 0.3s ease forwards',
        position: 'relative',
      }}
    >
      <span className="me-2" style={{ fontSize: '1.1rem' }}>
        {iconMap[type] || iconMap.info}
      </span>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={handleClose}
          className="btn-icon ms-2"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            opacity: 0.7,
            cursor: 'pointer',
            padding: '0.25rem',
            fontSize: '0.9rem',
          }}
          aria-label="Close alert"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
