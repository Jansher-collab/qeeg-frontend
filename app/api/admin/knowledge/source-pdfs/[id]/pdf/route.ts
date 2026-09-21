import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookiesOnResponse } from '@/lib/session';

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const dynamic = 'force-dynamic';

// Streams an admin-uploaded source PDF so the admin can review the original
// document behind the extracted entries. Admin-authenticated (cookie).
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/admin/knowledge/source-pdfs/${id}/pdf`, {
      headers: { Cookie: `qeeg_session_token=${sessionCookie}` },
      cache: 'no-store',
    });

    const body = await backendRes.arrayBuffer();

    if (backendRes.status === 404) {
      return NextResponse.json({ error: 'Source PDF not found.' }, { status: 404 });
    }

    if (backendRes.status === 401) {
      return clearSessionCookiesOnResponse(
        NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
      );
    }

    if (!backendRes.ok) {
      return NextResponse.json({ error: 'Failed to load source PDF.' }, { status: backendRes.status });
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': backendRes.headers.get('content-type') || 'application/pdf',
        'Content-Disposition': backendRes.headers.get('content-disposition') || 'inline',
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch {
    return new NextResponse('Knowledge base service is unavailable.', { status: 503 });
  }
}