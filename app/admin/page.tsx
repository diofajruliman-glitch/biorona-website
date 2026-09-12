import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import AdminDashboard from "@/components/admin/AdminDashboard";
export default function Page(){return <AdminGuard><AdminShell><AdminDashboard/></AdminShell></AdminGuard>}
