"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import KidBuyAssistantBanner from "./components/KidBuyAssistantBanner";
import { useCart } from "../components/cart/cart-context";
import KidBuyAssistantOverlay from "./components/KidBuyAssistantOverlay";
import { emitAssistantMessage, getStartCenterMessage } from "./lib/kidbuyAssistant";
import AuthShimmerLink from "./components/AuthShimmerLink";
import { supabaseBrowser } from "@/app/lib/supabase-browser";

type CategoryKey = "elektronik" | "sport" | "office" | "gadgets" | "wissen" | "mode";

type Category = {
  key: CategoryKey;
  label: string;
  bgFrom: string;
  bgTo: string;
  text: string;
};

type Offer = {
  id: string;
  title: string;
  priceCHF: number;
  bgFrom: string;
  bgTo: string;
  emoji: string;
};

type ViewedItem = {
  id: string;
  title: string;
  priceCHF: number;
  imageUrl?: string;
  category?: CategoryKey;
};

function formatCHF(v: number) {
  return `CHF ${v.toFixed(2)}`;
}

function Container({ children }: { children: React.ReactNode }) {
  return <div style={{ width: "min(1680px, 100%)", margin: "0 auto", padding: "0 18px" }}>{children}</div>;
}

function PillLink({
  href,
  label,
  variant,
}: {
  href: string;
  label: string;
  variant: "primary" | "ghost";
}) {
  const common: React.CSSProperties = {
    height: 46,
    padding: "0 18px",
    borderRadius: 999,
    fontWeight: 950,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: 0.2,
  };

  const style: React.CSSProperties =
    variant === "primary"
      ? {
          ...common,
          color: "#0B1220",
          background: "linear-gradient(180deg, #FFE275, #FFB200)",
          border: "1px solid rgba(15,23,42,0.18)",
          boxShadow: "0 18px 45px rgba(0,0,0,0.18)",
        }
      : {
          ...common,
          color: "#0B1220",
          background: "rgba(255,255,255,0.80)",
          border: "1px solid rgba(15,23,42,0.10)",
        };

  return (
    <Link
      href={href}
      style={style}
      onMouseDown={(e) => ((e.currentTarget as HTMLAnchorElement).style.transform = "scale(0.99)")}
      onMouseUp={(e) => ((e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)")}
    >
      {label}
    </Link>
  );
}

function FeatureItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: 14,
        borderRadius: 18,
        border: "1px solid rgba(15,23,42,0.10)",
        background: "rgba(255,255,255,0.90)",
        boxShadow: "0 16px 45px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          height: 42,
          width: 42,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          border: "1px solid rgba(15,23,42,0.10)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.84))",
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 950, fontSize: 14, letterSpacing: 0.1 }}>{title}</div>
        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.78, lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}

/* -------------------- Zuletzt angesehen (Startseite) -------------------- */

const RECENT_KEY = "kidbuy_recent_viewed_v1";

function readRecent(): ViewedItem[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.slice(0, 20);
  } catch {
    return [];
  }
}

function makeIdFromTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .slice(0, 60);
}

function addRecentViewedLocal(input: {
  id?: string;
  title: string;
  priceCHF: number;
  imageUrl?: string;
  category?: CategoryKey;
}) {
  const item: ViewedItem = {
    id: input.id && String(input.id).trim().length ? String(input.id) : makeIdFromTitle(input.title),
    title: input.title,
    priceCHF: input.priceCHF,
    imageUrl: input.imageUrl,
    category: input.category,
  };

  const cur = readRecent();
  const withoutDupes = cur.filter((x) => x.id !== item.id);
  const next = [item, ...withoutDupes].slice(0, 20);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("kidbuy_recent_updated_v1"));
}

declare global {
  interface Window {
    kidbuyAddRecentViewed?: (item: {
      id?: string;
      title: string;
      priceCHF: number;
      imageUrl?: string;
      category?: CategoryKey;
    }) => void;
  }
}

