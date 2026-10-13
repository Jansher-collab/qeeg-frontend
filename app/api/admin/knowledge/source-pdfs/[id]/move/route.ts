import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookiesOnResponse } from '@/lib/session';

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const dynamic = 'force-dynamic';

// Moves a document into a folder (or to the root when folderId is null).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/api/admin/knowledge/source-pdfs/${id}/move`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `qeeg_session_token=${sessionCookie}`,
        },
        body: JSON.stringify(body),
      }
    );

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
      { error: data?.error || 'Failed to move document.' },
      { status: backendRes.status }
    );
  } catch {
    return NextResponse.json({ error: 'Knowledge base service is unavailable.' }, { status: 503 });
  }
}
