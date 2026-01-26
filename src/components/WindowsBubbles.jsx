import React, { useRef, useEffect, useCallback } from 'react';

const BUBBLE_COLORS = [
  'rgba(0, 120, 215, 0.6)',   // Windows blue
  'rgba(0, 153, 188, 0.6)',   // Teal
  'rgba(122, 165, 206, 0.6)', // Light blue
  'rgba(0, 99, 177, 0.6)',    // Deep blue
  'rgba(86, 156, 214, 0.6)',  // Sky blue
  'rgba(0, 188, 212, 0.6)',   // Cyan
  'rgba(100, 181, 246, 0.6)', // Soft blue
];

const COLLISION_COLORS = [
  'rgba(255, 152, 0, 0.7)',   // Orange
  'rgba(255, 193, 7, 0.7)',   // Amber
  'rgba(76, 175, 80, 0.7)',   // Green
  'rgba(156, 39, 176, 0.7)',  // Purple
  'rgba(233, 30, 99, 0.7)',   // Pink
];

class Bubble {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset(true);
  }

  reset(initial = false) {
    const minSize = 30;
    const maxSize = 120;
    this.radius = minSize + Math.random() * (maxSize - minSize);

    if (initial) {
      this.x = this.radius + Math.random() * (this.canvas.width - this.radius * 2);
      this.y = this.radius + Math.random() * (this.canvas.height - this.radius * 2);
    } else {
      // Spawn from edges
      const edge = Math.floor(Math.random() * 4);
      switch (edge) {
        case 0: // Top
          this.x = Math.random() * this.canvas.width;
          this.y = -this.radius;
          break;
        case 1: // Right
          this.x = this.canvas.width + this.radius;
          this.y = Math.random() * this.canvas.height;
          break;
        case 2: // Bottom
          this.x = Math.random() * this.canvas.width;
          this.y = this.canvas.height + this.radius;
          break;
        default: // Left
          this.x = -this.radius;
          this.y = Math.random() * this.canvas.height;
          break;
      }
    }

    const speed = 0.3 + Math.random() * 0.7;
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
    this.targetColor = this.color;
    this.colorTransition = 0;
    this.opacity = 0.4 + Math.random() * 0.3;
    this.popping = false;
    this.popProgress = 0;
  }

  update() {
    if (this.popping) {
      this.popProgress += 0.1;
      if (this.popProgress >= 1) {
        this.reset(false);
        return;
      }
      return;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Bounce off edges
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx *= -1;
    } else if (this.x + this.radius > this.canvas.width) {
      this.x = this.canvas.width - this.radius;
      this.vx *= -1;
    }

    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy *= -1;
    } else if (this.y + this.radius > this.canvas.height) {
      this.y = this.canvas.height - this.radius;
      this.vy *= -1;
    }

    // Color transition
    if (this.colorTransition > 0) {
      this.colorTransition -= 0.02;
      if (this.colorTransition <= 0) {
        this.color = this.targetColor;
        this.targetColor = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
      }
    }
  }

  draw(ctx) {
    ctx.save();

    if (this.popping) {
      const scale = 1 + this.popProgress * 0.5;
      const alpha = 1 - this.popProgress;
      ctx.globalAlpha = alpha * this.opacity;
      ctx.translate(this.x, this.y);
      ctx.scale(scale, scale);
      ctx.translate(-this.x, -this.y);
    }

    // Main bubble gradient
    const gradient = ctx.createRadialGradient(
      this.x - this.radius * 0.3,
      this.y - this.radius * 0.3,
      0,
      this.x,
      this.y,
      this.radius
    );

    const baseColor = this.colorTransition > 0
      ? this.lerpColor(this.color, this.targetColor, 1 - this.colorTransition)
      : this.color;

    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(0.5, baseColor);
    gradient.addColorStop(1, baseColor.replace(/[\d.]+\)$/, '0.2)'));

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.globalAlpha = this.popping ? ctx.globalAlpha : this.opacity;
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.ellipse(
      this.x - this.radius * 0.35,
      this.y - this.radius * 0.35,
      this.radius * 0.25,
      this.radius * 0.15,
      -Math.PI / 4,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();

    // Subtle rim
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius - 1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  lerpColor(color1, color2, t) {
    const parse = (c) => {
      const match = c.match(/[\d.]+/g);
      return match ? match.map(Number) : [0, 0, 0, 0];
    };
    const c1 = parse(color1);
    const c2 = parse(color2);
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
    const a = c1[3] + (c2[3] - c1[3]) * t;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  collidesWith(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius + other.radius;
  }

  resolveCollision(other) {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // Normal vector
    const nx = dx / distance;
    const ny = dy / distance;

    // Relative velocity
    const dvx = this.vx - other.vx;
    const dvy = this.vy - other.vy;

    // Relative velocity in collision normal direction
    const dvn = dvx * nx + dvy * ny;

    // Don't resolve if velocities are separating
    if (dvn > 0) return;

    // Collision impulse (equal mass)
    const impulse = dvn;

    // Apply impulse
    this.vx -= impulse * nx * 0.5;
    this.vy -= impulse * ny * 0.5;
    other.vx += impulse * nx * 0.5;
    other.vy += impulse * ny * 0.5;

    // Separate bubbles
    const overlap = (this.radius + other.radius - distance) / 2;
    this.x -= overlap * nx;
    this.y -= overlap * ny;
    other.x += overlap * nx;
    other.y += overlap * ny;

    // Change colors on collision
    const collisionColor = COLLISION_COLORS[Math.floor(Math.random() * COLLISION_COLORS.length)];
    this.targetColor = collisionColor;
    this.colorTransition = 1;
    other.targetColor = collisionColor;
    other.colorTransition = 1;
  }

  containsPoint(x, y) {
    const dx = x - this.x;
    const dy = y - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
  }

  pop() {
    this.popping = true;
    this.popProgress = 0;
  }
}

export default function WindowsBubbles({ bubbleCount = 12 }) {
  const canvasRef = useRef(null);
  const bubblesRef = useRef([]);
  const animationRef = useRef(null);
  const isVisibleRef = useRef(true);

  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check bubbles in reverse order (top bubbles first)
    for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
      const bubble = bubblesRef.current[i];
      if (!bubble.popping && bubble.containsPoint(x, y)) {
        bubble.pop();
        break;
      }
    }
  }, []);

  const handleVisibilityChange = useCallback(() => {
    isVisibleRef.current = !document.hidden;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Initialize bubbles
    bubblesRef.current = Array.from({ length: bubbleCount }, () => new Bubble(canvas));

    const animate = () => {
      if (!isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and check collisions
      const bubbles = bubblesRef.current;
      for (let i = 0; i < bubbles.length; i++) {
        bubbles[i].update();

        // Check collisions with other bubbles
        for (let j = i + 1; j < bubbles.length; j++) {
          if (!bubbles[i].popping && !bubbles[j].popping && bubbles[i].collidesWith(bubbles[j])) {
            bubbles[i].resolveCollision(bubbles[j]);
          }
        }
      }

      // Draw bubbles
      for (const bubble of bubbles) {
        bubble.draw(ctx);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    canvas.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      canvas.removeEventListener('click', handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [bubbleCount, handleClick, handleVisibilityChange]);

  return (
    <canvas
      ref={canvasRef}
      className="windows-bubbles"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        zIndex: 0,
      }}
    />
  );
}
