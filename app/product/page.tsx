"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../components/cart/cart-context";
import { addRecentViewed } from "../lib/recentViewed";

// ✅ already in your project (used on HomePage too)
import KidBuyAssistantOverlay from "../components/KidBuyAssistantOverlay";
import { emitAssistantMessage } from "../lib/kidbuyAssistant";

/* -------------------- Produkt Bilder (UYUXIO) -------------------- */

const UYUXIO_IMAGES = [
  "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2018.%20Feb.%202026,%2015_14_39.png",
  "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2018.%20Feb.%202026,%2015_32_07.png",
  "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2018.%20Feb.%202026,%2015_32_13.png",
  "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2018.%20Feb.%202026,%2015_32_23.png",
  "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2018.%20Feb.%202026,%2016_12_24.png",
  "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2018.%20Feb.%202026,%2016_13_58.png",
] as const;

/* -------------------- Types -------------------- */

type CategoryKey = "elektronik" | "bestseller" | "kueche" | "office" | "gadgets" | "wissen";
type Category = {
  key: CategoryKey;
  label: string;

  // gradient
  bgFrom: string;
  bgTo: string;
  fg: string;

  // subtle page tint
  tint: string; // rgba(...)

  // indicator gradient
  indicator: string; // css gradient
};

type MediaItem = { id: string; type: "image" | "video"; label: string };

type ProductCard = {
  id: string;
  title: string;
  blurb: string;
  priceCHF: number;
  rating: number; // 0..5
  ratingCount: number;
};

type SpecRow = { label: string; value: string };

type Review = {
  id: string;
  name: string;
  stars: 1 | 2 | 3 | 4 | 5;
  text: string;
  dateISO: string;
};

type Page4Props = {
  specs: SpecRow[];
  initialCounts: Record<number, number>;
};

/* -------------------- Helpers -------------------- */

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatCHF(value: number) {
  return `CHF ${value.toFixed(2)}`;
}

/* -------------------- “Search assistant” small helper (keeps build clean) -------------------- */

function getSearchMessage(q: string): { text: string; emoji?: string } | null {
  const s = q.trim().toLowerCase();
  if (!s) return null;

  if (s.includes("kopfh")) return { text: "Kopfhörer? Oh ja – das ist immer ein Win!", emoji: "🎧" };
  if (s.includes("office")) return { text: "Office-Sachen sind mega praktisch 😄", emoji: "🗂️" };
  if (s.includes("rabatt") || s.includes("deal")) return { text: "Deals gesucht – du bist schlau! 😎", emoji: "🔥" };

  return { text: `Ich suche mal nach „${q.trim()}“…`, emoji: "🔎" };
}

/* -------------------- Wishlist (Herz + Flug Animation) -------------------- */

const LS_WISHLIST = "kidbuy_wishlist";

type WishlistStoredProduct = {
  id: string;
  title: string;
  priceCHF?: number;
  imageUrl: string;
  category?: string;
};

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readWishlist(): WishlistStoredProduct[] {
  if (typeof window === "undefined") return [];
  return safeParse<WishlistStoredProduct[]>(localStorage.getItem(LS_WISHLIST), []);
}

function writeWishlist(list: WishlistStoredProduct[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_WISHLIST, JSON.stringify(list));
}

function upsertWishlist(item: WishlistStoredProduct) {
  const cur = readWishlist();
  const next = [item, ...cur.filter((x) => x.id !== item.id)];
  writeWishlist(next);
}

function removeWishlist(id: string) {
  const cur = readWishlist();
  const next = cur.filter((x) => x.id !== id);
  writeWishlist(next);
}

function isInWishlist(id: string) {
  return readWishlist().some((x) => x.id === id);
}

