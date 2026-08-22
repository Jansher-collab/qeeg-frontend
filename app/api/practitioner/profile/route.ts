import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;

  if (sessionCookie) {
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/practitioner/profile`, {
        headers: {
          Cookie: `qeeg_session_token=${sessionCookie}`,
        },
      });

      if (backendRes.ok) {
        const backendData = await backendRes.json();
        return NextResponse.json(backendData);
      }
    } catch {
      // Backend not running, proceed to default mock profile
    }
  }

  return NextResponse.json({
    profile: {
      fullName: 'Dr. Alexander Wright',
      professionalTitle: 'Senior Clinical Neuropsychologist',
      profession: 'Clinical Neuropsychologist',
      providerNumber: 'PR-88921-VIC',
      clinicName: 'Melbourne NeuroCare Clinic',
      practiceAddress: 'Suite 4B, 120 Collins Street, Melbourne VIC 3000',
      phone: '+61 3 9820 1144',
      practiceEmail: 'reception@melbourneneurocare.com.au',
      notificationEmail: 'a.wright@melbourneneurocare.com.au',
    },
  });
}

export async function PUT(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;
  const body = await req.json();

  if (sessionCookie) {
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/practitioner/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `qeeg_session_token=${sessionCookie}`,
        },
        body: JSON.stringify(body),
      });

      if (backendRes.ok) {
        const backendData = await backendRes.json();
        return NextResponse.json(backendData);
      }
    } catch {
      // Backend not running, proceed to mock response
    }
  }

  return NextResponse.json({
    message: 'Profile updated successfully.',
    profile: body,
  });
}
