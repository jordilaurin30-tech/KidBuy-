import { NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Für den Start: parentId & walletId kommen aus dem Request
    // Später: holst du das aus Login/Session
    const parentId = String(body?.parentId || "");
    const walletId = String(body?.walletId || "");
    const amountCents = Number(body?.amountCents || 0);

    if (!parentId || !walletId) {
      return NextResponse.json({ error: "parentId oder walletId fehlt." }, { status: 400 });
    }

    if (!Number.isFinite(amountCents) || amountCents < 100) {
      return NextResponse.json({ error: "Betrag zu klein. Minimum 1.00 EUR (=100 cents)." }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "eur",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: { name: "KidBuy Guthaben-Aufladung" },
          },
        },
      ],
      // ✅ Metadata: damit wir im Webhook wissen, welches Wallet
      metadata: {
        type: "wallet_topup",
        parent_id: parentId,
        wallet_id: walletId,
        amount_cents: String(amountCents),
      },
      success_url: `${appUrl}/parent/topup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/parent/topup/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Topup failed." }, { status: 500 });
  }
}