function FlyingWishlistHeart({
  item,
  targetId = "kidbuy-profile-icon-target",
}: {
  item: WishlistStoredProduct;
  targetId?: string;
}) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [liked, setLiked] = useState(false);

  // flying overlay state
  const [fly, setFly] = useState<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    key: number;
    phase: "typing" | "emoji";
  } | null>(null);

  useEffect(() => {
    // sync state on mount
    setLiked(isInWishlist(item.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startFly = () => {
    const btn = btnRef.current;
    const target = document.getElementById(targetId);
    if (!btn || !target) return;

    const a = btn.getBoundingClientRect();
    const b = target.getBoundingClientRect();

    const from = { x: a.left + a.width / 2, y: a.top + a.height / 2 };
    const to = { x: b.left + b.width / 2, y: b.top + b.height / 2 };

    setFly({ from, to, key: Date.now(), phase: "typing" });
  };

  const toggle = () => {
    const next = !liked;
    setLiked(next);

    if (next) {
      upsertWishlist(item);
      startFly();
      emitAssistantMessage({ text: "Auf die Wunschliste! Nice 😄", emoji: "❤️" });
    } else {
      removeWishlist(item.id);
      emitAssistantMessage({ text: "Ok, von der Wunschliste entfernt 🙂", emoji: "🧹" });
    }
  };

  return (
    <>
      {/* styles once */}
      <style>{`
        @keyframes kidbuyHeartFloat {
          0%   { transform: translate3d(0,0,0) scale(1); opacity: 1; filter: drop-shadow(0 12px 22px rgba(0,0,0,.18)); }
          60%  { transform: translate3d(var(--tx), var(--ty), 0) scale(1.15); opacity: 1; }
          100% { transform: translate3d(var(--tx), var(--ty), 0) scale(.35); opacity: 0; }
        }
        @keyframes kidbuyTargetPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.10); }
          100% { transform: scale(1); }
        }
        @keyframes kidbuyEmojiPop {
          0% { transform: scale(.6) translateY(2px); opacity: .2; }
          60% { transform: scale(1.2) translateY(-2px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>

      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-label={liked ? "Von Wunschliste entfernen" : "Zur Wunschliste hinzufügen"}
        title={liked ? "Auf deiner Wunschliste" : "Zur Wunschliste"}
        style={{
          height: 44,
          width: 44,
          borderRadius: 999,
          border: "1px solid rgba(15,23,42,0.14)",
          background: "rgba(255,255,255,0.94)",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          userSelect: "none",
          position: "relative",
        }}
      >
        <span style={{ color: liked ? "#EF4444" : "rgba(15,23,42,0.45)", transition: "color 160ms ease" }}>
          {liked ? "❤️" : "🤍"}
        </span>
      </button>

      {/* flying heart */}
      {fly && (
        <div
          key={fly.key}
          style={{
            position: "fixed",
            left: fly.from.x,
            top: fly.from.y,
            zIndex: 9999,
            pointerEvents: "none",
            transform: "translate(-50%, -50%)",
          }}
          onAnimationEnd={() => {
            // pulse the profile icon briefly
            const target = document.getElementById(targetId);
            if (target) {
              (target as HTMLElement).style.animation = "kidbuyTargetPulse 420ms ease";
              window.setTimeout(() => {
                (target as HTMLElement).style.animation = "none";
              }, 460);
            }
            setFly(null);
          }}
        >
          <div
            style={
              {
                fontSize: 26,
                "--tx": `${fly.to.x - fly.from.x}px`,
                "--ty": `${fly.to.y - fly.from.y}px`,
                animation: "kidbuyHeartFloat 820ms cubic-bezier(0.22,1,0.36,1) forwards",
              } as React.CSSProperties
            }
          >
            ❤️
          </div>
        </div>
      )}
    </>
  );
}

/* -------------------- UI Bits -------------------- */

function IconCircleButton({
  icon,
  aria,
  onClick,
  style,
}: {
  icon: string;
  aria: string;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      style={{
        height: 44,
        width: 44,
        borderRadius: 999,
        border: "1px solid rgba(15,23,42,0.14)",
        background: "rgba(255,255,255,0.92)",
        cursor: "pointer",
        fontSize: 18,
        fontWeight: 900,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {icon}
    </button>
  );
}

function PrimaryButton({
  label,
  variant,
  onClick,
}: {
  label: string;
  variant: "cart" | "buy";
  onClick: () => void;
}) {
  const bg =
    variant === "cart"
      ? "linear-gradient(180deg, #FFE275, #FFCC33)"
      : "linear-gradient(180deg, #FFB16A, #FF7A00)";

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 44,
        padding: "0 18px",
        borderRadius: 12,
        border: "1px solid rgba(15,23,42,0.14)",
        background: bg,
        fontWeight: 950,
        cursor: "pointer",
        letterSpacing: 0.2,
        boxShadow: "none",
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.99)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {label}
    </button>
  );
}

function StarsInline({ value }: { value: number }) {
  const filled = clamp(Math.round(value), 0, 5);
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            style={{
              fontSize: 16,
              color: i < filled ? "#F6B300" : "rgba(15,23,42,0.20)",
              userSelect: "none",
              lineHeight: 1,
            }}
          >
            ★
          </span>
        ))}
      </div>
      <span style={{ fontWeight: 950, fontSize: 13, opacity: 0.85 }}>{value.toFixed(1)}</span>
    </div>
  );
}

/* --------- Clickable star picker (Page 4) --------- */

function StarPicker({
  value,
  onChange,
}: {
  value: 1 | 2 | 3 | 4 | 5;
  onChange: (v: 1 | 2 | 3 | 4 | 5) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", userSelect: "none" }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = (i + 1) as 1 | 2 | 3 | 4 | 5;
        const lit = (hover ?? value) >= starValue;

        return (
          <button
            key={starValue}
            type="button"
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onChange(starValue)}
            aria-label={`${starValue} Sterne wählen`}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
              fontSize: 20,
              color: lit ? "#F6B300" : "rgba(15,23,42,0.20)",
            }}
          >
            ★
          </button>
        );
      })}
      <span style={{ marginLeft: 6, fontWeight: 900, fontSize: 12, opacity: 0.75 }}>{value}/5</span>
    </div>
  );
}

/* -------------------- Layout -------------------- */

function PageShell({ children, tint }: { children: React.ReactNode; tint: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        color: "#0F172A",
        background:
          `linear-gradient(0deg, ${tint}, ${tint}),` +
          "radial-gradient(1300px 760px at 16% 6%, rgba(255, 214, 102, 0.26), transparent 55%)," +
          "radial-gradient(900px 600px at 86% 16%, rgba(99, 102, 241, 0.16), transparent 55%)," +
          "linear-gradient(180deg, #F7FAFF 0%, #FFFFFF 55%, #F8FBFF 100%)",
        transition: "background 350ms ease",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {children}
    </div>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return <div style={{ width: "min(1680px, 100%)", margin: "0 auto", padding: "0 18px" }}>{children}</div>;
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        borderRadius: 24,
        border: "1px solid rgba(15,23,42,0.10)",
        background: "rgba(255,255,255,0.92)",
        boxShadow: "0 22px 70px rgba(0,0,0,0.08)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* -------------------- Infinite Carousel (Page 3 images) -------------------- */

function InfiniteCarousel<T>({
  items,
  renderItem,
  visibleFraction = 2.5,
  autoEveryMs = 7000,
  height = 300,
  gap = 14,
}: {
  items: T[];
  renderItem: (item: T, idx: number) => React.ReactNode;
  visibleFraction?: number;
  autoEveryMs?: number;
  height?: number;
  gap?: number;
}) {
  const n = items.length;

  const clones = useMemo(() => {
    if (n === 0) return [];
    const head = items.slice(0, Math.min(2, n));
    const tail = items.slice(Math.max(0, n - 2), n);
    return [...tail, ...items, ...head];
  }, [items, n]);

  const [index, setIndex] = useState(n > 0 ? 2 : 0);
  const [anim, setAnim] = useState(true);
  const timerRef = useRef<number | null>(null);

  const itemWidthPercent = 100 / visibleFraction;

  const go = (dir: 1 | -1) => {
    if (n === 0) return;
    setAnim(true);
    setIndex((p) => p + dir);
  };

  useEffect(() => {
    if (n === 0) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => go(1), autoEveryMs) as unknown as number;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, autoEveryMs]);

  const onTransitionEnd = () => {
    if (n === 0) return;
    if (index >= n + 2) {
      setAnim(false);
      setIndex(2);
      return;
    }
    if (index <= 1) {
      setAnim(false);
      setIndex(n + 1);
      return;
    }
  };

  useEffect(() => {
    if (!anim) {
      const t = window.setTimeout(() => setAnim(true), 0);
      return () => window.clearTimeout(t);
    }
  }, [anim]);

  return (
    <div
      style={{
        borderRadius: 22,
        border: "1px solid rgba(15,23,42,0.10)",
        background: "rgba(255,255,255,0.92)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.08)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        onTransitionEnd={onTransitionEnd}
        style={{
          display: "flex",
          gap,
          padding: 16,
          transform: `translateX(calc(-${index * itemWidthPercent}% - ${index * gap}px))`,
          transition: anim ? "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
          willChange: "transform",
        }}
      >
        {clones.map((it, i) => (
          <div
            key={i}
            style={{
              flex: `0 0 calc(${itemWidthPercent}% - ${gap}px)`,
              height,
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid rgba(15,23,42,0.10)",
              background: "rgba(245,246,248,0.95)",
              position: "relative",
            }}
          >
            {renderItem(it, i)}
          </div>
        ))}
      </div>

      <IconCircleButton
        icon="←"
        aria="Zurück"
        onClick={() => go(-1)}
        style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
      />
      <IconCircleButton
        icon="→"
        aria="Weiter"
        onClick={() => go(1)}
        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}
      />
    </div>
  );
}

/* -------------------- Page 1 -------------------- */

function Page1({
  categories,
  activeCategory,
  setActiveCategory,
  onOpenCart,
  onAddMainToCart,
}: {
  categories: Category[];
  activeCategory: CategoryKey;
  setActiveCategory: (k: CategoryKey) => void;
  onOpenCart: () => void;
  onAddMainToCart: () => void;
}) {
  const allImages: MediaItem[] = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: `img-${i + 1}`,
        type: "image" as const,
        label: `Bild ${i + 1}`,
      })),
    []
  );

  // ✅ Quelle für jedes MediaItem (wir mappen 12 Platzhalter auf deine 6 echten Bilder)
  const mediaSrcById = useMemo(() => {
    const m: Record<string, string> = {};
    allImages.forEach((img, idx) => {
      m[img.id] = UYUXIO_IMAGES[idx % UYUXIO_IMAGES.length];
    });
    return m;
  }, [allImages]);

  const video: MediaItem = useMemo(() => ({ id: "vid-1", type: "video", label: "Video" }), []);

  const [search, setSearch] = useState("");
  const searchTimerRef = useRef<number | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeMedia, setActiveMedia] = useState<MediaItem>(allImages[0]);
  const [zoomed, setZoomed] = useState(false);

  const [thumbStart, setThumbStart] = useState(0);

  const thumbsImages = useMemo(() => {
    const out: MediaItem[] = [];
    for (let i = 0; i < 4; i++) out.push(allImages[(thumbStart + i) % allImages.length]);
    return out;
  }, [allImages, thumbStart]);

  const goToImageIndex = (idx: number) => {
    const nextIdx = (idx + allImages.length) % allImages.length;
    setZoomed(false);
    setActiveIndex(nextIdx);
    setActiveMedia(allImages[nextIdx]);
  };

  const nextImage = () => goToImageIndex(activeIndex + 1);
  const prevImage = () => goToImageIndex(activeIndex - 1);

  useEffect(() => {
    const inWindow =
      activeIndex === (thumbStart + 0) % allImages.length ||
      activeIndex === (thumbStart + 1) % allImages.length ||
      activeIndex === (thumbStart + 2) % allImages.length ||
      activeIndex === (thumbStart + 3) % allImages.length;

    if (!inWindow) setThumbStart(activeIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const [catHover, setCatHover] = useState<CategoryKey | null>(null);

  // indicator positioning
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const updateIndicator = () => {
    const row = rowRef.current;
    if (!row) return;
    const activeEl = row.querySelector<HTMLButtonElement>(`button[data-cat="${activeCategory}"]`);
    if (!activeEl) return;

    const rowRect = row.getBoundingClientRect();
    const rect = activeEl.getBoundingClientRect();

    const width = Math.min(rect.width, 64);
    const left = rect.left - rowRect.left + (rect.width - width) / 2;

    setIndicator({ left, width });
  };

  useEffect(() => {
    updateIndicator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  useEffect(() => {
    const onResize = () => updateIndicator();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const activeCat = useMemo(() => categories.find((c) => c.key === activeCategory)!, [categories, activeCategory]);

  return (
    <section style={{ minHeight: "100vh", padding: "18px 0 22px" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.86)",
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
        }}
      >
        <Container>
          {/* ✅ FIX: header grid is properly closed (this was your build error) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "160px 1fr 260px",
              alignItems: "center",
              gap: 16,
              padding: "14px 0",
            }}
          >
            <div style={{ fontWeight: 950, fontSize: 26, letterSpacing: -0.6, color: "#5B21B6" }}>KidBuy</div>

            <div
              style={{
                height: 46,
                borderRadius: 999,
                border: "1px solid rgba(15,23,42,0.12)",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                gap: 10,
                boxShadow: "0 12px 28px rgba(0,0,0,0.05)",
              }}
            >
              <span style={{ opacity: 0.55 }}>🔎</span>
              <input
                value={search}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearch(val);

                  if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
                  searchTimerRef.current = window.setTimeout(() => {
                    const m = getSearchMessage(val);
                    if (m) emitAssistantMessage(m);
                  }, 400) as unknown as number;
                }}
                placeholder="Produkte suchen..."
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 14,
                }}
              />
            </div>

            {/* ✅ NEU: Profil-Icon + Warenkorb (Anmelden-Logo ist hier NICHT vorhanden) */}
            <div style={{ justifySelf: "end", display: "flex", gap: 10, alignItems: "center" }}>
              <Link
                href="/profile"
                id="kidbuy-profile-icon-target"
                title="Profil"
                style={{
                  height: 46,
                  width: 46,
                  borderRadius: 999,
                  border: "1px solid rgba(15,23,42,0.12)",
                  background: "rgba(255,255,255,0.94)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  fontWeight: 950,
                  boxShadow: "0 12px 28px rgba(0,0,0,0.05)",
                  color: "#0B1220",
                  fontSize: 18,
                }}
              >
                👤
              </Link>

              <button
                type="button"
                onClick={onOpenCart}
                style={{
                  height: 46,
                  padding: "0 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(15,23,42,0.12)",
                  background: "rgba(255,255,255,0.94)",
                  cursor: "pointer",
                  fontWeight: 900,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: "0 12px 28px rgba(0,0,0,0.05)",
                }}
              >
                🛒 Warenkorb
              </button>
            </div>
          </div>

          <div style={{ position: "relative", paddingBottom: 16 }}>
            <div
              ref={rowRef}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 18,
                flexWrap: "wrap",
              }}
            >
              {categories.map((c) => {
                const isHover = catHover === c.key;
                const active = c.key === activeCategory;

                return (
                  <button
                    key={c.key}
                    data-cat={c.key}
                    type="button"
                    onMouseEnter={() => setCatHover(c.key)}
                    onMouseLeave={() => setCatHover(null)}
                    onClick={() => setActiveCategory(c.key)}
                    style={{
                      height: 34,
                      padding: "0 14px",
                      borderRadius: 999,
                      border: active ? "2px solid rgba(15,23,42,0.16)" : "1px solid rgba(15,23,42,0.12)",
                      background: `linear-gradient(135deg, ${c.bgFrom}, ${c.bgTo})`,
                      color: c.fg,
                      fontWeight: 950,
                      cursor: "pointer",
                      fontSize: 13,
                      transform: isHover ? "translateY(-2px)" : "translateY(0)",
                      boxShadow: isHover ? "0 10px 18px rgba(0,0,0,0.14)" : "none",
                      transition: "transform 140ms ease, box-shadow 140ms ease",
                    }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>

            <div
              aria-hidden
              style={{
                position: "absolute",
                left: indicator.left,
                bottom: 6,
                width: indicator.width,
                height: 6,
                borderRadius: 999,
                background: activeCat.indicator,
                boxShadow: "0 8px 16px rgba(0,0,0,0.18)",
                transition:
                  "left 260ms cubic-bezier(0.22, 1, 0.36, 1), width 260ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </div>
        </Container>
      </div>

      <Container>
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 20, alignItems: "start" }}>
          <Card style={{ padding: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "98px 1fr", gap: 18 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
                {thumbsImages.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => goToImageIndex(allImages.findIndex((x) => x.id === m.id))}
                    style={{
                      width: 96,
                      height: 78,
                      borderRadius: 14,
                      border:
                        activeMedia.id === m.id
                          ? "2px solid rgba(99,102,241,0.75)"
                          : "1px solid rgba(15,23,42,0.14)",
                      background: "rgba(255,255,255,0.96)",
                      cursor: "pointer",
                      fontWeight: 950,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      padding: 0,
                    }}
                  >
                    <img
                      src={mediaSrcById[m.id]}
                      alt={m.label}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }}
                    />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => (setZoomed(false), setActiveMedia(video))}
                  style={{
                    width: 96,
                    height: 78,
                    borderRadius: 14,
                    border:
                      activeMedia.id === video.id
                        ? "2px solid rgba(99,102,241,0.75)"
                        : "1px solid rgba(15,23,42,0.14)",
                    background: "rgba(255,255,255,0.96)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Video"
                  title="Video"
                >
                  <div
                    style={{
                      height: 44,
                      width: 44,
                      borderRadius: 999,
                      border: "2px solid rgba(15,23,42,0.22)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 950,
                    }}
                  >
                    ▶
                  </div>
                </button>
              </div>

              <div
                onDoubleClick={() => setZoomed((z) => !z)}
                title="Doppelklick: Zoom"
                style={{
                  height: 560,
                  borderRadius: 22,
                  border: "1px solid rgba(15,23,42,0.12)",
                  background:
                    "linear-gradient(0deg, rgba(255,255,255,0.92), rgba(255,255,255,0.92))," +
                    "repeating-linear-gradient(0deg, rgba(15,23,42,0.05) 0px, rgba(15,23,42,0.05) 1px, transparent 1px, transparent 32px)," +
                    "repeating-linear-gradient(90deg, rgba(15,23,42,0.05) 0px, rgba(15,23,42,0.05) 1px, transparent 1px, transparent 32px)",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "zoom-in",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {activeMedia.type === "video" ? (
                  <div style={{ fontWeight: 950, fontSize: 46, opacity: 0.55, userSelect: "none" }}>Video</div>
                ) : (
                  <img
                    src={mediaSrcById[activeMedia.id]}
                    alt={activeMedia.label}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      transform: zoomed ? "scale(1.6)" : "scale(1)",
                      transition: "transform 200ms ease",
                      userSelect: "none",
                    }}
                  />
                )}

                <IconCircleButton
                  icon="←"
                  aria="Vorheriges Bild"
                  onClick={prevImage}
                  style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
                />
                <IconCircleButton
                  icon="→"
                  aria="Nächstes Bild"
                  onClick={nextImage}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: 16,
                    bottom: 16,
                    padding: "10px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.90)",
                    border: "1px solid rgba(15,23,42,0.12)",
                    fontWeight: 900,
                    fontSize: 12,
                    opacity: 0.85,
                  }}
                >
                  Doppelklick: Zoom
                </div>
              </div>
            </div>
          </Card>

          <Card style={{ padding: 20 }}>
            <div style={{ fontWeight: 950, fontSize: 28, letterSpacing: -0.6, lineHeight: 1.15 }}>
              Premium Produktname
            </div>

            <div style={{ marginTop: 10 }}>
              <StarsInline value={4.8} />
            </div>

            <div style={{ marginTop: 14, fontSize: 14, lineHeight: 1.65, opacity: 0.9 }}>
              Kabellose True-Wireless-In-Ear-Kopfhörer mit Bluetooth für klaren Stereo-Sound und bequemes Musikhören ohne
              Kabel. Das Ladecase mit LED-Anzeige zeigt den Akkustand und lädt die Ohrhörer unterwegs auf. Mit Mikrofon,
              Geräuschreduzierung und spritzwassergeschütztem Design für Alltag und Sport.
            </div>

            <ul style={{ marginTop: 12, paddingLeft: 18, fontSize: 14, lineHeight: 1.7, opacity: 0.92 }}>
              <li>Robust & langlebig</li>
              <li>Kinderfreundlich & modern</li>
              <li>Schneller Versand (EU)</li>
              <li>Top Geschenkidee</li>
            </ul>

            <div
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 18,
                border: "1px solid rgba(15,23,42,0.10)",
                background:
                  "radial-gradient(700px 200px at 10% 0%, rgba(255, 204, 51, 0.20), transparent 55%)," +
                  "radial-gradient(700px 200px at 90% 100%, rgba(99, 102, 241, 0.12), transparent 60%)," +
                  "rgba(255,255,255,0.94)",
              }}
            >
              <div style={{ opacity: 0.7, fontWeight: 900, fontSize: 12 }}>Preis</div>
              <div style={{ marginTop: 6, fontWeight: 950, fontSize: 34, letterSpacing: -0.8 }}>{formatCHF(39.9)}</div>

              <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <PrimaryButton label="WARENKORB" variant="cart" onClick={onAddMainToCart} />
                <PrimaryButton label="Jetzt kaufen" variant="buy" onClick={() => alert("Jetzt kaufen (Demo)")} />

                {/* ✅ NEU: Herz (Wishlist) + Flug zu Profil */}
                <div style={{ marginLeft: "auto" }}>
                  <FlyingWishlistHeart
                    item={{
                      id: "produkt1",
                      title: "PHILIPS Kopfhörer",
                      priceCHF: 15.11,
                      imageUrl: UYUXIO_IMAGES[0],
                      category: "elektronik",
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}

/* -------------------- Page 2 -------------------- */

function Page2() {
  return (
    <section style={{ padding: "18px 0 22px" }}>
      <Container>
        <div style={{ fontWeight: 950, fontSize: 28, marginBottom: 12 }}>Details</div>

        <Card style={{ height: 360, overflow: "hidden", marginBottom: 14 }}>
          <img src={UYUXIO_IMAGES[4]} alt="Detailbild" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Card style={{ height: 280, overflow: "hidden" }}>
            <img src={UYUXIO_IMAGES[5]} alt="Detailbild 2" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </Card>

          <Card style={{ padding: 18 }}>
            <div style={{ fontWeight: 950, fontSize: 22, marginBottom: 10 }}>Beschreibung</div>
            <div style={{ fontSize: 14, lineHeight: 1.65, opacity: 0.9 }}>
              Erlebe kabellose Freiheit mit diesen modernen Bluetooth-In-Ear-Kopfhörern, die satten Stereo-Sound und ein
              kompaktes Ladecase mit LED-Anzeige bieten. Dank integriertem Mikrofon eignen sie sich perfekt für Musik,
              Anrufe und unterwegs. Laut Produktangaben verfügen sie über Geräuschreduzierung und sind spritzwassergeschützt
              – ideal für Alltag und Sport. Ihr leichtes Design sorgt für angenehmen Sitz auch bei längerem Tragen. Eine
              preiswerte Lösung für alle, die praktische True-Wireless-Kopfhörer suchen.
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}

/* -------------------- Page 3 -------------------- */

function SimilarProductCardVertical({
  p,
  ctaBg,
  onAdd,
}: {
  p: ProductCard;
  ctaBg: string;
  onAdd: (p: ProductCard) => void;
}) {
  const [hover, setHover] = useState(false);

  const totalH = 460;
  const imgH = Math.round(totalH * 0.6);
  const infoH = totalH - imgH;

  const starsFilled = Math.round(clamp(p.rating, 0, 5));

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        minWidth: 320,
        maxWidth: 320,
        height: totalH,
        borderRadius: 22,
        background: "#FFFFFF",
        border: "1px solid rgba(15,23,42,0.10)",
        overflow: "hidden",
        cursor: "pointer",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 160ms ease, box-shadow 160ms ease",
        boxShadow: hover ? "0 22px 60px rgba(0,0,0,0.14)" : "0 14px 35px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: imgH,
          background: "linear-gradient(180deg, rgba(0,0,0,0.03), rgba(0,0,0,0.01))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 18,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 18,
            background: "rgba(15,23,42,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 950,
            opacity: 0.55,
            fontSize: 18,
          }}
        >
          Produktbild
        </div>
      </div>

      <div
        style={{
          height: infoH,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 950,
              fontSize: 15,
              lineHeight: 1.25,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {p.title}
          </div>

          <div style={{ marginTop: 8, fontWeight: 950, fontSize: 16 }}>{formatCHF(p.priceCHF)}</div>

          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 14,
                    color: i < starsFilled ? "#F6B300" : "rgba(15,23,42,0.18)",
                    userSelect: "none",
                    lineHeight: 1,
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.7 }}>{p.ratingCount}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(p);
          }}
          style={{
            background: ctaBg,
            border: "none",
            padding: "14px 18px",
            borderRadius: 12,
            fontWeight: 900,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          In den Warenkorb
        </button>
      </div>
    </div>
  );
}

function Page3({
  productCards,
  ctaBg,
  onAddSimilarToCart,
}: {
  productCards: ProductCard[];
  ctaBg: string;
  onAddSimilarToCart: (p: ProductCard) => void;
}) {
  const heroSlides = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: `slide-${i + 1}`,
      src: UYUXIO_IMAGES[i % UYUXIO_IMAGES.length],
    }));
  }, []);

  const stripRef = useRef<HTMLDivElement | null>(null);

  const scrollProducts = (dir: -1 | 1) => {
    const el = stripRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 560, behavior: "smooth" });
  };

  return (
    <section style={{ padding: "18px 0 24px" }}>
      <Container>
        <div style={{ fontWeight: 950, fontSize: 28, marginBottom: 12 }}>Weitere Bilder</div>

        <InfiniteCarousel
          items={heroSlides}
          visibleFraction={2.5}
          autoEveryMs={7000}
          height={300}
          renderItem={(it) => (
            <img src={(it as any).src} alt="Weitere Bilder" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        />

        <div style={{ height: 18 }} />

        <div style={{ fontWeight: 950, fontSize: 28, marginBottom: 12 }}>Ähnliche Produkte</div>

        <Card style={{ padding: 16, position: "relative" }}>
          <div
            ref={stripRef}
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              paddingBottom: 12,
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {productCards.map((p) => (
              <SimilarProductCardVertical key={p.id} p={p} ctaBg={ctaBg} onAdd={onAddSimilarToCart} />
            ))}
          </div>

          <IconCircleButton
            icon="←"
            aria="Links scrollen"
            onClick={() => scrollProducts(-1)}
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
          />
          <IconCircleButton
            icon="→"
            aria="Rechts scrollen"
            onClick={() => scrollProducts(1)}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}
          />
        </Card>
      </Container>
    </section>
  );
}

/* -------------------- Page 4 -------------------- */

function Page4({ specs, initialCounts }: Page4Props) {
  const [counts, setCounts] = useState<{ [stars: number]: number }>(initialCounts);
  const [reviews, setReviews] = useState<Review[]>(() => [
    {
      id: "r-1",
      name: "Susi23",
      stars: 5,
      text: "Super Produkt! Liebe es mega! Kauft es!!",
      dateISO: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: "r-2",
      name: "Tim",
      stars: 4,
      text: "Sieht gut aus, würde ich wieder kaufen.",
      dateISO: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
  ]);

  const [name, setName] = useState("Gast");
  const [text, setText] = useState("");
  const [stars, setStars] = useState<1 | 2 | 3 | 4 | 5>(5);

  const maxCount = useMemo(() => {
    return Math.max(counts[1] || 0, counts[2] || 0, counts[3] || 0, counts[4] || 0, counts[5] || 0, 1);
  }, [counts]);

  const addReview = () => {
    const t = text.trim();
    if (!t) return;

    const newReview: Review = {
      id: `r-${Date.now()}`,
      name: name.trim() ? name.trim() : "Gast",
      stars,
      text: t,
      dateISO: new Date().toISOString(),
    };

    setCounts((prev) => ({ ...prev, [stars]: (prev[stars] || 0) + 1 }));
    setReviews((prev) => [newReview, ...prev]);
    setText("");
    setStars(5);
  };

  const [loopIndex, setLoopIndex] = useState(0);
  useEffect(() => setLoopIndex(0), [reviews.length]);

  const current = reviews.length ? reviews[clamp(loopIndex, 0, reviews.length - 1)] : null;

  return (
    <section style={{ padding: "18px 0 44px" }}>
      <Container>
        <div style={{ fontWeight: 950, fontSize: 28, marginBottom: 12 }}>DATEN & BEWERTUNGEN</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 14 }}>
          <Card style={{ padding: 16 }}>
            <div style={{ fontWeight: 950, fontSize: 18, marginBottom: 10, opacity: 0.9 }}>Produktdaten</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {specs.map((r) => (
                  <tr key={r.label}>
                    <td
                      style={{
                        padding: "10px 10px",
                        borderBottom: "1px solid rgba(15,23,42,0.10)",
                        fontWeight: 950,
                        width: "42%",
                      }}
                    >
                      {r.label}
                    </td>
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(15,23,42,0.10)", opacity: 0.9 }}>
                      {r.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card style={{ padding: 16 }}>
            <div style={{ fontWeight: 950, fontSize: 18, marginBottom: 10, opacity: 0.9 }}>Bewertungen</div>

            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, alignItems: "start" }}>
              <div>
                <div style={{ height: 190, display: "flex", alignItems: "flex-end", gap: 10, padding: "8px 4px" }}>
                  {[5, 4, 3, 2, 1].map((s) => {
                    const c = counts[s] || 0;
                    const h = Math.round((c / maxCount) * 170);
                    return (
                      <div key={s} style={{ width: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: "100%",
                            height: h,
                            borderRadius: 12,
                            border: "1px solid rgba(15,23,42,0.14)",
                            background: "rgba(255, 226, 117, 0.95)",
                          }}
                        />
                        <div style={{ fontSize: 12, opacity: 0.85 }}>{c}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={inputStyle()} />
                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Dein Kommentar…" style={textareaStyle()} />

                <div style={{ marginTop: 10 }}>
                  <div style={{ fontWeight: 900, fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Deine Bewertung</div>
                  <StarPicker value={stars} onChange={setStars} />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={addReview}
                    style={{
                      height: 44,
                      padding: "0 16px",
                      borderRadius: 12,
                      border: "1px solid rgba(15,23,42,0.14)",
                      background: "rgba(255,255,255,0.94)",
                      cursor: "pointer",
                      fontWeight: 950,
                    }}
                  >
                    Senden
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12 }}>
              <IconCircleButton
                icon="←"
                aria="Vorheriger Kommentar"
                onClick={() => setLoopIndex((i) => clamp(i + 1, 0, Math.max(0, reviews.length - 1)))}
              />
              <div style={{ flex: 1 }}>
                {current ? (
                  <div
                    style={{
                      borderRadius: 18,
                      border: "1px solid rgba(15,23,42,0.12)",
                      background: "rgba(255,255,255,0.94)",
                      padding: 14,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <div style={{ display: "flex", gap: 3 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: 14,
                              color: i < current.stars ? "#F6B300" : "rgba(15,23,42,0.20)",
                              userSelect: "none",
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <div style={{ fontWeight: 950, opacity: 0.85 }}>{current.name}</div>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, opacity: 0.92 }}>{current.text}</div>
                  </div>
                ) : (
                  <div style={{ opacity: 0.7 }}>Noch keine Kommentare.</div>
                )}
              </div>
              <IconCircleButton
                icon="→"
                aria="Nächster Kommentar"
                onClick={() => setLoopIndex((i) => clamp(i - 1, 0, Math.max(0, reviews.length - 1)))}
              />
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    height: 44,
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.14)",
    padding: "0 12px",
    outline: "none",
    background: "rgba(255,255,255,0.96)",
    fontWeight: 900,
  };
}

function textareaStyle(): React.CSSProperties {
  return {
    marginTop: 10,
    width: "100%",
    minHeight: 96,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.14)",
    padding: "10px 12px",
    outline: "none",
    background: "rgba(255,255,255,0.96)",
    resize: "vertical",
  };
}

/* -------------------- Main -------------------- */

export default function Page() {
  const router = useRouter();
  const { addItem } = useCart();

  useEffect(() => {
    addRecentViewed({
      id: "produkt1",
      title: "PHILIPS Kopfhörer",
      priceCHF: 15.11,
      image: UYUXIO_IMAGES[0],
    });
  }, []);

  const categories: Category[] = useMemo(
    () => [
      {
        key: "elektronik",
        label: "Elektronik",
        bgFrom: "#6AA8FF",
        bgTo: "#B8D7FF",
        fg: "#0B1220",
        tint: "rgba(90, 160, 255, 0.06)",
        indicator: "linear-gradient(90deg, #4F8CFF, #9DC7FF)",
      },
      {
        key: "bestseller",
        label: "Bestseller",
        bgFrom: "#FFB16A",
        bgTo: "#FFD1A7",
        fg: "#111827",
        tint: "rgba(255, 160, 80, 0.06)",
        indicator: "linear-gradient(90deg, #FF7A00, #FFC07A)",
      },

      // ✅ Küche ersetzt durch Office (wie du wolltest)
      {
        key: "office",
        label: "Office",
        bgFrom: "#22C55E",
        bgTo: "#BBF7D0",
        fg: "#0F172A",
        tint: "rgba(34, 197, 94, 0.06)",
        indicator: "linear-gradient(90deg, #22C55E, #BBF7D0)",
      },

      {
        key: "gadgets",
        label: "Gadgets",
        bgFrom: "#B9D8FF",
        bgTo: "#DCEBFF",
        fg: "#0F172A",
        tint: "rgba(120, 170, 255, 0.05)",
        indicator: "linear-gradient(90deg, #5B8CFF, #C3DBFF)",
      },
      {
        key: "wissen",
        label: "Wissen",
        bgFrom: "#E5E7EB",
        bgTo: "#F3F4F6",
        fg: "#0F172A",
        tint: "rgba(148, 163, 184, 0.05)",
        indicator: "linear-gradient(90deg, #9CA3AF, #E5E7EB)",
      },
    ],
    []
  );

  const [activeCategory, setActiveCategory] = useState<CategoryKey>("elektronik");
  const activeCat = useMemo(() => categories.find((c) => c.key === activeCategory)!, [categories, activeCategory]);

  const productCards: ProductCard[] = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: `p-${i + 1}`,
      title: `PHILIPS 2025 Kabellose Kopfhörer – Neuer ... ${i + 1}`,
      blurb: "Kompakt, super Sound, ideal für unterwegs.",
      priceCHF: 15.11 + (i % 10) * 2.75,
      rating: 4.2 + (i % 4) * 0.2,
      ratingCount: 2880 + i * 13,
    }));
  }, []);

  const specs: SpecRow[] = useMemo(
    () => [
      { label: "Marke:", value: "KidBuy" },
      { label: "Hersteller:", value: "KidBuy EU" },
      { label: "Gewicht:", value: "0.42 kg" },
      { label: "Akku:", value: "3000 mAh" },
    ],
    []
  );

  const initialCounts = useMemo(() => ({ 5: 663, 4: 430, 3: 93, 2: 87, 1: 40 }), []);

  const addMainToCart = () => {
    addItem({
      id: "produkt1",
      title: "PHILIPS Kopfhörer",
      priceCHF: 15.11,
      imageUrl: UYUXIO_IMAGES[0],
    });
    router.push("/cart");
  };

  const openCart = () => router.push("/cart");

  const addSimilarToCart = (p: ProductCard) => {
    addItem({
      id: p.id,
      title: p.title,
      priceCHF: p.priceCHF,
      imageUrl: UYUXIO_IMAGES[0],
    });
    router.push("/cart");
  };

  return (
    <PageShell tint={activeCat.tint}>
      {/* ✅ Overlay gerendert (wie Startseite), nur Ergänzung */}
      <KidBuyAssistantOverlay />

      <Page1
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        onOpenCart={openCart}
        onAddMainToCart={addMainToCart}
      />
      <Page2 />
      <Page3 productCards={productCards} ctaBg={activeCat.indicator} onAddSimilarToCart={addSimilarToCart} />
      <Page4 specs={specs} initialCounts={initialCounts} />
    </PageShell>
  );
}