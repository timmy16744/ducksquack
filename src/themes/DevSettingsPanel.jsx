import React, { useState, useCallback } from 'react';
import { useTheme } from './ThemeContext';
import { baseTokenSchema } from './tokens';
import './DevSettingsPanel.css';

function ColorControl({ varName, schema, value, onChange }) {
  return (
    <div className="dev-control">
      <div className="dev-control-label">
        <span className="dev-control-name">{schema.label}</span>
      </div>
      <div className="dev-color-row">
        <input
          type="color"
          className="dev-color-input"
          value={value || '#000000'}
          onChange={(e) => onChange(varName, e.target.value)}
        />
        <input
          type="text"
          className="dev-color-text"
          value={value || ''}
          onChange={(e) => onChange(varName, e.target.value)}
          placeholder="#000000"
        />
      </div>
      <div className="dev-control-var">{varName}</div>
    </div>
  );
}

function RangeControl({ varName, schema, value, onChange }) {
  const numValue = parseFloat(value) || schema.min;
  const displayValue = schema.unit ? `${numValue}${schema.unit}` : numValue;

  return (
    <div className="dev-control">
      <div className="dev-control-label">
        <span className="dev-control-name">{schema.label}</span>
        <span className="dev-control-value">{displayValue}</span>
      </div>
      <input
        type="range"
        className="dev-range-input"
        min={schema.min}
        max={schema.max}
        step={schema.step}
        value={numValue}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          onChange(varName, schema.unit ? `${v}${schema.unit}` : `${v}`);
        }}
      />
      <div className="dev-control-var">{varName}</div>
    </div>
  );
}

function SelectControl({ varName, schema, value, onChange }) {
  return (
    <div className="dev-control">
      <div className="dev-control-label">
        <span className="dev-control-name">{schema.label}</span>
      </div>
      <select
        className="dev-select"
        value={value || ''}
        onChange={(e) => onChange(varName, e.target.value)}
      >
        {schema.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="dev-control-var">{varName}</div>
    </div>
  );
}

function SettingToggle({ name, def, value, onChange }) {
  return (
    <div className="dev-toggle-row">
      <span className="dev-toggle-label">{def.label}</span>
      <label className="dev-toggle">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(name, e.target.checked)}
        />
        <span className="dev-toggle-track" />
        <span className="dev-toggle-knob" />
      </label>
    </div>
  );
}

