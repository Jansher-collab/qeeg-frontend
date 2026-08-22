"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewReportRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/portal?view=new");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-[#16233B] animate-spin" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Loading New Report Workflow...
        </span>
      </div>
    </div>
  );
}
