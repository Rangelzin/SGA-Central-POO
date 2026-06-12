"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { BarChart3, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Class } from "@/types/domain";

export function getClassColumns({
  onDelete,
}: {
  onDelete: (classItem: Class) => void;
}): ColumnDef<Class, unknown>[] {
  return [
    {
      accessorKey: "code",
      header: "Turma",
      cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
    },
    {
      id: "subject",
      header: "Disciplina",
      cell: ({ row }) => row.original.subject.name,
    },
    {
      id: "teacher",
      header: "Professor",
      cell: ({ row }) => row.original.teacher.name,
    },
    { accessorKey: "term", header: "Período" },
    { accessorKey: "schedule", header: "Horário" },
    {
      id: "seats",
      header: "Vagas",
      cell: ({ row }) => {
        const { availableSeats, capacity } = row.original;
        return (
          <span
            className={cn(
              "tabular-nums",
              availableSeats === 0 && "font-medium text-destructive",
            )}
          >
            {availableSeats}/{capacity}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Relatório da turma">
            <Link href={`/admin/classes/${row.original.uuid}/report`}>
              <BarChart3 className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Editar turma">
            <Link href={`/admin/classes/${row.original.uuid}`}>
              <Pencil className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Remover turma"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      ),
    },
  ];
}
