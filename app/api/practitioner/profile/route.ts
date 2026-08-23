import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;

  if (sessionCookie) {
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/practitioner/profile`, {
        headers: {
          Cookie: `qeeg_session_token=${sessionCookie}`,
        },
      });

      if (backendRes.ok) {
        const backendData = await backendRes.json();
        return NextResponse.json(backendData);
      }
      return NextResponse.json({ error: 'Failed to fetch profile from backend' }, { status: backendRes.status });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
}

export async function PUT(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;
  const body = await req.json();

  if (sessionCookie) {
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/practitioner/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `qeeg_session_token=${sessionCookie}`,
        },
        body: JSON.stringify(body),
      });

      if (backendRes.ok) {
        const backendData = await backendRes.json();
        return NextResponse.json(backendData);
      }
      return NextResponse.json({ error: 'Failed to update profile in backend' }, { status: backendRes.status });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
}
