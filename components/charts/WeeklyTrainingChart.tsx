"use client";

import { useState } from "react";

type WeekPoint = { label: string; hours: number; hoursFormatted: string };
type GridLine = { value: number; label: string };

const HEIGHT = 140;
const BAR_W = 22;
const LABEL_W = 40;

export function WeeklyTrainingChart({ weeks, gridLines }: { weeks: WeekPoint[]; gridLines: GridLine[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const groupW = BAR_W + 20;
  const chartWidth = weeks.length * groupW;
  const width = chartWidth + LABEL_W;
  const max = Math.max(1, gridLines[0]?.value ?? 1);

  const baseline = HEIGHT - 20;
  const scale = (v: number) => (v / max) * (baseline - 10);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${HEIGHT}`} className="w-full" style={{ height: HEIGHT }}>
        {gridLines.map((g, i) => {
          const y = baseline - scale(g.value);
          return (
            <g key={i}>
              <line
                x1={LABEL_W}
                x2={width}
                y1={y}
                y2={y}
                stroke={g.value === 0 ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.08)"}
                strokeWidth={1}
              />
              <text x={LABEL_W - 8} y={y + 4} textAnchor="end" fontSize={12} fill="#8e8e93">
                {g.label}
              </text>
            </g>
          );
        })}
        {weeks.map((w, i) => {
          const x = LABEL_W + i * groupW + (groupW - BAR_W) / 2;
          const h = scale(w.hours);
          return (
            <g key={w.label}>
              <rect
                x={x}
                y={baseline - h}
                width={BAR_W}
                height={Math.max(h, 1)}
                rx={5}
                fill="#c7f53b"
                opacity={hovered !== null && hovered !== i ? 0.5 : 1}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered(null)}
              />
              <text x={x + BAR_W / 2} y={HEIGHT - 4} textAnchor="middle" fontSize={12} fill="#8e8e93">
                {w.label}
              </text>
            </g>
          );
        })}
      </svg>

      {hovered !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-xl border border-border bg-paper px-3 py-2"
          style={{ left: `${((LABEL_W + hovered * groupW + groupW / 2) / width) * 100}%` }}
        >
          <p className="text-xs text-charcoal-soft">{weeks[hovered].label}</p>
          <p className="text-sm font-semibold tabular-nums text-charcoal">{weeks[hovered].hoursFormatted}</p>
        </div>
      )}
    </div>
  );
}
