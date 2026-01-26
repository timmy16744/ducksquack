import React, { useState, useEffect, useRef, useCallback } from 'react';
import './WindowsBubbles.css';

const rotate = (x, y, sin, cos, reverse) => {
  return reverse
    ? { x: cos * x + sin * y, y: cos * y - sin * x }
    : { x: cos * x - sin * y, y: cos * y + sin * x };
};

const flatten = (arr) =>
  arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);

export default function WindowsBubbles() {
  const [circles, setCircles] = useState([]);
  const containerRef = useRef(null);
  const lastExecRef = useRef(null);
  const lastCollisionsRef = useRef([]);
  const animationRef = useRef(null);
  const circlesRef = useRef([]);
  const bubbleRefs = useRef({});

  // Keep circlesRef in sync
  useEffect(() => {
    circlesRef.current = circles;
  }, [circles]);

  // Direct DOM update - no React re-render
  const updateBubbleDOM = useCallback((circle) => {
    const el = bubbleRefs.current[circle.key];
    if (el) {
      el.style.transform = `translate(${circle.x}px, ${circle.y}px)`;
      el.style.boxShadow = `0 0 2rem hsl(${circle.hue}, 75%, 50%) inset`;
    }
  }, []);

  const update = useCallback((tm) => {
    const currentCircles = circlesRef.current;

    if (lastExecRef.current && currentCircles.length) {
      const diff = tm - lastExecRef.current;
      const container = containerRef.current;
      if (!container) {
        animationRef.current = requestAnimationFrame(update);
        return;
      }

      const box = container.getBoundingClientRect();
      const radiusEl = container.querySelector('#bubbleradius');
      if (!radiusEl) {
        animationRef.current = requestAnimationFrame(update);
        return;
      }
      const radius = radiusEl.getBoundingClientRect().width;

      // Build collision pairs
      const couples = [];
      const active = currentCircles.filter((c) => !c.popped);
      active.forEach((c1) => {
        active.forEach((c2) => {
          if (c1 !== c2) {
            couples.push([c1, c2]);
          }
        });
      });

      // Find collisions
      const collisions = couples.filter((couple) => {
        const dist = Math.sqrt(
          Math.pow(couple[0].y - couple[1].y, 2) +
            Math.pow(couple[0].x - couple[1].x, 2)
        );
        return dist < radius * 2;
      });

      // Filter new collisions
      const newCollisions = collisions.filter((couple) => {
        const key = couple[0].key + couple[1].key;
        return lastCollisionsRef.current.indexOf(key) < 0;
      });

      // Calculate collision responses
      newCollisions.forEach((couple) => {
        const a = couple[0];
        const b = couple[1];

        if (a.collisionFree && b.collisionFree) {
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const collisionAngle = Math.atan2(dy, dx);
          const sin = Math.sin(collisionAngle);
          const cos = Math.cos(collisionAngle);

          const pos_a = { x: 0, y: 0 };
          const pos_b = rotate(dx, dy, sin, cos, true);
          const vel_a = rotate(a.vx, a.vy, sin, cos, true);
          const vel_b = rotate(b.vx, b.vy, sin, cos, true);

          const vxTotal = vel_a.x - vel_b.x;
          vel_a.x =
            ((a.mass - b.mass) * vel_a.x + 2 * b.mass * vel_b.x) /
            (a.mass + b.mass);
          vel_b.x = vxTotal + vel_a.x;

          pos_a.x += vel_a.x;
          pos_b.x += vel_b.x;

          const pos_a_final = rotate(pos_a.x, pos_a.y, sin, cos, false);
          const vel_a_final = rotate(vel_a.x, vel_a.y, sin, cos, false);

          a.new_x = a.x + pos_a_final.x;
          a.new_y = a.y + pos_a_final.y;
          a.new_vx = vel_a_final.x;
          a.new_vy = vel_a_final.y;
        }
      });

      // Apply collision results
      newCollisions.forEach((couple) => {
        const a = couple[0];
        if (a.new_vy !== undefined) {
          a.vx = a.new_vx;
          a.vy = a.new_vy;
          a.x = a.new_x;
          a.y = a.new_y;
          a.hue = (a.hue + 20) % 360;
          // Clean up temp values
          delete a.new_vx;
          delete a.new_vy;
          delete a.new_x;
          delete a.new_y;
        }
      });

      // Track collisions
      lastCollisionsRef.current = collisions.map(
        (couple) => couple[0].key + couple[1].key
      );

      const collided = [...new Set(flatten(newCollisions))];
      const collidedKeys = collided.map((c) => c.key);

      // Update positions - direct DOM manipulation, no React re-render
      currentCircles.forEach((c) => {
        if (c.popped) return;

        c.collisionFree = c.collisionFree || collidedKeys.indexOf(c.key) < 0;

        // Bounce off walls
        if (c.y < 0) {
          c.vy = Math.abs(c.vy);
        } else if (c.y > box.height) {
          c.vy = -Math.abs(c.vy);
        }
        if (c.x < 0) {
          c.vx = Math.abs(c.vx);
        } else if (c.x > box.width) {
          c.vx = -Math.abs(c.vx);
        }

        c.y += c.vy * diff;
        c.x += c.vx * diff;

        // Update DOM directly - no setState!
        updateBubbleDOM(c);
      });
    }

    lastExecRef.current = tm;
    animationRef.current = requestAnimationFrame(update);
  }, [updateBubbleDOM]);

  const handleVisibilityChange = useCallback(() => {
    if (!document.hidden) {
      lastExecRef.current = null; // Reset to avoid huge diff jump
      animationRef.current = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(animationRef.current);
    }
  }, [update]);

  const handleClick = useCallback((evt) => {
    const m = { x: evt.clientX, y: evt.clientY };
    const container = containerRef.current;
    if (!container) return;

    const radiusEl = container.querySelector('#bubbleradius');
    if (!radiusEl) return;
    const radius = radiusEl.getBoundingClientRect().width;

    let nearest = null;
    let nearestDistSq = Infinity;

    circlesRef.current.forEach((c) => {
      if (c.popped) return;
      const dx = m.x - c.x;
      const dy = m.y - c.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < nearestDistSq && distSq < radius * radius) {
        nearest = c;
        nearestDistSq = distSq;
      }
    });

    if (nearest) {
      nearest.popped = true;
      // Only trigger re-render for pop animation
      setCircles([...circlesRef.current]);
    }
  }, []);

  // Initialize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const box = container.getBoundingClientRect();
    const radiusEl = container.querySelector('#bubbleradius');
    if (!radiusEl) return;
    const radius = radiusEl.getBoundingClientRect().width;

    const max = Math.floor(
      (box.width * box.height) / 300 / Math.pow(radius, 1.2)
    );

    const initialCircles = [];
    for (let i = 0; i < max; i++) {
      initialCircles.push({
        key: Math.random(),
        y: Math.random() * box.height,
        x: Math.random() * box.width,
        vx: Math.random() / 5,
        vy: Math.random() / 5,
        hue: Math.random() * 360,
        collisionFree: false,
        mass: 1,
        radius: radius,
        popped: false,
      });
    }

    setCircles(initialCircles);
    circlesRef.current = initialCircles;

    animationRef.current = requestAnimationFrame(update);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [update, handleVisibilityChange]);

  // Store ref to bubble element
  const setBubbleRef = useCallback((key) => (el) => {
    if (el) {
      bubbleRefs.current[key] = el;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="windows-bubbles"
      onClick={handleClick}
    >
      <i id="bubbleradius"></i>
      {circles.map((c) => (
        <span
          key={c.key}
          ref={setBubbleRef(c.key)}
          className={`bubble ${c.popped ? 'popped' : ''}`}
          style={{
            transform: `translate(${c.x}px, ${c.y}px)`,
            boxShadow: `0 0 2rem hsl(${c.hue}, 75%, 50%) inset`,
          }}
        />
      ))}
    </div>
  );
}
