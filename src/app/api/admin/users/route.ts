import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type UserPayload = {
  name: string;
  email: string;
  password: string;
  department?: string;
  role: "applicant" | "approver" | "admin";
};

async function assert管理者() {
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

export async function GET() {
  const admin = await assert管理者();

  if (!admin.ok) {
    return admin.response;
  }

  const supabase管理者 = createSupabaseAdminClient();

  const { data: profiles, error: profilesError } = await supabase管理者
    .from("profiles")
    .select("id, name, role, department, created_at")
    .order("created_at", { ascending: false });

  if (profilesError) {
    return NextResponse.json(
      { message: "ユーザー情報を取得できませんでした。" },
      { status: 400 }
    );
  }

  const { data: authUsers, error: authUsersError } =
    await supabase管理者.auth.admin.listUsers();

  if (authUsersError) {
    return NextResponse.json(
      { message: "認証ユーザーを取得できませんでした。" },
      { status: 400 }
    );
  }

  const users = (profiles ?? []).map((profile) => {
    const authUser = authUsers.users.find((user) => user.id === profile.id);

    return {
      id: profile.id,
      name: profile.name,
      role: profile.role,
      department: profile.department,
      created_at: profile.created_at,
      email: authUser?.email ?? null,
      last_sign_in_at: authUser?.last_sign_in_at ?? null,
      email_confirmed_at: authUser?.email_confirmed_at ?? null,
    };
  });

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const admin = await assert管理者();

  if (!admin.ok) {
    return admin.response;
  }

  const body = (await request.json()) as UserPayload;

  if (!body.name || !body.email || !body.password || !body.role) {
    return NextResponse.json(
      { message: "氏名、メール、パスワード、権限を入力してください。" },
      { status: 400 }
    );
  }

  const supabase管理者 = createSupabaseAdminClient();

  const { data: createdUser, error: authError } =
    await supabase管理者.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        name: body.name,
        department: body.department ?? "",
        role: body.role,
      },
    });

  if (authError || !createdUser.user) {
    return NextResponse.json(
      { message: "ユーザーを作成できませんでした。" },
      { status: 400 }
    );
  }

  const { error: profileError } = await supabase管理者.from("profiles").upsert({
    id: createdUser.user.id,
    name: body.name,
    role: body.role,
    department: body.department ?? null,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    return NextResponse.json(
      { message: "プロフィールを保存できませんでした。" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: "ユーザーを作成しました。",
    userId: createdUser.user.id,
  });
}
