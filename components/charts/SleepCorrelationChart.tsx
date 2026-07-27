"use client";

type Bucket = { label: string; avgMood: number | null; avgEnergy: number | null; count: number };

const HEIGHT = 140;
const BAR_W = 16;
const GAP = 6;
const GROUP_W = BAR_W * 2 + GAP + 24;
const MAX_SCALE = 5;
const MOOD_COLOR = "#c7f53b";
const ENERGY_COLOR = "#5b9bff";

export function SleepCorrelationChart({ buckets }: { buckets: Bucket[] }) {
  const width = buckets.length * GROUP_W;
  const baseline = HEIGHT - 20;
  const scale = (v: number) => (v / MAX_SCALE) * (baseline - 10);

  const hasData = buckets.some((b) => b.count > 0);
  if (!hasData) {
    return <p className="text-center text-sm text-charcoal-soft">Log a few nights of sleep to see the pattern.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs text-charcoal-soft">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: MOOD_COLOR }} />
          Avg mood next day
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ENERGY_COLOR }} />
          Avg energy next day
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${HEIGHT}`} className="w-full" style={{ height: HEIGHT }}>
        <line x1={0} x2={width} y1={baseline} y2={baseline} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
        {buckets.map((b, i) => {
          const groupX = i * GROUP_W + 12;
          const moodH = b.avgMood != null ? scale(b.avgMood) : 0;
          const energyH = b.avgEnergy != null ? scale(b.avgEnergy) : 0;
          return (
            <g key={b.label}>
              <rect x={groupX} y={baseline - moodH} width={BAR_W} height={Math.max(moodH, b.avgMood != null ? 2 : 0)} rx={4} fill={MOOD_COLOR} opacity={b.count > 0 ? 1 : 0.25} />
              <rect x={groupX + BAR_W + GAP} y={baseline - energyH} width={BAR_W} height={Math.max(energyH, b.avgEnergy != null ? 2 : 0)} rx={4} fill={ENERGY_COLOR} opacity={b.count > 0 ? 1 : 0.25} />
              <text x={groupX + BAR_W + GAP / 2} y={HEIGHT - 4} textAnchor="middle" fontSize={12} fill="#8e8e93">
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
