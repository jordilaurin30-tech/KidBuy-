import { NextRequest, NextResponse } from "next/server";
import { supabaseAuthRoute } from "@/app/lib/supabase-auth-route";

export async function GET(req: NextRequest) {
  const { supabase, applyCookies } = supabaseAuthRoute(req);

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const res = NextResponse.json(
      { ok: false, user: null, error: error?.message ?? "Auth session missing!" },
      { status: 401 }
    );
    return applyCookies(res);
  }

  const res = NextResponse.json({
    ok: true,
    user: { id: data.user.id, email: data.user.email },
  });

  return applyCookies(res);
}