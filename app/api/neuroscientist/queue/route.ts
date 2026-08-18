import { NextResponse } from 'next/server';

export async function GET() {
  const queue = [
    {
      id: 'rep_002',
      caseReference: 'CASE-94102-NSW',
      status: 'IN_NEUROSCIENTIST_REVIEW',
      reliabilityScore: 0.88,
      confidenceScore: 0.84,
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      age: 44,
      gender: 'Male',
      reportSummary: 'Posterior Alpha slowing with generalized slowing across parietal leads.',
      submittingPractitioner: {
        email: 'dr.smith@sydneyneuro.com.au',
        practitionerProfile: {
          fullName: 'Dr. Michael Smith',
          clinicName: 'Sydney Neurological Assessment Centre',
        },
      },
    },
  ];

  return NextResponse.json({ queue });
}
