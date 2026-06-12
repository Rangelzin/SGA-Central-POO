import { RoleLayout } from "@/components/shared/role-layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout roles={["ADMIN"]}>{children}</RoleLayout>;
}
