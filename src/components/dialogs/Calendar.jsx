import React, { useState } from 'react';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Generate calendar grid
  const days = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      currentMonth: false,
      isToday: false
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday =
      i === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    days.push({
      day: i,
      currentMonth: true,
      isToday
    });
  }

  // Next month days
  const remaining = 42 - days.length; // 6 rows * 7 days = 42
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      currentMonth: false,
      isToday: false
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="xp-calendar">
      <div className="xp-calendar-header">
        <button className="xp-calendar-nav" onClick={handlePrevMonth}>
          ◀
        </button>
        <span className="xp-calendar-title">
          {monthNames[month]} {year}
        </span>
        <button className="xp-calendar-nav" onClick={handleNextMonth}>
          ▶
        </button>
      </div>

      <div className="xp-calendar-grid">
        {weekdays.map(day => (
          <div key={day} className="xp-calendar-weekday">
            {day}
          </div>
        ))}

        {days.map((day, index) => (
          <div
            key={index}
            className={`xp-calendar-day ${day.isToday ? 'today' : ''} ${!day.currentMonth ? 'other-month' : ''}`}
          >
            {day.day}
          </div>
        ))}
      </div>
    </div>
  );
}
