import { NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Public runtime config proxy. No session required: it exposes only the active
// admin-configured pricing so every client surface renders the live fee.
export async function GET() {
  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/config`, {
      cache: 'no-store',
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: 'Failed to load configuration.' },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json(
      { error: 'Configuration service is unavailable.' },
      { status: 503 }
    );
  }
}
