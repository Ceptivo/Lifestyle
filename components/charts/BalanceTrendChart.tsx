"use client";

import { useMemo, useRef, useState } from "react";

type Point = { date: string; balance: number; dateFormatted: string; balanceFormatted: string };

const WIDTH = 600;
const HEIGHT = 180;
const PAD_X = 8;
const PAD_TOP = 20;
const PAD_BOTTOM = 8;

export function BalanceTrendChart({
  points,
  maxFormatted,
  minFormatted,
}: {
  points: Point[];
  maxFormatted: string;
  minFormatted: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { linePath, areaPath, zeroY, scaleX, scaleY, min } = useMemo(() => {
    const values = points.map((p) => p.balance);
    const rawMin = Math.min(0, ...values);
    const rawMax = Math.max(...values, 0.01);
    const span = rawMax - rawMin || 1;

    const innerW = WIDTH - PAD_X * 2;
    const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM;

    const sx = (i: number) => (points.length <= 1 ? PAD_X : PAD_X + (i / (points.length - 1)) * innerW);
    const sy = (v: number) => PAD_TOP + innerH - ((v - rawMin) / span) * innerH;

    const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${sx(i).toFixed(2)},${sy(p.balance).toFixed(2)}`).join(" ");
    const area = `${line} L${sx(points.length - 1).toFixed(2)},${sy(rawMin).toFixed(2)} L${sx(0).toFixed(2)},${sy(rawMin).toFixed(2)} Z`;

    return { linePath: line, areaPath: area, zeroY: sy(0), scaleX: sx, scaleY: sy, min: rawMin };
  }, [points]);

  if (points.length < 2) {
    return <p className="text-center text-sm text-charcoal-soft">Not enough history yet for a trend.</p>;
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
  const activeY = scaleY(activePoint.balance);
  const tooltipRight = activeX > WIDTH * 0.6;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none"
        style={{ height: 180 }}
        onPointerMove={(e) => handleMove(e.clientX)}
        onPointerLeave={() => setHoverIndex(null)}
        onPointerDown={(e) => handleMove(e.clientX)}
      >
        {min < 0 && (
          <line x1={PAD_X} x2={WIDTH - PAD_X} y1={zeroY} y2={zeroY} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
        )}
        <path d={areaPath} fill="#c7f53b" fillOpacity={0.14} stroke="none" />
        <path d={linePath} fill="none" stroke="#c7f53b" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {hoverIndex !== null && (
          <line x1={activeX} x2={activeX} y1={PAD_TOP} y2={HEIGHT - PAD_BOTTOM} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
        )}
        <circle cx={activeX} cy={activeY} r={4} fill="#c7f53b" stroke="#19191c" strokeWidth={2} />

        <text x={PAD_X} y={14} textAnchor="start" fontSize={11} fill="#8e8e93">
          {maxFormatted}
        </text>
        {min < 0 && (
          <text x={PAD_X} y={HEIGHT - 2} textAnchor="start" fontSize={11} fill="#8e8e93">
            {minFormatted}
          </text>
        )}
      </svg>

      <div
        className="pointer-events-none absolute top-0 rounded-xl border border-border bg-paper px-3 py-2"
        style={{
          left: `${(activeX / WIDTH) * 100}%`,
          transform: tooltipRight ? "translate(calc(-100% - 8px), 0)" : "translate(8px, 0)",
        }}
      >
        <p className="text-xs text-charcoal-soft">{activePoint.dateFormatted}</p>
        <p className="text-sm font-semibold tabular-nums text-charcoal">{activePoint.balanceFormatted}</p>
      </div>
    </div>
  );
}
