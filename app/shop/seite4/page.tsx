
"use client";

import { useState } from "react";

export default function SeiteVier() {
  const productSpecs = [
    { label: "Marke", value: "Hier Marke eintragen" },
    { label: "Hersteller", value: "Hier Hersteller eintragen" },
    { label: "Gewicht", value: "z. B. 1.2 kg" },
    { label: "Akku", value: "z. B. 4000 mAh" },
    { label: "Herkunft", value: "Made in Germany 🇩🇪" },
  ];

  const [ratings, setRatings] = useState([
    { stars: 5, count: 120 },
    { stars: 4, count: 60 },
    { stars: 3, count: 20 },
    { stars: 2, count: 8 },
    { stars: 1, count: 4 },
  ]);

  const maxRating = Math.max(...ratings.map((r) => r.count));

  const initialComments = [
    { name: "Anna", text: "Super Produkt, meine Kinder lieben es!", stars: 5 },
    { name: "Tom", text: "Gute Qualität, schneller Versand.", stars: 4 },
    { name: "Lena", text: "Preis-Leistung top!", stars: 5 },
  ];

  const loopComments = [...initialComments, ...initialComments];

  const [comments, setComments] = useState(loopComments);
  const [commentIndex, setCommentIndex] = useState(0);
  const [transition, setTransition] = useState(true);

  const [commentText, setCommentText] = useState("");
  const [selectedStars, setSelectedStars] = useState(0);

  const submitComment = () => {
    if (!commentText || selectedStars === 0) return;

    setRatings((prev) =>
      prev.map((r) =>
        r.stars === selectedStars
          ? { ...r, count: r.count + 1 }
          : r
      )
    );

    setComments((prev) => [
      { name: "Du", text: commentText, stars: selectedStars },
      ...prev,
    ]);

    setCommentText("");
    setSelectedStars(0);
  };

  const nextComment = () => {
    setTransition(true);
    setCommentIndex((prev) => prev + 1);

    if (commentIndex + 1 === initialComments.length) {
      setTimeout(() => {
        setTransition(false);
        setCommentIndex(0);
      }, 400);
    }
  };

  const prevComment = () => {
    if (commentIndex === 0) {
      setTransition(false);
      setCommentIndex(initialComments.length);
      setTimeout(() => {
        setTransition(true);
        setCommentIndex(initialComments.length - 1);
      }, 20);
    } else {
      setTransition(true);
      setCommentIndex((prev) => prev - 1);
    }
  };

  return (
    <main style={{ padding: 60, background: "#fff" }}>
      {/* ================= PRODUKT DATEN ================= */}
      <section style={{ marginBottom: 100 }}>
        <h2 style={{ fontSize: 32, marginBottom: 24 }}>Produktdetails</h2>

        <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid #eee" }}>
          {productSpecs.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "18px 24px",
                background: i % 2 === 0 ? "#fafafa" : "#fff",
              }}
            >
              <strong>{item.label}</strong>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ================= BEWERTUNGEN + KOMMENTAR ================= */}
      <section style={{ marginBottom: 100 }}>
        <h2 style={{ fontSize: 32, marginBottom: 32 }}>Kundenbewertungen</h2>

        <div style={{ display: "flex", gap: 60 }}>
          {/* ===== DIAGRAMM (HÖHE ANGEPASST) ===== */}
          <div
            style={{
              flex: 1,
              minHeight: 360,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {ratings.map((r, i) => (
              <div key={i} style={{ display: "flex", marginBottom: 18 }}>
                <span style={{ width: 60 }}>{r.stars} ★</span>
                <div
                  style={{
                    height: 26, // ← dicker
                    width: `${(r.count / maxRating) * 100}%`,
                    background: "#f4b400",
                    borderRadius: 14,
                  }}
                />
                <span style={{ marginLeft: 12 }}>{r.count}</span>
              </div>
            ))}
          </div>

          {/* ===== KOMMENTAR RASTER ===== */}
          <div
            style={{
              flex: 1,
              minHeight: 360,
              borderRadius: 24,
              padding: 24,
              border: "1px solid #eee",
            }}
          >
            <h3>Kommentar schreiben</h3>

            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Deine Meinung zum Produkt..."
              style={{
                width: "100%",
                height: 120,
                borderRadius: 16,
                padding: 16,
                border: "1px solid #ddd",
                resize: "none",
                marginBottom: 16,
              }}
            />

            <div style={{ fontSize: 24, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  onClick={() => setSelectedStars(s)}
                  style={{
                    cursor: "pointer",
                    color: s <= selectedStars ? "#f4b400" : "#ccc",
                  }}
                >
                  ★
                </span>
              ))}
            </div>

            <button
              onClick={submitComment}
              style={{
                padding: "12px 24px",
                borderRadius: 20,
                border: "none",
                background: "#ff9900",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Bewertung absenden
            </button>
          </div>
        </div>
      </section>

      {/* ================= KOMMENTARE LOOP ================= */}
      <section>
        <h2 style={{ fontSize: 32, marginBottom: 32 }}>Kundenmeinungen</h2>

        <div style={{ position: "relative", overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              gap: 24,
              transform: `translateX(-${commentIndex * 45}%)`,
              transition: transition ? "transform 0.4s ease" : "none",
            }}
          >
            {comments.map((c, i) => (
              <div
                key={i}
                style={{
                  minWidth: "45%",
                  borderRadius: 24,
                  padding: 24,
                  border: "1px solid #eee",
                }}
              >
                <strong>{c.name}</strong>
                <div style={{ color: "#f4b400", margin: "6px 0" }}>
                  {"★".repeat(c.stars)}
                </div>
                <p>{c.text}</p>
              </div>
            ))}
          </div>

          <Arrow left onClick={prevComment} />
          <Arrow onClick={nextComment} />
        </div>
      </section>
    </main>
  );
}

function Arrow({ left, onClick }: { left?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        top: "50%",
        [left ? "left" : "right"]: 10,
        transform: "translateY(-50%)",
        width: 48,
        height: 48,
        borderRadius: "50%",
        border: "none",
        background: "#fff",
        fontSize: 22,
        cursor: "pointer",
        boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
      }}
    >
      {left ? "←" : "→"}
    </button>
  );
}
