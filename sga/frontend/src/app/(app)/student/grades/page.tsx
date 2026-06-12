"use client";

import { CalendarDays, Percent, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useStudentEnrollments } from "@/features/students/hooks";
import { useAuth } from "@/lib/auth/use-auth";
import { cn, formatAttendance, formatGrade } from "@/lib/utils";
import { MIN_ATTENDANCE, PASSING_GRADE } from "@/types/domain";

export default function StudentGradesPage() {
  const { user } = useAuth();
  const enrollments = useStudentEnrollments(user?.uuid);

  const list = (enrollments.data ?? []).filter(
    (enrollment) => enrollment.status !== "CANCELLED",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notas e frequência"
        description="Acompanhe seu desempenho em cada turma (RF-08)."
      />

      {enrollments.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : enrollments.isError ? (
        <ErrorState onRetry={() => enrollments.refetch()} />
      ) : list.length === 0 ? (
        <EmptyState
          title="Nenhuma turma cursada"
          description="Suas notas aparecem aqui assim que você se matricular."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((enrollment) => {
            const lowAttendance =
              enrollment.attendance !== null &&
              enrollment.attendance < MIN_ATTENDANCE;
            const lowGrade =
              enrollment.grade !== null && enrollment.grade < PASSING_GRADE;
            return (
              <Card key={enrollment.uuid}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{enrollment.class.code}</CardTitle>
                    <StatusBadge status={enrollment.status} />
                  </div>
                  <CardDescription className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" aria-hidden />
                    {enrollment.class.term} · {enrollment.class.schedule}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-muted-foreground" aria-hidden />
                    Nota:{" "}
                    <strong
                      className={cn("tabular-nums", lowGrade && "text-destructive")}
                    >
                      {formatGrade(enrollment.grade)}
                    </strong>
                  </p>
                  <p className="flex items-center gap-2">
                    <Percent className="size-4 text-muted-foreground" aria-hidden />
                    Frequência:{" "}
                    <strong className={cn("tabular-nums", lowAttendance && "text-warning")}>
                      {formatAttendance(enrollment.attendance)}
                    </strong>
                  </p>
                  {lowAttendance && (
                    <p className="text-xs font-medium text-warning">
                      Atenção: frequência abaixo de {MIN_ATTENDANCE}%.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
