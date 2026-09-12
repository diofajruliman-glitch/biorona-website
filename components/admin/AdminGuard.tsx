"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isAdminUser } from "@/lib/supabase/admin";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "allowed" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verify() {
      try {
        const supabase = getSupabaseClient();
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
          window.location.replace("/admin/login/");
          return;
        }

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user || !isAdminUser(userData.user.app_metadata)) {
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            window.location.replace("/admin/login/");
            return;
          }

          const refreshedSession = await supabase.auth.getSession();
          const refreshedUser = await supabase.auth.getUser();
          if (refreshedSession.error || !refreshedSession.data.session || refreshedUser.error || !refreshedUser.data.user || !isAdminUser(refreshedUser.data.user.app_metadata)) {
            window.location.replace("/admin/login/");
            return;
          }
        }

        setStatus("allowed");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Konfigurasi admin tidak tersedia.");
        setStatus("error");
      }
    }

    void verify();
  }, []);

  if (status === "loading") return <div className="adminState" role="status">Memeriksa sesi admin…</div>;
  if (status === "error") return <div className="adminState adminError" role="alert">{message}</div>;
  return children;
}
