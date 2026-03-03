"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { isInWishlist, toggleWishlist, type WishlistItem } from "@/app/lib/wishlist";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export default function WishlistHeart({
  item,
  targetId = "kidbuy-profile-icon-target",
}: {
  item: WishlistItem;
  targetId?: string;
}) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [on, setOn] = useState(false);
  const [fly, setFly] = useState<null | { x: number; y: number; tx: number; ty: number }>(null);

  useEffect(() => {
    setOn(isInWishlist(item.id));
    const onUpdate = () => setOn(isInWishlist(item.id));
    window.addEventListener("kidbuy_wishlist_updated", onUpdate);
    return () => window.removeEventListener("kidbuy_wishlist_updated", onUpdate);
  }, [item.id]);

  const heart = on ? "❤️" : "🤍";

  const runFly = () => {
    const startEl = btnRef.current;
    const targetEl = document.getElementById(targetId);
    if (!startEl || !targetEl) return;

    const s = startEl.getBoundingClientRect();
    const t = targetEl.getBoundingClientRect();

    const sx = s.left + s.width / 2;
    const sy = s.top + s.height / 2;

    const tx = t.left + t.width / 2;
    const ty = t.top + t.height / 2;

    setFly({ x: sx, y: sy, tx, ty });

    // little “merge” pulse on target
    try {
      targetEl.style.transition = "transform 220ms ease";
      targetEl.style.transform = "scale(1.06)";
      window.setTimeout(() => {
        targetEl.style.transform = "scale(1)";
      }, 240);
    } catch {}
  };

  const onClick = () => {
    const nowAdded = toggleWishlist(item);
    setOn(nowAdded);

    // only fly when added
    if (nowAdded) runFly();
  };

  return (
    <>
      <style>{`
        @keyframes kbHeartGlow {
          0% { filter: drop-shadow(0 0 0 rgba(255,0,70,0.0)); }
          50% { filter: drop-shadow(0 0 14px rgba(255,0,70,0.28)); }
          100% { filter: drop-shadow(0 0 0 rgba(255,0,70,0.0)); }
        }
      `}</style>

      <button
        ref={btnRef}
        type="button"
        onClick={onClick}
        aria-label="Zur Wunschliste"
        style={{
          height: 44,
          borderRadius: 999,
          border: "1px solid rgba(15,23,42,0.12)",
          background: "rgba(255,255,255,0.96)",
          cursor: "pointer",
          fontWeight: 950,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 14px",
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 18,
            lineHeight: 1,
            animation: on ? "kbHeartGlow 900ms ease" : "none",
          }}
        >
          {heart}
        </span>
        <span style={{ fontWeight: 950, fontSize: 13, opacity: 0.85 }}>
          Wunschliste
        </span>
      </button>

      {/* flying heart overlay */}
      {fly && <FlyingHeart fly={fly} onDone={() => setFly(null)} />}
    </>
  );
}

function FlyingHeart({
  fly,
  onDone,
}: {
  fly: { x: number; y: number; tx: number; ty: number };
  onDone: () => void;
}) {
  const [pos, setPos] = useState({ x: fly.x, y: fly.y, s: 1, o: 1, r: -8 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const dur = 980;

    // “feather” curve: up then to target
    const cx = (fly.x + fly.tx) / 2;
    const cy = Math.min(fly.y, fly.ty) - 140;

    const step = (tNow: number) => {
      const t = clamp((tNow - start) / dur, 0, 1);

      // smooth
      const ease = 1 - Math.pow(1 - t, 3);

      // quadratic bezier
      const x = (1 - ease) * (1 - ease) * fly.x + 2 * (1 - ease) * ease * cx + ease * ease * fly.tx;
      const y = (1 - ease) * (1 - ease) * fly.y + 2 * (1 - ease) * ease * cy + ease * ease * fly.ty;

      const s = 1 + ease * 0.15;
      const o = 1 - ease * 0.15;
      const r = -8 + ease * 16;

      setPos({ x, y, s, o, r });

      if (t >= 1) {
        onDone();
        return;
      }
      raf.current = requestAnimationFrame(step);
    };

    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [fly.tx, fly.ty, fly.x, fly.y, onDone]);

  return (
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        transform: `translate(-50%, -50%) scale(${pos.s}) rotate(${pos.r}deg)`,
        opacity: pos.o,
        zIndex: 99999,
        pointerEvents: "none",
        fontSize: 26,
        filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.20))",
      }}
      aria-hidden="true"
    >
      ❤️
    </div>
  );
}