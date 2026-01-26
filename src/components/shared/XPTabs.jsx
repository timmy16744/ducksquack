import React from 'react';

export default function XPTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="xp-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`xp-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
