import React, { useState, useEffect } from 'react';

export default function AnalogClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Calculate hand angles
  const secondAngle = (seconds * 6) - 90; // 6 degrees per second
  const minuteAngle = (minutes * 6) + (seconds * 0.1) - 90; // 6 degrees per minute + smooth movement
  const hourAngle = (hours * 30) + (minutes * 0.5) - 90; // 30 degrees per hour + smooth movement

  const cx = 60;
  const cy = 60;
  const radius = 50;

  // Calculate hand end points
  const getHandCoords = (angle, length) => {
    const radians = (angle * Math.PI) / 180;
    return {
      x: cx + length * Math.cos(radians),
      y: cy + length * Math.sin(radians)
    };
  };

  const hourHand = getHandCoords(hourAngle, 28);
  const minuteHand = getHandCoords(minuteAngle, 38);
  const secondHand = getHandCoords(secondAngle, 42);

  // Generate hour markers and numbers
  const markers = [];
  const numbers = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const innerRadius = 42;
    const outerRadius = 46;
    const textRadius = 35;

    markers.push({
      x1: cx + innerRadius * Math.cos(angle),
      y1: cy + innerRadius * Math.sin(angle),
      x2: cx + outerRadius * Math.cos(angle),
      y2: cy + outerRadius * Math.sin(angle),
      isHour: true
    });

    numbers.push({
      x: cx + textRadius * Math.cos(angle),
      y: cy + textRadius * Math.sin(angle),
      text: i === 0 ? '12' : String(i)
    });
  }

  // Generate minute markers
  for (let i = 0; i < 60; i++) {
    if (i % 5 !== 0) {
      const angle = (i * 6 - 90) * (Math.PI / 180);
      const innerRadius = 44;
      const outerRadius = 46;
      markers.push({
        x1: cx + innerRadius * Math.cos(angle),
        y1: cy + innerRadius * Math.sin(angle),
        x2: cx + outerRadius * Math.cos(angle),
        y2: cy + outerRadius * Math.sin(angle),
        isHour: false
      });
    }
  }

  return (
    <div className="xp-analog-clock">
      <svg viewBox="0 0 120 120">
        <defs>
          <linearGradient id="clockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e8e8e8" />
          </linearGradient>
          <filter id="clockShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* Clock face */}
        <circle cx={cx} cy={cy} r={radius} className="clock-face" />
        <circle cx={cx} cy={cy} r={radius - 3} className="clock-face-inner" />

        {/* Tick marks */}
        {markers.map((marker, i) => (
          <line
            key={i}
            x1={marker.x1}
            y1={marker.y1}
            x2={marker.x2}
            y2={marker.y2}
            className="clock-tick"
            strokeWidth={marker.isHour ? 2 : 0.5}
          />
        ))}

        {/* Numbers */}
        {numbers.map((num, i) => (
          <text
            key={i}
            x={num.x}
            y={num.y}
            className="clock-number"
          >
            {num.text}
          </text>
        ))}

        {/* Hour hand */}
        <line
          x1={cx}
          y1={cy}
          x2={hourHand.x}
          y2={hourHand.y}
          className="clock-hand hour"
          filter="url(#clockShadow)"
        />

        {/* Minute hand */}
        <line
          x1={cx}
          y1={cy}
          x2={minuteHand.x}
          y2={minuteHand.y}
          className="clock-hand minute"
          filter="url(#clockShadow)"
        />

        {/* Second hand */}
        <line
          x1={cx}
          y1={cy}
          x2={secondHand.x}
          y2={secondHand.y}
          className="clock-hand second"
        />

        {/* Center cap */}
        <circle cx={cx} cy={cy} r={4} className="clock-center" />
      </svg>
    </div>
  );
}
