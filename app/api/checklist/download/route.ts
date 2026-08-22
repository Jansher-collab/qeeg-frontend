import { NextRequest, NextResponse } from "next/server";
import { generatePreFilledChecklistPDF } from "@/lib/services/pdfService";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('qeeg_session_token')?.value;

    // 1. Attempt to forward request to live Express backend on port 5000
    if (sessionCookie) {
      try {
        const backendRes = await fetch(`${BACKEND_URL}/api/checklist/download`, {
          headers: {
            Cookie: `qeeg_session_token=${sessionCookie}`,
          },
        });

        if (backendRes.ok) {
          const arrayBuffer = await backendRes.arrayBuffer();
          return new NextResponse(arrayBuffer, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": 'attachment; filename="QEEG_Symptom_Checklist.pdf"',
              "Cache-Control": "no-store, max-age=0",
            },
          });
        }
      } catch {
        // Express backend offline, use local pdfService generator
      }
    }

    // 2. Local fallback: decode user details from session cookie dynamically
    let practitioner = {
      fullName: "Dr. Alexander Wright",
      profession: "Clinical Neuropsychologist",
      clinicName: "Melbourne NeuroCare Clinic",
      providerNumber: "PR-88921-VIC",
      phone: "+61 3 9820 1144",
      practiceEmail: "a.wright@melbourneneurocare.com.au",
      email: "a.wright@melbourneneurocare.com.au",
    };

    if (sessionCookie) {
      try {
        let payloadJson = '';
        if (sessionCookie.includes('.')) {
          const parts = sessionCookie.split('.');
          if (parts.length >= 2) {
            payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
          }
        } else {
          const raw = sessionCookie.replace('mock_jwt_', '');
          payloadJson = atob(raw);
        }

        if (payloadJson) {
          const decoded = JSON.parse(payloadJson);
          practitioner = {
            fullName: decoded.name || practitioner.fullName,
            profession: decoded.profession || practitioner.profession,
            clinicName: decoded.clinicName || practitioner.clinicName,
            providerNumber: decoded.providerNumber || practitioner.providerNumber,
            phone: decoded.phone || practitioner.phone,
            practiceEmail: decoded.email || practitioner.practiceEmail,
            email: decoded.email || practitioner.email,
          };
        }
      } catch {
        // Keep default
      }
    }

    const pdfBuffer = await generatePreFilledChecklistPDF(practitioner);

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="QEEG_Symptom_Checklist.pdf"',
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate checklist PDF" },
      { status: 500 }
    );
  }
}
