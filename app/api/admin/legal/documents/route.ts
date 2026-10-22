import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookiesOnResponse } from '@/lib/session';

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// The legal-document registry changes whenever an admin publishes a
// replacement, so this proxy must never serve a cached response - otherwise
// the admin UI keeps rendering the previous document after a replacement.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/api/admin/legal/documents${req.nextUrl.search}`,
      {
        headers: { Cookie: `qeeg_session_token=${sessionCookie}` },
        cache: 'no-store',
      }
    );

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data, {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    if (backendRes.status === 401) {
      return clearSessionCookiesOnResponse(
        NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
      );
    }

    return NextResponse.json(
      { error: 'Failed to load legal documents.' },
      { status: backendRes.status }
    );
  } catch {
    return NextResponse.json(
      { error: 'Legal document service is unavailable.' },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/admin/legal/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionCookie ? { Cookie: `qeeg_session_token=${sessionCookie}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const contentType = backendRes.headers.get('content-type') || '';
    const text = await backendRes.text();

    if (backendRes.ok) {
      if (contentType.includes('application/json')) {
        try {
          const data = text ? JSON.parse(text) : null;
          if (data !== null) return NextResponse.json(data);
        } catch {
          // Fall through
        }
      }
      return NextResponse.json(
        { error: 'Legal document update returned an unexpected response.' },
        { status: 502 }
      );
    }

    let errorData: { error?: string } | null = null;
    if (contentType.includes('application/json') && text) {
      try {
        errorData = JSON.parse(text);
      } catch {
        errorData = null;
      }
    } else if (text && text.trim().startsWith('<')) {
      // Never propagate raw HTML to the client — return a safe message.
      return NextResponse.json(
        {
          error:
            'The server returned an unexpected HTML error while publishing the legal document. Check the PDF size/format and try again.',
        },
        { status: backendRes.status >= 500 ? 502 : backendRes.status }
      );
    } else if (text) {
      try {
        errorData = JSON.parse(text);
      } catch {
        errorData = null;
      }
    }

    if (backendRes.status === 401) {
      return clearSessionCookiesOnResponse(
        NextResponse.json(
          { error: errorData?.error || 'Not authenticated.' },
          { status: 401 }
        )
      );
    }

    return NextResponse.json(
      { error: errorData?.error || 'Failed to update legal document.' },
      { status: backendRes.status }
    );
  } catch {
    return NextResponse.json(
      { error: 'Legal document service is unavailable.' },
      { status: 503 }
    );
  }
}