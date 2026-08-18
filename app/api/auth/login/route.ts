import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const isNeuro = email.toLowerCase().includes('neuro') || email.toLowerCase().includes('admin');
    const role = isNeuro ? 'NEUROSCIENTIST' : 'PRACTITIONER';

    const payload = {
      userId: 'usr_' + (isNeuro ? 'neuro_001' : 'practitioner_001'),
      email: email.toLowerCase().trim(),
      role,
      name: isNeuro ? 'Dr. Sarah Jenkins' : 'Dr. Alexander Wright',
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    const token = 'mock_jwt_' + btoa(JSON.stringify(payload));

    const response = NextResponse.json({
      message: 'Login successful.',
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        fullName: payload.name,
      },
    });

    response.cookies.set('qeeg_session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Authentication failed.' },
      { status: 500 }
    );
  }
}
