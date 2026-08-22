import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(req: NextRequest, { params }: { params: { action: string[] } }) {
  const action = params.action.join('/');
  return handleRequest(req, action, 'GET');
}

export async function POST(req: NextRequest, { params }: { params: { action: string[] } }) {
  const action = params.action.join('/');
  return handleRequest(req, action, 'POST');
}

export async function PUT(req: NextRequest, { params }: { params: { action: string[] } }) {
  const action = params.action.join('/');
  return handleRequest(req, action, 'PUT');
}

export async function DELETE(req: NextRequest, { params }: { params: { action: string[] } }) {
  const action = params.action.join('/');
  return handleRequest(req, action, 'DELETE');
}

async function handleRequest(req: NextRequest, action: string, method: string) {
  const url = `${BACKEND_URL}/api/auth/${action}`;
  try {
    const headers = new Headers(req.headers);
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

    backendRes.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
