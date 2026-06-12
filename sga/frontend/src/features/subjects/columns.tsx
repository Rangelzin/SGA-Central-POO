"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { subjectTypeLabels } from "@/features/subjects/schemas";
import type { Subject } from "@/types/domain";

export function getSubjectColumns({
  onDelete,
  onActivate,
}: {
  onDelete: (subject: Subject) => void;
  onActivate: (subject: Subject) => void;
}): ColumnDef<Subject, unknown>[] {
  return [
    { accessorKey: "code", header: "Código" },
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      id: "type",
      header: "Tipo",
      cell: ({ row }) => subjectTypeLabels[row.original.type],
    },
    {
      accessorKey: "workload",
      header: "CH",
      cell: ({ row }) => `${row.original.workload}h`,
    },
    {
      id: "teacher",
      header: "Professor responsável",
      cell: ({ row }) =>
        row.original.responsibleTeacher?.name ?? (
          <span className="text-muted-foreground">Não definido</span>
        ),
    },
    {
      id: "active",
      header: "Status",
      cell: ({ row }) =>
        row.original.active ? (
          <Badge className="border-transparent bg-success/15 text-success">Ativa</Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Inativa
          </Badge>
        ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => {
        const subject = row.original;
        const canActivate = !subject.active && Boolean(subject.responsibleTeacher);
        return (
          <div className="flex justify-end gap-1">
            {!subject.active && (
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* span: tooltip precisa funcionar mesmo com o botão desabilitado */}
                  <span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Ativar disciplina"
                      className="text-success hover:text-success"
                      disabled={!canActivate}
                      onClick={() => onActivate(subject)}
                    >
                      <CheckCircle2 className="size-4" aria-hidden />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {canActivate
                    ? "Ativar disciplina"
                    : "Defina um professor responsável para ativar (RF-03)"}
                </TooltipContent>
              </Tooltip>
            )}
            <Button asChild variant="ghost" size="icon" aria-label="Editar disciplina">
              <Link href={`/admin/subjects/${subject.uuid}`}>
                <Pencil className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remover disciplina"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(subject)}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        );
      },
    },
  ];
}
