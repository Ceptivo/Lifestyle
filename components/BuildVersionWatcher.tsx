"use client";

import { useEffect } from "react";

// Detects a stale client independently of the service worker — polling here
// never touches the SW cache path, so it still works even if a device's SW
// update lifecycle is stuck or unsupported (e.g. some installed-PWA setups).
// Checks on an interval and, importantly, whenever the app regains focus —
// the exact moment someone reopens a backgrounded PWA — since that's when a
// stale build is most likely to have been sitting untouched across a deploy.
export function BuildVersionWatcher({ buildId }: { buildId: string }) {
  useEffect(() => {
    if (!buildId) return;
    let reloaded = false;

    const check = async () => {
      if (reloaded) return;
      try {
        const res = await fetch("/api/build-id", { cache: "no-store" });
        const data = (await res.json()) as { buildId: string };
        if (data.buildId && data.buildId !== buildId) {
          reloaded = true;
          window.location.reload();
        }
      } catch {
        // Offline or a blip — nothing to do, next check will retry.
      }
    };

    const interval = setInterval(check, 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", check);
    check();

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", check);
    };
  }, [buildId]);

  return null;
}
