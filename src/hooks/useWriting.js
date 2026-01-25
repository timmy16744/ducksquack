import { useState, useEffect } from 'react';
import { fetchWriting } from '../utils/content';

/**
 * Custom hook for lazy loading writing content
 * @param {string} slug - The writing slug to load
 * @returns {{ data: Object|null, loading: boolean, error: Error|null }}
 */
export function useWriting(slug) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetchWriting(slug)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [slug]);

  return { data, loading, error };
}
