import { useState, useEffect } from 'react';
import { useRoute } from './useRoute';
import { useWriting } from './useWriting';
import { fetchWritingsIndex } from '../utils/content';
import { subscribeToViewCounts } from '../utils/firebase';
import { useAudioPlayback } from '../shared/useAudioPlayback';

/**
 * Everything a theme shell needs, in one call.
 *
 * Previously each of the five shells independently wired up routing, the
 * writings index, view counts, the current post and audio playback -- five
 * copies of the same ~40 lines that had to be kept in sync by hand. A shell
 * now only decides how things look.
 *
 * @returns {{
 *   page: string, slug: string|null, navigate: Function,
 *   writings: Array, writingsLoaded: boolean, viewCounts: Object,
 *   post: { data: Object|null, loading: boolean, error: Error|null },
 *   audio: Object
 * }}
 */
export function useSiteData() {
  const { page, slug, navigate } = useRoute();
  const { data, loading, error } = useWriting(slug);

  const [writings, setWritings] = useState([]);
  const [writingsLoaded, setWritingsLoaded] = useState(false);
  const [viewCounts, setViewCounts] = useState({});

  useEffect(() => {
    let cancelled = false;
    fetchWritingsIndex()
      .then((list) => {
        if (cancelled) return;
        setWritings(list);
        setWritingsLoaded(true);
      })
      .catch(() => {
        // A failed index is not fatal: the shell renders an empty list rather
        // than hanging on a spinner forever.
        if (!cancelled) setWritingsLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => subscribeToViewCounts(setViewCounts), []);

  const audio = useAudioPlayback(data?.audio?.url || null);

  return {
    page,
    slug,
    navigate,
    writings,
    writingsLoaded,
    viewCounts,
    post: { data, loading, error },
    audio,
  };
}
