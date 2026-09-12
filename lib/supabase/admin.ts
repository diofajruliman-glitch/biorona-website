import { getSupabaseClient } from "./client";

export async function requireAdminSession() {
  const supabase = getSupabaseClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session || session.user.app_metadata?.role !== "admin") {
    throw new Error("Sesi admin tidak valid atau sudah berakhir.");
  }
  return { supabase, session };
}

export function isAdminUser(appMetadata: Record<string, unknown> | undefined) {
  return appMetadata?.role === "admin";
}
