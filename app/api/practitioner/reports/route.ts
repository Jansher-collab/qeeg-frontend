import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('qeeg_session_token')?.value;

  if (sessionCookie) {
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/practitioner/reports`, {
        headers: {
          Cookie: `qeeg_session_token=${sessionCookie}`,
        },
      });

      if (backendRes.ok) {
        const backendData = await backendRes.json();
        return NextResponse.json(backendData);
      }
    } catch {
      // Backend not running, proceed to mock data
    }
  }

  const mockReports = [
    {
      id: 'rep_001',
      caseReference: 'CASE-88291-VIC',
      status: 'COMPLETED',
      reliabilityScore: 0.94,
      confidenceScore: 0.91,
      feeAmount: 65.0,
      paymentStatus: 'CAPTURED',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      reportSummary: 'Elevated frontal Theta/Beta ratio (3.82) with Left Frontal Alpha Asymmetry (F3-F4 z=-2.14). Correlation mapped across 8 PubMed studies.',
      age: 28,
      gender: 'Female',
      findings: {
        thetaBetaRatio: 3.82,
        alphaPeakFrequency: 9.8,
        asymmetryZScore: -2.14,
        tovaDPrime: -1.88,
      },
    },
    {
      id: 'rep_002',
      caseReference: 'CASE-94102-NSW',
      status: 'IN_NEUROSCIENTIST_REVIEW',
      reliabilityScore: 0.88,
      confidenceScore: 0.84,
      feeAmount: 65.0,
      paymentStatus: 'AUTHORISED',
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      reportSummary: 'Posterior Alpha slowing with generalized slowing across parietal leads. Under review by consulting neuroscientist.',
      age: 44,
      gender: 'Male',
    },
    {
      id: 'rep_003',
      caseReference: 'CASE-77301-QLD',
      status: 'RELIABILITY_REJECTED',
      reliabilityScore: 0.72,
      confidenceScore: null,
      feeAmount: 65.0,
      paymentStatus: 'NOT_STARTED',
      createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
      reportSummary: 'Test-Retest reliability coefficient (0.72) failed the mandatory 0.80 clinical threshold. Zero fee charged.',
      age: 19,
      gender: 'Male',
    },
  ];

  return NextResponse.json({ reports: mockReports });
}
