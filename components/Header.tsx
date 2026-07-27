import { Lock, User } from "lucide-react";
import { lock } from "@/app/actions/auth";

export function Header() {
  return (
    <header className="safe-top sticky top-0 z-10 flex items-center justify-between bg-ink px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-white">
          <User size={18} />
        </span>
        <p className="text-lg font-bold leading-tight text-white">
          Lifestyle<span className="text-pink">.</span>
        </p>
      </div>
      <form action={lock}>
        <button
          type="submit"
          aria-label="Lock"
          className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white"
        >
          <Lock size={18} />
        </button>
      </form>
    </header>
  );
}
