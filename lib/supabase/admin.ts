import { getSupabaseClient } from "./client";

export function isAdminUser(appMetadata: Record<string, unknown> | undefined) {
  return appMetadata?.role === "admin";
}

export async function requireAdminSession() {
  const supabase = getSupabaseClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error("Sesi admin tidak valid atau sudah berakhir.");
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user || !isAdminUser(userData.user.app_metadata)) {
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      throw new Error("Sesi admin tidak valid atau sudah berakhir.");
    }

    const refreshedUser = await supabase.auth.getUser();
    if (refreshedUser.error || !refreshedUser.data.user || !isAdminUser(refreshedUser.data.user.app_metadata)) {
      throw new Error("Sesi admin tidak valid atau sudah berakhir.");
    }

    const refreshedSession = await supabase.auth.getSession();
    if (refreshedSession.error || !refreshedSession.data.session) {
      throw new Error("Sesi admin tidak valid atau sudah berakhir.");
    }

    return { supabase, session: refreshedSession.data.session };
  }

  return { supabase, session };
}
