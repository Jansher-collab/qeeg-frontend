import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookiesOnResponse } from '@/lib/session';

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/admin/settings`, {
      headers: { Cookie: `qeeg_session_token=${sessionCookie}` },
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }

    if (backendRes.status === 401) {
      return clearSessionCookiesOnResponse(
        NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
      );
    }

    return NextResponse.json(
      { error: 'Failed to load settings.' },
      { status: backendRes.status }
    );
  } catch {
    return NextResponse.json(
      { error: 'Settings service is unavailable.' },
      { status: 503 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;
  const body = await req.json();
  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionCookie ? { Cookie: `qeeg_session_token=${sessionCookie}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }
    const errorData = await backendRes.json().catch(() => null);

    if (backendRes.status === 401) {
      return clearSessionCookiesOnResponse(
        NextResponse.json(
          { error: errorData?.error || 'Not authenticated.' },
          { status: 401 }
        )
      );
    }

    return NextResponse.json(
      { error: errorData?.error || 'Failed to update settings.' },
      { status: backendRes.status }
    );
  } catch {
    return NextResponse.json(
      { error: 'Backend settings service is unavailable.' },
      { status: 503 }
    );
  }
}