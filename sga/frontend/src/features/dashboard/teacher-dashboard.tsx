"use client";

import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { BookOpen, ClipboardList, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/features/dashboard/stat-card";
import { classKeys, useClasses } from "@/features/classes/hooks";
import { classService } from "@/lib/api/services";
import { CURRENT_TERM } from "@/lib/constants";

export function TeacherDashboard() {
  const classes = useClasses({ teacherId: "me", term: CURRENT_TERM, page: 0, size: 50 });
  const list = classes.data?.content ?? [];
  const totalStudents = list.reduce((sum, c) => sum + c.enrolledCount, 0);

  // Avaliações pendentes = matrículas ativas ainda sem nota lançada (12.11)
  const enrollmentQueries = useQueries({
    queries: list.map((classItem) => ({
      queryKey: classKeys.enrollments(classItem.uuid),
      queryFn: () => classService.getEnrollments(classItem.uuid),
    })),
  });
  const pendingLoading =
    classes.isLoading || enrollmentQueries.some((query) => query.isLoading);
  const pendingCount = enrollmentQueries.reduce(
    (sum, query) =>
      sum +
      (query.data ?? []).filter(
        (enrollment) =>
          enrollment.grade === null && enrollment.status !== "CANCELLED",
      ).length,
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Suas turmas no período ${CURRENT_TERM}.`}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={BookOpen}
          label="Turmas"
          value={classes.data?.totalElements ?? 0}
          isLoading={classes.isLoading}
        />
        <StatCard
          icon={ClipboardList}
          label="Avaliações pendentes"
          value={pendingCount}
          hint="Alunos sem nota lançada"
          isLoading={pendingLoading}
        />
        <StatCard
          icon={Users}
          label="Alunos matriculados"
          value={totalStudents}
          isLoading={classes.isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Acesso rápido</CardTitle>
        </CardHeader>
        <CardContent>
          {!classes.isLoading && list.length === 0 ? (
            <EmptyState
              title="Nenhuma turma neste período"
              description="Quando a secretaria criar turmas para você, elas aparecem aqui."
            />
          ) : (
            <ul className="divide-y">
              {list.map((classItem) => (
                <li
                  key={classItem.uuid}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {classItem.code} — {classItem.subject.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {classItem.schedule} · {classItem.location} ·{" "}
                      {classItem.enrolledCount} aluno
                      {classItem.enrolledCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/teacher/classes/${classItem.uuid}/grades`}>
                      Lançar notas
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
