import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const dynamic = 'force-dynamic';

// Reconciles the Knowledge Base directory with the database and returns a summary.
export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/admin/knowledge/reindex`, {
      method: 'POST',
      headers: { Cookie: `qeeg_session_token=${sessionCookie}` },
    });

    const data = await backendRes.json().catch(() => null);
    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data?.error || 'Failed to re-index knowledge base.' },
        { status: backendRes.status }
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Knowledge base service is unavailable.' }, { status: 503 });
  }
}
