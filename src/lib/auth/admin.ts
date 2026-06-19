import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getLoginUserProfile() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      user: null,
      profile: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, role, department")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error(profileError);

    return {
      user,
      profile: null,
    };
  }

  return {
    user,
    profile,
  };
}

export async function isCurrentUserAdmin() {
  const { profile } = await getLoginUserProfile();

  return profile?.role === "admin";
}