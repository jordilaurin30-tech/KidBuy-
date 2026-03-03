import { NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe";
import { supabaseAdmin } from "@/app/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const walletId = String(body?.walletId || "").trim();
    const amountEuros = Number(body?.amountEuros);

    if (!walletId) return NextResponse.json({ error: "Missing walletId" }, { status: 400 });
    if (!Number.isFinite(amountEuros) || amountEuros <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const amountCents = Math.round(amountEuros * 100);

    // Check wallet exists (simple)
    const { data: wallet, error: wErr } = await supabaseAdmin
      .from("wallets")
      .select("id, currency")
      .eq("id", walletId)
      .single();

    if (wErr || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"], // Apple Pay erscheint automatisch, wenn möglich
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: { name: "KidBuy Guthaben-Aufladung" },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/parent/topup?success=1`,
      cancel_url: `${origin}/parent/topup?canceled=1`,
      metadata: {
        type: "topup",
        wallet_id: walletId,
        amount_cents: String(amountCents),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Topup failed" }, { status: 500 });
  }
}