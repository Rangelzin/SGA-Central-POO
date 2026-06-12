import { RoleLayout } from "@/components/shared/role-layout";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout roles={["TEACHER"]}>{children}</RoleLayout>;
}
