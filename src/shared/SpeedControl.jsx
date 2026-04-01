import React, { useRef, useCallback } from 'react';

/**
 * Drag-up/down speed control.
 * Drag up = faster, drag down = slower. Snaps to 0.05 increments.
 *
 * Props:
 *   displayRate - current display rate (number)
 *   displayRateLabel - formatted label string (e.g. "1.0x")
 *   setSpeed - function(newDisplayRate)
 *   className - CSS class for the container
 */
export default function SpeedControl({ displayRate, displayRateLabel, setSpeed, className }) {
  const dragRef = useRef(null);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startY: e.clientY, startRate: displayRate };
  }, [displayRate]);

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current) return;
    // Drag up = increase speed, drag down = decrease
    // 100px of drag = 1.0x change
    const deltaY = dragRef.current.startY - e.clientY;
    const deltaRate = deltaY / 100;
    const newRate = dragRef.current.startRate + deltaRate;
    setSpeed(newRate);
  }, [setSpeed]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  // Double-click to reset to 1.0x
  const handleDoubleClick = useCallback(() => {
    setSpeed(1.0);
  }, [setSpeed]);

  return (
    <span
      className={className}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      title="Drag up/down to adjust speed. Double-click to reset."
      style={{ touchAction: 'none', userSelect: 'none', cursor: 'ns-resize' }}
    >
      {displayRateLabel}
    </span>
  );
}
