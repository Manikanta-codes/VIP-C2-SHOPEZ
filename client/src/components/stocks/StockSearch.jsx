import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import API from '../../api/axios';

const StockSearch = ({ onSelect, placeholder = 'Search stocks by name or symbol...' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  const searchStocks = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await API.get('/stocks/search', { params: { q: searchQuery } });
      const data = res.data.stocks || res.data || [];
      setResults(data.slice(0, 8));
      setIsOpen(data.length > 0);
      setSelectedIndex(-1);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchStocks(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchStocks]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (stock) => {
    setQuery('');
    setIsOpen(false);
    setResults([]);
    if (onSelect) {
      onSelect(stock);
    } else {
      navigate(`/stock/${stock._id}`);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      <div className="search-input-wrapper">
        <FaSearch className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          aria-label="Search stocks"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          style={{ paddingRight: query ? '2.5rem' : '1rem' }}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="btn-icon"
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'transparent',
              width: '28px',
              height: '28px',
            }}
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="position-absolute w-100 mt-1"
          style={{
            zIndex: 1050,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: '380px',
            overflowY: 'auto',
          }}
          role="listbox"
        >
          {loading && (
            <div className="p-3 text-center">
              <div className="spinner-border spinner-border-sm" role="status" />
              <span className="ms-2 text-secondary-c" style={{ fontSize: '0.85rem' }}>Searching...</span>
            </div>
          )}

          {!loading && results.length === 0 && query.length > 0 && (
            <div className="p-3 text-center text-muted-c" style={{ fontSize: '0.9rem' }}>
              No stocks found for "{query}"
            </div>
          )}

          {!loading && results.map((stock, idx) => (
            <div
              key={stock._id || idx}
              className="d-flex align-items-center justify-content-between px-3 py-2 cursor-pointer"
              style={{
                background: selectedIndex === idx ? 'var(--bg-elevated)' : 'transparent',
                transition: 'var(--transition-fast)',
                borderBottom: idx < results.length - 1 ? '1px solid var(--glass-border)' : 'none',
              }}
              onClick={() => handleSelect(stock)}
              onMouseEnter={() => setSelectedIndex(idx)}
              role="option"
              aria-selected={selectedIndex === idx}
            >
              <div>
                <span className="fw-600 me-2" style={{ fontSize: '0.9rem' }}>
                  {stock.symbol}
                </span>
                <span className="text-muted-c" style={{ fontSize: '0.8rem' }}>
                  {stock.name}
                </span>
              </div>
              <div className="text-end">
                <span className="fw-600" style={{ fontSize: '0.9rem' }}>
                  {formatCurrency(stock.currentPrice)}
                </span>
                {stock.changePercent != null && (
                  <span
                    className={`ms-2 ${stock.changePercent >= 0 ? 'price-up' : 'price-down'}`}
                    style={{ fontSize: '0.8rem' }}
                  >
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockSearch;
