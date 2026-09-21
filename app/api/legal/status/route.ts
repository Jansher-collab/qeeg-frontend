import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookiesOnResponse } from "@/lib/session";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/legal/status`, {
      headers: { Cookie: `qeeg_session_token=${sessionCookie}` },
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data, { status: 200 });
    }

    return clearSessionCookiesOnResponse(
      new NextResponse(JSON.stringify({ error: 'Not authenticated. Please log in.' }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    );
  } catch {
    return NextResponse.json({ error: 'Service unavailable. Please try again later.' }, { status: 503 });
  }
}