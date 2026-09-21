import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookiesOnResponse } from '@/lib/session';

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Re-runs ingestion for a knowledge source PDF (e.g. after a failure).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/admin/knowledge/source-pdfs/${id}/ingest`, {
      method: 'POST',
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

    const errorData = await backendRes.json().catch(() => null);
    return NextResponse.json(
      { error: errorData?.error || 'Failed to re-run ingestion.' },
      { status: backendRes.status }
    );
  } catch {
    return NextResponse.json(
      { error: 'Knowledge base service is unavailable.' },
      { status: 503 }
    );
  }
}