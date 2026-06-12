"use client";

import { BookOpen, CalendarDays, GraduationCap, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/features/dashboard/stat-card";
import { useStudents } from "@/features/students/hooks";
import { useTeachers } from "@/features/teachers/hooks";
import { useSubjects } from "@/features/subjects/hooks";
import { useClasses } from "@/features/classes/hooks";
import { CURRENT_TERM } from "@/lib/constants";

export function AdminDashboard() {
  // size=1: só o totalElements do envelope interessa aqui
  const students = useStudents({ page: 0, size: 1 });
  const teachers = useTeachers({ page: 0, size: 1 });
  const subjects = useSubjects({ page: 0, size: 1 });
  const classes = useClasses({ term: CURRENT_TERM, page: 0, size: 1 });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral da secretaria acadêmica."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={GraduationCap}
          label="Alunos"
          value={students.data?.totalElements ?? 0}
          isLoading={students.isLoading}
        />
        <StatCard
          icon={Users}
          label="Professores"
          value={teachers.data?.totalElements ?? 0}
          isLoading={teachers.isLoading}
        />
        <StatCard
          icon={BookOpen}
          label="Disciplinas"
          value={subjects.data?.totalElements ?? 0}
          isLoading={subjects.isLoading}
        />
        <StatCard
          icon={CalendarDays}
          label="Turmas ativas"
          value={classes.data?.totalElements ?? 0}
          hint={`Período ${CURRENT_TERM}`}
          isLoading={classes.isLoading}
        />
      </div>
    </div>
  );
}
