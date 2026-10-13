import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookiesOnResponse } from '@/lib/session';

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Lists the structured research entries extracted from source PDFs.
export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const sourcePdfId = req.nextUrl.searchParams.get('sourcePdfId');
  const status = req.nextUrl.searchParams.get('status');
  const params = new URLSearchParams();
  if (sourcePdfId) params.set('sourcePdfId', sourcePdfId);
  if (status) params.set('status', status);
  const query = params.toString() ? `?${params.toString()}` : '';

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/admin/knowledge/entries${query}`, {
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
      { error: 'Failed to load knowledge entries.' },
      { status: backendRes.status }
    );
  } catch {
    return NextResponse.json(
      { error: 'Knowledge base service is unavailable.' },
      { status: 503 }
    );
  }
}