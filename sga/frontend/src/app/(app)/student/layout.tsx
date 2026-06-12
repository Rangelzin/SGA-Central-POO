import { RoleLayout } from "@/components/shared/role-layout";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout roles={["STUDENT"]}>{children}</RoleLayout>;
}
