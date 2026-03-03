import { NextRequest, NextResponse } from "next/server";
import { supabaseAuthRoute } from "@/app/lib/supabase-auth-route";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, message: "Bitte E-Mail und Passwort eingeben." },
      { status: 400 }
    );
  }

  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!looksLikeEmail) {
    return NextResponse.json(
      { ok: false, message: `Email address "${email}" is invalid` },
      { status: 400 }
    );
  }

  const { supabase, applyCookies } = supabaseAuthRoute(req);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    const res = NextResponse.json(
      { ok: false, message: error?.message || "Login fehlgeschlagen." },
      { status: 401 }
    );
    return applyCookies(res);
  }

  const res = NextResponse.json({ ok: true });
  return applyCookies(res);
}