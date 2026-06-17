import { useState, useCallback } from 'react';
import API from '../api/axios';

const useStocks = () => {
  const [stocks, setStocks] = useState([]);
  const [stock, setStock] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchStocks = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/stocks', { params });
      const data = res.data;
      setStocks(data.stocks || data);
      if (data.pagination) {
        setPagination(data.pagination);
      } else if (data.totalPages) {
        setPagination({
          page: data.page || params.page || 1,
          totalPages: data.totalPages,
          total: data.total || (data.stocks ? data.stocks.length : 0),
        });
      }
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch stocks';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchStocks = useCallback(async (query) => {
    if (!query || query.trim().length < 1) {
      setSearchResults([]);
      return [];
    }
    try {
      const res = await API.get('/stocks/search', { params: { q: query } });
      const results = res.data.stocks || res.data || [];
      setSearchResults(results);
      return results;
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
      return [];
    }
  }, []);

  const getStock = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/stocks/${id}`);
      const data = res.data.stock || res.data;
      setStock(data);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch stock';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTopGainers = useCallback(async (limit = 5) => {
    try {
      const res = await API.get('/stocks/top-gainers', { params: { limit } });
      const data = res.data.stocks || res.data || [];
      setTopGainers(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch top gainers:', err);
      return [];
    }
  }, []);

  const getTopLosers = useCallback(async (limit = 5) => {
    try {
      const res = await API.get('/stocks/top-losers', { params: { limit } });
      const data = res.data.stocks || res.data || [];
      setTopLosers(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch top losers:', err);
      return [];
    }
  }, []);

  const getStockHistory = useCallback(async (id, range = '1M') => {
    try {
      const res = await API.get(`/stocks/${id}/history`, { params: { range } });
      return res.data.history || res.data || [];
    } catch (err) {
      console.error('Failed to fetch stock history:', err);
      return [];
    }
  }, []);

  return {
    stocks,
    stock,
    searchResults,
    topGainers,
    topLosers,
    loading,
    error,
    pagination,
    fetchStocks,
    searchStocks,
    getStock,
    getTopGainers,
    getTopLosers,
    getStockHistory,
    setSearchResults,
  };
};

export default useStocks;
