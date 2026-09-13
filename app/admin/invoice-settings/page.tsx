import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import InvoiceSettingsEditor from "@/components/admin/InvoiceSettingsEditor";

export default function Page() {
  return <AdminGuard><AdminShell><InvoiceSettingsEditor/></AdminShell></AdminGuard>;
}
