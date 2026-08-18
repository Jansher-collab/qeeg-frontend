import { NextResponse } from 'next/server';

export async function GET() {
  const logs = [
    {
      id: 'log_001',
      action: 'REPORT_GENERATED',
      caseReference: 'CASE-88291-VIC',
      details: { fee: 65.0, status: 'COMPLETED' },
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'log_002',
      action: 'RELIABILITY_REJECTED',
      caseReference: 'CASE-77301-QLD',
      details: { score: 0.72, threshold: 0.8 },
      timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
  ];

  return NextResponse.json({ logs });
}
