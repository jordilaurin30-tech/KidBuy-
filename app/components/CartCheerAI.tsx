"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

const COMMENTS = [
  { t: "Boah! Das ist ein richtig starker Einkauf!", e: "🔥", fx: "pop" },
  { t: "Wow… dein Warenkorb hat Style!", e: "😎", fx: "wink" },
  { t: "Das sind ja Premium-Funde!", e: "💎", fx: "glow" },
  { t: "Mega Auswahl getroffen!", e: "🎯", fx: "pop" },
  { t: "Du hast echt Geschmack!", e: "✨", fx: "glow" },
  { t: "Das wird ein epischer Einkauf!", e: "🚀", fx: "bounce" },
  { t: "Ich wäre stolz auf diesen Warenkorb.", e: "🥇", fx: "glow" },
  { t: "Legendäre Picks!", e: "🛍️", fx: "bounce" },
  { t: "Das sieht nach einem Gewinner-Cart aus!", e: "🏆", fx: "glow" },
  { t: "Du bist ein Einkaufs-Pro!", e: "🧠", fx: "pop" },
  { t: "Ich liebe deine Auswahl!", e: "😍", fx: "pulse" },
  { t: "Wow… diese Produkte sind next level!", e: "⚡", fx: "zap" },
  { t: "Das ist Shopping auf Elite-Level.", e: "👑", fx: "glow" },
  { t: "Heftig gute Sachen!", e: "🤩", fx: "pulse" },
  { t: "Dein Warenkorb ist beneidenswert.", e: "😮", fx: "pop" },
  { t: "Das wird ein grandioses Paket!", e: "📦", fx: "bounce" },
  { t: "Ich würde genau dasselbe kaufen.", e: "👌", fx: "pop" },
  { t: "Perfekte Wahl getroffen!", e: "🎉", fx: "bounce" },
  { t: "So kauft ein Champion ein!", e: "🥊", fx: "pop" },
  { t: "Diese Auswahl ist einfach stark.", e: "💪", fx: "pulse" },
  { t: "Shopping-Instinkt 100%", e: "🧭", fx: "glow" },
  { t: "Du hast den Einkaufs-Flow!", e: "🌊", fx: "glow" },
  { t: "Das ist ein Traum-Warenkorb.", e: "🌟", fx: "glow" },
  { t: "Ich bin beeindruckt von deinem Geschmack.", e: "👏", fx: "bounce" },
];

const LAST_ADD_KEY = "kidbuy_cart_last_add";
const LAST_VISIT_KEY = "kidbuy_cart_last_visit";

