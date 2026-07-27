import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency } from "@/lib/format";

export function AccountsSummary({
  accounts,
}: {
  accounts: { id: string; name: string; icon: string; balance: number }[];
}) {
  if (!accounts.length) {
    return (
      <Card className="text-center text-sm text-charcoal-soft">
        No accounts yet.{" "}
        <Link href="/finance/accounts" className="font-medium text-pink-dark">
          Add one
        </Link>
        .
      </Card>
    );
  }

  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <div className="flex w-max gap-3">
        {accounts.map((account) => {
          return (
            <Link key={account.id} href="/finance/accounts">
              <Card className="w-40 px-4 py-3.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
                  <Icon name={account.icon} size={16} />
                </span>
                <p className="mt-2.5 truncate text-sm text-charcoal-soft">{account.name}</p>
                <p className="truncate text-base font-bold tabular-nums text-charcoal">
                  {formatCurrency(account.balance)}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
