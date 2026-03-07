"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "../../../components/cart/cart-context";
import { PRODUCT_DETAILS } from "@/app/data/product-details";
import { emitAssistantMessage, getCartCenterMessage } from "@/app/lib/kidbuyAssistant";

// Deine bestehenden Produkte (aus catalog.ts)
import { PRODUCTS as CATALOG_PRODUCTS } from "../../data/catalog";

// Unsere Ergänzung (neue Produkte + Specs)
import { EXTRA_PRODUCTS } from "../../data/products-extra";
import { EXTRA_PRODUCT_SPECS } from "../../data/product-specs-extra";

type SpecRow = { label: string; value: string };

function formatCHF(v: number) {
  return `CHF ${v.toFixed(2)}`;
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

export default function ProductByIdPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();

  // ✅ Hier mergen wir: catalog.ts Produkte + extra Produkte
  const allProducts = useMemo(() => {
    const a = Array.isArray(CATALOG_PRODUCTS) ? CATALOG_PRODUCTS : [];
    const b = Array.isArray(EXTRA_PRODUCTS) ? EXTRA_PRODUCTS : [];
    return [...a, ...b];
  }, []);

  const product = useMemo(() => {
    const id = params?.id ?? "";
    return allProducts.find((p: any) => p.id === id) ?? null;
  }, [allProducts, params?.id]);

  // ✅ Extra Details (Bilder, Beschreibung, Bulletpoints, Specs)
  const details = product ? (PRODUCT_DETAILS as any)[product.id] ?? null : null;

  // ✅ Specs: zuerst aus PRODUCT_DETAILS, fallback auf EXTRA_PRODUCT_SPECS
  const specs: SpecRow[] = useMemo(() => {
    if (!product) return [];
    const fromDetails: SpecRow[] = (details?.specs as SpecRow[]) ?? [];
    if (fromDetails.length) return fromDetails;

    return (EXTRA_PRODUCT_SPECS as any)[product.id] ?? [];
  }, [product, details]);

  if (!product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          background: "linear-gradient(180deg, #F7FAFF 0%, #FFFFFF 55%, #F8FBFF 100%)",
        }}
      >
        <Container>
          <div style={{ padding: "40px 0", fontWeight: 950, fontSize: 22 }}>Produkt nicht gefunden: {params?.id}</div>
        </Container>
      </div>
    );
  }
