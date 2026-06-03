import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  department?: string;
  role: "applicant" | "approver" | "admin";
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

export async function GET() {
  const adminCheck = await assertAdmin();

  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id, name, role, department, created_at")
    .order("created_at", { ascending: false });

  if (profilesError) {
    return NextResponse.json(
      { message: profilesError.message },
      { status: 400 }
    );
  }

  const { data: usersData, error: usersError } =
    await supabaseAdmin.auth.admin.listUsers();

  if (usersError) {
    return NextResponse.json(
      { message: usersError.message },
      { status: 400 }
    );
  }

  const users = (profiles ?? []).map((profile) => {
    const authUser = usersData.users.find((user) => user.id === profile.id);

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
  const adminCheck = await assertAdmin();

  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const body = (await request.json()) as CreateUserPayload;

  if (!body.name || !body.email || !body.password || !body.role) {
    return NextResponse.json(
      { message: "氏名、メールアドレス、パスワード、権限は必須です" },
      { status: 400 }
    );
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: createdUser, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        name: body.name,
        department: body.department ?? "",
        role: body.role,
      },
    });

  if (authError) {
    return NextResponse.json(
      { message: authError.message },
      { status: 400 }
    );
  }

  const userId = createdUser.user.id;

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: userId,
    name: body.name,
    role: body.role,
    department: body.department ?? null,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    return NextResponse.json(
      { message: profileError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: "ユーザーを作成しました",
    userId,
  });
}