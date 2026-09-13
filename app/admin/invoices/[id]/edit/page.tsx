"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import InvoiceEditor from "@/components/admin/InvoiceEditor";

function Editor() {
  const { id } = useParams<{ id: string }>();
  return <AdminGuard><AdminShell><InvoiceEditor invoiceId={id}/></AdminShell></AdminGuard>;
}

export default function Page() {
  return <Suspense fallback={<div className="adminState">Memuat invoice…</div>}><Editor/></Suspense>;
}
