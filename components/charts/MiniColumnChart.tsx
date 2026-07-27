"use client";

import { useState } from "react";
import { INCOME_COLOR, EXPENSE_COLOR } from "@/lib/chart-colors";

type MonthTotal = { label: string; income: number; expense: number; incomeFormatted: string; expenseFormatted: string };
type GridLine = { value: number; label: string };
type Hovered = { monthIndex: number; type: "income" | "expense" } | null;

const HEIGHT = 140;
const BAR_W = 16;
const GAP = 6;
const GROUP_W = BAR_W * 2 + GAP + 20;
const LABEL_W = 84;

export function MiniColumnChart({ months, gridLines }: { months: MonthTotal[]; gridLines: GridLine[] }) {
  const [hovered, setHovered] = useState<Hovered>(null);
  const chartWidth = months.length * GROUP_W;
  const width = chartWidth + LABEL_W;
  const max = Math.max(1, gridLines[0]?.value ?? 1);

  const baseline = HEIGHT - 20;
  const scale = (v: number) => (v / max) * (baseline - 10);

  const hoveredData = hovered ? months[hovered.monthIndex] : null;
  const hoveredValueFormatted = hoveredData
    ? hovered!.type === "income"
      ? hoveredData.incomeFormatted
      : hoveredData.expenseFormatted
    : "";

  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs text-charcoal-soft">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: INCOME_COLOR }} />
          Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: EXPENSE_COLOR }} />
          Expenses
        </span>
      </div>

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
          {months.map((m, i) => {
            const groupX = LABEL_W + i * GROUP_W + 10;
            const incomeH = scale(m.income);
            const expenseH = scale(m.expense);
            const isIncomeHovered = hovered?.monthIndex === i && hovered.type === "income";
            const isExpenseHovered = hovered?.monthIndex === i && hovered.type === "expense";
            return (
              <g key={m.label}>
                <rect
                  x={groupX}
                  y={baseline - incomeH}
                  width={BAR_W}
                  height={Math.max(incomeH, 1)}
                  rx={4}
                  fill={INCOME_COLOR}
                  opacity={hovered && !isIncomeHovered ? 0.5 : 1}
                  onPointerEnter={() => setHovered({ monthIndex: i, type: "income" })}
                  onPointerLeave={() => setHovered(null)}
                />
                <rect
                  x={groupX + BAR_W + GAP}
                  y={baseline - expenseH}
                  width={BAR_W}
                  height={Math.max(expenseH, 1)}
                  rx={4}
                  fill={EXPENSE_COLOR}
                  opacity={hovered && !isExpenseHovered ? 0.5 : 1}
                  onPointerEnter={() => setHovered({ monthIndex: i, type: "expense" })}
                  onPointerLeave={() => setHovered(null)}
                />
                <text
                  x={groupX + BAR_W + GAP / 2}
                  y={HEIGHT - 4}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#8e8e93"
                >
                  {m.label.split(" ")[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {hovered && hoveredData && (
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-xl border border-border bg-paper px-3 py-2"
            style={{ left: `${((LABEL_W + hovered.monthIndex * GROUP_W + GROUP_W / 2) / width) * 100}%` }}
          >
            <p className="text-xs text-charcoal-soft">
              {hoveredData.label} · {hovered.type === "income" ? "Income" : "Expenses"}
            </p>
            <p className="text-sm font-semibold tabular-nums text-charcoal">{hoveredValueFormatted}</p>
          </div>
        )}
      </div>
    </div>
  );
}
