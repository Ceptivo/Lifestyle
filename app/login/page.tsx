import { unlock } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-ink px-6">
      <div className="w-full max-w-xs">
        <p className="mb-1 text-center text-2xl font-bold text-white">
          Lifestyle<span className="text-pink">.</span>
        </p>
        <p className="mb-8 text-center text-sm text-white/50">Enter your PIN to continue</p>

        <form action={unlock} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            name="pin"
            autoFocus
            required
            maxLength={12}
            placeholder="•••••"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-lg tracking-[0.5em] text-white placeholder:tracking-normal placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-pink"
          />
          {error && <p className="text-center text-sm text-danger">Incorrect PIN. Try again.</p>}
          <button
            type="submit"
            className="w-full rounded-full bg-pink px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-pink-dark"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
