import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
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
  const body = await req.json();
  return NextResponse.json({
    message: 'Profile updated successfully.',
    profile: body,
  });
}
