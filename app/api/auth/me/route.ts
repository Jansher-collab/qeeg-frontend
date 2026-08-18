import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;

  if (!sessionCookie) {
    // Return default demo user for seamless local inspection
    return NextResponse.json({
      user: {
        id: 'usr_demo_practitioner',
        email: 'practitioner@melbourneclinic.com.au',
        role: 'PRACTITIONER',
        fullName: 'Dr. Alexander Wright',
        clinicName: 'Melbourne NeuroCare Clinic',
        providerNumber: 'PR-88921-VIC',
      },
    });
  }

  try {
    const raw = sessionCookie.replace('mock_jwt_', '');
    const decoded = JSON.parse(atob(raw));
    return NextResponse.json({
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        fullName: decoded.name || 'Dr. Alexander Wright',
        clinicName: 'Melbourne NeuroCare Clinic',
        providerNumber: 'PR-88921-VIC',
      },
    });
  } catch {
    return NextResponse.json({
      user: {
        id: 'usr_demo_practitioner',
        email: 'practitioner@melbourneclinic.com.au',
        role: 'PRACTITIONER',
        fullName: 'Dr. Alexander Wright',
        clinicName: 'Melbourne NeuroCare Clinic',
        providerNumber: 'PR-88921-VIC',
      },
    });
  }
}
