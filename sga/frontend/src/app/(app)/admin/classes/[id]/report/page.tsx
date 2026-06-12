"use client";

import { use } from "react";
import { ClassReportView } from "@/features/reports/class-report";

export default function AdminClassReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ClassReportView classId={id} />;
}
