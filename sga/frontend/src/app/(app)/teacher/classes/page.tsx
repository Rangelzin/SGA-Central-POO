"use client";

import Link from "next/link";
import { BarChart3, CalendarDays, MapPin, PenLine, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { useClasses } from "@/features/classes/hooks";

export default function TeacherClassesPage() {
  const classes = useClasses({ teacherId: "me", page: 0, size: 50 });
  const list = classes.data?.content ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minhas turmas"
        description="Lance notas e frequência e acompanhe o desempenho (RF-09)."
      />

      {classes.isError ? (
        <ErrorState onRetry={() => classes.refetch()} />
      ) : classes.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          title="Nenhuma turma atribuída"
          description="Quando a secretaria criar turmas para você, elas aparecem aqui."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((classItem) => (
            <Card key={classItem.uuid} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{classItem.code}</CardTitle>
                <CardDescription>{classItem.subject.name}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-1.5 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-4 shrink-0" aria-hidden />
                  {classItem.term} · {classItem.schedule}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0" aria-hidden />
                  {classItem.location}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="size-4 shrink-0" aria-hidden />
                  {classItem.enrolledCount} aluno{classItem.enrolledCount === 1 ? "" : "s"}{" "}
                  matriculado{classItem.enrolledCount === 1 ? "" : "s"}
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/teacher/classes/${classItem.uuid}/grades`}>
                    <PenLine className="size-4" aria-hidden />
                    Lançar notas
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/teacher/classes/${classItem.uuid}/report`}>
                    <BarChart3 className="size-4" aria-hidden />
                    Relatório
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
