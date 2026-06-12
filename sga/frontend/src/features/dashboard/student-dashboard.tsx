"use client";

import Link from "next/link";
import { ClipboardList, Percent, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/features/dashboard/stat-card";
import { useStudentEnrollments } from "@/features/students/hooks";
import { useAuth } from "@/lib/auth/use-auth";
import { formatAttendance, formatGrade } from "@/lib/utils";

export function StudentDashboard() {
  const { user } = useAuth();
  const enrollments = useStudentEnrollments(user?.uuid);

  const active = (enrollments.data ?? []).filter(
    (enrollment) =>
      enrollment.status === "ENROLLED" || enrollment.status === "IN_PROGRESS",
  );
  const graded = (enrollments.data ?? []).filter(
    (enrollment) => enrollment.grade !== null && enrollment.status !== "CANCELLED",
  );
  const average =
    graded.length > 0
      ? graded.reduce((sum, e) => sum + (e.grade ?? 0), 0) / graded.length
      : null;
  const withAttendance = active.filter((e) => e.attendance !== null);
  const averageAttendance =
    withAttendance.length > 0
      ? withAttendance.reduce((sum, e) => sum + (e.attendance ?? 0), 0) /
        withAttendance.length
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Acompanhe suas matrículas, notas e frequência."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={ClipboardList}
          label="Matrículas ativas"
          value={active.length}
          isLoading={enrollments.isLoading}
        />
        <StatCard
          icon={TrendingUp}
          label="Média atual"
          value={average !== null ? formatGrade(average) : "—"}
          isLoading={enrollments.isLoading}
        />
        <StatCard
          icon={Percent}
          label="Frequência média"
          value={averageAttendance !== null ? formatAttendance(averageAttendance) : "—"}
          isLoading={enrollments.isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Disciplinas em andamento</CardTitle>
        </CardHeader>
        <CardContent>
          {!enrollments.isLoading && active.length === 0 ? (
            <EmptyState
              title="Você não tem matrículas ativas"
              description="Acesse a matrícula para escolher suas turmas."
              action={
                <Button asChild size="sm">
                  <Link href="/student/enrollment">Fazer matrícula</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y">
              {active.map((enrollment) => (
                <li
                  key={enrollment.uuid}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{enrollment.class.code}</p>
                    <p className="text-sm text-muted-foreground">
                      {enrollment.class.schedule} · Nota: {formatGrade(enrollment.grade)}{" "}
                      · Frequência: {formatAttendance(enrollment.attendance)}
                    </p>
                  </div>
                  <StatusBadge status={enrollment.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
