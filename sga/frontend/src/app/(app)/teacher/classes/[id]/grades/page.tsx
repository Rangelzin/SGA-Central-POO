"use client";

import { use } from "react";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { GradeRow } from "@/features/grades/grade-row";
import { useClass, useClassEnrollments } from "@/features/classes/hooks";
import { MIN_ATTENDANCE, PASSING_GRADE } from "@/types/domain";

export default function ClassGradesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const classQuery = useClass(id);
  const enrollments = useClassEnrollments(id);

  if (classQuery.isLoading || enrollments.isLoading) return <LoadingState />;
  if (classQuery.isError || !classQuery.data) {
    return (
      <ErrorState message="Turma não encontrada." onRetry={() => classQuery.refetch()} />
    );
  }
  if (enrollments.isError) {
    return <ErrorState onRetry={() => enrollments.refetch()} />;
  }

  const classItem = classQuery.data;
  const list = enrollments.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Notas — ${classItem.code}`}
        description={`${classItem.subject.name} · ${classItem.term} · Aprovação: média ≥ ${PASSING_GRADE.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} e frequência ≥ ${MIN_ATTENDANCE}%`}
        action={
          <Button asChild variant="outline">
            <Link href={`/teacher/classes/${classItem.uuid}/report`}>
              <BarChart3 className="size-4" aria-hidden />
              Relatório
            </Link>
          </Button>
        }
      />

      {list.length === 0 ? (
        <EmptyState
          title="Nenhum aluno matriculado"
          description="O lançamento de notas fica disponível quando houver matrículas."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Aluno</TableHead>
                <TableHead>Nota (0–10)</TableHead>
                <TableHead>Frequência (%)</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Avaliações</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Salvar</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((enrollment) => (
                <GradeRow
                  key={enrollment.uuid}
                  enrollment={enrollment}
                  classId={classItem.uuid}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
