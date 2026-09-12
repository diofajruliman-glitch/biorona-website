import AdminGuard from "@/components/admin/AdminGuard";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminShell from "@/components/admin/AdminShell";

export default function Page() {
  return (
    <AdminGuard>
      <AdminShell>
        <AdminCategories />
      </AdminShell>
    </AdminGuard>
  );
}
