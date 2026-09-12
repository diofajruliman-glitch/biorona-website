import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import AdminProducts from "@/components/admin/AdminProducts";
export default function Page(){return <AdminGuard><AdminShell><AdminProducts/></AdminShell></AdminGuard>}
