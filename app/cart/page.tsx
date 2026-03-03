"use client"

import React from "react";
import Link from "next/link";
import { useCart } from "../../components/cart/cart-context";
import CartCheerAI from "../components/CartCheerAI";
import { supabaseBrowser } from "@/app/lib/supabase-browser";


function formatCHF(v: number) {
  return `CHF ${v.toFixed(2)}`;
}

export default function CartPage() {
  const { items, subtotal, count, removeItem, setQty, clear } = useCart();

  // ✅ Ergänzung: Checkout UX (Loading + Error)
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null);

  // ✅ Ergänzung: fix Versandkosten in Cents (EUR)
  const SHIPPING_CENTS = 490;

  // ✅ Ergänzung: Checkout starten
  async function startCheckout() {
    if (items.length === 0) return;

const { data } = await supabaseBrowser.auth.getUser();
if (!data.user) {
  setCheckoutError("Bitte zuerst anmelden, bevor du bestellen kannst.");
  setIsCheckingOut(false);
  return;
}

    setCheckoutError(null);
    setIsCheckingOut(true);

    try {
      const payload = {
        items: items.map((p) => ({
          id: p.id,
          title: p.title,
          qty: p.qty,
          priceCHF: p.priceCHF, // ⚠️ aktuell wird das serverseitig als EUR behandelt
          imageUrl: p.imageUrl,
        })),
        shippingCents: SHIPPING_CENTS,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      // ✅ Ergänzung: verhindert JSON.parse crash bei Fehlern
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Checkout fehlgeschlagen.");
      }

      const data = await res.json();

      if (!data?.url) {
        throw new Error("Checkout fehlgeschlagen (keine Stripe URL).");
      }

      window.location.href = data.url;
    } catch (e: any) {
      setCheckoutError(e?.message || "Checkout fehlgeschlagen.");
      setIsCheckingOut(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        background: "linear-gradient(180deg, #F7FAFF, #FFFFFF)",
        color: "#0F172A",
      }}
    >
      <div style={{ width: "min(1200px, 100%)", margin: "0 auto", padding: "22px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 950, letterSpacing: -0.6 }}>Warenkorb</div>
            <div style={{ marginTop: 6, opacity: 0.75, fontWeight: 800, fontSize: 13 }}>
              {count} Artikel • Zwischensumme: {formatCHF(subtotal)}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link
              href="/product"
              style={{
                textDecoration: "none",
                fontWeight: 950,
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(15,23,42,0.12)",
                background: "white",
                color: "#0B1220",
              }}
            >
              ← Weiter shoppen
            </Link>

            <button
              type="button"
              onClick={clear}
              style={{
                fontWeight: 950,
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(15,23,42,0.12)",
                background: "white",
                cursor: "pointer",
              }}
            >
              Warenkorb leeren
            </button>
          </div>
        </div>

        <div style={{ height: 16 }} />
        <CartCheerAI />

        {/* Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 0.8fr", gap: 14, alignItems: "start" }}>
          {/* Items */}
          <div
            style={{
              borderRadius: 18,
              border: "1px solid rgba(15,23,42,0.10)",
              background: "rgba(255,255,255,0.92)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: 14, borderBottom: "1px solid rgba(15,23,42,0.08)", fontWeight: 950 }}>
              Einkaufsliste
            </div>

            {items.length === 0 ? (
              <div style={{ padding: 18, opacity: 0.75, fontWeight: 800 }}>Dein Warenkorb ist leer.</div>
            ) : (
              <div style={{ padding: 14, display: "grid", gap: 12 }}>
                {items.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "110px 1fr 160px",
                      gap: 12,
                      alignItems: "center",
                      padding: 12,
                      borderRadius: 16,
                      border: "1px solid rgba(15,23,42,0.08)",
                      background: "white",
                    }}
                  >
                    {/* Image */}
                    <div
                      style={{
                        height: 90,
                        borderRadius: 14,
                        border: "1px solid rgba(15,23,42,0.08)",
                        background: "linear-gradient(180deg, #F3F4F6, #FFFFFF)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      ) : (
                        <div style={{ fontWeight: 950, opacity: 0.5 }}>Bild</div>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <div style={{ fontWeight: 950, fontSize: 14 }}>{p.title}</div>
                      <div style={{ marginTop: 6, fontWeight: 950, fontSize: 16 }}>{formatCHF(p.priceCHF)}</div>

                      <button
                        type="button"
                        onClick={() => removeItem(p.id)}
                        style={{
                          marginTop: 10,
                          fontWeight: 950,
                          fontSize: 12,
                          padding: "8px 10px",
                          borderRadius: 12,
                          border: "1px solid rgba(15,23,42,0.12)",
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        Entfernen
                      </button>
                    </div>

                    {/* Qty + Total */}
                    <div style={{ justifySelf: "end", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
                        <button
                          type="button"
                          onClick={() => setQty(p.id, p.qty - 1)}
                          style={{
                            height: 34,
                            width: 34,
                            borderRadius: 12,
                            border: "1px solid rgba(15,23,42,0.12)",
                            background: "white",
                            cursor: "pointer",
                            fontWeight: 950,
                          }}
                        >
                          −
                        </button>

                        <div
                          style={{
                            minWidth: 44,
                            height: 34,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 12,
                            border: "1px solid rgba(15,23,42,0.10)",
                            background: "rgba(2,6,23,0.03)",
                            fontWeight: 950,
                          }}
                        >
                          {p.qty}
                        </div>

                        <button
                          type="button"
                          onClick={() => setQty(p.id, p.qty + 1)}
                          style={{
                            height: 34,
                            width: 34,
                            borderRadius: 12,
                            border: "1px solid rgba(15,23,42,0.12)",
                            background: "white",
                            cursor: "pointer",
                            fontWeight: 950,
                          }}
                        >
                          +
                        </button>
                      </div>

                      <div style={{ marginTop: 10, fontWeight: 950 }}>{formatCHF(p.priceCHF * p.qty)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div
            style={{
              borderRadius: 18,
              border: "1px solid rgba(15,23,42,0.10)",
              background: "rgba(255,255,255,0.92)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: 14, borderBottom: "1px solid rgba(15,23,42,0.08)", fontWeight: 950 }}>Zusammenfassung</div>

            <div style={{ padding: 14, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, opacity: 0.8 }}>
                <span>Artikel</span>
                <span>{count}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 950, fontSize: 16 }}>
                <span>Zwischensumme</span>
                <span>{formatCHF(subtotal)}</span>
              </div>

              {/* ✅ Ergänzung: Error Anzeige */}
              {checkoutError ? (
                <div
                  style={{
                    borderRadius: 12,
                    border: "1px solid rgba(220,38,38,0.25)",
                    background: "rgba(220,38,38,0.06)",
                    padding: 10,
                    fontWeight: 900,
                    fontSize: 12,
                    color: "#991B1B",
                  }}
                >
                  {checkoutError}
                </div>
              ) : null}

              <div style={{ height: 1, background: "rgba(15,23,42,0.10)" }} />

              <button
                type="button"
                disabled={items.length === 0 || isCheckingOut}
                onClick={startCheckout}
                style={{
                  height: 48,
                  borderRadius: 14,
                  border: "1px solid rgba(15,23,42,0.12)",
                  background:
                    items.length === 0 || isCheckingOut
                      ? "rgba(2,6,23,0.08)"
                      : "linear-gradient(180deg, #FFE275, #FFB200)",
                  fontWeight: 950,
                  cursor: items.length === 0 || isCheckingOut ? "not-allowed" : "pointer",
                }}
              >
                {isCheckingOut ? "Weiter zu Stripe…" : "Zur Kasse"}
              </button>

              <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800, lineHeight: 1.5 }}>
                Hinweis: Checkout/Elternkonto kommt später — hier ist erstmal der Warenkorb.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}