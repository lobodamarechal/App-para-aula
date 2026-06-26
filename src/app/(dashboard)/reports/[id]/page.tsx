import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { DEMO_MODE, demoReports } from "@/lib/demo";
import type { Report } from "@/lib/types";
import { ReportDocument } from "@/components/reports/report-document";

export const dynamic = "force-dynamic";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (DEMO_MODE) {
    const report = demoReports().find((r) => r.id === id);
    if (!report) notFound();
    return <ReportDocument report={report} />;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return <ReportDocument report={data as Report} />;
}
