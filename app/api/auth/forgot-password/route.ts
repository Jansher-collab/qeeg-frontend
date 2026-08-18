import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    return NextResponse.json({
      message: `If an account with ${email} exists, a password reset link has been dispatched.`,
    });
  } catch {
    return NextResponse.json({ message: 'Request processed.' });
  }
}
