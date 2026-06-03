import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type UpdateUserPayload = {
  name?: string;
  department?: string;
  role?: "applicant" | "approver" | "admin";
  email?: string;
  password?: string;
};

async function assertAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "ログインが必要です" },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "管理者権限が必要です" },
        { status: 403 }
      ),
    };
  }

  return { ok: true as const };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const adminCheck = await assertAdmin();

  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const { id } = await context.params;
  const body = (await request.json()) as UpdateUserPayload;

  const supabaseAdmin = createSupabaseAdminClient();

  const authAttributes: {
    email?: string;
    password?: string;
    user_metadata?: Record<string, string | undefined>;
  } = {};

  if (body.email) {
    authAttributes.email = body.email;
  }

  if (body.password) {
    authAttributes.password = body.password;
  }

  if (body.name || body.department || body.role) {
    authAttributes.user_metadata = {
      name: body.name,
      department: body.department,
      role: body.role,
    };
  }

  if (Object.keys(authAttributes).length > 0) {
    const { error: authError } =
      await supabaseAdmin.auth.admin.updateUserById(id, authAttributes);

    if (authError) {
      return NextResponse.json(
        { message: authError.message },
        { status: 400 }
      );
    }
  }

  const profileUpdate: {
    name?: string;
    department?: string;
    role?: "applicant" | "approver" | "admin";
    updated_at: string;
  } = {
    updated_at: new Date().toISOString(),
  };

  if (body.name !== undefined) {
    profileUpdate.name = body.name;
  }

  if (body.department !== undefined) {
    profileUpdate.department = body.department;
  }

  if (body.role !== undefined) {
    profileUpdate.role = body.role;
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update(profileUpdate)
    .eq("id", id);

  if (profileError) {
    return NextResponse.json(
      { message: profileError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: "ユーザー情報を更新しました" });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const adminCheck = await assertAdmin();

  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const { id } = await context.params;
  const supabaseAdmin = createSupabaseAdminClient();

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", id);

  if (profileError) {
    return NextResponse.json(
      { message: profileError.message },
      { status: 400 }
    );
  }

  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (authError) {
    return NextResponse.json(
      { message: authError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: "ユーザーを削除しました" });
}