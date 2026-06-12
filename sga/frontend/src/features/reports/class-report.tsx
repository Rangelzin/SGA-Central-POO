"use client";

import { Download, Percent, TrendingUp, UserCheck, Users, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/features/dashboard/stat-card";
import { useClass, useClassReport } from "@/features/classes/hooks";
import {
  cn,
  downloadTextFile,
  formatAttendance,
  formatGrade,
} from "@/lib/utils";
import { MIN_ATTENDANCE } from "@/types/domain";
import type { ClassReport as ClassReportData } from "@/types/api";

const statusLabels: Record<string, string> = {
  ENROLLED: "Matriculado",
  IN_PROGRESS: "Em andamento",
  APPROVED: "Aprovado",
  FAILED: "Reprovado",
  CANCELLED: "Cancelada",
};

/** Export simples em CSV (atende a "saída simples" do RF-07). */
function exportReportCsv(report: ClassReportData) {
  const header = "Aluno;Matricula;Nota;Frequencia;Situacao";
  const lines = report.rows.map((row) =>
    [
      row.student.name,
      row.student.enrollmentCode,
      row.grade ?? "",
      row.attendance ?? "",
      statusLabels[row.status],
    ].join(";"),
  );
  downloadTextFile(
    `relatorio-${report.class.code}-${report.class.term}.csv`,
    [header, ...lines].join("\n"),
    "text/csv",
  );
}

export function ClassReportView({ classId }: { classId: string }) {
  const classQuery = useClass(classId);
  const report = useClassReport(classId);

  if (classQuery.isLoading || report.isLoading) return <LoadingState />;
  if (report.isError || !report.data) {
    return (
      <ErrorState
        message="Não foi possível carregar o relatório."
        onRetry={() => report.refetch()}
      />
    );
  }

  const data = report.data;
  const approvalRate =
    data.studentsCount > 0
      ? Math.round((data.approvedCount / data.studentsCount) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Relatório — ${data.class.code}`}
        description={
          classQuery.data
            ? `${classQuery.data.subject.name} · ${data.class.term} · ${classQuery.data.teacher.name}`
            : data.class.term
        }
        action={
          <Button
            variant="outline"
            onClick={() => exportReportCsv(data)}
            disabled={data.rows.length === 0}
          >
            <Download className="size-4" aria-hidden />
            Exportar CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Alunos" value={data.studentsCount} />
        <StatCard
          icon={TrendingUp}
          label="Média geral"
          value={formatGrade(data.averageGrade)}
        />
        <StatCard
          icon={UserCheck}
          label="Aprovados"
          value={data.approvedCount}
          hint={`${approvalRate}% da turma`}
        />
        <StatCard icon={UserX} label="Reprovados" value={data.failedCount} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Desempenho por aluno</CardTitle>
        </CardHeader>
        <CardContent>
          {data.rows.length === 0 ? (
            <EmptyState
              icon={Percent}
              title="Turma sem alunos matriculados"
              description="O relatório fica disponível quando houver matrículas."
            />
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Aluno</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Frequência</TableHead>
                    <TableHead>Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.map((row) => (
                    <TableRow key={row.student.uuid}>
                      <TableCell className="font-medium">{row.student.name}</TableCell>
                      <TableCell>{row.student.enrollmentCode}</TableCell>
                      <TableCell
                        className={cn(
                          "tabular-nums",
                          row.grade !== null && row.grade < 6 && "text-destructive",
                        )}
                      >
                        {formatGrade(row.grade)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "tabular-nums",
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
