import { useState, useEffect, useCallback } from 'react';
import { createSlug } from '../utils/slug';

/**
 * Custom hook for hash-based routing (SPA-friendly)
 * Supports paths: /, /about/, /writings/, /writings/{slug}/
 */
export function useRoute() {
  const [route, setRoute] = useState({ page: 'home', slug: null });

  const parseRoute = useCallback(() => {
    // Check hash first (for SPA routing)
    let path = window.location.hash
      ? window.location.hash.replace('#', '')
      : window.location.pathname;

    // If we have a hash route, update URL to use pathname
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      path = window.location.hash.replace('#', '');
      window.history.replaceState({}, '', path);
    }

    if (path === '/' || path === '') {
      return { page: 'home', slug: null };
    } else if (path === '/about' || path === '/about/') {
      return { page: 'about', slug: null };
    } else if (path === '/writings' || path === '/writings/') {
      return { page: 'writings', slug: null };
    } else if (path.startsWith('/writings/')) {
      const slug = path.replace('/writings/', '').replace(/\/$/, '');
      if (slug) {
        return { page: 'post', slug };
      }
      return { page: 'writings', slug: null };
    }
    return { page: 'home', slug: null };
  }, []);

  useEffect(() => {
    const handleRoute = () => {
      setRoute(parseRoute());
    };

    // Handle initial route
    handleRoute();

    // Listen for popstate (back/forward) and hashchange
    window.addEventListener('popstate', handleRoute);
    window.addEventListener('hashchange', handleRoute);

    return () => {
      window.removeEventListener('popstate', handleRoute);
      window.removeEventListener('hashchange', handleRoute);
    };
  }, [parseRoute]);

  const navigate = useCallback((page, post = null) => {
    let url = '/';

    if (page === 'about') {
      url = '/about/';
    } else if (page === 'writings') {
      url = '/writings/';
    } else if (page === 'post' && post) {
      const slug = typeof post === 'string' ? post : createSlug(post.title);
      url = `/writings/${slug}/`;
    }

    window.history.pushState({}, '', url);
    setRoute(parseRoute());

    // Scroll content to top
    const contentArea = document.querySelector('.xp-content-area');
    if (contentArea) {
      contentArea.scrollTop = 0;
    }
  }, [parseRoute]);

  return { ...route, navigate };
}
