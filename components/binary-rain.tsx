"use client";

import { useRef, useEffect } from "react";

// useMountEffect: escape hatch for one-time external DOM sync on mount.
function useMountEffect(fn: () => void | (() => void)) {
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(fn, []);
}

const CHARS = "01";
const FONT_SIZE = 13;
const SPEED_MIN = 0.3;
const SPEED_MAX = 0.9;
const OPACITY = 0.45; // max column opacity — stays subtle behind content

type Column = {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  len: number;
};

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

export function BinaryRain({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let cols: Column[] = [];

    function init() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const count = Math.floor(canvas.width / (FONT_SIZE * 1.2));
      cols = Array.from({ length: count }, (_, i) => ({
        x: i * (FONT_SIZE * 1.2) + FONT_SIZE * 0.1,
        y: -(Math.random() * canvas!.height),
        speed: SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN),
        chars: Array.from({ length: 24 }, randomChar),
        len: 10 + Math.floor(Math.random() * 14),
      }));
    }

    function getInkColor(): string {
      // Canvas can't use CSS vars directly; resolve to a hex-ish value.
      // We set a known fallback per theme on a hidden element.
      const el = document.documentElement;
      const raw = getComputedStyle(el).getPropertyValue("--ink").trim();
      // If it's an oklch value the browser can't use directly in canvas fillStyle,
      // so we bounce it through a temporary element's color.
      const tmp = document.createElement("div");
      tmp.style.cssText = `color:${raw};position:absolute;opacity:0`;
      el.appendChild(tmp);
      const resolved = getComputedStyle(tmp).color || "#39e75f";
      el.removeChild(tmp);
      return resolved;
    }

    let inkColor = getInkColor();
    // Re-resolve colour whenever data-theme changes on <html>
    const mo = new MutationObserver(() => { inkColor = getInkColor(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    function draw() {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FONT_SIZE}px monospace`;

      for (const col of cols) {
        for (let i = 0; i < col.len; i++) {
          const charY = col.y - i * FONT_SIZE;
          if (charY < -FONT_SIZE || charY > canvas.height) continue;

          const frac = 1 - i / col.len;
          ctx.globalAlpha = frac * OPACITY;
          ctx.fillStyle = inkColor;

          if (Math.random() < 0.02) col.chars[i % col.chars.length] = randomChar();
          ctx.fillText(col.chars[i % col.chars.length], col.x, charY);
        }

        col.y += col.speed;
        if (col.y - col.len * FONT_SIZE > canvas.height) {
          col.y = -(Math.random() * canvas.height * 0.5);
          col.speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
          col.len = 10 + Math.floor(Math.random() * 14);
        }
      }

      raf = requestAnimationFrame(draw);
    }

    init();
    raf = requestAnimationFrame(draw);

    const ro = new ResizeObserver(() => {
      init();
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      ro.disconnect();
    };
  });

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      style={{ color: "var(--ink)" }}
    />
  );
}
