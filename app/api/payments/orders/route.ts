import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, sessionCookieClearOptions } from '@/lib/session';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/**
 * PayPal order creation is a POST-only, cookie-authenticated endpoint, so only
 * the POST verb is proxied. The browser must reach it same-origin (relative
 * `/api/payments/orders`) so the httpOnly session cookie is forwarded here and
 * then on to the backend — a direct cross-origin call to the backend host would
 * drop the session and require credentialed CORS on the PayPal order path.
 *
 * The response body is passed through verbatim (including PayPal's
 * `errorCode`/`error` fields) so the portal can surface the real failure reason
 * instead of a generic message.
 */
export async function POST(req: NextRequest) {
  const url = `${BACKEND_URL}/api/payments/orders`;

  let payload: string;
  try {
    payload = await req.text();
  } catch {
    return NextResponse.json(
      { error: 'Could not read the payment order request body.', errorCode: 'PAYMENT_FAILED' },
      { status: 400 }
    );
  }

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

    const backendRes = await fetch(url, {
      method: 'POST',
      headers,
      body: payload,
      cache: 'no-store',
    });

    const body = await backendRes.text();

    // A non-JSON body (e.g. an HTML error page from an upstream proxy) would
    // break the caller's res.json(); normalise it to a structured error so the
    // portal always has something parseable to display.
    const contentTypeHeader = backendRes.headers.get('content-type') || '';
    const isJson = contentTypeHeader.includes('application/json');
    if (!isJson) {
      return NextResponse.json(
        {
          error: `The payment service returned an unexpected non-JSON response (HTTP ${backendRes.status}). Please try again.`,
          errorCode: 'PAYMENT_FAILED',
        },
        { status: backendRes.status >= 400 ? backendRes.status : 502 }
      );
    }

    const response = new NextResponse(body, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: { 'content-type': 'application/json' },
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

    // An invalid/expired/revoked session is evicted client-side so the
    // practitioner is not trapped retrying a payment that can never succeed.
    if (backendRes.status === 401) {
      response.cookies.set(SESSION_COOKIE_NAME, '', sessionCookieClearOptions());
    }

    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred while creating the payment order.';
    return NextResponse.json(
      {
        error: `Could not reach the payment service (${message}). Please try again.`,
        errorCode: 'PAYMENT_FAILED',
      },
      { status: 502 }
    );
  }
}
