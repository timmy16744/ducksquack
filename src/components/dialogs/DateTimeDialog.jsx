import React, { useState, useEffect } from 'react';
import XPDialog from './XPDialog';
import XPTabs from '../shared/XPTabs';
import AnalogClock from './AnalogClock';
import Calendar from './Calendar';

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="7" fill="#ECE9D8" stroke="#808080" strokeWidth="1"/>
    <circle cx="8" cy="8" r="5.5" fill="#fff" stroke="#4a4a4a" strokeWidth="0.5"/>
    <line x1="8" y1="8" x2="8" y2="4" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="8" y1="8" x2="11" y2="8" stroke="#333" strokeWidth="1" strokeLinecap="round"/>
    <circle cx="8" cy="8" r="0.8" fill="#333"/>
  </svg>
);

export default function DateTimeDialog({ onClose }) {
  const [activeTab, setActiveTab] = useState('datetime');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getTimezone = () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = -time.getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const mins = Math.abs(offset) % 60;
    const sign = offset >= 0 ? '+' : '-';
    return {
      name: tz.replace(/_/g, ' '),
      offset: `UTC${sign}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
    };
  };

  const timezone = getTimezone();

  const tabs = [
    { id: 'datetime', label: 'Date & Time' },
    { id: 'timezone', label: 'Time Zone' },
    { id: 'internet', label: 'Internet Time' }
  ];

  const renderDateTimeTab = () => (
    <div className="datetime-dialog-content">
      <div className="datetime-main">
        <div className="datetime-clock-section">
          <AnalogClock />
          <div className="datetime-time-display">
            <label>Time:</label>
            <input
              type="text"
              className="datetime-time-input"
              value={formatTime(time)}
              readOnly
            />
          </div>
        </div>
        <div className="datetime-calendar-section">
          <Calendar />
        </div>
      </div>
      <div className="datetime-timezone">
        <label>Current time zone:</label>
        <div className="datetime-timezone-value">
          {timezone.name} ({timezone.offset})
        </div>
      </div>
    </div>
  );

  const renderTimezoneTab = () => (
    <div className="timezone-tab-content">
      <div className="timezone-map-placeholder">
        World Time Zone Map
      </div>
      <div className="timezone-select-container">
        <label>Time zone:</label>
        <select className="timezone-select" defaultValue={timezone.name}>
          <option value={timezone.name}>
            ({timezone.offset}) {timezone.name}
          </option>
        </select>
      </div>
      <div className="timezone-current">
        <input type="checkbox" id="dst" defaultChecked />
        <label htmlFor="dst">Automatically adjust clock for daylight saving changes</label>
      </div>
    </div>
  );

  const renderInternetTimeTab = () => (
    <div className="internet-time-content">
      <div className="internet-time-checkbox">
        <input type="checkbox" id="sync" defaultChecked />
        <label htmlFor="sync">Automatically synchronize with an Internet time server</label>
      </div>
      <div className="internet-time-server">
        <label>Server:</label>
        <input type="text" defaultValue="time.windows.com" readOnly />
      </div>
      <div className="internet-time-status">
        Last synchronized: {time.toLocaleString()}
      </div>
      <button className="xp-button internet-time-update-btn">
        Update Now
      </button>
    </div>
  );

  const footer = (
    <>
      <button className="xp-button primary" onClick={onClose}>OK</button>
      <button className="xp-button" onClick={onClose}>Cancel</button>
      <button className="xp-button">Apply</button>
    </>
  );

  return (
    <XPDialog
      title="Date and Time Properties"
      icon={<ClockIcon />}
      width={410}
      height={380}
      onClose={onClose}
      footer={footer}
    >
      <XPTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="xp-tab-panel">
        {activeTab === 'datetime' && renderDateTimeTab()}
        {activeTab === 'timezone' && renderTimezoneTab()}
        {activeTab === 'internet' && renderInternetTimeTab()}
      </div>
    </XPDialog>
  );
}