emitAssistantMessage(getCartCenterMessage(product.title) as any);

  const addToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      priceCHF: product.priceCHF,
      imageUrl: product.imageUrl || "",
    });
    router.push("/cart");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        background:
          "radial-gradient(1300px 760px at 16% 6%, rgba(255, 214, 102, 0.26), transparent 55%)," +
          "radial-gradient(900px 600px at 86% 16%, rgba(99, 102, 241, 0.16), transparent 55%)," +
          "linear-gradient(180deg, #F7FAFF 0%, #FFFFFF 55%, #F8FBFF 100%)",
        color: "#0F172A",
      }}
    >
      {/* Oben: Produkt */}
      <section style={{ padding: "18px 0 22px" }}>
        <Container>
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 20, alignItems: "start" }}>
            <Card style={{ padding: 18, minHeight: 560 }}>
              {details?.images?.length ? (
                <ProductGallery images={details.images} />
              ) : (
                <div
                  style={{
                    height: 560,
                    borderRadius: 22,
                    border: "1px solid rgba(15,23,42,0.12)",
                    background:
                      "linear-gradient(0deg, rgba(255,255,255,0.92), rgba(255,255,255,0.92))," +
                      "repeating-linear-gradient(0deg, rgba(15,23,42,0.05) 0px, rgba(15,23,42,0.05) 1px, transparent 1px, transparent 32px)," +
                      "repeating-linear-gradient(90deg, rgba(15,23,42,0.05) 0px, rgba(15,23,42,0.05) 1px, transparent 1px, transparent 32px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 950,
                    fontSize: 38,
                    opacity: 0.55,
                  }}
                >
                  Bild kommt später
                </div>
              )}
            </Card>

            <Card style={{ padding: 20 }}>
              <div style={{ fontWeight: 950, fontSize: 26, letterSpacing: -0.6, lineHeight: 1.15 }}>{product.title}</div>

              <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.65, opacity: 0.9 }}>
                Kategorie: <span style={{ fontWeight: 950 }}>{product.category}</span>
              </div>

              {details?.description ? (
                <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.65, opacity: 0.9 }}>{details.description}</div>
              ) : null}

              {details?.bullets?.length ? (
                <ul style={{ marginTop: 12, paddingLeft: 18, fontSize: 14, lineHeight: 1.7, opacity: 0.92 }}>
                  {details.bullets.slice(0, 6).map((b: string, idx: number) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              ) : null}

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
                <div style={{ marginTop: 6, fontWeight: 950, fontSize: 34, letterSpacing: -0.8 }}>
                  {formatCHF(product.priceCHF)}
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={addToCart}
                    style={{
                      height: 44,
                      padding: "0 18px",
                      borderRadius: 12,
                      border: "1px solid rgba(15,23,42,0.14)",
                      background: "linear-gradient(180deg, #FFE275, #FFCC33)",
                      fontWeight: 950,
                      cursor: "pointer",
                    }}
                  >
                    WARENKORB
                  </button>

                  <button
                    type="button"
                    onClick={() => alert("Jetzt kaufen (Demo)")}
                    style={{
                      height: 44,
                      padding: "0 18px",
                      borderRadius: 12,
                      border: "1px solid rgba(15,23,42,0.14)",
                      background: "linear-gradient(180deg, #FFB16A, #FF7A00)",
                      fontWeight: 950,
                      cursor: "pointer",
                    }}
                  >
                    Jetzt kaufen
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* DATEN & BEWERTUNGEN: Tabelle füllen */}
      <section style={{ padding: "18px 0 44px" }}>
        <Container>
          <div style={{ fontWeight: 950, fontSize: 28, marginBottom: 12 }}>DATEN & BEWERTUNGEN</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 14 }}>
            <Card style={{ padding: 16 }}>
              <div style={{ fontWeight: 950, fontSize: 18, marginBottom: 10, opacity: 0.9 }}>Produktdaten</div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {specs.length ? (
                    specs.map((r) => (
                      <tr key={r.label}>
                        <td
                          style={{
                            padding: "10px 10px",
                            borderBottom: "1px solid rgba(15,23,42,0.10)",
                            fontWeight: 950,
                            width: "52%",
                          }}
                        >
                          {r.label}
                        </td>
                        <td
                          style={{
                            padding: "10px 10px",
                            borderBottom: "1px solid rgba(15,23,42,0.10)",
                            opacity: 0.9,
                          }}
                        >
                          {r.value}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td style={{ padding: "10px 10px", opacity: 0.75 }}>Noch keine Specs hinterlegt.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>

            <Card style={{ padding: 16 }}>
              <div style={{ fontWeight: 950, fontSize: 18, marginBottom: 10, opacity: 0.9 }}>Bewertungen</div>
              <div style={{ opacity: 0.7 }}>(Deine Bewertungs-UI bleibt wie im Original — hier erstmal Demo)</div>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  );
}

/* -------------------- Gallery (Bilder + Thumbnails) -------------------- */

function ProductGallery({ images }: { images: string[] }) {
  const safe = Array.isArray(images) ? images.filter(Boolean) : [];
  const [active, setActive] = useState(0);

  const main = safe[active] ?? safe[0];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "92px 1fr", gap: 14 }}>
      {/* Thumbnails */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {safe.slice(0, 10).map((src, idx) => {
          const isActive = idx === active;
          return (
            <button
              key={src + idx}
              type="button"
              onClick={() => setActive(idx)}
              style={{
                width: 92,
                height: 76,
                borderRadius: 14,
                border: isActive ? "2px solid rgba(59,130,246,0.80)" : "1px solid rgba(15,23,42,0.14)",
                background: "rgba(255,255,255,0.96)",
                cursor: "pointer",
                padding: 6,
              }}
              title={`Bild ${idx + 1}`}
            >
              <img
                src={src}
                alt={`Thumbnail ${idx + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 10,
                  display: "block",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Main Image */}
      <div
        style={{
          height: 560,
          borderRadius: 22,
          border: "1px solid rgba(15,23,42,0.12)",
          background: "rgba(255,255,255,0.96)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {main ? (
          <img
            src={main}
            alt="Produktbild"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 950,
              fontSize: 34,
              opacity: 0.55,
            }}
          >
            Bild kommt später
          </div>
        )}
      </div>
    </div>
  );
}
