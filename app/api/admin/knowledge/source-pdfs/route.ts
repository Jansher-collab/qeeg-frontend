import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookiesOnResponse } from '@/lib/session';

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/admin/knowledge/source-pdfs`, {
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
      { error: 'Failed to load knowledge source PDFs.' },
      { status: backendRes.status }
    );
  } catch {
    return NextResponse.json(
      { error: 'Knowledge base service is unavailable.' },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;
  const body = await req.json();

  // Light validation before proxying: the backend accepts a single
  // `{ fileName, base64 }` or a batch `{ files: [...] }` (max 10 PDFs).
  const batch = Array.isArray(body?.files) ? body.files : null;
  if (batch) {
    if (batch.length === 0 || batch.length > 10) {
      return NextResponse.json(
        { error: 'Please upload between 1 and 10 PDFs at once.' },
        { status: 400 }
      );
    }
  } else if (typeof body?.base64 !== 'string' || body.base64.trim() === '') {
    return NextResponse.json({ error: 'A base64-encoded PDF is required.' }, { status: 400 });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/admin/knowledge/source-pdfs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionCookie ? { Cookie: `qeeg_session_token=${sessionCookie}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }

    const errorData = await backendRes.json().catch(() => null);

    if (backendRes.status === 401) {
      return clearSessionCookiesOnResponse(
        NextResponse.json(
          { error: errorData?.error || 'Not authenticated.' },
          { status: 401 }
        )
      );
    }

    return NextResponse.json(
      { error: errorData?.error || 'Failed to upload knowledge source PDF.' },
      { status: backendRes.status }
    );
  } catch {
    return NextResponse.json(
      { error: 'Knowledge base service is unavailable.' },
      { status: 503 }
    );
  }
}