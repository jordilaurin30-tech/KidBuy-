import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe";
import { supabaseAdmin } from "@/app/lib/supabase-server";
import { supabaseAuthRoute } from "@/app/lib/supabase-auth-route";

type CartItem = {
  id: string;
  title: string;
  qty: number;
  priceCHF: number;
  imageUrl?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const { supabase, applyCookies } = supabaseAuthRoute(req);
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      const res = NextResponse.json(
        { error: "Bitte zuerst anmelden, bevor du bestellen kannst." },
        { status: 401 }
      );
      return applyCookies(res);
    }

    const user = userData.user;

    const body = await req.json().catch(() => null);
    const items: CartItem[] = Array.isArray(body?.items) ? body.items : [];
    const shippingCents: number = Number(body?.shippingCents ?? 0);

    if (!items.length) {
      const res = NextResponse.json({ error: "Cart ist leer." }, { status: 400 });
      return applyCookies(res);
    }

    const subtotalCents = items.reduce((sum, p) => {
      const unit = Math.round(Number(p.priceCHF) * 100);
      return sum + unit * Number(p.qty);
    }, 0);

    const totalCents = subtotalCents + shippingCents;

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        customer_email: user.email ?? null,
        status: "pending",
        currency: "eur",
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        total_cents: totalCents,
        items,
      })
      .select("id")
      .single();

    if (orderErr || !order?.id) {
      const res = NextResponse.json(
        { error: "DB order insert failed.", details: orderErr ?? null },
        { status: 500 }
      );
      return applyCookies(res);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "eur",
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: [
          "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT",
          "NL","PL","PT","RO","SK","SI","ES","SE"
        ],
      },
      line_items: items.map((p) => ({
        quantity: p.qty,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(Number(p.priceCHF) * 100),
          product_data: {
            name: p.title,
            images: p.imageUrl ? [p.imageUrl] : undefined,
          },
        },
      })),
      shipping_options: shippingCents
        ? [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: { amount: shippingCents, currency: "eur" },
                display_name: "Versand",
              },
            },
          ]
        : undefined,

      metadata: { order_id: String(order.id), user_id: String(user.id) },

      // ✅ success bekommt session_id von Stripe
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,

      // ✅ cancel bekommt KEIN {CHECKOUT_SESSION_ID}
      //    aber wir geben unsere order_id selbst mit, damit wir wissen was abgebrochen wurde
      cancel_url: `${appUrl}/checkout/cancel?order_id=${order.id}`,
    });

    await supabaseAdmin
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    const res = NextResponse.json({ url: session.url });
    return applyCookies(res);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Checkout failed." },
      { status: 500 }
    );
  }
}