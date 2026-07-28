"use client";

import { useState, useTransition } from "react";
import { Trash2, Eye, EyeOff, Copy } from "lucide-react";
import { revealCredential, deleteCredential } from "@/app/actions/personal";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

export type Credential = { id: string; serviceName: string; username: string | null; url: string | null; notes: string | null; icon: string };

function CredentialRow({ credential }: { credential: Credential }) {
  const [revealed, setRevealed] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleReveal() {
    if (revealed) {
      setRevealed(null);
      return;
    }
    startTransition(async () => {
      const password = await revealCredential(credential.id);
      setRevealed(password);
    });
  }

  return (
    <Card className="px-4 py-3.5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink-dark">
          <Icon name={credential.icon} size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-charcoal">{credential.serviceName}</p>
          {credential.username && <p className="truncate text-xs text-charcoal-soft">{credential.username}</p>}
        </div>
        <form action={deleteCredential.bind(null, credential.id)}>
          <button type="submit" aria-label="Delete account" className="shrink-0 rounded-full p-1.5 text-charcoal-soft hover:bg-cream hover:text-danger">
            <Trash2 size={14} />
          </button>
        </form>
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <div className="flex-1 rounded-lg bg-cream px-3 py-2 font-mono text-sm text-charcoal">
          {revealed ?? "••••••••••••"}
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={toggleReveal}
          aria-label={revealed ? "Hide password" : "Reveal password"}
          className="shrink-0 rounded-full p-2 text-charcoal-soft hover:bg-cream hover:text-charcoal"
        >
          {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        {revealed && (
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(revealed)}
            aria-label="Copy password"
            className="shrink-0 rounded-full p-2 text-charcoal-soft hover:bg-cream hover:text-charcoal"
          >
            <Copy size={16} />
          </button>
        )}
      </div>
      {credential.notes && <p className="mt-2 text-xs text-charcoal-soft">{credential.notes}</p>}
    </Card>
  );
}

export function CredentialList({ credentials }: { credentials: Credential[] }) {
  if (!credentials.length) {
    return <p className="text-center text-sm text-charcoal-soft">No accounts saved yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {credentials.map((c) => (
        <li key={c.id}>
          <CredentialRow credential={c} />
        </li>
      ))}
    </ul>
  );
}
