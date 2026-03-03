// app/parent/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Divider, FieldRow, Input, Toggle } from "@/components/parent/ParentCards";

type ChildProfile = {
  id: string;
  name: string;
  dailyBudget: number;
  locked: boolean;
};

const LS = {
  budget: "kidbuy_parent_budget",
  requireApproval: "kidbuy_parent_require_approval",
  maxOrder: "kidbuy_parent_max_order",
  maxDay: "kidbuy_parent_max_day",
  children: "kidbuy_parent_children",
  recent: "kidbuy_recent",
  wishlist: "kidbuy_wishlist",
} as const;

function clampMin0(n: number) {
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function parseNumberLoose(v: unknown, fallback: number) {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const cleaned = v.replace(",", ".").trim();
    const n = Number(cleaned);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function formatCHF(n: number) {
  const safe = clampMin0(n);
  try {
    return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(safe);
  } catch {
    return `CHF ${safe.toFixed(2)}`;
  }
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readLSNumber(key: string, fallback: number) {
  const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
  if (raw == null) return fallback;
  // allow either JSON number or plain string
  const parsed = safeJsonParse<unknown>(raw);
  if (parsed !== null) return parseNumberLoose(parsed, fallback);
  return parseNumberLoose(raw, fallback);
}

function writeLSNumber(key: string, value: number) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function readLSBool(key: string, fallback: boolean) {
  const raw = window.localStorage.getItem(key);
  if (raw == null) return fallback;
  const parsed = safeJsonParse<unknown>(raw);
  if (typeof parsed === "boolean") return parsed;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return fallback;
}

function writeLSBool(key: string, value: boolean) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function defaultChildren(): ChildProfile[] {
  return [
    { id: "child-1", name: "Kind 1", dailyBudget: 10, locked: false },
    { id: "child-2", name: "Kind 2", dailyBudget: 10, locked: false },
  ];
}

function readChildren(): ChildProfile[] {
  const raw = window.localStorage.getItem(LS.children);
  const parsed = safeJsonParse<unknown>(raw);

  if (Array.isArray(parsed)) {
    const cleaned: ChildProfile[] = parsed
      .map((x: any, idx) => {
        const id = typeof x?.id === "string" ? x.id : `child-${idx + 1}`;
        const name = typeof x?.name === "string" ? x.name : `Kind ${idx + 1}`;
        const dailyBudget = clampMin0(parseNumberLoose(x?.dailyBudget, 10));
        const locked = typeof x?.locked === "boolean" ? x.locked : false;
        return { id, name, dailyBudget, locked };
      })
      .slice(0, 50);
    if (cleaned.length > 0) return cleaned;
  }

  return defaultChildren();
}

function writeChildren(children: ChildProfile[]) {
  window.localStorage.setItem(LS.children, JSON.stringify(children));
}

function normalizeList(raw: unknown): Array<{ title: string; subtitle?: string }> {
  // supports arrays of strings, or objects with name/title, price, etc.
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x: any) => {
      if (typeof x === "string") return { title: x };
      if (typeof x?.title === "string") {
        const subtitle =
          typeof x?.price === "number"
            ? formatCHF(x.price)
            : typeof x?.price === "string"
            ? x.price
            : typeof x?.category === "string"
            ? x.category
            : undefined;
        return { title: x.title, subtitle };
      }
      if (typeof x?.name === "string") {
        const subtitle =
          typeof x?.price === "number"
            ? formatCHF(x.price)
            : typeof x?.price === "string"
            ? x.price
            : typeof x?.category === "string"
            ? x.category
            : undefined;
        return { title: x.name, subtitle };
      }
      if (typeof x?.id === "string") return { title: x.id };
      return null;
    })
    .filter(Boolean)
    .slice(0, 12) as Array<{ title: string; subtitle?: string }>;
}

export default function ParentPage() {
  const [mounted, setMounted] = useState(false);

  // Budget
  const [budget, setBudget] = useState<number>(50);
  const [amount, setAmount] = useState<string>("5");

  // Rules
  const [requireApproval, setRequireApproval] = useState<boolean>(true);
  const [maxOrder, setMaxOrder] = useState<string>("25");
  const [maxDay, setMaxDay] = useState<string>("50");

  // Children
  const [children, setChildren] = useState<ChildProfile[]>([]);

  // Read-only activity
  const [recentList, setRecentList] = useState<Array<{ title: string; subtitle?: string }>>([]);
  const [wishlistList, setWishlistList] = useState<Array<{ title: string; subtitle?: string }>>([]);

  useEffect(() => {
    setMounted(true);

    // Budget
    const b = readLSNumber(LS.budget, 50);
    setBudget(clampMin0(b));

    // Rules
    setRequireApproval(readLSBool(LS.requireApproval, true));
    setMaxOrder(String(clampMin0(readLSNumber(LS.maxOrder, 25))));
    setMaxDay(String(clampMin0(readLSNumber(LS.maxDay, 50))));

    // Children
    const c = readChildren();
    setChildren(c);
    // ensure initialized
    writeChildren(c);

    // Activity
    const recentRaw = safeJsonParse<unknown>(window.localStorage.getItem(LS.recent));
    const wishRaw = safeJsonParse<unknown>(window.localStorage.getItem(LS.wishlist));
    setRecentList(normalizeList(recentRaw));
    setWishlistList(normalizeList(wishRaw));
  }, []);

  // Persist rules when changed (after mount)
  useEffect(() => {
    if (!mounted) return;
    writeLSBool(LS.requireApproval, requireApproval);
  }, [mounted, requireApproval]);

  useEffect(() => {
    if (!mounted) return;
    writeLSNumber(LS.maxOrder, clampMin0(parseNumberLoose(maxOrder, 0)));
  }, [mounted, maxOrder]);

  useEffect(() => {
    if (!mounted) return;
    writeLSNumber(LS.maxDay, clampMin0(parseNumberLoose(maxDay, 0)));
  }, [mounted, maxDay]);

  const amountNumber = useMemo(() => clampMin0(parseNumberLoose(amount, 0)), [amount]);
  const canApply = amountNumber > 0;

  function applyBudget(delta: number) {
    const next = clampMin0(budget + delta);
    setBudget(next);
    writeLSNumber(LS.budget, next);
  }

  function toggleChildLock(id: string) {
    const next = children.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c));
    setChildren(next);
    writeChildren(next);
  }

  return (
    <main
      style={{
        padding: "22px 18px 54px",
        maxWidth: 1080,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <Card
          title="Elternkonto"
          subtitle="Kontrolle & Sicherheit für KidBuy"
          right={<Badge tone="green">Sicher</Badge>}
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ color: "rgba(0,0,0,0.60)", fontSize: 13, lineHeight: 1.4, maxWidth: 720 }}>
              Budget & Regeln werden in dieser Demo lokal gespeichert (localStorage). Perfekt zum Testen – später
              austauschbar durch echtes Elternkonto-Backend.
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                borderRadius: 18,
                border: "1px solid rgba(0,0,0,0.08)",
                background: "rgba(0,0,0,0.03)",
                color: "rgba(0,0,0,0.65)",
                fontSize: 12,
                fontWeight: 700,
              }}
              title="Demo-Status"
            >
              <span aria-hidden style={{ fontSize: 14 }}>🛡️</span>
              Elternmodus aktiv
            </div>
          </div>
        </Card>
      </div>

      {/* Content grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
        }}
      >
        {/* Top row: Budget + Rules */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 16,
          }}
        >
          {/* Budget */}
          <Card title="Budget" subtitle="Gesamtbudget für Einkäufe (Demo)">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize: 12, color: "rgba(0,0,0,0.55)", fontWeight: 700 }}>
                    Aktuelles Budget
                  </div>
                  <div
                    style={{
                      fontSize: 34,
                      fontWeight: 850,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.05,
                    }}
                  >
                    {formatCHF(budget)}
                  </div>
                </div>

                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 18,
                    background: "rgba(20, 90, 255, 0.06)",
                    border: "1px solid rgba(20, 90, 255, 0.10)",
                    color: "rgba(20, 70, 190, 0.92)",
                    fontSize: 12,
                    fontWeight: 750,
                  }}
                >
                  localStorage: <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{LS.budget}</span>
                </div>
              </div>

              <FieldRow label="Betrag" hint="CHF (z.B. 5 oder 12.50)">
                <Input value={amount} onChange={setAmount} placeholder="5" prefix="CHF" />
              </FieldRow>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button onClick={() => applyBudget(+amountNumber)} disabled={!canApply}>
                  Budget erhöhen
                </Button>
                <Button onClick={() => applyBudget(-amountNumber)} variant="secondary" disabled={!canApply}>
                  Budget senken
                </Button>
              </div>

              <div style={{ fontSize: 12, color: "rgba(0,0,0,0.52)", lineHeight: 1.4 }}>
                Tipp: Budget kann nicht unter 0 fallen. Eingaben mit Komma werden automatisch verstanden.
              </div>
            </div>
          </Card>

          {/* Rules */}
          <Card title="Kaufregeln & Limits" subtitle="Einfach togglen – Werte werden gespeichert">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <FieldRow
                label="Käufe müssen bestätigt werden"
                hint="Kind kann nur anfragen"
                right={<Toggle checked={requireApproval} onChange={setRequireApproval} />}
              />

              <Divider />

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                <FieldRow label="Max. pro Bestellung" hint="CHF">
                  <Input value={maxOrder} onChange={setMaxOrder} placeholder="25" prefix="CHF" />
                </FieldRow>
                <FieldRow label="Max. pro Tag" hint="CHF">
                  <Input value={maxDay} onChange={setMaxDay} placeholder="50" prefix="CHF" />
                </FieldRow>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  color: "rgba(0,0,0,0.55)",
                  fontSize: 12,
                  fontWeight: 650,
                }}
              >
                <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{LS.requireApproval}</span>
                <span>·</span>
                <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{LS.maxOrder}</span>
                <span>·</span>
                <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{LS.maxDay}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom row: Children + Activity */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 16,
          }}
        >
          <Card title="Kinderprofile" subtitle="Demo-Kinder, später erweiterbar">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 12,
                }}
              >
                {children.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      borderRadius: 20,
                      border: "1px solid rgba(0,0,0,0.06)",
                      background:
                        c.locked
                          ? "linear-gradient(180deg, rgba(230,70,70,0.07) 0%, rgba(255,255,255,0.85) 100%)"
                          : "linear-gradient(180deg, rgba(28,180,120,0.06) 0%, rgba(255,255,255,0.85) 100%)",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.07)",
                      padding: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 850, letterSpacing: "-0.02em" }}>{c.name}</div>
                      <div style={{ marginTop: 6, fontSize: 12, color: "rgba(0,0,0,0.60)", fontWeight: 650 }}>
                        Tagesbudget:{" "}
                        <span style={{ color: "rgba(0,0,0,0.78)" }}>{formatCHF(c.dailyBudget)}</span>
                        {" · "}
                        Status:{" "}
                        <span style={{ color: c.locked ? "rgba(170,30,30,0.98)" : "rgba(16,120,80,0.95)" }}>
                          {c.locked ? "Gesperrt" : "Aktiv"}
                        </span>
                      </div>
                    </div>

                    <Toggle
                      checked={!c.locked}
                      onChange={() => toggleChildLock(c.id)}
                      label={c.locked ? "Entsperren" : "Sperren"}
                    />
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 12, color: "rgba(0,0,0,0.52)", lineHeight: 1.4 }}>
                Speicherung:{" "}
                <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{LS.children}</span>
              </div>
            </div>
          </Card>

          <Card title="Letzte Aktivitäten" subtitle="Nur Anzeige (read-only)">
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 850, letterSpacing: "-0.01em" }}>
                  Letzte angesehen Produkte
                </div>
                <div style={{ marginTop: 10 }}>
                  {recentList.length === 0 ? (
                    <div
                      style={{
                        borderRadius: 18,
                        border: "1px dashed rgba(0,0,0,0.12)",
                        background: "rgba(0,0,0,0.02)",
                        padding: 14,
                        color: "rgba(0,0,0,0.58)",
                        fontSize: 12,
                        fontWeight: 650,
                      }}
                    >
                      Noch keine Einträge gefunden (localStorage:{" "}
                      <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{LS.recent}</span>).
                    </div>
                  ) : (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                      {recentList.map((it, idx) => (
                        <li
                          key={`${it.title}-${idx}`}
                          style={{
                            borderRadius: 18,
                            border: "1px solid rgba(0,0,0,0.06)",
                            background: "rgba(255,255,255,0.80)",
                            boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                            padding: "12px 12px",
                          }}
                        >
                          <div style={{ fontWeight: 800, letterSpacing: "-0.01em" }}>{it.title}</div>
                          {it.subtitle && (
                            <div style={{ marginTop: 4, fontSize: 12, color: "rgba(0,0,0,0.56)", fontWeight: 650 }}>
                              {it.subtitle}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <Divider />

              <div>
                <div style={{ fontSize: 13, fontWeight: 850, letterSpacing: "-0.01em" }}>Wunschliste</div>
                <div style={{ marginTop: 10 }}>
                  {wishlistList.length === 0 ? (
                    <div
                      style={{
                        borderRadius: 18,
                        border: "1px dashed rgba(0,0,0,0.12)",
                        background: "rgba(0,0,0,0.02)",
                        padding: 14,
                        color: "rgba(0,0,0,0.58)",
                        fontSize: 12,
                        fontWeight: 650,
                      }}
                    >
                      Noch keine Einträge gefunden (localStorage:{" "}
                      <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                        {LS.wishlist}
                      </span>
                      ).
                    </div>
                  ) : (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                      {wishlistList.map((it, idx) => (
                        <li
                          key={`${it.title}-${idx}`}
                          style={{
                            borderRadius: 18,
                            border: "1px solid rgba(0,0,0,0.06)",
                            background: "rgba(255,255,255,0.80)",
                            boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                            padding: "12px 12px",
                          }}
                        >
                          <div style={{ fontWeight: 800, letterSpacing: "-0.01em" }}>{it.title}</div>
                          {it.subtitle && (
                            <div style={{ marginTop: 4, fontSize: 12, color: "rgba(0,0,0,0.56)", fontWeight: 650 }}>
                              {it.subtitle}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Simple responsive enhancement without touching globals */}
      <style jsx>{`
        @media (min-width: 980px) {
          main > div:nth-child(2) {
            grid-template-columns: 1.12fr 0.88fr;
            align-items: start;
          }
          main > div:nth-child(2) > div:nth-child(1) {
            grid-column: 1 / 2;
          }
          main > div:nth-child(2) > div:nth-child(2) {
            grid-column: 2 / 3;
          }
        }
      `}</style>
    </main>
  );
}
