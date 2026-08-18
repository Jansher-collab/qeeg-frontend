import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json({
    message: 'Report ready for download. Immediate purge scheduled upon stream completion.',
    reportId: id,
    downloadUrl: `/api/reports/${id}/file`,
  });
}
