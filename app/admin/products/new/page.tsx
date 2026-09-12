import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import ProductEditor from "@/components/admin/ProductEditor";
export default function Page(){return <AdminGuard><AdminShell><ProductEditor/></AdminShell></AdminGuard>}
