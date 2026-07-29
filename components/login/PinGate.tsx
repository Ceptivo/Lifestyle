"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { unlock } from "@/app/actions/auth";

const LOCKOUT_MS = 60_000;
const LOCKOUT_KEY = "lifestyle-pin-lockout-until";

type Stage = "form" | "accusation" | "question" | "gotcha" | "locked";

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6">
      <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-ink p-6 text-center shadow-xl">
        {children}
      </div>
    </div>
  );
}

export function PinGate() {
  const [stage, setStage] = useState<Stage>("form");
  const [surname, setSurname] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Syncs from localStorage (an external system) on mount — the lockout
    // deadline can't be known during SSR, so this one-time correction after
    // hydration is unavoidable.
    const until = Number(localStorage.getItem(LOCKOUT_KEY) ?? 0);
    const remaining = until - Date.now();
    if (remaining > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStage("locked");
      const t = setTimeout(() => setStage("form"), remaining);
      return () => clearTimeout(t);
    }
  }, []);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await unlock(formData);
      if (result?.error) {
        formRef.current?.reset();
        setStage("accusation");
      }
    });
  }

  function handleSurnameSubmit(e: React.FormEvent) {
    e.preventDefault();
    const until = Date.now() + LOCKOUT_MS;
    localStorage.setItem(LOCKOUT_KEY, String(until));
    setStage("gotcha");
  }

  function dismissGotcha() {
    setStage("locked");
    setTimeout(() => setStage("form"), LOCKOUT_MS);
  }

  if (stage === "locked") {
    return (
      <div className="w-full max-w-xs text-center">
        <p className="text-2xl font-bold text-white">
          Lifestyle<span className="text-pink">.</span>
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-xs">
        <p className="mb-1 text-center text-2xl font-bold text-white">
          Lifestyle<span className="text-pink">.</span>
        </p>
        <p className="mb-8 text-center text-sm text-white/50">Enter your PIN to continue</p>

        <form ref={formRef} action={handleSubmit} className="space-y-4">
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
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-pink px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-pink-dark disabled:opacity-60"
          >
            {isPending ? "Checking…" : "Unlock"}
          </button>
        </form>
      </div>

      {stage === "accusation" && (
        <Modal>
          <p className="mb-5 text-lg font-bold text-white">
            HEY! You are NOT Luke, so F*CK OFF… unless you are?
          </p>
          <button
            type="button"
            onClick={() => setStage("question")}
            className="w-full rounded-full bg-pink px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-pink-dark"
          >
            I am Luke
          </button>
        </Modal>
      )}

      {stage === "question" && (
        <Modal>
          <p className="mb-4 text-base font-semibold text-white">If you are Luke, what is my surname?</p>
          <form onSubmit={handleSurnameSubmit} className="space-y-3">
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              autoFocus
              placeholder="Surname"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-pink"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-pink px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-pink-dark"
            >
              Submit
            </button>
          </form>
        </Modal>
      )}

      {stage === "gotcha" && (
        <Modal>
          <p className="mb-5 text-lg font-bold text-white">HAHAH! You really thought MF! 😂</p>
          <button
            type="button"
            onClick={dismissGotcha}
            className="w-full rounded-full bg-pink px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-pink-dark"
          >
            ...
          </button>
        </Modal>
      )}
    </>
  );
}
