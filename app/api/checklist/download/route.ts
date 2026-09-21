import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookiesOnResponse } from "@/lib/session";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('qeeg_session_token')?.value;

    // Authentication is strictly required for this route
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Not authenticated. Please log in.' },
        { status: 401 }
      );
    }

    // 1. Forward request to live Express backend
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/checklist/download`, {
        headers: {
          Cookie: `qeeg_session_token=${sessionCookie}`,
        },
      });

      if (backendRes.ok) {
        const arrayBuffer = await backendRes.arrayBuffer();
        return new NextResponse(arrayBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="QEEG_Symptom_Checklist.pdf"',
            "Cache-Control": "no-store, max-age=0",
          },
        });
      }

      // Backend rejected the request (invalid/expired session): evict the cookie.
      return clearSessionCookiesOnResponse(
        new NextResponse(
          JSON.stringify({ error: 'Not authenticated. Please log in.' }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        )
      );
    } catch {
      // Backend offline
      return NextResponse.json(
        { error: 'Service unavailable. Please try again later.' },
        { status: 503 }
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate checklist PDF";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
