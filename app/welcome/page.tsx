"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  async function markSeen() {
    try {
      await fetch("/api/welcome/seen", { method: "POST" });
    } catch {}
  }

  async function goLater() {
    await markSeen();
    router.replace("/"); // ✅ zurück auf Startseite
  }

  async function goLogin() {
    await markSeen();
    router.replace("/login"); // ✅ zur Anmeldung
  }

  return (
    <main style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Unscharfer Hintergrund */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(900px 520px at 20% 20%, rgba(255,205,55,0.22), transparent 60%)," +
            "radial-gradient(900px 520px at 80% 20%, rgba(60,120,255,0.18), transparent 60%)," +
            "radial-gradient(900px 520px at 25% 85%, rgba(35,200,140,0.18), transparent 60%)," +
            "radial-gradient(900px 520px at 85% 85%, rgba(255,90,90,0.16), transparent 60%)",
          filter: "blur(10px)",
          transform: "scale(1.05)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.35)",
        }}
      />

      {/* Popup in der Mitte */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "22px 18px",
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          style={{
            width: "min(560px, 94vw)",
            borderRadius: 26,
            border: "1px solid rgba(0,0,0,0.08)",
            background: "rgba(255,255,255,0.88)",
            boxShadow: "0 22px 80px rgba(0,0,0,0.16)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: 18,
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.80) 100%)",
            }}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: 950, letterSpacing: "-0.02em", color: "rgba(0,0,0,0.90)" }}>
                Hi, schön dass du da bist! <span aria-hidden>😊</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: "rgba(0,0,0,0.62)", lineHeight: 1.35 }}>
                Möchtest du dich erstmal anmelden oder direkt loslegen?
              </div>
            </div>

            <div
              style={{
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,0.10)",
                background: "rgba(0,0,0,0.04)",
                padding: "8px 10px",
                fontSize: 12,
                fontWeight: 900,
                color: "rgba(0,0,0,0.75)",
                whiteSpace: "nowrap",
              }}
            >
              KidBuy ✨
            </div>
          </div>

          <div style={{ padding: 18, display: "grid", gap: 12 }}>
            <button
              onClick={goLogin}
              style={{
                borderRadius: 20,
                border: "1px solid rgba(60,120,255,0.28)",
                background: "rgba(60,120,255,0.18)",
                color: "rgba(0,0,0,0.88)",
                padding: "14px 14px",
                fontSize: 14,
                fontWeight: 950,
                letterSpacing: "-0.01em",
                cursor: "pointer",
                boxShadow: "0 14px 30px rgba(0,0,0,0.10)",
              }}
            >
              Anmelden
            </button>

            <button
              onClick={goLater}
              style={{
                borderRadius: 20,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "rgba(255,255,255,0.70)",
                color: "rgba(0,0,0,0.86)",
                padding: "14px 14px",
                fontSize: 14,
                fontWeight: 950,
                letterSpacing: "-0.01em",
                cursor: "pointer",
                boxShadow: "0 12px 26px rgba(0,0,0,0.08)",
              }}
            >
              Später anmelden
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
