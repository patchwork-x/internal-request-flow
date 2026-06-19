import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type UserPayload = {
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
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "ログインしてください。" },
        { status: 401 }
      ),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "管理者のみ操作できます。" },
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
  const admin = await assertAdmin();

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;
  const body = (await request.json()) as UserPayload;

  const supabaseAdmin = createSupabaseAdminClient();

  const authUpdate: {
    email?: string;
    password?: string;
    user_metadata?: Record<string, string | undefined>;
  } = {};

  if (body.email) {
    authUpdate.email = body.email;
  }

  if (body.password) {
    authUpdate.password = body.password;
  }

  if (body.name || body.department || body.role) {
    authUpdate.user_metadata = {
      name: body.name,
      department: body.department,
      role: body.role,
    };
  }

  if (Object.keys(authUpdate).length > 0) {
    const { error: authError } =
      await supabaseAdmin.auth.admin.updateUserById(id, authUpdate);

    if (authError) {
      console.error(authError);
      return NextResponse.json(
        { message: "認証ユーザーを更新できませんでした。" },
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
    console.error(profileError);
    return NextResponse.json(
      { message: "プロフィールを更新できませんでした。" },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: "ユーザー情報を更新しました。" });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await assertAdmin();

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;
  const supabaseAdmin = createSupabaseAdminClient();

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", id);

  if (profileError) {
    console.error(profileError);
    return NextResponse.json(
      { message: "プロフィールを削除できませんでした。" },
      { status: 400 }
    );
  }

  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (authError) {
    console.error(authError);
    return NextResponse.json(
      { message: "認証ユーザーを削除できませんでした。" },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: "ユーザーを削除しました。" });
}