export default function CartCheerAI() {
  const [active, setActive] = useState(false);
  const [pick, setPick] = useState<{ t: string; e: string; fx: string } | null>(null);

  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "emoji" | "done">("typing");

  const typingTimer = useRef<number | null>(null);
  const phaseTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    const now = Date.now();

    const lastAdd = Number(localStorage.getItem(LAST_ADD_KEY) || 0);
    const lastVisit = Number(localStorage.getItem(LAST_VISIT_KEY) || 0);

    const addedRecently = now - lastAdd < 8000;
    const returnedAfterTime = now - lastVisit > 45000;

    // visit timestamp always update
    localStorage.setItem(LAST_VISIT_KEY, String(now));

    if (!(addedRecently || returnedAfterTime)) return;

    const chosen = COMMENTS[Math.floor(Math.random() * COMMENTS.length)];
    setPick(chosen);
    setActive(true);
    setTyped("");
    setPhase("typing");

    return () => {
      if (typingTimer.current) window.clearInterval(typingTimer.current);
      if (phaseTimer.current) window.clearTimeout(phaseTimer.current);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  // typing effect
  useEffect(() => {
    if (!active || !pick) return;

    const full = pick.t;
    let i = 0;

    if (typingTimer.current) window.clearInterval(typingTimer.current);
    typingTimer.current = window.setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) {
        if (typingTimer.current) window.clearInterval(typingTimer.current);
        setPhase("done"); // "done" means typing finished, then wait 2s, then emoji
      }
    }, 22); // fast but readable

    return () => {
      if (typingTimer.current) window.clearInterval(typingTimer.current);
    };
  }, [active, pick]);

  // after typing finished: wait 2s -> show emoji fx
  useEffect(() => {
    if (!active || !pick) return;
    if (phase !== "done") return;

    if (phaseTimer.current) window.clearTimeout(phaseTimer.current);
    phaseTimer.current = window.setTimeout(() => {
      setPhase("emoji");
    }, 2000);

    return () => {
      if (phaseTimer.current) window.clearTimeout(phaseTimer.current);
    };
  }, [active, pick, phase]);

  // auto hide after emoji shows
  useEffect(() => {
    if (!active) return;
    if (phase !== "emoji") return;

    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      setActive(false);
    }, 6500); // disappears after a while

    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [active, phase]);

  const emojiStyle = useMemo(() => {
    const base: React.CSSProperties = {
      width: 44,
      height: 44,
      borderRadius: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 26,
      background: "white",
      border: "1px solid rgba(15,23,42,0.10)",
      boxShadow: "0 18px 55px rgba(0,0,0,0.10)",
      transform: "translateY(0px) scale(1)",
      opacity: 0,
    };

    if (!pick) return base;
    if (phase !== "emoji") return base;

    // show
    const show: React.CSSProperties = { opacity: 1 };

    // effects
    const fx = pick.fx;
    if (fx === "bounce") return { ...base, ...show, animation: "kbEmojiBounce 680ms ease-out 1" };
    if (fx === "pop") return { ...base, ...show, animation: "kbEmojiPop 520ms ease-out 1" };
    if (fx === "pulse") return { ...base, ...show, animation: "kbEmojiPulse 900ms ease-in-out 1" };
    if (fx === "glow") return { ...base, ...show, animation: "kbEmojiGlow 1000ms ease-in-out 1" };
    if (fx === "zap") return { ...base, ...show, animation: "kbEmojiZap 520ms ease-out 1" };
    if (fx === "wink") return { ...base, ...show, animation: "kbEmojiWink 720ms ease-in-out 1" };

    return { ...base, ...show, animation: "kbEmojiPop 520ms ease-out 1" };
  }, [pick, phase]);

  if (!active || !pick) return null;

  return (
    <>
      <style>{`
        @keyframes kbCursorBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        @keyframes kbEmojiBounce {
          0% { transform: translateY(8px) scale(0.92); }
          60% { transform: translateY(-10px) scale(1.08); }
          100% { transform: translateY(0px) scale(1); }
        }

        @keyframes kbEmojiPop {
          0% { transform: scale(0.6); }
          70% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }

        @keyframes kbEmojiPulse {
          0% { transform: scale(1); }
          45% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }

        @keyframes kbEmojiGlow {
          0% { box-shadow: 0 18px 55px rgba(0,0,0,0.10); }
          40% { box-shadow: 0 18px 55px rgba(0,0,0,0.10), 0 0 22px rgba(255, 204, 0, 0.45); }
          100% { box-shadow: 0 18px 55px rgba(0,0,0,0.10); }
        }

        @keyframes kbEmojiZap {
          0% { transform: translateX(0) scale(0.9); }
          35% { transform: translateX(-6px) scale(1.08); }
          70% { transform: translateX(6px) scale(1.08); }
          100% { transform: translateX(0) scale(1); }
        }

        @keyframes kbEmojiWink {
          0% { transform: scale(0.95); }
          30% { transform: scale(1.1) rotate(-6deg); }
          60% { transform: scale(1.02) rotate(6deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>

      <div
        style={{
          marginBottom: 14,
          borderRadius: 18,
          border: "1px solid rgba(15,23,42,0.10)",
          background: "linear-gradient(180deg,#ECFEFF,#FFFFFF)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.10)",
          padding: 16,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 950, fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
            KidBuy KI
          </div>

          <div style={{ fontWeight: 950, fontSize: 16, lineHeight: 1.25 }}>
            {typed}
            {phase !== "emoji" ? (
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  marginLeft: 2,
                  opacity: 0.8,
                  animation: "kbCursorBlink 1s linear infinite",
                }}
              >
                |
              </span>
            ) : null}
          </div>
        </div>

        <div style={emojiStyle} aria-hidden="true">
          {pick.e}
        </div>
      </div>
    </>
  );
}