import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const dynamic = 'force-dynamic';

// Downloads every approved ('live') literature entry as a JSON document.
export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/admin/knowledge/export`, {
      headers: { Cookie: `qeeg_session_token=${sessionCookie}` },
      cache: 'no-store',
    });

    const data = await backendRes.json().catch(() => null);
    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data?.error || 'Failed to export knowledge base.' },
        { status: backendRes.status }
      );
    }

    const res = NextResponse.json(data);
    res.headers.set(
      'Content-Disposition',
      `attachment; filename="knowledge-base-export-${Date.now()}.json"`
    );
    return res;
  } catch {
    return NextResponse.json({ error: 'Knowledge base service is unavailable.' }, { status: 503 });
  }
}