function RecentlyViewedStrip({ items }: { items: ViewedItem[] }) {
  const { addItem } = useCart();
  const stripRef = useRef<HTMLDivElement | null>(null);

  const scroll = (dir: -1 | 1) => {
    const el = stripRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 520, behavior: "smooth" });
  };

  useEffect(() => {
    if (!items.length) return;
    const t = window.setInterval(() => scroll(1), 7000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  if (!items.length) return null;

  const categoryButtonBg = (cat?: CategoryKey) => {
    const map: Record<CategoryKey, string> = {
      elektronik: "linear-gradient(180deg, #93C5FD, #3B82F6)",
      sport: "linear-gradient(180deg, #F87171, #EF4444)",
      office: "linear-gradient(180deg, #86EFAC, #22C55E)",
      gadgets: "linear-gradient(180deg, #C7D2FE, #6366F1)",
      wissen: "linear-gradient(180deg, #E5E7EB, #CBD5E1)",
      mode: "linear-gradient(180deg, #FFE275, #FFB200)",
    };
    return cat ? map[cat] : "linear-gradient(180deg, #FFE275, #FFB200)";
  };

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontWeight: 950, fontSize: 22, letterSpacing: -0.4, marginBottom: 10 }}>
        Zuletzt angesehen
      </div>

      <div
        style={{
          position: "relative",
          borderRadius: 22,
          border: "1px solid rgba(15,23,42,0.10)",
          background: "rgba(255,255,255,0.92)",
          boxShadow: "0 18px 55px rgba(0,0,0,0.08)",
          padding: 14,
          overflow: "hidden",
        }}
      >
        <div
          ref={stripRef}
          style={{
            display: "flex",
            gap: 14,
            overflowX: "auto",
            paddingBottom: 10,
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {items.map((p) => (
            <Link
              key={p.id}
              href="/product"
              style={{
                minWidth: 280,
                maxWidth: 280,
                textDecoration: "none",
                color: "#0B1220",
                borderRadius: 18,
                border: "1px solid rgba(15,23,42,0.10)",
                background: "white",
                overflow: "hidden",
                boxShadow: "0 14px 35px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
              }}
              title="Öffnet die Produktseite (Demo)"
              onClick={() => {
                addRecentViewedLocal({
                  id: p.id,
                  title: p.title,
                  priceCHF: p.priceCHF,
                  imageUrl: p.imageUrl,
                  category: p.category,
                });
              }}
            >
              <div
                style={{
                  height: 170,
                  background: "rgba(15,23,42,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 10,
                }}
              >
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 12,
                    }}
                  />
                ) : (
                  <div style={{ fontWeight: 950, opacity: 0.55 }}>Produktbild</div>
                )}
              </div>

              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <div
                  style={{
                    fontWeight: 950,
                    fontSize: 13,
                    lineHeight: 1.25,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {p.title}
                </div>
                <div style={{ fontWeight: 950, fontSize: 16 }}>{formatCHF(p.priceCHF)}</div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    addItem({
                      id: p.id,
                      title: p.title,
                      priceCHF: p.priceCHF,
                      imageUrl: p.imageUrl ?? "",
                    });

                    // ✅ NEU: kleine Reaktion wenn in Warenkorb
                    emitAssistantMessage({ text: "Wow – echt gute Wahl!", emoji: "😄" });
                  }}
                  style={{
                    height: 42,
                    borderRadius: 12,
                    border: "1px solid rgba(15,23,42,0.14)",
                    background: categoryButtonBg(p.category),
                    fontWeight: 950,
                    cursor: "pointer",
                  }}
                >
                  Ab in den Warenkorb
                </button>
              </div>
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Links"
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            height: 44,
            width: 44,
            borderRadius: 999,
            border: "1px solid rgba(15,23,42,0.12)",
            background: "rgba(255,255,255,0.92)",
            cursor: "pointer",
            fontWeight: 950,
            boxShadow: "0 16px 40px rgba(0,0,0,0.10)",
          }}
        >
          ←
        </button>

        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Rechts"
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            height: 44,
            width: 44,
            borderRadius: 999,
            border: "1px solid rgba(15,23,42,0.12)",
            background: "rgba(255,255,255,0.92)",
            cursor: "pointer",
            fontWeight: 950,
            boxShadow: "0 16px 40px rgba(0,0,0,0.10)",
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}

const START_POPUP_KEY = "kidbuy_start_popup_seen_v1";

