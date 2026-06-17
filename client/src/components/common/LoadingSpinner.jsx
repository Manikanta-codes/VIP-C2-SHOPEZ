const LoadingSpinner = ({ fullPage = false, size = 'md', text = 'Loading...' }) => {
  const sizeMap = {
    sm: { width: '24px', height: '24px', border: '2px' },
    md: { width: '40px', height: '40px', border: '3px' },
    lg: { width: '56px', height: '56px', border: '4px' },
  };

  const s = sizeMap[size] || sizeMap.md;

  const spinnerStyle = {
    width: s.width,
    height: s.height,
    border: `${s.border} solid var(--border-color)`,
    borderTopColor: 'var(--secondary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  if (fullPage) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: '60vh' }}
        role="status"
        aria-label="Loading content"
      >
        <div style={spinnerStyle} />
        <p className="mt-3 text-secondary-c" style={{ fontSize: '0.9rem', animation: 'pulse 2s ease-in-out infinite' }}>
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center p-3" role="status" aria-label="Loading">
      <div style={spinnerStyle} />
      {text && (
        <span className="ms-2 text-secondary-c" style={{ fontSize: '0.85rem' }}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
