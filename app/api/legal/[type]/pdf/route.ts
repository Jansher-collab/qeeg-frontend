import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const dynamic = 'force-dynamic';

// Public (pre-authentication) proxy that streams the admin-published legal PDF
// (DPA/EULA) from the backend. The `?v=<version>` query is forwarded so browser
// caches bust when a new document version is published.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const version = req.nextUrl.searchParams.get('v') || undefined;
  const query = version ? `?v=${encodeURIComponent(version)}` : '';

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/legal/documents/pdf/${type}${query}`, {
      cache: 'no-store',
    });

    const body = await backendRes.arrayBuffer();

    if (backendRes.status === 404) {
      return NextResponse.json(
        { error: 'Legal document not found.' },
        { status: 404 }
      );
    }

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: 'Failed to load legal document.' },
        { status: backendRes.status }
      );
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': backendRes.headers.get('content-type') || 'application/pdf',
        'Content-Disposition': backendRes.headers.get('content-disposition') || 'inline',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch {
    return new NextResponse('Legal document service is unavailable.', { status: 503 });
  }
}