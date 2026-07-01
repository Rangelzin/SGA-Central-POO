"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCpf } from "@/lib/utils";
import type { Student } from "@/types/domain";

export function getStudentColumns({
  onDelete,
}: {
  onDelete: (student: Student) => void;
}): ColumnDef<Student, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    { accessorKey: "enrollmentCode", header: "Matrícula" },
    {
      accessorKey: "cpf",
      header: "CPF",
      cell: ({ row }) => formatCpf(row.original.cpf),
    },
    { accessorKey: "email", header: "E-mail" },
    {
      id: "course",
      header: "Departamento",
      cell: ({ row }) => row.original.course?.name ?? "-",
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Editar aluno">
            <Link href={`/admin/students/${row.original.uuid}`}>
              <Pencil className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Remover aluno"
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
