import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, clinicName, profession, role = 'PRACTITIONER' } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    // Mock token creation for standalone frontend UI
    const payload = {
      userId: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: email.toLowerCase().trim(),
      role: role === 'NEUROSCIENTIST' ? 'NEUROSCIENTIST' : 'PRACTITIONER',
      name: fullName || 'Demo Practitioner',
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    const token = 'mock_jwt_' + btoa(JSON.stringify(payload));

    const response = NextResponse.json({
      message: 'Account created successfully.',
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        fullName: fullName || 'Demo Practitioner',
        clinicName: clinicName || 'Demo Clinic',
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
      { error: error.message || 'Failed to create account.' },
      { status: 500 }
    );
  }
}
