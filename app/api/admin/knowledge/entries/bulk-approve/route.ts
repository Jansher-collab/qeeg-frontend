import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookiesOnResponse } from '@/lib/session';

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const dynamic = 'force-dynamic';

// Bulk-approves every draft entry whose supporting quotes passed the verbatim check.
export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/admin/knowledge/entries/bulk-approve`, {
      method: 'POST',
      headers: { Cookie: `qeeg_session_token=${sessionCookie}` },
    });

    const data = await backendRes.json().catch(() => null);
    if (backendRes.ok) {
      return NextResponse.json(data);
    }
    if (backendRes.status === 401) {
      return clearSessionCookiesOnResponse(
        NextResponse.json({ error: data?.error || 'Not authenticated.' }, { status: 401 })
      );
    }
    return NextResponse.json(
      { error: data?.error || 'Failed to bulk-approve entries.' },
      { status: backendRes.status }
    );
  } catch {
    return NextResponse.json({ error: 'Knowledge base service is unavailable.' }, { status: 503 });
  }
}