function StartWelcomeModal({
  open,
  onLogin,
  onLater,
}: {
  open: boolean;
  onLogin: () => void;
  onLater: () => void;
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        background: "rgba(2,6,23,0.35)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(255,255,255,0.92)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.30)",
          padding: 18,
        }}
      >
        <div style={{ fontWeight: 950, fontSize: 18, letterSpacing: -0.2 }}>
          Hi, schön dass du da bist 🙂<br />
          möchtest du dich erstmal anmelden oder direkt loslegen?
        </div>

        <div style={{ height: 14 }} />

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onLater}
            style={{
              height: 44,
              padding: "0 14px",
              borderRadius: 12,
              border: "1px solid rgba(15,23,42,0.12)",
              background: "rgba(255,255,255,0.88)",
              fontWeight: 950,
              cursor: "pointer",
            }}
          >
            Später anmelden
          </button>

          <button
            type="button"
            onClick={onLogin}
            style={{
              height: 44,
              padding: "0 14px",
              borderRadius: 12,
              border: "1px solid rgba(15,23,42,0.14)",
              background: "linear-gradient(180deg, #FFE275, #FFB200)",
              fontWeight: 950,
              cursor: "pointer",
            }}
          >
            Anmelden
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {

  const [isAuthed, setIsAuthed] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    let alive = true;

    async function loadUser() {
      const { data } = await supabaseBrowser.auth.getUser();
      const user = data.user;

      if (!alive) return;

      if (!user) {
        setIsAuthed(false);
        setDisplayName("");
        return;
      }

      setIsAuthed(true);

      // 1) Versuch: Name aus profiles.full_name
      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!alive) return;

      const nameFromProfiles = profile?.full_name?.trim();
      const nameFromMeta =
        (user.user_metadata?.full_name as string | undefined)?.trim() ||
        (user.user_metadata?.name as string | undefined)?.trim();

      setDisplayName(nameFromProfiles || nameFromMeta || (user.email ?? "User"));
    }

    loadUser();

    // live updates (login/logout)
    const { data: sub } = supabaseBrowser.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);


  const categories: Category[] = useMemo(
    () => [
      { key: "elektronik", label: "Elektronik", bgFrom: "#93C5FD", bgTo: "#DBEAFE", text: "#0B1220" },
      { key: "sport", label: "Sport", bgFrom: "#EF4444", bgTo: "#FCA5A5", text: "#0B1220" },
      { key: "office", label: "Office", bgFrom: "#22C55E", bgTo: "#BBF7D0", text: "#0B1220" },
      { key: "gadgets", label: "Gadgets", bgFrom: "#6D8BFF", bgTo: "#DCEBFF", text: "#0B1220" },
      { key: "wissen", label: "Wissen", bgFrom: "#E5E7EB", bgTo: "#F8FAFC", text: "#0B1220" },
      { key: "mode", label: "Mode & Accessoires", bgFrom: "#FFD166", bgTo: "#FFE9AE", text: "#0B1220" },
    ],
    []
  );

  const offers: Offer[] = useMemo(
    () => [
      {
        id: "o1",
        title: "KidBuy ProCalc – Smart Taschenrechner (Schule & Office)",
        priceCHF: 24.9,
        bgFrom: "#E0F2FE",
        bgTo: "#FFFFFF",
        emoji: "🧮",
      },
      {
        id: "o2",
        title: "GlowCare Kids – Sanftes Beauty-Set (alltagstauglich)",
        priceCHF: 19.9,
        bgFrom: "#FDE2E4",
        bgTo: "#FFF7F8",
        emoji: "🧴",
      },
      {
        id: "o3",
        title: "NeonKeys LED – RGB Gaming-Tastatur (leise & stylisch)",
        priceCHF: 49.9,
        bgFrom: "#EDE9FE",
        bgTo: "#FFFFFF",
        emoji: "⌨️",
      },
    ],
    []
  );

  const [activeCat, setActiveCat] = useState<CategoryKey>("elektronik");

  // ✅ wichtig: activeTheme enthält die Farben
  const activeTheme = useMemo(() => {
    return categories.find((c) => c.key === activeCat) ?? categories[0];
  }, [activeCat, categories]);

  const sliderOrder: CategoryKey[] = useMemo(() => ["elektronik", "sport", "office", "gadgets", "wissen", "mode"], []);
  const [heroIndex, setHeroIndex] = useState(0);
  const hoveredRef = useRef(false);

  const heroSets: Record<CategoryKey, { glowA: string; glowB: string; title: string }> = useMemo(
    () => ({
      elektronik: { glowA: "rgba(147,197,253,0.22)", glowB: "rgba(219,234,254,0.16)", title: "Elektronik" },
      sport: { glowA: "rgba(239,68,68,0.20)", glowB: "rgba(252,165,165,0.16)", title: "Sport" },
      office: { glowA: "rgba(34,197,94,0.18)", glowB: "rgba(187,247,208,0.14)", title: "Office" },
      gadgets: { glowA: "rgba(109,139,255,0.16)", glowB: "rgba(220,235,255,0.14)", title: "Gadgets" },
      wissen: { glowA: "rgba(148,163,184,0.16)", glowB: "rgba(248,250,252,0.14)", title: "Wissen" },
      mode: { glowA: "rgba(255,209,102,0.22)", glowB: "rgba(255,233,174,0.16)", title: "Mode" },
    }),
    []
  );

  const heroKey = sliderOrder[heroIndex];
  const heroCfg = heroSets[heroKey];

  useEffect(() => {
    const t = window.setInterval(() => {
      if (hoveredRef.current) return;
      setHeroIndex((i) => (i + 1) % sliderOrder.length);
    }, 10000);
    return () => window.clearInterval(t);
  }, [sliderOrder.length]);

  useEffect(() => setActiveCat(heroKey), [heroKey]);

  const pageTint = useMemo(() => {
    const map: Record<CategoryKey, string> = {
      elektronik: "rgba(147, 197, 253, 0.06)",
      sport: "rgba(239, 68, 68, 0.06)",
      office: "rgba(34, 197, 94, 0.05)",
      gadgets: "rgba(109, 139, 255, 0.05)",
      wissen: "rgba(148, 163, 184, 0.04)",
      mode: "rgba(255, 209, 102, 0.06)",
    };
    return map[activeCat] ?? "rgba(0,0,0,0.03)";
  }, [activeCat]);

  const HERO_IMAGES = useMemo(
    () => [
      "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2014.%20Feb.%202026,%2011_53_25.png",
      "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2015.%20Feb.%202026,%2016_39_41.png",
      "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2015.%20Feb.%202026,%2016_39_52.png",
    ],
    []
  );

  const [heroImgIndex, setHeroImgIndex] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      if (hoveredRef.current) return;
      setHeroImgIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, 10000);
    return () => window.clearInterval(t);
  }, [HERO_IMAGES.length]);

  const goHeroImg = (dir: -1 | 1) => setHeroImgIndex((i) => (i + dir + HERO_IMAGES.length) % HERO_IMAGES.length);

  const ELEKTRONIK_CATEGORY_IMAGE =
    "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2013.%20Feb.%202026,%2020_49_23.png";
  const SPORT_CATEGORY_IMAGE =
    "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2014.%20Feb.%202026,%2013_00_14.png";
  const MODE_CATEGORY_IMAGE =
    "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2015.%20Feb.%202026,%2021_41_06.png";
  const OFFICE_CATEGORY_IMAGE =
    "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2015.%20Feb.%202026,%2021_16_18.png";

  const [recent, setRecent] = useState<ViewedItem[]>([]);
  useEffect(() => {
    setRecent(readRecent());

    const onStorage = (e: StorageEvent) => {
      if (e.key === RECENT_KEY) setRecent(readRecent());
    };
    const onFocus = () => setRecent(readRecent());
    const onLocal = () => setRecent(readRecent());

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    window.addEventListener("kidbuy_recent_updated_v1", onLocal);

    window.kidbuyAddRecentViewed = (item) => addRecentViewedLocal(item);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("kidbuy_recent_updated_v1", onLocal);
    };
  }, []);

  // ✅ NEU: Start-Popup nur 1x
  const [showWelcome, setShowWelcome] = useState(false);
  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(START_POPUP_KEY);
      if (!seen) {
        setShowWelcome(true);
        // optional: auch gleich eine Center-Message triggern
        emitAssistantMessage(getStartCenterMessage());
      }
    } catch {
      // ignore
    }
  }, []);

  const closeWelcome = (storeFlag: boolean) => {
    try {
      if (storeFlag) window.localStorage.setItem(START_POPUP_KEY, "1");
    } catch {
      // ignore
    }
    setShowWelcome(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        color: "#0F172A",
        background:
          `linear-gradient(0deg, ${pageTint}, ${pageTint}),` +
          "radial-gradient(1200px 700px at 20% 10%, rgba(59,130,246,0.18), transparent 55%)," +
          "radial-gradient(1000px 650px at 85% 15%, rgba(255, 186, 70, 0.14), transparent 55%)," +
          "linear-gradient(180deg, #F7FAFF 0%, #FFFFFF 60%, #F8FBFF 100%)",
        transition: "background 260ms ease",
      }}
    >
      {/* ✅ NEU: Overlay MUSS gerendert werden, sonst sieht man keine Messages */}
      <KidBuyAssistantOverlay />

      {/* ✅ NEU: Start-Modal nur 1x */}
      <StartWelcomeModal
        open={showWelcome}
        onLater={() => closeWelcome(true)}
        onLogin={() => {
          closeWelcome(true);
          // Login Station
          window.location.href = "/login";
        }}
      />
 <KidBuyAssistantOverlay />

      {/* NAV */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "linear-gradient(180deg, rgba(2,6,23,0.82), rgba(2,6,23,0.55))",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <Container>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "220px 1fr 220px",
              alignItems: "center",
              gap: 14,
              padding: "12px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 950, fontSize: 24, color: "white", letterSpacing: -0.6 }}>
                <span style={{ opacity: 0.92 }}>Kid</span>
                <span style={{ color: "#FFD166" }}>Buy</span>
              </div>
              <div style={{ fontWeight: 900, color: "rgba(255,255,255,0.65)", fontSize: 12 }}>DEIN SHOP</div>
            </div>

            <div />
            <KidBuyAssistantBanner />

            <div style={{ 
  display: "flex", 
  justifyContent: "flex-end", 
  gap: 10,
  alignItems: "center"
}}>
              {!isAuthed ? (
                <Link
                  href="/register"
                  style={{
                    height: 42,
                    padding: "0 14px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.10)",
                    color: "white",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 950,
                  }}
                >
                  Registrieren
                </Link>
              ) :null} 
                
              
              <Link
                href="/cart"
                title="Warenkorb"
                style={{
                  height: 42,
                  width: 42,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.10)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  fontSize: 18,
                }}
                onClick={() => {
                  // ✅ NEU: kleine Reaktion beim Klick
                  emitAssistantMessage({ text: "Nice – ab in den Warenkorb! 😄", emoji: "😄" });
                }}
              >
                🛒
              </Link>

              <Link
                href="/profile"
                title="Konto"
                style={{
                  height: 42,
                  width: 42,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.10)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  fontSize: 18,
                }}
              >
                👤
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* HERO */}
      <section
        style={{
          padding: "18px 0 18px",
          background: "rgba(255,255,255,0.94)",
          borderBottom: "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <div style={{ position: "relative", width: "100%", background: "#fff" }}>
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                `radial-gradient(1000px 420px at 18% 35%, ${heroCfg.glowA}, transparent 60%),` +
                `radial-gradient(900px 380px at 40% 35%, ${heroCfg.glowB}, transparent 60%)`,
            }}
          />

          <Container>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.05fr 0.95fr",
                gap: 22,
                padding: "26px 0",
                alignItems: "center",
                position: "relative",
              }}
            >
              {/* links */}
              <div>
                <div
                  style={{
                    fontWeight: 950,
                    fontSize: 56,
                    letterSpacing: -1.2,
                    color: "#0B1220",
                    lineHeight: 1.02,
                  }}
                >
                  Willkommen bei
                  <div style={{ marginTop: 6 }}>
                    <span style={{ color: "#0B1220" }}>Kid</span>
                    <span style={{ color: "#2563EB" }}>Buy</span>
                  </div>
                </div>

                <div style={{ marginTop: 12, color: "rgba(15,23,42,0.78)", fontSize: 16, fontWeight: 800 }}>
                  Entdecke unsere besten Angebote – modern, sicher & kinderfreundlich.
                </div>

                <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <PillLink href="/product?all=1" label="Jetzt entdecken" variant="primary" />
                  <PillLink href="/#angebote" label="Zu den Angeboten" variant="ghost" />
                </div>

                <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {categories
                    .filter((c) => c.key !== "mode")
                    .map((c) => {
                      const active = c.key === activeCat;
                      return (
                        <Link
                          key={c.key}
                          href={`/c/${c.key}`}
                          style={{ textDecoration: "none" }}
                          onMouseEnter={() => setHeroIndex(sliderOrder.indexOf(c.key))}
                        >
                          <div
                            style={{
                              height: 34,
                              padding: "0 14px",
                              borderRadius: 999,
                              border: active ? "2px solid rgba(15,23,42,0.16)" : "1px solid rgba(15,23,42,0.10)",
                              background: `linear-gradient(135deg, ${c.bgFrom}, ${c.bgTo})`,
                              color: c.text,
                              cursor: "pointer",
                              fontWeight: 950,
                              fontSize: 13,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: active ? "0 14px 30px rgba(0,0,0,0.12)" : "none",
                              transition: "transform 140ms ease, box-shadow 140ms ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-2px)";
                              e.currentTarget.style.boxShadow = "0 12px 22px rgba(0,0,0,0.14)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = active ? "0 14px 30px rgba(0,0,0,0.12)" : "none";
                            }}
                          >
                            {c.label}
                          </div>
                        </Link>
                      );
                    })}
                </div>
              </div>

              {/* rechts */}
              <div
                onMouseEnter={() => (hoveredRef.current = true)}
                onMouseLeave={() => (hoveredRef.current = false)}
                style={{
                  position: "relative",
                  height: 480,
                  background: "transparent",
                  overflow: "hidden",
                  borderRadius: 0,
                }}
              >
                <button
                  type="button"
                  onClick={() => goHeroImg(-1)}
                  aria-label="Vorheriges Bild"
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    height: 46,
                    width: 46,
                    borderRadius: 999,
                    border: "1px solid rgba(15,23,42,0.12)",
                    background: "rgba(255,255,255,0.92)",
                    color: "#0B1220",
                    fontWeight: 950,
                    cursor: "pointer",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
                    zIndex: 2,
                  }}
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={() => goHeroImg(1)}
                  aria-label="Nächstes Bild"
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    height: 46,
                    width: 46,
                    borderRadius: 999,
                    border: "1px solid rgba(15,23,42,0.12)",
                    background: "rgba(255,255,255,0.92)",
                    color: "#0B1220",
                    fontWeight: 950,
                    cursor: "pointer",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
                    zIndex: 2,
                  }}
                >
                  →
                </button>

                <img
                  src={HERO_IMAGES[heroImgIndex]}
                  alt="Hero"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    background: "transparent",
                    filter: "none",
                    borderRadius: 0,
                    WebkitMaskImage:
                      "radial-gradient(closest-side at 55% 50%, rgba(0,0,0,1) 86%, rgba(0,0,0,0) 100%)",
                    maskImage:
                      "radial-gradient(closest-side at 55% 50%, rgba(0,0,0,1) 86%, rgba(0,0,0,0) 100%)",
                  }}
                />
              </div>
            </div>
          </Container>
        </div>
      </section>

      {/* CATEGORY CARDS */}
      <section style={{ padding: "16px 0 18px" }}>
        <Container>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
            {[
              { key: "mode" as const, label: "Mode & Accessoires", bgFrom: "#FFD166", bgTo: "#FFE9AE", cta: "Jetzt ansehen", img: MODE_CATEGORY_IMAGE, pad: 6 },
              { key: "elektronik" as const, label: "Elektronik", bgFrom: "#93C5FD", bgTo: "#DBEAFE", cta: "Mehr entdecken", img: ELEKTRONIK_CATEGORY_IMAGE, pad: 6 },
              { key: "office" as const, label: "Office", bgFrom: "#22C55E", bgTo: "#BBF7D0", cta: "Entdecke mehr", img: OFFICE_CATEGORY_IMAGE, pad: 6 },
              { key: "sport" as const, label: "Sport", bgFrom: "#EF4444", bgTo: "#FCA5A5", cta: "Entdecke mehr", img: SPORT_CATEGORY_IMAGE, pad: 6 },
            ].map((c) => (
              <Link
                key={c.label}
                href={`/c/${c.key}`}
                style={{
                  textDecoration: "none",
                  color: "#0B1220",
                  borderRadius: 22,
                  overflow: "hidden",
                  border: "1px solid rgba(15,23,42,0.10)",
                  background: `linear-gradient(135deg, ${c.bgFrom}, ${c.bgTo})`,
                  boxShadow: "0 18px 60px rgba(0,0,0,0.10)",
                  minHeight: 420,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    height: 250,
                    margin: 14,
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.55)",
                    border: "1px solid rgba(15,23,42,0.10)",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: c.pad,
                  }}
                >
                  <img
                    src={c.img}
                    alt={c.label}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: c.key === "office" || c.key === "sport" ? "cover" : "contain",
                      background: "transparent",
                      borderRadius: 14,
                    }}
                  />
                </div>

                <div style={{ padding: "0 18px 12px" }}>
                  <div style={{ fontWeight: 950, fontSize: 20, letterSpacing: -0.2, color: "#fff", textShadow: "0 10px 24px rgba(0,0,0,0.18)" }}>
                    {c.label}
                  </div>
                </div>

                <div style={{ padding: "0 18px 18px", marginTop: "auto" }}>
                  <div
                    style={{
                      height: 40,
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.78)",
                      border: "1px solid rgba(15,23,42,0.12)",
                      fontWeight: 950,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      color: "#0B1220",
                    }}
                  >
                    {c.cta}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <RecentlyViewedStrip items={recent} />
        </Container>
      </section>

      {/* OFFERS */}
      <section id="angebote" style={{ padding: "16px 0 10px" }}>
        <Container>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(15,23,42,0.10)" }} />
            <div style={{ fontWeight: 950, fontSize: 26, letterSpacing: -0.6 }}>Top Angebote des Monats</div>
            <div style={{ flex: 1, height: 1, background: "rgba(15,23,42,0.10)" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
            {offers.map((o) => (
              <div
                key={o.id}
                style={{
                  borderRadius: 24,
                  border: "1px solid rgba(15,23,42,0.10)",
                  background: `linear-gradient(135deg, ${o.bgFrom}, ${o.bgTo})`,
                  boxShadow: "0 20px 70px rgba(0,0,0,0.10)",
                  overflow: "hidden",
                }}
              >
                <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, opacity: 0.85 }}>
                  {o.emoji}
                </div>
                <div style={{ padding: 16, background: "rgba(255,255,255,0.84)", borderTop: "1px solid rgba(15,23,42,0.08)" }}>
                  <div style={{ fontWeight: 950, fontSize: 14 }}>{o.title}</div>
                  <div style={{ marginTop: 6, fontWeight: 950, fontSize: 18 }}>{formatCHF(o.priceCHF)}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
            <Link
              href="/#angebote"
              style={{
                height: 46,
                padding: "0 18px",
                borderRadius: 999,
                border: "1px solid rgba(15,23,42,0.14)",
                background: "linear-gradient(180deg, #FFB16A, #FF7A00)",
                color: "white",
                fontWeight: 950,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 18px 55px rgba(0,0,0,0.16)",
              }}
            >
              Zu den Angeboten
            </Link>
          </div>
        </Container>
      </section>

      {/* TRUST */}
      <section style={{ padding: "18px 0 26px" }}>
        <Container>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
            <FeatureItem icon="🚚" title="Gratis Versand" desc="Schneller Versand (später EU-weit) – klar & einfach." />
            <FeatureItem icon="🛡️" title="Sichere Zahlung" desc="Sichere Abwicklung – später mit Elternkonto-System." />
            <FeatureItem icon="🎧" title="Top Kundenservice" desc="Support & Hilfe – kinderfreundlich und verständlich." />
          </div>
        </Container>
      </section>

      {/* FOOTER (nur EINMAL!) */}
      <footer
        style={{
          marginTop: 26,
          borderTop: "1px solid rgba(15,23,42,0.08)",
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Container>
          <div
            style={{
              padding: "18px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontWeight: 950, fontSize: 18 }}>KidBuy</div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.78, lineHeight: 1.6 }}>
                Moderne, kinderfreundliche Shopping-Erfahrung – mit Elternkonto-System im Hintergrund.
              </div>
            </div>

            
          {/* rechts: Anmelden-Link (schimmert in Kategorie-Farbe) */}
<div style={{ marginRight: 18 }}>
  <AuthShimmerLink
  href={isAuthed ? "/profile" : "/register"}
  from={activeTheme.bgFrom}
  to={activeTheme.bgTo}
  label={isAuthed ? `Hallo ${displayName}` : "Registrieren"}
/>
</div>
 
</div>

<div style={{ marginTop: 18, fontSize: 12, opacity: 0.65, paddingBottom: 18 }}>
  © {new Date().getFullYear()} KidBuy – Vorlage / Demo
</div>
</Container>
</footer>
</div>
);
}