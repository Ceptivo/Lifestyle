"use client";

import { useMemo, useState } from "react";
import { INCOME_COLOR, EXPENSE_COLOR } from "@/lib/chart-colors";

type MonthTotal = { label: string; income: number; expense: number; incomeFormatted: string; expenseFormatted: string };
type Hovered = { monthIndex: number; type: "income" | "expense" } | null;

const HEIGHT = 140;
const BAR_W = 16;
const GAP = 6;
const GROUP_W = BAR_W * 2 + GAP + 20;

export function MiniColumnChart({ months }: { months: MonthTotal[] }) {
  const [hovered, setHovered] = useState<Hovered>(null);
  const width = months.length * GROUP_W;
  const max = useMemo(() => Math.max(1, ...months.flatMap((m) => [m.income, m.expense])), [months]);

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
          <line x1={0} x2={width} y1={baseline} y2={baseline} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
          {months.map((m, i) => {
            const groupX = i * GROUP_W + 10;
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
                  fontSize={11}
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
            style={{ left: `${((hovered.monthIndex * GROUP_W + GROUP_W / 2) / width) * 100}%` }}
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
