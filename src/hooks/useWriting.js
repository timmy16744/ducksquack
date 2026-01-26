import { useState, useEffect, useRef } from 'react';
import { fetchWriting } from '../utils/content';
import { incrementViewCount } from '../utils/firebase';

/**
 * Custom hook for lazy loading writing content
 * @param {string} slug - The writing slug to load
 * @returns {{ data: Object|null, loading: boolean, error: Error|null }}
 */
export function useWriting(slug) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const viewedSlugsRef = useRef(new Set());

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
      .then((writingData) => {
        setData(writingData);

        // Increment view count only once per session per slug
        if (!viewedSlugsRef.current.has(slug)) {
          viewedSlugsRef.current.add(slug);
          incrementViewCount(slug);
        }
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [slug]);

  return { data, loading, error };
}
