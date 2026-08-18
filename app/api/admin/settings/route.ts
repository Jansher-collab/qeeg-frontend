import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    settings: {
      reportFeeAUD: 65.0,
      minReliabilityThreshold: 0.8,
      currency: 'AUD',
      hostingRegion: 'ap-southeast-2 (Sydney)',
    },
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json({
    message: 'Settings updated.',
    settings: body,
  });
}
