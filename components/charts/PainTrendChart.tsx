"use client";

import { useMemo, useRef, useState } from "react";

type Point = { date: string; severity: number; dateFormatted: string; symptom: string };

const WIDTH = 600;
const PLOT_HEIGHT = 160;
const AXIS_H = 20;
const HEIGHT = PLOT_HEIGHT + AXIS_H;
const PAD_X = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 8;

export function PainTrendChart({ points }: { points: Point[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { linePath, scaleX, scaleY } = useMemo(() => {
    const innerW = WIDTH - PAD_X * 2;
    const innerH = PLOT_HEIGHT - PAD_TOP - PAD_BOTTOM;
    const sx = (i: number) => (points.length <= 1 ? PAD_X : PAD_X + (i / (points.length - 1)) * innerW);
    const sy = (v: number) => PAD_TOP + innerH - (v / 10) * innerH;
    const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${sx(i).toFixed(2)},${sy(p.severity).toFixed(2)}`).join(" ");
    return { linePath: line, scaleX: sx, scaleY: sy };
  }, [points]);

  if (points.length < 2) {
    return <p className="text-center text-sm text-charcoal-soft">Log a couple of entries to see a trend.</p>;
  }

  function handleMove(clientX: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const index = Math.round(ratio * (points.length - 1));
    setHoverIndex(Math.min(points.length - 1, Math.max(0, index)));
  }

  const active = hoverIndex ?? points.length - 1;
  const activePoint = points[active];
  const activeX = scaleX(active);
  const activeY = scaleY(activePoint.severity);
  const tooltipRight = activeX > WIDTH * 0.6;
  const xTickIndices = Array.from(new Set([0, Math.round((points.length - 1) / 2), points.length - 1]));

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-pan-y"
        style={{ height: HEIGHT }}
        onPointerMove={(e) => handleMove(e.clientX)}
        onPointerLeave={() => setHoverIndex(null)}
        onPointerDown={(e) => handleMove(e.clientX)}
      >
        {[0, 5, 10].map((v) => (
          <g key={v}>
            <line x1={PAD_X} x2={WIDTH - PAD_X} y1={scaleY(v)} y2={scaleY(v)} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
            <text x={WIDTH - PAD_X} y={scaleY(v) - 4} textAnchor="end" fontSize={12} fill="#8e8e93">
              {v}
            </text>
          </g>
        ))}

        <path d={linePath} fill="none" stroke="#ff7452" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {hoverIndex !== null && (
          <line x1={activeX} x2={activeX} y1={PAD_TOP} y2={PLOT_HEIGHT - PAD_BOTTOM} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
        )}
        <circle cx={activeX} cy={activeY} r={4} fill="#ff7452" stroke="#19191c" strokeWidth={2} />

        {xTickIndices.map((i) => (
          <text
            key={i}
            x={scaleX(i)}
            y={PLOT_HEIGHT + 14}
            textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
            fontSize={12}
            fill="#8e8e93"
          >
            {points[i].dateFormatted}
          </text>
        ))}
      </svg>

      <div
        className="pointer-events-none absolute top-0 rounded-xl border border-border bg-paper px-3 py-2"
        style={{
          left: `${(activeX / WIDTH) * 100}%`,
          transform: tooltipRight ? "translate(calc(-100% - 8px), 0)" : "translate(8px, 0)",
        }}
      >
        <p className="text-xs text-charcoal-soft">{activePoint.dateFormatted}</p>
        <p className="text-sm font-semibold tabular-nums text-charcoal">
          {activePoint.symptom} · {activePoint.severity}/10
        </p>
      </div>
    </div>
  );
}
