"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useStudentTranscript } from "@/features/students/hooks";
import { useAuth } from "@/lib/auth/use-auth";
import {
  cn,
  downloadTextFile,
  formatAttendance,
  formatGrade,
} from "@/lib/utils";
import { MIN_ATTENDANCE } from "@/types/domain";
import type { Transcript } from "@/types/api";

const statusLabels: Record<string, string> = {
  ENROLLED: "Matriculado",
  IN_PROGRESS: "Em andamento",
  APPROVED: "Aprovado",
  FAILED: "Reprovado",
  CANCELLED: "Cancelada",
};

/** Export em texto simples (RF-06). */
function exportTranscript(transcript: Transcript) {
  const lines = [
    "HISTÓRICO ESCOLAR — SGA",
    `Aluno: ${transcript.student.name} (${transcript.student.enrollmentCode})`,
    "",
    "Disciplina;Turma;Período;CH;Nota;Frequência;Situação",
    ...transcript.rows.map((row) =>
      [
        `${row.subject.code} ${row.subject.name}`,
        row.class.code,
        row.class.term,
        `${row.subject.workload}h`,
        row.grade ?? "",
        row.attendance ?? "",
        statusLabels[row.status],
      ].join(";"),
    ),
    "",
    `Carga horária concluída: ${transcript.completedWorkload}h`,
    `Média geral: ${transcript.overallAverage ?? "—"}`,
  ];
  downloadTextFile(
    `historico-${transcript.student.enrollmentCode}.txt`,
    lines.join("\n"),
  );
}

export default function TranscriptPage() {
  const { user } = useAuth();
  const transcript = useStudentTranscript(user?.uuid);

  if (transcript.isLoading) return <LoadingState />;
  if (transcript.isError || !transcript.data) {
    return (
      <ErrorState
        message="Não foi possível carregar o histórico."
        onRetry={() => transcript.refetch()}
      />
    );
  }

  const data = transcript.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico escolar"
        description={`${data.student.name} · Matrícula ${data.student.enrollmentCode} (RF-06)`}
        action={
          <Button
            variant="outline"
            onClick={() => exportTranscript(data)}
            disabled={data.rows.length === 0}
          >
            <Download className="size-4" aria-hidden />
            Exportar
          </Button>
        }
      />

      {data.rows.length === 0 ? (
        <EmptyState
          title="Histórico vazio"
          description="As disciplinas cursadas aparecem aqui ao longo do curso."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">CH</TableHead>
                  <TableHead className="text-right">Nota</TableHead>
                  <TableHead className="text-right">Frequência</TableHead>
                  <TableHead>Situação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((row) => (
                  <TableRow key={`${row.class.uuid}-${row.subject.uuid}`}>
                    <TableCell className="font-medium">
                      {row.subject.code} — {row.subject.name}
                    </TableCell>
                    <TableCell>{row.class.code}</TableCell>
                    <TableCell>{row.class.term}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.subject.workload}h
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatGrade(row.grade)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums",
                        row.attendance !== null &&
                          row.attendance < MIN_ATTENDANCE &&
                          "font-medium text-warning",
                      )}
                    >
                      {formatAttendance(row.attendance)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Card>
            <CardContent className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-8">
              <p>
                Carga horária concluída:{" "}
                <strong className="tabular-nums">{data.completedWorkload}h</strong>
              </p>
              <p>
                Média geral:{" "}
                <strong className="tabular-nums">
                  {data.overallAverage !== null ? formatGrade(data.overallAverage) : "—"}
                </strong>
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