function SettingSelect({ name, def, value, onChange }) {
  return (
    <div className="dev-control">
      <div className="dev-control-label">
        <span className="dev-control-name">{def.label}</span>
      </div>
      <select
        className="dev-select"
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      >
        {def.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export default function DevSettingsPanel() {
  const {
    themeId, setThemeId, theme, themes,
    tokens, updateToken, resetTokens,
    settings, updateSetting, resetSettings,
    exportTheme, importTheme,
  } = useTheme();

  const [isOpen, setIsOpen] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [copyFeedback, setCopyFeedback] = useState('');

  const toggleCategory = (cat) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Group base tokens by category
  const categories = {};
  Object.entries(baseTokenSchema).forEach(([varName, schema]) => {
    const cat = schema.category;
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push({ varName, schema });
  });

  // Group theme-specific extra tokens (tokens not in baseTokenSchema)
  const extraTokens = [];
  Object.entries(tokens).forEach(([varName]) => {
    if (!baseTokenSchema[varName] && varName.startsWith('--')) {
      extraTokens.push(varName);
    }
  });

  const handleExport = useCallback(() => {
    const json = exportTheme();
    navigator.clipboard.writeText(json).then(() => {
      setCopyFeedback('Copied!');
      setTimeout(() => setCopyFeedback(''), 2000);
    }).catch(() => {
      setCopyFeedback('Failed');
      setTimeout(() => setCopyFeedback(''), 2000);
    });
  }, [exportTheme]);

  const handleImport = useCallback(() => {
    const json = prompt('Paste theme JSON:');
    if (json) importTheme(json);
  }, [importTheme]);

  const handleResetAll = useCallback(() => {
    resetTokens();
    resetSettings();
  }, [resetTokens, resetSettings]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="dev-panel-overlay">
      <div className="dev-panel-header">
        <h3>Dev Settings</h3>
        <button className="dev-panel-close" onClick={() => setIsOpen(false)}>×</button>
      </div>

      {/* Theme selector */}
      <div className="dev-panel-theme-select">
        <label>Theme</label>
        <div className="dev-panel-theme-grid">
          {themes.map((t) => (
            <button
              key={t.id}
              className={`dev-panel-theme-btn ${themeId === t.id ? 'active' : ''}`}
              onClick={() => setThemeId(t.id)}
              title={t.description}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable token controls */}
      <div className="dev-panel-body">
        {/* Theme-specific settings */}
        {theme.settings && Object.keys(theme.settings).length > 0 && (
          <div className="dev-panel-category">
            <div
              className="dev-panel-category-header"
              onClick={() => toggleCategory('_settings')}
            >
              <span className="dev-panel-category-title">Theme Settings</span>
              <span className={`dev-panel-category-arrow ${!collapsedCategories['_settings'] ? 'open' : ''}`}>▶</span>
            </div>
            {!collapsedCategories['_settings'] && (
              <div className="dev-panel-category-body">
                {Object.entries(theme.settings).map(([key, def]) => {
                  const val = settings[key];
                  if (def.type === 'boolean') {
                    return <SettingToggle key={key} name={key} def={def} value={val} onChange={updateSetting} />;
                  }
                  if (def.type === 'select') {
                    return <SettingSelect key={key} name={key} def={def} value={val} onChange={updateSetting} />;
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        )}

        {/* Base token categories */}
        {Object.entries(categories).map(([cat, items]) => (
          <div key={cat} className="dev-panel-category">
            <div
              className="dev-panel-category-header"
              onClick={() => toggleCategory(cat)}
            >
              <span className="dev-panel-category-title">{cat}</span>
              <span className={`dev-panel-category-arrow ${!collapsedCategories[cat] ? 'open' : ''}`}>▶</span>
            </div>
            {!collapsedCategories[cat] && (
              <div className="dev-panel-category-body">
                {items.map(({ varName, schema }) => {
                  const value = tokens[varName] || '';
                  if (schema.type === 'color') {
                    return <ColorControl key={varName} varName={varName} schema={schema} value={value} onChange={updateToken} />;
                  }
                  if (schema.type === 'range') {
                    return <RangeControl key={varName} varName={varName} schema={schema} value={value} onChange={updateToken} />;
                  }
                  if (schema.type === 'select') {
                    return <SelectControl key={varName} varName={varName} schema={schema} value={value} onChange={updateToken} />;
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        ))}

        {/* Extra theme-specific tokens */}
        {extraTokens.length > 0 && (
          <div className="dev-panel-category">
            <div
              className="dev-panel-category-header"
              onClick={() => toggleCategory('_extra')}
            >
              <span className="dev-panel-category-title">Theme Tokens</span>
              <span className={`dev-panel-category-arrow ${!collapsedCategories['_extra'] ? 'open' : ''}`}>▶</span>
            </div>
            {!collapsedCategories['_extra'] && (
              <div className="dev-panel-category-body">
                {extraTokens.map((varName) => (
                  <div key={varName} className="dev-control">
                    <div className="dev-control-label">
                      <span className="dev-control-name">{varName.replace(/^--/, '').replace(/-/g, ' ')}</span>
                    </div>
                    <div className="dev-color-row">
                      {tokens[varName]?.startsWith('#') && (
                        <input
                          type="color"
                          className="dev-color-input"
                          value={tokens[varName]}
                          onChange={(e) => updateToken(varName, e.target.value)}
                        />
                      )}
                      <input
                        type="text"
                        className="dev-color-text"
                        value={tokens[varName] || ''}
                        onChange={(e) => updateToken(varName, e.target.value)}
                      />
                    </div>
                    <div className="dev-control-var">{varName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="dev-panel-actions">
        <button className="dev-action-btn primary" onClick={handleExport}>
          {copyFeedback || 'Export'}
        </button>
        <button className="dev-action-btn" onClick={handleImport}>
          Import
        </button>
        <button className="dev-action-btn danger" onClick={handleResetAll}>
          Reset All
        </button>
      </div>

      <div className="dev-panel-hint">
        <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>D</kbd> to toggle
      </div>
    </div>
  );
}
