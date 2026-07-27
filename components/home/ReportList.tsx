import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { ReportItem } from "@/lib/daily-report";

const TONE_CLASSES: Record<ReportItem["tone"], string> = {
  alert: "bg-danger-soft text-danger",
  tip: "bg-pink-soft text-pink-dark",
  info: "bg-white/5 text-charcoal-soft",
};

export function ReportList({ items }: { items: ReportItem[] }) {
  if (!items.length) {
    return (
      <Card>
        <p className="text-center text-sm text-charcoal-soft">
          Nothing urgent today — you&rsquo;re on top of things.
        </p>
      </Card>
    );
  }

  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={item.href}>
            <Card className="flex items-center gap-3 px-4 py-3.5">
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", TONE_CLASSES[item.tone])}>
                <Icon name={item.icon} size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-charcoal">{item.title}</p>
                <p className="truncate text-xs text-charcoal-soft">{item.body}</p>
              </div>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
