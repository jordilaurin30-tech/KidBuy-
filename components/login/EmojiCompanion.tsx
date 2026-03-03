"use client";

import React, { useMemo } from "react";

export type EmojiMood =
  | "idle"
  | "nameTyping"
  | "emailTyping"
  | "passwordTyping"
  | "angry"
  | "clap";

export type EmojiPalette = {
  text: string;
  yellow: string;
  blue: string;
  green: string;
  red: string;
  border: string;
  borderStrong: string;
  glass: string;
  shadow: string;
};

export function EmojiCompanion({
  look,
  mood,
  shake,
  clap,
  palette,

  // ✅ NUR ERGÄNZT: Übersetzbare Texte von außen (optional)
  subtitleByMood,
}: {
  look: { x: number; y: number };
  mood: EmojiMood;
  shake: boolean;
  clap: boolean;
  palette: EmojiPalette;

  // ✅ NUR ERGÄNZT (optional): wenn vorhanden, überschreibt es die Bubble-Texte
  subtitleByMood?: Partial<Record<EmojiMood, string>>;
}) {
  // Kopf folgt Maus (smooth)
  const rotX = look.y * -12;
  const rotY = look.x * 14;

  const isIdle = mood === "idle";
  const isEmail = mood === "emailTyping";
  const isName = mood === "nameTyping";
  const isPass = mood === "passwordTyping";
  const isAngry = mood === "angry";
  const isClap = mood === "clap";

  // Augenbewegung
  const baseEyeX = look.x * 7;
  const baseEyeY = look.y * 5;

  // Bei Email: Schlitzaugen, weniger Bewegung
  const eyeX = isEmail ? baseEyeX * 0.35 : baseEyeX;
  const eyeY = isEmail ? baseEyeY * 0.35 : baseEyeY;

  // Passwort: dauerhaft wegschauen (Grundzustand)
  // aber die "Peek" Animation macht 1x kurz hin und dann wieder weg.
  const passAwayX = -20;
  const passAwayY = -2;

  // Augenform
  const eyeShape = useMemo(() => {
    if (isEmail) return { w: 30, h: 10, r: 999, opacity: 0.92 }; // Schlitz
    if (isAngry) return { w: 26, h: 26, r: 999, opacity: 0.95 };
    if (isName) return { w: 24, h: 24, r: 999, opacity: 0.95 };
    if (isPass) return { w: 24, h: 24, r: 999, opacity: 0.92 };
    if (isClap) return { w: 24, h: 24, r: 999, opacity: 0.95 };
    return { w: 22, h: 22, r: 999, opacity: 0.92 };
  }, [isEmail, isAngry, isName, isPass, isClap]);

  // Mundform
  const mouth = useMemo(() => {
    if (isName) return "round";
    if (isEmail) return "flat";
    if (isPass) return "smile";
    if (isAngry) return "flatTense";
    if (isClap) return "smileBig";
    return "smileSoft";
  }, [isName, isEmail, isPass, isAngry, isClap]);

  // ✅ Default-Texte (so wie vorher) – NUR ERGÄNZT als Mapping
  const defaultSubtitleByMood: Record<EmojiMood, string> = useMemo(
    () => ({
      nameTyping: "oh! dein Name!",
      emailTyping: "ich lese die E-Mail…",
      passwordTyping: "🙈 psst…",
      angry: "grrr!",
      clap: "yay!",
      idle: "hi!",
    }),
    []
  );

  // ✅ subtitle: zuerst optionales Mapping von außen, sonst Default (ändert nichts am Verhalten)
  const subtitle = useMemo(() => {
    const external = subtitleByMood?.[mood];
    if (typeof external === "string" && external.trim().length > 0) return external;
    return defaultSubtitleByMood[mood] ?? "hi!";
  }, [mood, subtitleByMood, defaultSubtitleByMood]);

  // Backen nur bei Passwort (kleiner, runder, natürlicher Verlauf)
  const cheeksVisible = isPass;

  // Für Blinzeln: nur im Idle-Modus (alle 10s)
  const blinkClass = isIdle ? "kb-blink" : "";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        position: "relative",
        pointerEvents: "none",
      }}
    >
      {/* Aura – ohne Box */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: 620,
          height: 620,
          borderRadius: 999,
          background: `
            radial-gradient(260px 220px at 30% 25%, ${palette.yellow}, transparent 60%),
            radial-gradient(260px 220px at 70% 20%, ${palette.blue}, transparent 60%),
            radial-gradient(260px 220px at 30% 78%, ${palette.green}, transparent 60%),
            radial-gradient(260px 220px at 74% 82%, ${palette.red}, transparent 60%)
          `,
          filter: "blur(20px)",
          opacity: 0.95,
          transform: "translateY(6px)",
        }}
      />

      <div style={{ position: "relative", width: 380, height: 520, display: "grid", placeItems: "center" }}>
        {/* Head */}
        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: 999,
            background: "rgba(255,255,255,0.80)",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 22px 62px rgba(0,0,0,0.12)",
            transform: `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            transition: "transform 85ms linear",
            position: "relative",
            display: "grid",
            placeItems: "center",
            animation: shake ? "kbShake 420ms ease-in-out" : clap ? "kbBounce 900ms ease" : undefined,
          }}
        >
          {/* Angry eyebrows */}
          {isAngry && (
            <>
              <div
                style={{
                  position: "absolute",
                  top: 70,
                  left: 72,
                  width: 62,
                  height: 10,
                  borderRadius: 999,
                  background: "rgba(0,0,0,0.72)",
                  transform: "rotate(18deg)",
                  opacity: 0.92,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 70,
                  right: 72,
                  width: 62,
                  height: 10,
                  borderRadius: 999,
                  background: "rgba(0,0,0,0.72)",
                  transform: "rotate(-18deg)",
                  opacity: 0.92,
                }}
              />
            </>
          )}

          {/* Cheeks (password -> embarrassed) */}
          {cheeksVisible && (
            <>
              <div
                style={{
                  position: "absolute",
                  top: 148,
                  left: 58,
                  width: 40,
                  height: 32,
                  borderRadius: 999,
                  background:
                    "radial-gradient(closest-side, rgba(255,90,90,0.28), rgba(255,90,90,0.12), transparent 72%)",
                  filter: "blur(0.2px)",
                  opacity: 0.92,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 148,
                  right: 58,
                  width: 40,
                  height: 32,
                  borderRadius: 999,
                  background:
                    "radial-gradient(closest-side, rgba(255,90,90,0.28), rgba(255,90,90,0.12), transparent 72%)",
                  filter: "blur(0.2px)",
                  opacity: 0.92,
                }}
              />
            </>
          )}

          {/* Eyes */}
          <div
            className={`kb-eye kb-eye-left ${blinkClass} ${isPass ? "kb-pass-peek" : ""}`}
            style={{
              position: "absolute",
              top: 98,
              left: 82,
              width: eyeShape.w,
              height: eyeShape.h,
              borderRadius: eyeShape.r,
              background: "rgba(0,0,0,0.82)",
              transform: isPass ? `translate(${passAwayX}px, ${passAwayY}px)` : `translate(${eyeX}px, ${eyeY}px)`,
              transition:
                "transform 160ms cubic-bezier(0.2, 0.9, 0.2, 1), width 160ms ease, height 160ms ease",
              opacity: eyeShape.opacity,
            }}
          />
          <div
            className={`kb-eye kb-eye-right ${blinkClass} ${isPass ? "kb-pass-peek" : ""}`}
            style={{
              position: "absolute",
              top: 98,
              right: 82,
              width: eyeShape.w,
              height: eyeShape.h,
              borderRadius: eyeShape.r,
              background: "rgba(0,0,0,0.82)",
              transform: isPass ? `translate(${passAwayX}px, ${passAwayY}px)` : `translate(${eyeX}px, ${eyeY}px)`,
              transition:
                "transform 160ms cubic-bezier(0.2, 0.9, 0.2, 1), width 160ms ease, height 160ms ease",
              opacity: eyeShape.opacity,
            }}
          />

          {/* Mouth – smooth shapes */}
          {mouth === "smileSoft" && (
            <div
              style={{
                position: "absolute",
                bottom: 78,
                width: 92,
                height: 50,
                borderBottom: "10px solid rgba(0,0,0,0.70)",
                borderRadius: "0 0 90px 90px",
                opacity: 0.9,
                transition: "all 180ms ease",
              }}
            />
          )}

          {mouth === "smile" && (
            <div
              style={{
                position: "absolute",
                bottom: 78,
                width: 92,
                height: 50,
                borderBottom: "11px solid rgba(0,0,0,0.72)",
                borderRadius: "0 0 95px 95px",
                opacity: 0.92,
                transition: "all 180ms ease",
              }}
            />
          )}

          {mouth === "smileBig" && (
            <div
              style={{
                position: "absolute",
                bottom: 74,
                width: 110,
                height: 56,
                borderBottom: "12px solid rgba(0,0,0,0.72)",
                borderRadius: "0 0 120px 120px",
                opacity: 0.92,
                transition: "all 180ms ease",
              }}
            />
          )}

          {mouth === "flat" && (
            <div
              style={{
                position: "absolute",
                bottom: 90,
                width: 92,
                height: 10,
                borderRadius: 999,
                background: "rgba(0,0,0,0.72)",
                opacity: 0.86,
                transition: "all 180ms ease",
              }}
            />
          )}

          {mouth === "flatTense" && (
            <div
              style={{
                position: "absolute",
                bottom: 90,
                width: 92,
                height: 10,
                borderRadius: 999,
                background: "rgba(0,0,0,0.78)",
                opacity: 0.92,
                transform: "scaleX(0.92)",
                transition: "all 180ms ease",
              }}
            />
          )}

          {/* Name: round mouth */}
          {mouth === "round" && (
            <div
              style={{
                position: "absolute",
                bottom: 80,
                width: 36,
                height: 36,
                borderRadius: 999,
                border: "9px solid rgba(0,0,0,0.72)",
                background: "transparent",
                opacity: 0.92,
                transition: "all 180ms ease",
              }}
            />
          )}
        </div>

        {/* Clap effect */}
        {clap && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 300,
              display: "flex",
              gap: 18,
              fontSize: 34,
              animation: "kbHands 900ms ease",
            }}
          >
            <span>👏</span>
            <span>👏</span>
          </div>
        )}

        {/* Bubble */}
        <div
          style={{
            position: "absolute",
            bottom: 34,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "10px 12px",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.10)",
            background: "rgba(255,255,255,0.78)",
            boxShadow: "0 12px 28px rgba(0,0,0,0.10)",
            fontWeight: 950,
            fontSize: 12,
            color: "rgba(0,0,0,0.78)",
            whiteSpace: "nowrap",
          }}
        >
          {subtitle}
        </div>
      </div>

      <style jsx>{`
        @keyframes kbShake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
          100% { transform: translateX(0); }
        }
        @keyframes kbBounce {
          0% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
          60% { transform: translateY(0); }
          80% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
        @keyframes kbHands {
          0% { opacity: 0; transform: translateY(10px) scale(0.9); }
          25% { opacity: 1; transform: translateY(0px) scale(1); }
          100% { opacity: 0; transform: translateY(-8px) scale(1.02); }
        }

        /* ✅ Passwort: 1x mini-peek, dann wieder weg (und bleibt weg, solange mood=passwordTyping) */
        .kb-pass-peek {
          animation: kbPassPeek 520ms cubic-bezier(0.2, 0.9, 0.2, 1);
          animation-fill-mode: forwards;
        }
        @keyframes kbPassPeek {
          0%   { transform: translate(-20px, -2px); }
          10%  { transform: translate(4px, 1px); }   /* super kurzer Blick hin */
          22%  { transform: translate(-20px, -2px); } /* sofort wieder weg */
          100% { transform: translate(-20px, -2px); }
        }

        /* ✅ Blinzeln nur im Idle: alle 10s kurz zu */
        .kb-blink {
          transform-origin: center;
          animation: kbBlink 10s linear infinite;
        }
        @keyframes kbBlink {
          0% { transform: scaleY(1); }
          92% { transform: scaleY(1); }
          93% { transform: scaleY(0.18); }
          94% { transform: scaleY(1); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}