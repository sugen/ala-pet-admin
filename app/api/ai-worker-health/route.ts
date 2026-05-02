import { NextResponse } from "next/server";

const aiWorkerBaseUrl = process.env.AI_WORKER_BASE_URL || process.env.NEXT_PUBLIC_AI_WORKER_BASE_URL || "http://127.0.0.1:8092";

export async function GET() {
  try {
    const response = await fetch(new URL("/health", aiWorkerBaseUrl).toString(), {
      cache: "no-store",
      signal: AbortSignal.timeout(10000)
    });
    const body = await response.json().catch(() => null);
    if (!response.ok || !body) {
      return NextResponse.json({ ok: false, message: `AI Worker health unavailable: HTTP ${response.status}` });
    }
    return NextResponse.json({ ok: true, data: body.data ?? body });
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "AI Worker health unavailable";
    return NextResponse.json({ ok: false, message });
  }
}