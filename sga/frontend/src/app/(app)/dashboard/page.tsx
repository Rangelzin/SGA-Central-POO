"use client";

import { useAuth } from "@/lib/auth/use-auth";
import { AdminDashboard } from "@/features/dashboard/admin-dashboard";
import { TeacherDashboard } from "@/features/dashboard/teacher-dashboard";
import { StudentDashboard } from "@/features/dashboard/student-dashboard";
import { LoadingState } from "@/components/shared/loading-state";

export default function DashboardPage() {
  const { user } = useAuth();

  switch (user?.role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "TEACHER":
      return <TeacherDashboard />;
    case "STUDENT":
      return <StudentDashboard />;
    default:
      return <LoadingState />;
  }
}
