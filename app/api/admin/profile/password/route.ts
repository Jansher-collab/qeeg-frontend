import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookiesOnResponse } from '@/lib/session';

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/admin/profile/password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `qeeg_session_token=${sessionCookie}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await backendRes.json().catch(() => null);

    if (backendRes.ok) {
      // The backend re-issues the session cookie on success (it rotates the
      // token version and signs this device back in) — forward Set-Cookie so
      // the browser stores the fresh cookie.
      const response = NextResponse.json(data);
      const backendCookies = backendRes.headers.getSetCookie?.() || [];
      for (const cookie of backendCookies) {
        response.headers.append('Set-Cookie', cookie);
      }
      return response;
    }

    if (backendRes.status === 401) {
      return clearSessionCookiesOnResponse(
        NextResponse.json(
          { error: data?.error || 'Not authenticated.' },
          { status: 401 }
        )
      );
    }

    return NextResponse.json(
      { error: data?.error || 'Failed to update password.' },
      { status: backendRes.status }
    );
  } catch {
    return NextResponse.json(
      { error: 'Profile service is unavailable. Please retry.' },
      { status: 503 }
    );
  }
}
