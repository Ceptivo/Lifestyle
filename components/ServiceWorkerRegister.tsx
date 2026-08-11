"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => registration.update().catch(() => {}))
      .catch(() => {});

    // When a new deploy's service worker takes over, reload once so the
    // page actually runs the fresh code — otherwise a tab left open across
    // a deploy can keep showing outdated app behavior indefinitely, with no
    // way for the user to tell a reload didn't actually help.
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  }, []);

  return null;
}
