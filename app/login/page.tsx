"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EmojiCompanion } from "../../components/login/EmojiCompanion"; // ✅ (A entfernt)

// ✅ i18n (EU-Sprachen) – nur ergänzt
import { EU_LANGS, getLang, setLang, t, type Lang, emojiSubtitles } from "../lib/i18n";

// ✅ Ergänzung: Supabase Browser Client
import { supabaseBrowser } from "@/app/lib/supabase-browser";

type Mode = "pick" | "normal" | "parent";

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function onlyDigits(s: string) {
  return s.replace(/[^\d]/g, "");
}

function isValidDobUI(day: string, month: string, year: string) {
  const d = Number(onlyDigits(day));
  const m = Number(onlyDigits(month));
  const y = Number(onlyDigits(year));
  if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) return false;
  if (y < 1900 || y > 2100) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/parent";
  const needParent = sp.get("needParent") === "1";

  // ✅ Language (persisted) – nur ergänzt
  const [lang, setLangState] = useState<Lang>("de");
  useEffect(() => {
    setLangState(getLang());
  }, []);

  // ✅ Emoji-Subtitles übersetzt – nur ergänzt
  const emojiTextByMood = useMemo(() => emojiSubtitles(lang), [lang]);

  // UI
  const [mode, setMode] = useState<Mode>("pick");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
