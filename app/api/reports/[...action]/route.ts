import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, sessionCookieClearOptions } from '@/lib/session';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(req: NextRequest, { params }: { params: Promise<{ action: string[] }> }) {
  const resolvedParams = await params;
  const action = resolvedParams.action.join('/');
  return handleRequest(req, action, 'GET');
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string[] }> }) {
  const resolvedParams = await params;
  const action = resolvedParams.action.join('/');
  return handleRequest(req, action, 'POST');
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ action: string[] }> }) {
  const resolvedParams = await params;
  const action = resolvedParams.action.join('/');
  return handleRequest(req, action, 'PUT');
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ action: string[] }> }) {
  const resolvedParams = await params;
  const action = resolvedParams.action.join('/');
  return handleRequest(req, action, 'DELETE');
}

async function handleRequest(req: NextRequest, action: string, method: string) {
  const url = `${BACKEND_URL}/api/reports/${action}`;
  try {
    // Forward only the headers the backend needs. Cloning the full request
    // header set (Content-Length, Expect, Transfer-Encoding, etc.) makes
    // Node's fetch reject the proxied body with `fetch failed`.
    const headers = new Headers();
    const cookie = req.headers.get('cookie');
    if (cookie) headers.set('cookie', cookie);
    const contentType = req.headers.get('content-type') || req.headers.get('accept');
    if (contentType) headers.set('content-type', contentType);
    headers.set('host', new URL(BACKEND_URL).host);

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = await req.text();
    }

    const backendRes = await fetch(url, fetchOptions);
    const body = await backendRes.text();

    const response = new NextResponse(body, {
      status: backendRes.status,
      statusText: backendRes.statusText,
    });

    const setCookies =
      typeof backendRes.headers.getSetCookie === 'function'
        ? backendRes.headers.getSetCookie()
        : backendRes.headers.get('set-cookie')
        ? [backendRes.headers.get('set-cookie') as string]
        : [];
    for (const c of setCookies) {
      response.headers.append('set-cookie', c);
    }

    // If the backend rejected the session (invalid, expired, or revoked token),
    // aggressively delete the session cookie on the client so the user is not
    // trapped in a broken dashboard loop.
    if (backendRes.status === 401) {
      response.cookies.set(SESSION_COOKIE_NAME, '', sessionCookieClearOptions());
    }

    return response;
 } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}