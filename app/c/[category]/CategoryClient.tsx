"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../../components/cart/cart-context";
import CategorySearchBar from "@/app/components/CategorySearchBar";

import {
  CATEGORY_THEMES,
  PRODUCTS,
  type CategoryKey,
  type Product,
} from "@/app/data/catalog";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatCHF(v: number) {
  return `CHF ${v.toFixed(2)}`;
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: "min(1680px, 100%)", margin: "0 auto", padding: "0 18px" }}>
      {children}
    </div>
  );
}

export default function CategoryClient({ category }: { category: string }) {
  const router = useRouter();

  const { addItem } = useCart();
// ✅ Added: route slug -> catalog key mapping (only additions)
const catAliasMap: Record<string, CategoryKey> = {
  office: "Office",
  gadgets: "Gadgets",
  elektronik: "elektronik",
  sport: "sport",
  mode: "mode",
};

const normalizedCategory = catAliasMap[String(category).toLowerCase()] ?? (String(category) as CategoryKey);

const [query, setQuery] = useState("");

  // ✅ Kategorie absichern
const cat: CategoryKey =
  normalizedCategory in CATEGORY_THEMES ? normalizedCategory : "elektronik";

  const theme = CATEGORY_THEMES[cat as keyof typeof CATEGORY_THEMES];

  // ✅ Produkte filtern
  const list = useMemo(() => PRODUCTS.filter((p) => p.category === cat), [cat]);
const filtered = useMemo(() => {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((p) => (p.title || "").toLowerCase().includes(q));
}, [list, query]);

  const pageBg =
    `linear-gradient(0deg, ${theme.tint}, ${theme.tint}),` +
    "radial-gradient(1200px 700px at 20% 10%, rgba(59,130,246,0.18), transparent 55%)," +
    "radial-gradient(1000px 650px at 85% 15%, rgba(255, 186, 70, 0.12), transparent 55%)," +
    "linear-gradient(180deg, #F7FAFF 0%, #FFFFFF 60%, #F8FBFF 100%)";

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        color: "#0F172A",
        background: pageBg,
      }}
    >
      {/* Topbar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.86)",
          borderBottom: "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <Container>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "12px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <Link
                href="/"
                style={{
                  textDecoration: "none",
                  fontWeight: 950,
                  fontSize: 22,
                  color: "#0B1220",
                }}
              >
                Kid<span style={{ color: theme.from }}>Buy</span>
              </Link>
              <span style={{ fontWeight: 900, opacity: 0.65 }}>
                Kategorie: <span style={{ color: theme.from }}>{theme.label}</span>
              </span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Link
                href="/"
                style={{
                  textDecoration: "none",
                  fontWeight: 900,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(15,23,42,0.10)",
                  background: "rgba(255,255,255,0.92)",
                  color: "#0B1220",
                }}
              >
                ← Startseite
              </Link>

              <Link
                href="/cart"
                style={{
                  textDecoration: "none",
                  fontWeight: 900,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(15,23,42,0.10)",
                  background: "rgba(255,255,255,0.92)",
                  color: "#0B1220",
                }}
              >
                🛒 Warenkorb
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div style={{ padding: "14px 0 0" }}>
          <CategorySearchBar
            value={query}
            onChange={setQuery}
            from={theme.from}
            to={theme.to}
            placeholder={`Suche in ${theme.label}…`}
          />
        </div>
      </Container>

      {/* Inhalt */}
      <Container>
        <div style={{ padding: "18px 0 40px" }}>
          {/* Deal-Leiste */}
          <div
            style={{
              borderRadius: 18,
              border: "1px solid rgba(15,23,42,0.10)",
              background: "rgba(255,255,255,0.92)",
              padding: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              boxShadow: "0 18px 50px rgba(0,0,0,0.08)",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
                  fontWeight: 950,
                  color: "#0B1220",
                  border: "1px solid rgba(15,23,42,0.12)",
                }}
              >
                {theme.label}
              </div>

              <div style={{ fontWeight: 900, opacity: 0.8 }}>
                Entdecke Produkte in <span style={{ color: theme.from }}>{theme.label}</span>
              </div>
            </div>

            <Link
              href="/product"
              style={{
                textDecoration: "none",
                fontWeight: 950,
                padding: "10px 14px",
                borderRadius: 999,
                background: `linear-gradient(180deg, ${theme.from}, ${theme.to})`,
                border: "1px solid rgba(15,23,42,0.14)",
                color: "#0B1220",
              }}
            >
              Zum Shop →
            </Link>
          </div>

          <div style={{ height: 16 }} />

          {/* Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: 16,
            }}
          >
            
{filtered.map((p) => (
              <ProductCardTile
                key={p.id}
                p={p}
                theme={theme}
                onAddToCart={() => {
                  addItem({
                    id: p.id,
                    title: p.title,
                    priceCHF: p.priceCHF,
                    imageUrl: p.imageUrl,
                  });
                  // optional: direkt in den Warenkorb springen:
                  router.push("/cart");
                }}
              />
            ))}
          </div>


          {list.length === 0 && (
            <div style={{ marginTop: 20, fontWeight: 900, opacity: 0.7 }}>
              Noch keine Produkte in dieser Kategorie.
            </div>
          )}

{list.length > 0 && filtered.length === 0 && (
  <div style={{ marginTop: 20, fontWeight: 900, opacity: 0.7 }}>
    Keine Treffer für „{query}“.
  </div>
)}

          {/* Mini-Responsive: bei kleineren Screens weniger Spalten */}
          <style jsx global>{`
            @media (max-width: 1500px) {
              .kidbuy-grid-5 {
                grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
              }
            }
            @media (max-width: 1100px) {
              .kidbuy-grid-5 {
                grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
              }
            }
            @media (max-width: 760px) {
              .kidbuy-grid-5 {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
            }
          `}</style>

          {/* apply class via wrapper rewrite without refactor */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(){
                  var grids = document.querySelectorAll('div[style*="gridTemplateColumns: repeat(5"]');
                  grids.forEach(function(g){ g.classList.add('kidbuy-grid-5'); });
                })();
              `,
            }}
          />
        </div>
      </Container>
    </div>
  );
}

function ProductCardTile({
  p,
  theme,
  onAddToCart,
}: {
  p: Product;
  theme: { from: string; to: string };
  onAddToCart: () => void;
}) {
  const [hover, setHover] = useState(false);
  const stars = Math.round(clamp(p.rating, 0, 5));

  return (
    <div
      style={{
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(15,23,42,0.10)",
        background: "rgba(255,255,255,0.96)",
        boxShadow: hover ? "0 22px 60px rgba(0,0,0,0.14)" : "0 14px 40px rgba(0,0,0,0.08)",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 160ms ease, box-shadow 160ms ease",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* ✅ Wichtig: Link geht jetzt auf /p/<id> */}
      <Link
        href={`/p/${p.id}`}
        style={{
          textDecoration: "none",
          color: "#0B1220",
          display: "block",
          padding: 10,
        }}
      >
        <img
          src={p.imageUrl}
          alt={p.title}
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            objectFit: "cover",
            borderRadius: 12,
            background: "rgba(15,23,42,0.06)",
          }}
        />
      </Link>

      <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <Link
          href={`/p/${p.id}`}
          style={{
            textDecoration: "none",
            color: "#0B1220",
            fontSize: 12,
            opacity: 0.82,
            lineHeight: 1.35,
            fontWeight: 800,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
          title={p.title}
        >
          {p.title}
        </Link>

        <div style={{ fontWeight: 950 }}>{formatCHF(p.priceCHF)}</div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                style={{
                  fontSize: 12,
                  color: i < stars ? "#F6B300" : "rgba(15,23,42,0.18)",
                }}
              >
                ★
              </span>
            ))}
          </div>
          <span style={{ fontSize: 12, opacity: 0.7 }}>{p.ratingCount}</span>
        </div>

        {/* ✅ echter Button (legt in Warenkorb) */}
        <button
          type="button"
          onClick={onAddToCart}
          style={{
            marginTop: 8,
            height: 38,
            borderRadius: 999,
            background: `linear-gradient(180deg, ${theme.from}, ${theme.to})`,
            border: "1px solid rgba(15,23,42,0.14)",
            color: "#0B1220",
            fontWeight: 950,
            cursor: "pointer",
          }}
        >
          In den Warenkorb
        </button>
      </div>
    </div>
  );
}
