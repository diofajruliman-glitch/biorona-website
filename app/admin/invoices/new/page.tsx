import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import InvoiceEditor from "@/components/admin/InvoiceEditor";

export default function Page() {
  return <AdminGuard><AdminShell><InvoiceEditor/></AdminShell></AdminGuard>;
}
