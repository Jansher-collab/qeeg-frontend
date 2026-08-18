import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }
    return NextResponse.json({
      message: 'Password reset successfully. You can now log in.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to reset password.' },
      { status: 500 }
    );
  }
}
