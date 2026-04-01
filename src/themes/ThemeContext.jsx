import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { themes } from './registry';

const ThemeContext = createContext(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function ThemeProvider({ children }) {
  const [themeId, setThemeIdState] = useState(() =>
    localStorage.getItem('ducksquack-theme') || 'zen'
  );
  const [devMode, setDevMode] = useState(() =>
    localStorage.getItem('ducksquack-devmode') === 'true'
  );
  const [tokenOverrides, setTokenOverrides] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`ducksquack-tokens-${themeId}`)) || {};
    } catch { return {}; }
  });
  const [themeSettings, setThemeSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`ducksquack-settings-${themeId}`)) || {};
    } catch { return {}; }
  });

  const prevThemeRef = useRef(null);

  const theme = themes.find(t => t.id === themeId) || themes[0];
  const resolvedTokens = { ...theme.tokens, ...tokenOverrides };

  // Get resolved settings (defaults + overrides)
  const resolvedSettings = {};
  if (theme.settings) {
    Object.entries(theme.settings).forEach(([key, def]) => {
      resolvedSettings[key] = themeSettings[key] !== undefined ? themeSettings[key] : def.default;
    });
  }

  // Apply CSS variables to :root
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(resolvedTokens).forEach(([key, value]) => {
      if (key.startsWith('--')) {
        const val = typeof value === 'number' ? `${value}` : value;
        root.style.setProperty(key, val);
      }
    });
  }, [resolvedTokens]);

  // Theme lifecycle (activate/deactivate)
  useEffect(() => {
    const prev = prevThemeRef.current;
    if (prev && prev.id !== theme.id) {
      prev.onDeactivate?.();
    }
    theme.onActivate?.();
    prevThemeRef.current = theme;
    document.documentElement.setAttribute('data-theme', theme.id);
    document.body.setAttribute('data-theme', theme.id);

    return () => {
      theme.onDeactivate?.();
    };
  }, [theme.id]);

  // Ctrl+Shift+D toggles dev mode
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setDevMode(d => {
          const next = !d;
          localStorage.setItem('ducksquack-devmode', next.toString());
          return next;
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const setThemeId = useCallback((id) => {
    setThemeIdState(id);
    localStorage.setItem('ducksquack-theme', id);
    // Load saved overrides for the new theme
    try {
      const saved = JSON.parse(localStorage.getItem(`ducksquack-tokens-${id}`)) || {};
      setTokenOverrides(saved);
    } catch { setTokenOverrides({}); }
    try {
      const saved = JSON.parse(localStorage.getItem(`ducksquack-settings-${id}`)) || {};
      setThemeSettings(saved);
    } catch { setThemeSettings({}); }
  }, []);

  const updateToken = useCallback((key, value) => {
    setTokenOverrides(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(`ducksquack-tokens-${themeId}`, JSON.stringify(next));
      document.documentElement.style.setProperty(key, value);
      return next;
    });
  }, [themeId]);

  const updateSetting = useCallback((key, value) => {
    setThemeSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(`ducksquack-settings-${themeId}`, JSON.stringify(next));
      return next;
    });
  }, [themeId]);

  const resetTokens = useCallback(() => {
    setTokenOverrides({});
    localStorage.removeItem(`ducksquack-tokens-${themeId}`);
    // Re-apply defaults
    Object.entries(theme.tokens).forEach(([key, value]) => {
      if (key.startsWith('--')) {
        document.documentElement.style.setProperty(key, typeof value === 'number' ? `${value}` : value);
      }
    });
  }, [themeId, theme.tokens]);

  const resetSettings = useCallback(() => {
    setThemeSettings({});
    localStorage.removeItem(`ducksquack-settings-${themeId}`);
  }, [themeId]);

  const exportTheme = useCallback(() => {
    return JSON.stringify({
      themeId,
      tokens: tokenOverrides,
      settings: themeSettings,
    }, null, 2);
  }, [themeId, tokenOverrides, themeSettings]);

  const importTheme = useCallback((json) => {
    try {
      const data = JSON.parse(json);
      if (data.tokens) {
        setTokenOverrides(data.tokens);
        localStorage.setItem(`ducksquack-tokens-${themeId}`, JSON.stringify(data.tokens));
      }
      if (data.settings) {
        setThemeSettings(data.settings);
        localStorage.setItem(`ducksquack-settings-${themeId}`, JSON.stringify(data.settings));
      }
    } catch (e) {
      console.error('Failed to import theme:', e);
    }
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{
      themeId,
      setThemeId,
      theme,
      themes,
      tokens: resolvedTokens,
      tokenOverrides,
      updateToken,
      resetTokens,
      settings: resolvedSettings,
      updateSetting,
      resetSettings,
      devMode,
      setDevMode,
      exportTheme,
      importTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
