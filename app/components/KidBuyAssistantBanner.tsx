"use client";

import React, { useEffect, useMemo, useState } from "react";
import { onAssistantMessage, type AssistantPayload } from "../lib/kidbuyAssistant";

type Props = {
  /** Wenn true: Overlay nur auf Startseite-Message reagieren, sonst auch auf Cart Messages */
  allowCartMessages?: boolean;
};

export default function KidBuyAssistantOverlay({ allowCartMessages = true }: Props) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<AssistantPayload | null>(null);

  const show = (p: AssistantPayload) => {
    setMsg(p);
    setOpen(true);

    // Auto close nach kurzer Zeit
    window.setTimeout(() => setOpen(false), 2600);
  };

  useEffect(() => {
    return onAssistantMessage((p) => {
      if (p.kind !== "center") return;
      if (!allowCartMessages && p.emoji) return; // optional, falls du mal nur Start willst
      show(p);
    });
  }, [allowCartMessages]);

  const styles = useMemo(() => {
    return {
      backdrop: {
        position: "fixed" as const,
        inset: 0,
        display: open ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        pointerEvents: "none" as const,
      },
      bubble: {
        pointerEvents: "none" as const,
        display: "flex",
        alignItems: "center",
        gap: 12,
        maxWidth: 760,
        margin: "0 18px",
        padding: "16px 18px",
        borderRadius: 22,
        border: "1px solid rgba(15,23,42,0.12)",
        background: "rgba(255,255,255,0.92)",
        boxShadow: "0 26px 90px rgba(0,0,0,0.18)",
        transform: open ? "translateY(0) scale(1)" : "translateY(8px) scale(0.98)",
        opacity: open ? 1 : 0,
        transition: "transform 260ms cubic-bezier(0.22,1,0.36,1), opacity 260ms ease",
        backdropFilter: "blur(10px)",
      },
      text: {
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        fontWeight: 950,
        color: "#0B1220",
        letterSpacing: -0.2,
        fontSize: 16,
        lineHeight: 1.25,
      },
      // animiertes emoji neben der Cart Message (smooth)
      emoji: {
        height: 44,
        width: 44,
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.85))",
        border: "1px solid rgba(15,23,42,0.10)",
        boxShadow: "0 14px 40px rgba(0,0,0,0.10)",
        animation: "kidbuyBounce 900ms ease-in-out infinite",
      },
    };
  }, [open]);

  return (
    <>
      <style>{`
        @keyframes kidbuyBounce {
          0%   { transform: translateY(0) rotate(0deg); filter: saturate(1); }
          35%  { transform: translateY(-6px) rotate(-6deg); filter: saturate(1.15); }
          70%  { transform: translateY(0) rotate(6deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
      `}</style>

      <div style={styles.backdrop} aria-hidden>
        <div style={styles.bubble}>
          {msg?.emoji ? <div style={styles.emoji}>{msg.emoji}</div> : null}
          <div style={styles.text}>{msg?.text ?? ""}</div>
        </div>
      </div>
    </>
  );
}
