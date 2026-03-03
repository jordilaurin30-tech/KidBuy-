"use client";

import { useState } from "react";

export function ProductTemplatePage() {
  const categories = [
    { name: "Elektronik", color: "#FFD600" },
    { name: "Bestseller", color: "#FF9800" },
    { name: "Küche", color: "#4CAF50" },
    { name: "Gadgets", color: "#2196F3" },
    { name: "Wissen", color: "#9E9E9E" },
  ];

  const images = [
    "Bild 1",
    "Bild 2",
    "Bild 3",
    "Bild 4",
    "Bild 5",
    "Video",
  ];

  const [currentImage, setCurrentImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  return (
    <div style={{ background: "#fff", padding: 32, fontFamily: "Arial, sans-serif" }}>

      {/* ===================== SUCHLEISTE ===================== */}
      <div style={{ marginBottom: 24 }}>
        <input
          placeholder="Produkte suchen…"
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 16,
            border: "1px solid #ddd",
            fontSize: 16,
          }}
        />
      </div>

      {/* ===================== KATEGORIEN ===================== */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 40,
        }}
      >
        {categories.map((cat) => (
          <div
            key={cat.name}
            style={{
              padding: "10px 18px",
              borderRadius: 20,
              background: cat.color,
              fontWeight: "bold",
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            {cat.name}
          </div>
        ))}
      </div>

      {/* ===================== SEITE 1 ===================== */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
        }}
      >
        {/* BILDER */}
        <div>
          <div
            onDoubleClick={() => setZoomOpen(true)}
            style={{
              position: "relative",
              height: 420,
              background: "#f2f2f2",
              borderRadius: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              color: "#888",
              cursor: "zoom-in",
            }}
          >
            {images[currentImage]}

            <div
              onClick={nextImage}
              style={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                background: "#fff",
                borderRadius: "50%",
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 24,
              }}
            >
              ➜
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 12,
              marginTop: 16,
            }}
          >
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => setCurrentImage(i)}
                style={{
                  height: 70,
                  background: "#e0e0e0",
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {img}
              </div>
            ))}
          </div>
        </div>

        {/* PRODUKTINFOS */}
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>
            Produktname – Platzhalter
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.6 }}>
            Hier kommt die Produktbeschreibung rein.  
            3–5 Sätze, austauschbar für jedes Produkt.  
            Neutral gehalten – perfekt als Vorlage.
          </p>

          <p style={{ marginTop: 12, fontSize: 16 }}>
            Herkunft: 🇩🇪 Made in Germany
          </p>

          <div style={{ marginTop: 20 }}>
            ⭐⭐⭐⭐⭐
          </div>

          <p style={{ fontSize: 24, fontWeight: "bold", marginTop: 16 }}>
            CHF 00.00
          </p>

          <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
            <button
              style={{
                background: "#FFD600",
                border: "none",
                padding: "14px 22px",
                borderRadius: 20,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              In den Warenkorb
            </button>

            <button
              style={{
                background: "#FF9800",
                border: "none",
                padding: "14px 22px",
                borderRadius: 20,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Jetzt kaufen
            </button>
          </div>
        </div>
      </section>

      {/* ===================== SEITE 2 ===================== */}
      <section style={{ marginTop: 120 }}>
        <div
          style={{
            width: "100%",
            height: 420,
            background: "#f2f2f2",
            borderRadius: 32,
            marginBottom: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            color: "#888",
          }}
        >
          Grosses Detailbild
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 40,
            alignItems: "center",
          }}
        >
          <div
            style={{
              height: 420,
              background: "#f2f2f2",
              borderRadius: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              color: "#888",
            }}
          >
            Zweites Bild
          </div>

          <div style={{ fontSize: 18, lineHeight: 1.7 }}>
            <strong>Mehr Informationen</strong>
            <p>
              Hier steht zusätzlicher erklärender Text zum Produkt.  
              Perfekt für Nutzen, Story oder Features.
            </p>
          </div>
        </div>
      </section>

      {zoomOpen && (
        <div
          onClick={() => setZoomOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            color: "#fff",
            cursor: "zoom-out",
            zIndex: 999,
          }}
        >
          {images[currentImage]}
        </div>
      )}
    </div>
  );
}
