import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useFetch = (url, options = {}) => {
  const { immediate = true, params = {}, transform = null } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async (executeParams = {}) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiService.get(url, { ...params, ...executeParams });
      
      if (response.success) {
        const result = transform ? transform(response.data) : response.data;
        setData(result);
        setSuccess(true);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url, params, transform]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    success,
    execute,
    setData
  };
};