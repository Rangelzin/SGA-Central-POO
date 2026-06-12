"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getStudentColumns } from "@/features/students/columns";
import { useDeleteStudent, useStudents } from "@/features/students/hooks";
import { PAGE_SIZE } from "@/lib/constants";
import type { Student } from "@/types/domain";

export default function StudentsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const students = useStudents({ page, size: PAGE_SIZE, search });
  const deleteStudent = useDeleteStudent();

  const columns = useMemo(
    () => getStudentColumns({ onDelete: setStudentToDelete }),
    [],
  );

  function handleConfirmDelete() {
    if (!studentToDelete) return;
    deleteStudent.mutate(studentToDelete.uuid, {
      onSuccess: () => setStudentToDelete(null),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alunos"
        description="Gerencie os alunos cadastrados (RF-01)."
        action={
          <Button asChild>
            <Link href="/admin/students/new">
              <Plus className="size-4" aria-hidden />
              Novo aluno
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={students.data?.content}
        isLoading={students.isLoading}
        isError={students.isError}
        onRetry={() => students.refetch()}
        page={page}
        totalPages={students.data?.totalPages ?? 0}
        totalElements={students.data?.totalElements ?? 0}
        onPageChange={setPage}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        searchPlaceholder="Buscar por nome, matrícula ou e-mail"
        emptyTitle="Nenhum aluno encontrado"
        emptyDescription={
          search
            ? "Ajuste a busca e tente novamente."
            : "Cadastre o primeiro aluno para começar."
        }
        emptyAction={
          !search && (
            <Button asChild size="sm">
              <Link href="/admin/students/new">Novo aluno</Link>
            </Button>
          )
        }
      />

      <ConfirmDialog
        open={Boolean(studentToDelete)}
        onOpenChange={(open) => !open && setStudentToDelete(null)}
        title="Remover aluno"
        description={`Tem certeza que deseja remover ${studentToDelete?.name}? As matrículas do aluno também serão removidas.`}
        isPending={deleteStudent.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
