import AdminGuard from "@/components/admin/AdminGuard";
import AdminInvoices from "@/components/admin/AdminInvoices";
import AdminShell from "@/components/admin/AdminShell";

export default function Page() {
  return <AdminGuard><AdminShell><AdminInvoices/></AdminShell></AdminGuard>;
}
