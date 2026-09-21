import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const dynamic = 'force-dynamic';

// Public (pre-authentication) endpoint used by the signup page and portal to
// fetch the currently-published DPA/EULA versions, so the displayed version and
// the version recorded on acceptance always match the admin panel's upload.
export async function GET() {
  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/legal/current`, { cache: 'no-store' });
    const data = await backendRes.json();
    if (backendRes.ok) {
      return NextResponse.json(data, { status: 200 });
    }
    return NextResponse.json(
      { error: data?.error || 'Failed to load current legal documents.' },
      { status: backendRes.status }
    );
  } catch {
    return NextResponse.json(
      { error: 'Legal document service is unavailable.' },
      { status: 503 }
    );
  }
}