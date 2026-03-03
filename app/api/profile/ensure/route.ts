import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, fullName, role } = body as {
      userId: string;
      email?: string | null;
      fullName?: string | null;
      role: "parent" | "kid";
    };

    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    if (role !== "parent" && role !== "kid") return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    // 1) Profile upsert (id = auth.users.id)
    const { error: pErr } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        role,
        email: email ?? null,
        full_name: fullName ?? null,
      },
      { onConflict: "id" }
    );

    if (pErr) return NextResponse.json({ error: "Profile upsert failed", details: pErr.message }, { status: 500 });

    // 2) Wallet nur für parent anlegen (falls nicht existiert)
    if (role === "parent") {
      const { data: existingWallet, error: wSelErr } = await supabaseAdmin
        .from("wallets")
        .select("id")
        .eq("parent_id", userId)
        .maybeSingle();

      if (wSelErr) return NextResponse.json({ error: "Wallet select failed", details: wSelErr.message }, { status: 500 });

      if (!existingWallet?.id) {
        const { error: wInsErr } = await supabaseAdmin.from("wallets").insert({
          parent_id: userId,
          balance_cents: 0,
          currency: "eur",
        });

        if (wInsErr) return NextResponse.json({ error: "Wallet insert failed", details: wInsErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}