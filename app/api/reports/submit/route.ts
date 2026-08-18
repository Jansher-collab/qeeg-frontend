import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const caseRef = 'CASE-' + Math.floor(10000 + Math.random() * 90000) + '-AU';

    return NextResponse.json({
      message: 'QEEG submission received and queued.',
      report: {
        id: 'rep_' + Math.random().toString(36).substring(2, 9),
        caseReference: caseRef,
        status: 'GENERATING',
        reliabilityScore: body.reliabilityScore || 0.92,
        feeAmount: 65.0,
        paymentStatus: 'AUTHORISED',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit case.' },
      { status: 500 }
    );
  }
}
