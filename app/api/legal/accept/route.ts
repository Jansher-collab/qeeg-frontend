import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookiesOnResponse } from "@/lib/session";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const backendRes = await fetch(`${BACKEND_URL}/api/legal/accept`, {
      method: 'POST',
      headers: {
        Cookie: `qeeg_session_token=${sessionCookie}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await backendRes.text();
    const data = text ? JSON.parse(text) : {};

    if (backendRes.ok) {
      return NextResponse.json(data, { status: 200 });
    }

    if (backendRes.status === 401) {
      return clearSessionCookiesOnResponse(
        new NextResponse(JSON.stringify({ error: 'Not authenticated. Please log in.' }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    return NextResponse.json(data, { status: backendRes.status });
  } catch {
    return NextResponse.json({ error: 'Service unavailable. Please try again later.' }, { status: 503 });
  }
}