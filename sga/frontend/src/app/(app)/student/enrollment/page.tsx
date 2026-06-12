"use client";

import { useState } from "react";
import { CalendarDays, MapPin, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useClasses } from "@/features/classes/hooks";
import { useStudentEnrollments } from "@/features/students/hooks";
import { useCancelEnrollment, useEnroll } from "@/features/enrollment/hooks";
import { useAuth } from "@/lib/auth/use-auth";
import { CURRENT_TERM } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Class, Enrollment } from "@/types/domain";

export default function EnrollmentPage() {
  const { user } = useAuth();
  const classes = useClasses({ term: CURRENT_TERM, page: 0, size: 100 });
  const enrollments = useStudentEnrollments(user?.uuid);
  const enroll = useEnroll();
  const cancelEnrollment = useCancelEnrollment();
  const [toCancel, setToCancel] = useState<Enrollment | null>(null);

  const classList = classes.data?.content ?? [];
  const myEnrollments = (enrollments.data ?? []).filter(
    (enrollment) => enrollment.status !== "CANCELLED",
  );
  const myActiveEnrollments = myEnrollments.filter(
    (enrollment) =>
      enrollment.status === "ENROLLED" || enrollment.status === "IN_PROGRESS",
  );

  // Disciplinas já cursadas no período atual (regra de duplicidade, RF-04)
  const enrolledClassIds = new Set(myEnrollments.map((e) => e.class.uuid));
  const enrolledSubjectIds = new Set(
    classList
      .filter((c) => enrolledClassIds.has(c.uuid))
      .map((c) => c.subject.uuid),
  );

  function enrollmentBlock(classItem: Class): string | null {
    if (enrolledClassIds.has(classItem.uuid)) return "Você já está matriculado nesta turma.";
    if (enrolledSubjectIds.has(classItem.subject.uuid)) {
      return "Você já está matriculado nesta disciplina neste período.";
    }
    if (classItem.availableSeats <= 0) return "Turma sem vagas disponíveis.";
    return null;
  }

  function handleConfirmCancel() {
    if (!toCancel) return;
    cancelEnrollment.mutate(toCancel.uuid, { onSuccess: () => setToCancel(null) });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Matrícula"
        description={`Turmas ofertadas no período ${CURRENT_TERM} (RF-04).`}
      />

      <section className="space-y-3" aria-label="Minhas matrículas">
        <h2 className="text-lg font-medium">Minhas matrículas</h2>
        {enrollments.isLoading ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : enrollments.isError ? (
          <ErrorState onRetry={() => enrollments.refetch()} />
        ) : myActiveEnrollments.length === 0 ? (
          <EmptyState
            title="Nenhuma matrícula ativa"
            description="Escolha uma turma abaixo para se matricular."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {myActiveEnrollments.map((enrollment) => (
              <Card key={enrollment.uuid}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{enrollment.class.code}</CardTitle>
                    <StatusBadge status={enrollment.status} />
                  </div>
                  <CardDescription>{enrollment.class.schedule}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setToCancel(enrollment)}
                  >
                    Cancelar matrícula
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3" aria-label="Turmas disponíveis">
        <h2 className="text-lg font-medium">Turmas disponíveis</h2>
        {classes.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-52 rounded-xl" />
            ))}
          </div>
        ) : classes.isError ? (
          <ErrorState onRetry={() => classes.refetch()} />
        ) : classList.length === 0 ? (
          <EmptyState
            title="Nenhuma turma ofertada"
            description={`Não há turmas abertas no período ${CURRENT_TERM}.`}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {classList.map((classItem) => {
              const blockReason = enrollmentBlock(classItem);
              const full = classItem.availableSeats <= 0;
              return (
                <Card key={classItem.uuid} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">
                        {classItem.subject.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={cn(
                          full
                            ? "border-transparent bg-destructive/15 text-destructive"
                            : "border-transparent bg-success/15 text-success",
                        )}
                      >
                        {full
                          ? "Sem vagas"
                          : `${classItem.availableSeats} vaga${classItem.availableSeats === 1 ? "" : "s"}`}
                      </Badge>
                    </div>
                    <CardDescription>{classItem.code}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-1.5 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <User className="size-4 shrink-0" aria-hidden />
                      {classItem.teacher.name}
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarDays className="size-4 shrink-0" aria-hidden />
                      {classItem.schedule}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0" aria-hidden />
                      {classItem.location}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="size-4 shrink-0" aria-hidden />
                      {classItem.enrolledCount}/{classItem.capacity} matriculados
                    </p>
                  </CardContent>
                  <CardFooter className="flex-col items-stretch gap-2">
                    <Button
                      size="sm"
                      disabled={Boolean(blockReason) || enroll.isPending}
                      onClick={() =>
                        enroll.mutate({ studentId: "me", classId: classItem.uuid })
                      }
                    >
                      Matricular
                    </Button>
                    {blockReason && (
                      <p className="text-center text-xs text-muted-foreground">
                        {blockReason}
                      </p>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(toCancel)}
        onOpenChange={(open) => !open && setToCancel(null)}
        title="Cancelar matrícula"
        description={`Cancelar sua matrícula em ${toCancel?.class.code}? A vaga será liberada para outros alunos.`}
        confirmLabel="Cancelar matrícula"
        isPending={cancelEnrollment.isPending}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
