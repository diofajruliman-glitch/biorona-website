"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import ProductEditor from "@/components/admin/ProductEditor";

function EditProduct(){const params=useParams<{id:string}>();const search=useSearchParams();const productId=params.id==="_"?search.get("id")??undefined:params.id;return <AdminGuard><AdminShell>{productId?<ProductEditor productId={productId}/>:<div className="adminState adminError">ID produk tidak tersedia.</div>}</AdminShell></AdminGuard>}
export default function Page(){return <Suspense fallback={<div className="adminState">Memuat produk…</div>}><EditProduct/></Suspense>}
