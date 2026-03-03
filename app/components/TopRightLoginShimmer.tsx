"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/app/lib/supabase-browser";

export default function TopRightLoginShimmer() {
  const [label, setLabel] = useState("Registrieren");

   useEffect(() => {
    let alive = true;

    async function loadLabel() {
      const { data } = await supabaseBrowser.auth.getUser();
      const user = data.user;

      if (!alive) return;

      // ✅ NICHT eingeloggt -> zurück auf Registrieren
      if (!user) {
        setLabel("Registrieren");
        return;
      }

      // ✅ Eingeloggt -> Name aus DB (profiles.full_name)
      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!alive) return;

      const dbName = profile?.full_name?.trim();

      // Fallbacks (falls profile leer ist)
      const metaName =
        (user.user_metadata?.full_name as string | undefined)?.trim() ||
        (user.user_metadata?.name as string | undefined)?.trim();

      const fallback = metaName || (user.email?.split("@")[0] ?? "User");

      setLabel(`Hallo ${dbName || fallback}`);
    }

    // initial laden
    loadLabel();

    // ✅ wichtig: live updaten bei Login/Logout
    const { data: sub } = supabaseBrowser.auth.onAuthStateChange(() => {
      loadLabel();
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return (
    <>
      <style>{`
        /* ✅ Shimmer wandert über die Buchstaben */
        @keyframes kidbuyShimmerMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* ✅ 4 Farben: Gelb -> Grün -> Blau -> Rot
           ✅ pro Farbe: 15s super sanfter Wechsel + 20s Pause
           ✅ 4 Segmente à 35s = 140s Loop
        */
        @keyframes kidbuyColorCycle {
          0% { --kbA: #FFD400; --kbB: #FFF3A6; --kbC: #FFC400; }                 /* Gelb */
          10.714286% { --kbA: #2EEB88; --kbB: #B8FFD8; --kbC: #15C46E; }        /* nach 15s: Grün */
          25% { --kbA: #2EEB88; --kbB: #B8FFD8; --kbC: #15C46E; }               /* 20s halten */

          35.714286% { --kbA: #2F7BFF; --kbB: #B9D5FF; --kbC: #1E55FF; }        /* nach 15s: Blau */
          50% { --kbA: #2F7BFF; --kbB: #B9D5FF; --kbC: #1E55FF; }               /* 20s halten */

          60.714286% { --kbA: #FF3B30; --kbB: #FFC2BE; --kbC: #FF2D55; }        /* nach 15s: Rot */
          75% { --kbA: #FF3B30; --kbB: #FFC2BE; --kbC: #FF2D55; }               /* 20s halten */

          85.714286% { --kbA: #FFD400; --kbB: #FFF3A6; --kbC: #FFC400; }        /* nach 15s: Gelb */
          100% { --kbA: #FFD400; --kbB: #FFF3A6; --kbC: #FFC400; }              /* 20s halten */
        }
      `}</style>

      <div
  style={{
    position: "fixed",
    top: 14,
    right: 216,   // 👈 war 14 — jetzt weiter links
    zIndex: 9999,
  }}
>
        <Link href="/login" style={{ textDecoration: "none" }}>
          {/* ✅ Basis-Text bleibt Weiß (Apple clean) */}
           <span
  style={{
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 15,
    padding: "6px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.20)",
    backdropFilter: "blur(10px)",
    whiteSpace: "nowrap",

    // ✅ wichtig: normaler Text weg (nur Shimmer sichtbar)
    color: "transparent",
    textShadow: "none",
  }}
>
  {label}

  <span
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",

      animation: "kidbuyColorCycle 140s linear infinite",
      backgroundImage:
        "linear-gradient(110deg, var(--kbA), var(--kbB), var(--kbC), var(--kbB), var(--kbA))",
      backgroundRepeat: "no-repeat",
      backgroundSize: "260% 260%",
      backgroundPosition: "0% 50%",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      pointerEvents: "none",
      filter: "drop-shadow(0 0 6px rgba(255,255,255,0.12))",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
  >
    <span
      style={{
        display: "inline-block",
        backgroundImage:
          "linear-gradient(110deg, var(--kbA), var(--kbB), var(--kbC), var(--kbB), var(--kbA))",
        backgroundRepeat: "no-repeat",
        backgroundSize: "260% 260%",
        backgroundPosition: "0% 50%",
        animation: "kidbuyShimmerMove 6.5s ease-in-out infinite",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  </span>
</span>
        </Link>
      </div>
    </>
  );
}