// ✅ WICHTIG: Kein Auto-Signup im Login (sonst kann jeder “beliebig” rein)
const ALLOW_AUTO_SIGNUP = false;

  // creds
  const [name, setName] = useState("");
  const [email, setEmail] = useState("parent@kidbuy.ch");
  const [password, setPassword] = useState("kidbuy");

  // parent verify
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [idPhotoSelected, setIdPhotoSelected] = useState(false);

  // ✅ Emoji mood nach deinen Regeln
  const [emojiMood, setEmojiMood] = useState<
    "idle" | "nameTyping" | "emailTyping" | "passwordTyping" | "angry" | "clap"
  >("idle");

  const [shake, setShake] = useState(false);
  const [clap, setClap] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [look, setLook] = useState({ x: 0, y: 0 }); // -1..1

  // Colors (deine Palette + Schwarz für Text)
  const palette = {
    text: "rgba(0,0,0,0.90)",
    yellow: "rgba(255, 205, 55, 0.22)",
    blue: "rgba(60, 120, 255, 0.18)",
    green: "rgba(35, 200, 140, 0.18)",
    red: "rgba(255, 90, 90, 0.16)",
    border: "rgba(0,0,0,0.08)",
    borderStrong: "rgba(0,0,0,0.12)",
    glass: "rgba(255,255,255,0.84)",
    shadow: "0 20px 70px rgba(0,0,0,0.12)",
  };

  const canLogin = useMemo(() => email.trim().length > 0 && password.length > 0, [email, password]);

  const dobValidUI = useMemo(() => isValidDobUI(dobDay, dobMonth, dobYear), [dobDay, dobMonth, dobYear]);
  const canFinishParent = useMemo(() => dobValidUI, [dobValidUI]);

  // Mouse-follow head (smooth)
  useEffect(() => {
    function onMove(e: MouseEvent) {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();

      // linke Panel-Mitte
      const cx = r.left + r.width * 0.25;
      const cy = r.top + r.height * 0.42;

      const dx = (e.clientX - cx) / 260;
      const dy = (e.clientY - cy) / 260;

      setLook({ x: clamp(dx, -1, 1), y: clamp(dy, -1, 1) });
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Wenn man aufhört zu tippen: wieder idle nach kurzer Zeit
  useEffect(() => {
    const tt = window.setTimeout(() => {
      if (!loading && !error) setEmojiMood("idle");
    }, 900);
    return () => window.clearTimeout(tt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, email, password]);

  function triggerAngry() {
    setEmojiMood("angry");
    setShake(true);
    window.setTimeout(() => setShake(false), 420);
    window.setTimeout(() => setEmojiMood("idle"), 900);
  }

  function triggerClapYes() {
    setEmojiMood("clap");
    setClap(true);
    window.setTimeout(() => setClap(false), 900);
    window.setTimeout(() => setEmojiMood("idle"), 1100);
  }

  // ✅ Ergänzung: erstellt Profile+Wallet serverseitig (ohne RLS Stress)
  async function ensureProfileAndWallet(role: "parent" | "kid") {
    const { data } = await supabaseBrowser.auth.getUser();
    const user = data?.user;
    if (!user) return false;

    const res = await fetch("/api/profile/ensure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        fullName: name || null,
        role,
      }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setError(j?.error || "Profil/Wallet konnte nicht erstellt werden.");
      return false;
    }

    return true;
  }

  // ✅ WICHTIG: baseLogin jetzt mit Supabase Auth (statt /api/auth/login)
  async function baseLogin(roleAfterLogin: "parent" | "kid") {
    setError("");
    setLoading(true);

    try {
      // 1) Versuche Login
      const signIn = await supabaseBrowser.auth.signInWithPassword({ email, password });

      // Wenn Login ok:
      if (!signIn.error && signIn.data?.user) {

try {
  localStorage.setItem("kidbuy_user_name", (name || "").trim());
  localStorage.setItem("kidbuy_user_role", roleAfterLogin);
} catch {}

await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ email, password }),
});

const who = await fetch("/api/auth/whoami", { credentials: "include" }).then(r => r.json());
console.log("WHOAMI:", who);

        const okEnsure = await ensureProfileAndWallet(roleAfterLogin);
        setLoading(false);
        return okEnsure;
      }

// ✅ FIX: Wenn Login fehlschlägt, NICHT automatisch registrieren.
// Stattdessen klare Meldung: "Bitte zuerst registrieren".
if (!ALLOW_AUTO_SIGNUP) {
  setError("Kein Konto gefunden oder falsches Passwort. Bitte zuerst registrieren oder Daten prüfen.");
  setLoading(false);
  triggerAngry();
  return false;
}

      // 2) Wenn Login nicht ging, versuche Signup (für Demo / neues Konto)
      // (Falls du kein Auto-Signup willst, sag mir Bescheid – dann entfernen wir das.)
      const signUp = await supabaseBrowser.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name || null },
        },
      });

      if (signUp.error) {
        setError(signUp.error.message || "Login fehlgeschlagen.");
        setLoading(false);
        triggerAngry();
        return false;
      }

      // Nach Signup nochmal einloggen (bei manchen Setups nötig)
      const signIn2 = await supabaseBrowser.auth.signInWithPassword({ email, password });
      if (signIn2.error || !signIn2.data?.user)try {
  localStorage.setItem("kidbuy_user_name", (name || "").trim());
  localStorage.setItem("kidbuy_user_role", roleAfterLogin);
} catch {}  {
        setError("Bitte E-Mail bestätigen oder erneut versuchen.");
        setLoading(false);
        triggerAngry();
        return false;
      }

      const okEnsure = await ensureProfileAndWallet(roleAfterLogin);
      setLoading(false);
      return okEnsure;
    } catch {
      setLoading(false);
      setError("Netzwerkfehler. Bitte nochmal.");
      triggerAngry();
      return false;
    }
  }

  async function onNormalLogin() {
    if (!canLogin) {
      setError("Bitte E-Mail und Passwort eingeben.");
      triggerAngry();
      return;
    }

    // ✅ normal = kid (oder “normal user”) – du kannst das später umbenennen
    const ok = await baseLogin("kid");
    if (!ok) return;

    triggerClapYes();
    router.push(next === "/parent" ? "/" : next);
    router.refresh();
  }

  async function onParentFlowStart() {
    if (!canLogin) {
      setError("Bitte E-Mail und Passwort eingeben.");
      triggerAngry();
      return;
    }

    // ✅ parent-flow: erst einloggen + profile/wallet anlegen
    const ok = await baseLogin("parent");
    if (!ok) return;

    setError("");
  }

  async function onFinishParent() {
    if (!canFinishParent) {
      setError("Bitte echtes Geburtsdatum eingeben (Tag 1–31, Monat 1–12, gültig).");
      triggerAngry();
      return;
    }

    setError("");
    setLoading(true);

    try {
      // ✅ Optional: Hier könntest du später DOB/ID wirklich prüfen.
      // Für jetzt belassen wir deinen Demo-Endpunkt (falls du ihn brauchst).
      // Wenn du KEINEN /api/auth/parent-verify mehr brauchst, sag Bescheid.
      const res = await fetch("/api/auth/parent-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "parent",
          dob: { day: dobDay, month: dobMonth, year: dobYear },
          hasIdPhoto: idPhotoSelected,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message || "Eltern-Bestätigung fehlgeschlagen.");
        setLoading(false);
        triggerAngry();
        return;
      }

      setLoading(false);
      triggerClapYes();
      router.push(next);
      router.refresh();
    } catch {
      setLoading(false);
      setError("Netzwerkfehler. Bitte nochmal.");
      triggerAngry();
    }
  }

  async function onLogout() {
    setLoading(true);
    setError("");
    try {
      await supabaseBrowser.auth.signOut(); // ✅ Supabase logout
      setLoading(false);
      setMode("pick");
      setEmojiMood("idle");
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  // ✅ FOCUS Reaktionen nach deinen Regeln
  function onNameFocus() {
    setEmojiMood("nameTyping"); // Name -> Mund rund (staunen)
  }
  function onEmailFocus() {
    setEmojiMood("emailTyping"); // Email -> Schlitzaugen + gerader Mund
  }
  function onPasswordFocus() {
    setEmojiMood("passwordTyping"); // Passwort -> schämt sich
  }

  function onAnyBlur() {
    // kurz warten, falls direkt nächstes Feld fokussiert wird
    window.setTimeout(() => {
      if (!loading && !error) setEmojiMood("idle");
    }, 120);
  }

  return (
    <main
      ref={containerRef}
      style={{
        minHeight: "100vh",
        color: palette.text,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -40,
          zIndex: 0,
          background: `
            radial-gradient(900px 540px at 18% 18%, ${palette.yellow}, transparent 62%),
            radial-gradient(900px 540px at 84% 18%, ${palette.blue}, transparent 62%),
            radial-gradient(900px 540px at 18% 86%, ${palette.green}, transparent 62%),
            radial-gradient(900px 540px at 86% 86%, ${palette.red}, transparent 62%)
          `,
          filter: "blur(6px)",
        }}
      />

      {/* ✅ echtes Layout: links Emoji, rechts Login (Desktop) */}
      <div className="kb-shell" style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        <section className="kb-left">
          {/* ✅ NUR ERGÄNZT: subtitleByMood -> Bubble wird übersetzt */}
          <EmojiCompanion
            look={look}
            mood={emojiMood}
            shake={shake}
            clap={clap}
            palette={palette}
            subtitleByMood={emojiTextByMood}
          />
        </section>

        <section className="kb-right">
          <div
            style={{
              width: "min(720px, 96vw)",
              background: palette.glass,
              border: `1px solid ${palette.border}`,
              borderRadius: 26,
              boxShadow: palette.shadow,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: 18,
                borderBottom: `1px solid ${palette.border}`,
                background: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 100%)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 20, fontWeight: 950, letterSpacing: "-0.02em" }}>{t(lang, "login.title")}</div>
                <div style={{ marginTop: 6, fontSize: 13, color: "rgba(0,0,0,0.62)", lineHeight: 1.35 }}>
                  {t(lang, "login.subtitle")}
                </div>
                {needParent && (
                  <div
                    style={{
                      marginTop: 10,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 999,
                      border: `1px solid ${palette.borderStrong}`,
                      background: "rgba(255, 205, 55, 0.18)",
                      fontSize: 12,
                      fontWeight: 950,
                    }}
                  >
                    🛡️ {t(lang, "login.needParent")}
                  </div>
                )}
              </div>

              {/* ✅ Apple-Style weg, dafür Sprachwahl */}
              <select
                value={lang}
                onChange={(e) => {
                  const v = e.target.value as Lang;
                  setLang(v);
                  setLangState(v);
                }}
                style={{
                  borderRadius: 999,
                  border: `1px solid ${palette.borderStrong}`,
                  background: "rgba(255,255,255,0.72)",
                  padding: "8px 10px",
                  fontSize: 12,
                  fontWeight: 950,
                  outline: "none",
                  cursor: "pointer",
                }}
                title="Sprache"
              >
                {EU_LANGS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* CONTENT */}
            <div
              style={{
                padding: 18,
                display: "grid",
                gap: 14,
                maxHeight: "calc(100vh - 140px)",
                overflow: "auto",
              }}
            >
              {/* ✅ Labels ohne Emoji-Text */}
              <Field label={t(lang, "login.name")}>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setEmojiMood("nameTyping");
                  }}
                  onFocus={onNameFocus}
                  onBlur={onAnyBlur}
                  placeholder={t(lang, "login.placeholderName")}
                  style={inputStyle(palette)}
                />
              </Field>

              <Field label={t(lang, "login.email")}>
                <input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmojiMood("emailTyping");
                  }}
                  onFocus={onEmailFocus}
                  onBlur={onAnyBlur}
                  placeholder={t(lang, "login.placeholderEmail")}
                  style={inputStyle(palette)}
                />
              </Field>

              <Field label={t(lang, "login.password")}>
                <input
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setEmojiMood("passwordTyping");
                  }}
                  placeholder="••••••"
                  type="password"
                  onFocus={onPasswordFocus}
                  onBlur={onAnyBlur}
                  style={inputStyle(palette)}
                />
              </Field>

              {mode === "pick" && (
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 950, color: "rgba(0,0,0,0.70)" }}>{t(lang, "login.optionQ")}</div>

                  <ChoiceCard
                    palette={palette}
                    title={t(lang, "login.opt1t")}
                    desc={t(lang, "login.opt1d")}
                    icon="➡️"
                    tint="blue"
                    onClick={() => setMode("normal")}
                  />

                  <ChoiceCard
                    palette={palette}
                    title={t(lang, "login.opt2t")}
                    desc={t(lang, "login.opt2d")}
                    icon="🛡️"
                    tint="yellow"
                    onClick={() => setMode("parent")}
                  />
                </div>
              )}

              {mode === "normal" && (
                <Panel palette={palette} tint="blue" title="Normal anmelden">
                  <div style={{ display: "grid", gap: 10 }}>
                    <button
                      onClick={onNormalLogin}
                      disabled={!canLogin || loading}
                      style={primaryButtonStyle(palette, "blue", !canLogin || loading)}
                    >
                      {loading ? "Bitte warten…" : "Anmelden (Normal)"}
                    </button>

                    <button onClick={() => setMode("pick")} disabled={loading} style={secondaryButtonStyle(palette, loading)}>
                      Zurück
                    </button>
                  </div>
                </Panel>
              )}

              {mode === "parent" && (
                <Panel palette={palette} tint="green" title="Als Elternteil anmelden">
                  <div style={{ display: "grid", gap: 10 }}>
                    <button
                      onClick={onParentFlowStart}
                      disabled={!canLogin || loading}
                      style={primaryButtonStyle(palette, "green", !canLogin || loading)}
                    >
                      {loading ? "Bitte warten…" : "Weiter (Login prüfen)"}
                    </button>

                    <div
                      style={{
                        borderRadius: 18,
                        border: `1px solid ${palette.borderStrong}`,
                        background: "rgba(255,255,255,0.72)",
                        padding: 12,
                        display: "grid",
                        gap: 10,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 950 }}>Elternteil bestätigen (18+)</div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.3fr", gap: 10 }}>
                        <DobBox label="Tag" value={dobDay} onChange={(v) => setDobDay(v)} placeholder="TT" maxLen={2} />
                        <DobBox label="Monat" value={dobMonth} onChange={(v) => setDobMonth(v)} placeholder="MM" maxLen={2} />
                        <DobBox label="Jahr" value={dobYear} onChange={(v) => setDobYear(v)} placeholder="JJJJ" maxLen={4} />
                      </div>

                      <div style={{ fontSize: 12, color: "rgba(0,0,0,0.55)", fontWeight: 800 }}>
                        (Nur echte Daten möglich – System prüft Alter.)
                      </div>

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          padding: "12px 12px",
                          borderRadius: 18,
                          border: `1px solid ${palette.borderStrong}`,
                          background: idPhotoSelected ? "rgba(255, 205, 55, 0.18)" : "rgba(255,255,255,0.80)",
                          boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                          cursor: "pointer",
                          fontWeight: 950,
                        }}
                      >
                        <span>{idPhotoSelected ? "✅ Foto ausgewählt (Demo)" : "Pass-Foto auswählen (Demo)"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setIdPhotoSelected(!!e.target.files?.[0])}
                          style={{ display: "none" }}
                        />
                        <span aria-hidden>📷</span>
                      </label>

                      <button
                        onClick={onFinishParent}
                        disabled={!canFinishParent || loading}
                        style={primaryButtonStyle(palette, "red", !canFinishParent || loading)}
                      >
                        {loading ? "Bitte warten…" : "Fertig anmelden (Elternteil)"}
                      </button>
                    </div>

                    <button onClick={() => setMode("pick")} disabled={loading} style={secondaryButtonStyle(palette, loading)}>
                      Zurück
                    </button>
                  </div>
                </Panel>
              )}

              {error && (
                <div
                  style={{
                    borderRadius: 18,
                    border: "1px solid rgba(255, 90, 90, 0.28)",
                    background: "rgba(255, 90, 90, 0.14)",
                    padding: "10px 12px",
                    fontSize: 12,
                    fontWeight: 950,
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  onClick={onLogout}
                  disabled={loading}
                  style={{
                    borderRadius: 18,
                    border: `1px solid ${palette.borderStrong}`,
                    background: "rgba(0,0,0,0.04)",
                    color: palette.text,
                    padding: "10px 12px",
                    fontSize: 12,
                    fontWeight: 950,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {t(lang, "login.logout")}
                </button>

                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.55)", fontWeight: 800 }}>
                  {t(lang, "login.demo")} <b>parent@kidbuy.ch</b> / <b>kidbuy</b>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .kb-shell {
          display: grid;
          grid-template-columns: 1fr;
          min-height: 100vh;
        }

        .kb-left {
          display: none;
          padding: 28px 24px;
          align-items: center;
          justify-content: center;
        }

        .kb-right {
          padding: 24px 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          overflow: auto;
        }

        @media (min-width: 980px) {
          .kb-shell {
            grid-template-columns: 1fr 1fr;
          }
          .kb-left {
            display: flex;
            position: sticky;
            top: 0;
            height: 100vh;
          }
          .kb-right {
            justify-content: flex-start;
            padding: 28px 28px;
          }
        }
      `}</style>
    </main>
  );
}

/** Small UI helpers */



function inputStyle(palette: any): React.CSSProperties {
  return {
    padding: "12px 12px",
    borderRadius: 18,
    border: `1px solid ${palette.borderStrong}`,
    background: "rgba(255,255,255,0.86)",
    boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
    outline: "none",
    fontSize: 14,
    fontWeight: 750,
    color: palette.text,
    width: "100%",
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 950 }}>{label}</span>
      {children}
    </label>
  );
}

function Panel({
  palette,
  tint,
  title,
  children,
}: {
  palette: any;
  tint: "blue" | "green" | "yellow" | "red";
  title: string;
  children: React.ReactNode;
}) {
  const bg =
    tint === "blue"
      ? "rgba(60, 120, 255, 0.10)"
      : tint === "green"
      ? "rgba(35, 200, 140, 0.12)"
      : tint === "yellow"
      ? "rgba(255, 205, 55, 0.16)"
      : "rgba(255, 90, 90, 0.12)";

  return (
    <div
      style={{
        borderRadius: 22,
        border: `1px solid ${palette.borderStrong}`,
        background: bg,
        padding: 14,
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ fontWeight: 950, letterSpacing: "-0.01em" }}>{title}</div>
      {children}
    </div>
  );
}

function ChoiceCard({
  palette,
  title,
  desc,
  icon,
  tint,
  onClick,
}: {
  palette: any;
  title: string;
  desc: string;
  icon: string;
  tint: "blue" | "yellow";
  onClick: () => void;
}) {
  const bg =
    tint === "blue"
      ? "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.76) 100%)"
      : "linear-gradient(180deg, rgba(255, 205, 55, 0.16) 0%, rgba(255,255,255,0.74) 100%)";

  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: "14px 14px",
        borderRadius: 22,
        border: `1px solid ${palette.borderStrong}`,
        background: bg,
        boxShadow: "0 14px 34px rgba(0,0,0,0.08)",
        cursor: "pointer",
        fontWeight: 950,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 14 }}>{title}</div>
          <div style={{ marginTop: 6, fontSize: 12, fontWeight: 800, color: "rgba(0,0,0,0.60)" }}>{desc}</div>
        </div>
        <span aria-hidden style={{ fontSize: 18 }}>
          {icon}
        </span>
      </div>
    </button>
  );
}

function primaryButtonStyle(palette: any, tint: "blue" | "green" | "red", disabled: boolean): React.CSSProperties {
  const border =
    tint === "blue"
      ? "rgba(60,120,255,0.28)"
      : tint === "green"
      ? "rgba(35,200,140,0.28)"
      : "rgba(255,90,90,0.28)";
  const bg =
    tint === "blue"
      ? "rgba(60,120,255,0.18)"
      : tint === "green"
      ? "rgba(35,200,140,0.18)"
      : "rgba(255,90,90,0.16)";

  return {
    borderRadius: 18,
    border: `1px solid ${border}`,
    background: bg,
    color: palette.text,
    padding: "12px 14px",
    fontSize: 13,
    fontWeight: 950,
    letterSpacing: "-0.01em",
    boxShadow: "0 14px 30px rgba(0,0,0,0.10)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "transform 160ms ease, box-shadow 160ms ease",
  };
}

function secondaryButtonStyle(palette: any, disabled: boolean): React.CSSProperties {
  return {
    borderRadius: 18,
    border: `1px solid ${palette.borderStrong}`,
    background: "rgba(255,255,255,0.75)",
    color: palette.text,
    padding: "11px 14px",
    fontSize: 13,
    fontWeight: 900,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
  };
}

function DobBox({
  label,
  value,
  onChange,
  placeholder,
  maxLen,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLen: number;
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 11, fontWeight: 950, color: "rgba(0,0,0,0.70)" }}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(onlyDigits(e.target.value).slice(0, maxLen))}
        placeholder={placeholder}
        inputMode="numeric"
        style={{
          padding: "12px 10px",
          borderRadius: 16,
          border: "1px solid rgba(0,0,0,0.12)",
          background: "rgba(255,255,255,0.85)",
          boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
          outline: "none",
          fontSize: 14,
          fontWeight: 950,
          color: "rgba(0,0,0,0.90)",
          textAlign: "center",
        }}
      />
    </div>
  );
}