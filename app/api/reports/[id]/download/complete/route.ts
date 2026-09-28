import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookiesOnResponse } from '@/lib/session';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;
  const token = req.nextUrl.searchParams.get('token') || undefined;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Forward the user's session cookie for authenticated access.
  if (sessionCookie) {
    headers['Cookie'] = `qeeg_session_token=${sessionCookie}`;
  }

  // Preserve the optional collection token.
  const query = token ? `?token=${encodeURIComponent(token)}` : '';
  const backendUrl = `${BACKEND_URL}/api/reports/${id}/download/complete${query}`;

  try {
    const backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ token: token ?? undefined }),
      cache: 'no-store',
    });

    const body = await backendRes.text();
    const contentType = backendRes.headers.get('content-type') || 'application/json';

    const response = new NextResponse(body, {
      status: backendRes.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, max-age=0',
      },
    });

    // Session rejected means the cookie is stale/revoked — evict it so the
    // user is not trapped. Harmless for anonymous collection-token access.
    if (backendRes.status === 401) {
      clearSessionCookiesOnResponse(response);
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to reach report service.' },
      { status: 500 }
    );
  }
}