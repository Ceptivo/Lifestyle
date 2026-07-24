import { Lock } from "lucide-react";
import { lock } from "@/app/actions/auth";

export function Header() {
  return (
    <header className="safe-top sticky top-0 z-10 flex items-center justify-between bg-ink px-5 py-4">
      <div>
        <p className="font-serif text-lg leading-tight text-white">
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
