import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase-server";

function looksLikeEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const full_name = typeof body?.full_name === "string" ? body.full_name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = body?.role === "kid" ? "kid" : "parent"; // nur "kid" oder "parent"

  if (!full_name) {
    return NextResponse.json({ ok: false, message: "Bitte Name eingeben." }, { status: 400 });
  }
  if (!email || !looksLikeEmail(email)) {
    return NextResponse.json({ ok: false, message: `Email address "${email}" is invalid` }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ ok: false, message: "Passwort muss mindestens 6 Zeichen haben." }, { status: 400 });
  }

  // 1) Supabase Auth User erstellen (Admin API)
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // wichtig: sonst kommt oft "Bitte E-Mail bestätigen"
  });

  if (createErr || !created?.user) {
    // häufig: User existiert schon
    const msg = createErr?.message || "Registrierung fehlgeschlagen (Auth).";
    return NextResponse.json({ ok: false, message: msg }, { status: 400 });
  }

  const userId = created.user.id;

  // 2) Profil in public.profiles speichern (id = auth.users.id)
  const { error: profileErr } = await supabaseAdmin.from("profiles").insert({
    id: userId,
    role,
    parent_id: null, // Parent hat null; Kid bekommst du später wenn du parent_id verknüpfst
    full_name,
    email,
  });

  if (profileErr) {
    // falls Profil insert fail: Auth-User wieder löschen, damit kein "Zombie user" bleibt
    await supabaseAdmin.auth.admin.deleteUser(userId);

    return NextResponse.json(
      { ok: false, message: `Profil konnte nicht gespeichert werden: ${profileErr.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, userId });
}