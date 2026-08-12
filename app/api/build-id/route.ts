import { NextResponse } from "next/server";

// Polled by BuildVersionWatcher to detect when a new deploy has gone live.
// Vercel sets VERCEL_GIT_COMMIT_SHA automatically at build time — no
// manual bump needed.
export async function GET() {
  return NextResponse.json(
    { buildId: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev" },
    { headers: { "Cache-Control": "no-store, must-revalidate" } }
  );
}
