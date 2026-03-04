import { NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe";
import { supabaseAdmin } from "@/app/lib/supabase-server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !whsec) {
    return new NextResponse("Missing webhook secret/signature", { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whsec);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const paid =
        session.payment_status === "paid" || session.status === "complete";

      // ============================
      // ✅ TOPUP (NEU) — Wallet erhöhen
      // ============================
      const isTopup = session.metadata?.type === "topup";
      const walletId = session.metadata?.wallet_id || null;
      const amountCentsStr = session.metadata?.amount_cents || "0";
      const amountCents = Number(amountCentsStr);

      if (isTopup && paid && walletId && Number.isFinite(amountCents) && amountCents > 0) {
        const marker = `stripe_session:${session.id}`;

        // Idempotenz: wenn wir diese Session schon verbucht haben -> nichts tun
        const { data: existingTx } = await supabaseAdmin
          .from("wallet_transactions")
          .select("id")
          .eq("note", marker)
          .limit(1);

        if (!existingTx || existingTx.length === 0) {
          // 1) Wallet Balance erhöhen
          await supabaseAdmin
            .from("wallets")
            .update({}) // required by supabase typings sometimes
            .eq("id", walletId);

          // Atomar per RPC wäre besser, aber wir bleiben minimal:
          const { data: w } = await supabaseAdmin
            .from("wallets")
            .select("balance_cents")
            .eq("id", walletId)
            .single();

          const current = Number(w?.balance_cents || 0);
          const next = current + amountCents;

          await supabaseAdmin
            .from("wallets")
            .update({ balance_cents: next })
            .eq("id", walletId);

          // 2) Transaction log
          await supabaseAdmin.from("wallet_transactions").insert({
            wallet_id: walletId,
            type: "topup",
            amount_cents: amountCents,
            currency: "eur",
            note: marker,
          });
        }
      }

      // ============================
      // ✅ ORDERS (DEIN BESTEHENDER CODE)
      // ============================
      const orderId = session.metadata?.order_id;

      if (orderId && paid) {
        await supabaseAdmin
          .from("orders")
          .update({
            status: "paid",
            stripe_payment_intent_id: String(session.payment_intent || ""),
            customer_email: session.customer_details?.email || null,
            shipping_address: session.customer_details?.address || null,
            billing_address: session.customer_details?.address || null,
          })
          .eq("id", orderId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    return new NextResponse(`Webhook handler failed: ${e?.message}`, { status: 500 });
  }
}
