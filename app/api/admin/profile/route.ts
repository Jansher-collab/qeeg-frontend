import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookiesOnResponse } from '@/lib/session';

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function PUT(req: NextRequest) {
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
    const backendRes = await fetch(`${BACKEND_URL}/api/admin/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `qeeg_session_token=${sessionCookie}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await backendRes.json().catch(() => null);

    if (backendRes.ok) {
      return NextResponse.json(data);
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
      { error: data?.error || 'Failed to update profile.' },
      { status: backendRes.status }
    );
  } catch {
    return NextResponse.json(
      { error: 'Profile service is unavailable. Please retry.' },
      { status: 503 }
    );
  }
}
