import Link from "next/link";
import { redirect } from "next/navigation";
import { stripe } from "@/app/lib/stripe";
import { supabaseAdmin } from "@/app/lib/supabase-server";
import { supabaseAuthServer } from "@/app/lib/supabase-auth-server";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  // ✅ Wenn jemand diese Seite ohne Stripe öffnet -> ab zur Cancel-Seite
  if (!sessionId) {
    redirect("/checkout/cancel");
  }

  // ✅ nur eingeloggte user dürfen es sehen
  const supabase = supabaseAuthServer();
  const { data: u } = await supabase.auth.getUser();
  const user = u?.user;

  if (!user) {
    redirect("/login");
  }

  // ✅ Order muss in DB existieren und dem User gehören
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id,status,total_cents,currency,stripe_session_id")
    .eq("stripe_session_id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) {
    redirect("/checkout/cancel");
  }

  // Stripe nur für Anzeige
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const paid = order.status === "paid";
  const amount = ((order.total_cents ?? 0) / 100).toFixed(2);
  const currency = String(order.currency ?? "eur").toUpperCase();

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "system-ui" }}>
      <div style={{ width: "min(720px, 100%)", borderRadius: 22, border: "1px solid rgba(15,23,42,0.10)", background: "white", padding: 18 }}>
        <div style={{ fontWeight: 950, fontSize: 26 }}>
          {paid ? "✅ Zahlung erfolgreich" : "⏳ Zahlung wird geprüft"}
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900 }}>
            <span>Status (DB)</span>
            <span>{order.status}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900 }}>
            <span>Status (Stripe)</span>
            <span>{session.payment_status}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900 }}>
            <span>Betrag</span>
            <span>{amount} {currency}</span>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/product" style={{ fontWeight: 950, textDecoration: "none" }}>← Weiter shoppen</Link>
            <Link href="/cart" style={{ fontWeight: 950, textDecoration: "none" }}>Warenkorb</Link>
          </div>
        </div>
      </div>
    </div>
  );
}