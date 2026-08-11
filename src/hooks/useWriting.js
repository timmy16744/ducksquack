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

    // Guard against out-of-order responses. Navigating quickly between essays
    // could otherwise let a slow earlier fetch resolve after a later one and
    // render the wrong essay.
    let stale = false;

    fetchWriting(slug)
      .then((writingData) => {
        if (stale) return;
        setData(writingData);

        // Increment view count only once per session per slug
        if (!viewedSlugsRef.current.has(slug)) {
          viewedSlugsRef.current.add(slug);
          incrementViewCount(slug);
        }
      })
      .catch((err) => { if (!stale) setError(err); })
      .finally(() => { if (!stale) setLoading(false); });

    return () => { stale = true; };
  }, [slug]);

  return { data, loading, error };
}
