"use client";

import React from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/app/lib/supabase-browser";

export default function ParentTopupPage() {
  const [amountEuros, setAmountEuros] = React.useState("10");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [walletId, setWalletId] = React.useState<string | null>(null);

  // ✅ Beim Laden: User + Wallet automatisch holen
  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);

      const { data: userData, error: uErr } = await supabaseBrowser.auth.getUser();
      const user = userData?.user;

      if (!user || uErr) {
        if (!cancelled) {
          setUserEmail(null);
          setWalletId(null);
        }
        return;
      }

      if (!cancelled) setUserEmail(user.email ?? null);

      // Wallet anhand parent_id (= user.id) finden
      const { data: wallet, error: wErr } = await supabaseBrowser
        .from("wallets")
        .select("id")
        .eq("parent_id", user.id)
        .maybeSingle();

      if (!cancelled) {
        if (wErr || !wallet?.id) {
          setWalletId(null);
          setError("Keine Wallet gefunden. (Bitte einmal Parent-Profil + Wallet anlegen.)");
        } else {
          setWalletId(wallet.id);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function startTopup() {
    setError(null);

    const amount = Number(amountEuros);
    if (!Number.isFinite(amount) || amount <= 0) return setError("Bitte gültigen Betrag eingeben (z.B. 10).");
    if (!walletId) return setError("Keine Wallet gefunden – bitte erst einloggen / Wallet anlegen.");

    setLoading(true);
    try {
      const res = await fetch("/api/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ walletId wird NICHT mehr vom Nutzer eingegeben, sondern automatisch
        body: JSON.stringify({ walletId, amountEuros: amount }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Topup fehlgeschlagen.");
        setLoading(false);
        return;
      }

      if (!data?.url) {
        setError("Topup fehlgeschlagen (keine Stripe URL).");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || "Topup fehlgeschlagen.");
      setLoading(false);
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
      <div style={{ width: "min(760px, 100%)", margin: "0 auto", padding: "22px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 950, letterSpacing: -0.6 }}>Eltern-Guthaben aufladen</div>
            <div style={{ marginTop: 6, opacity: 0.75, fontWeight: 800, fontSize: 13 }}>
              {userEmail ? (
                <>Eingeloggt als: <b>{userEmail}</b></>
              ) : (
                <>Nicht eingeloggt — bitte zuerst einloggen.</>
              )}
            </div>
          </div>
          <Link
            href="/cart"
            style={{
              textDecoration: "none",
              fontWeight: 950,
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(15,23,42,0.12)",
              background: "white",
              color: "#0B1220",
              whiteSpace: "nowrap",
            }}
          >
            ← Zurück
          </Link>
        </div>

        <div style={{ height: 16 }} />

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
            Topup
          </div>

          <div style={{ padding: 14, display: "grid", gap: 10 }}>
            <label style={{ fontWeight: 900, fontSize: 12, opacity: 0.8 }}>Betrag in EUR</label>
            <input
              value={amountEuros}
              onChange={(e) => setAmountEuros(e.target.value)}
              placeholder="10"
              inputMode="decimal"
              style={{
                height: 44,
                borderRadius: 12,
                border: "1px solid rgba(15,23,42,0.12)",
                padding: "0 12px",
                fontWeight: 800,
              }}
            />

            {walletId ? (
              <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 800 }}>
                Wallet gefunden ✅
              </div>
            ) : (
              <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 800 }}>
                Wallet: nicht gefunden
              </div>
            )}

            {error ? (
              <div
                style={{
                  borderRadius: 12,
                  border: "1px solid rgba(220,38,38,0.25)",
                  background: "rgba(220,38,38,0.06)",
                  padding: 10,
                  fontWeight: 900,
                  fontSize: 12,
                  color: "#991B1B",
                  marginTop: 6,
                }}
              >
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={startTopup}
              disabled={loading || !userEmail || !walletId}
              style={{
                marginTop: 8,
                height: 48,
                borderRadius: 14,
                border: "1px solid rgba(15,23,42,0.12)",
                background: loading || !userEmail || !walletId ? "rgba(2,6,23,0.08)" : "linear-gradient(180deg, #FFE275, #FFB200)",
                fontWeight: 950,
                cursor: loading || !userEmail || !walletId ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Weiter zu Stripe…" : "Aufladen"}
            </button>

            {!userEmail ? (
              <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800, lineHeight: 1.5 }}>
                Bitte zuerst einloggen: <Link href="/login">/login</Link>
              </div>
            ) : null}

            <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800, lineHeight: 1.5 }}>
              Stripe Testkarte: <b>4242 4242 4242 4242</b> • Datum: beliebig • CVC: 123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}