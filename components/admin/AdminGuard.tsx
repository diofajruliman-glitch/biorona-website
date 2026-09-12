"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isAdminUser } from "@/lib/supabase/admin";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "allowed" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const supabase = getSupabaseClient();
      supabase.auth.getSession().then(({ data, error }) => {
        if (error || !data.session || !isAdminUser(data.session.user.app_metadata)) {
          window.location.replace("/admin/login/");
          return;
        }
        setStatus("allowed");
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Konfigurasi admin tidak tersedia.");
      setStatus("error");
    }
  }, []);

  if (status === "loading") return <div className="adminState" role="status">Memeriksa sesi admin…</div>;
  if (status === "error") return <div className="adminState adminError" role="alert">{message}</div>;
  return children;
}
