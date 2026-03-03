"use client";

import React, { useEffect, useMemo, useState } from "react";
import { onAssistantMessage, type AssistantMessage } from "../lib/kidbuyAssistant";

export default function KidBuyAssistantOverlay() {
  const [msg, setMsg] = useState<AssistantMessage | null>(null);
  const [visible, setVisible] = useState(false);

  const anim = useMemo(
    () => `
      @keyframes kidbuyPopIn {
        0% { transform: translate(-50%, -50%) scale(0.96); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
      @keyframes kidbuyPopOut {
        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(0.98); opacity: 0; }
      }
      @keyframes kidbuyEmojiBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
    `,
    []
  );

  useEffect(() => {
    const off = onAssistantMessage((m) => {
      setMsg(m);
      setVisible(true);

      window.clearTimeout((window as any).__kidbuy_to);
      (window as any).__kidbuy_to = window.setTimeout(() => {
        setVisible(false);
      }, 2200);
    });

    return () => off();
  }, []);

  if (!msg) return null;

  return (
    <>
      <style>{anim}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 9999,
          display: visible ? "block" : "block",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(560px, calc(100% - 28px))",
            borderRadius: 22,
            border: "1px solid rgba(15,23,42,0.12)",
            background: "rgba(255,255,255,0.92)",
            boxShadow: "0 26px 90px rgba(0,0,0,0.18)",
            padding: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
            animation: visible ? "kidbuyPopIn 180ms ease-out" : "kidbuyPopOut 160ms ease-in",
            opacity: visible ? 1 : 0,
          }}
        >
          <div
            aria-hidden
            style={{
              fontSize: 26,
              width: 40,
              height: 40,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(15,23,42,0.04)",
              border: "1px solid rgba(15,23,42,0.08)",
              animation: "kidbuyEmojiBounce 700ms ease-in-out infinite",
            }}
          >
            {msg.emoji}
          </div>

          <div style={{ fontWeight: 950, color: "#0B1220", fontSize: 14, lineHeight: 1.35 }}>
            {msg.text}
          </div>
        </div>
      </div>
    </>
  );
}