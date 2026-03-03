
"use client";

import { useEffect, useState } from "react";

export default function SeiteDreiLoopFinal() {
  /* ================= DATEN ================= */
  const images = ["Bild 1", "Bild 2", "Bild 3", "Bild 4", "Bild 5"];
  const loopImages = [...images, ...images];

  const products = [
    { name: "Produkt A", price: "CHF 19.90" },
    { name: "Produkt B", price: "CHF 24.90" },
    { name: "Produkt C", price: "CHF 29.90" },
    { name: "Produkt D", price: "CHF 34.90" },
    { name: "Produkt E", price: "CHF 39.90" },
  ];
  const loopProducts = [...products, ...products];

  const [imgIndex, setImgIndex] = useState(0);
  const [prodIndex, setProdIndex] = useState(0);
  const [imgTransition, setImgTransition] = useState(true);
  const [prodTransition, setProdTransition] = useState(true);

  /* ================= AUTO PLAY (NUR BILDER) ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      nextImg();
    }, 7000);

    return () => clearInterval(interval);
  }, [imgIndex]);

  /* ================= LOOP LOGIK ================= */
  const nextImg = () => {
    setImgTransition(true);
    setImgIndex((prev) => prev + 1);

    if (imgIndex + 1 === images.length) {
      setTimeout(() => {
        setImgTransition(false);
        setImgIndex(0);
      }, 500);
    }
  };

  const prevImg = () => {
    if (imgIndex === 0) {
      setImgTransition(false);
      setImgIndex(images.length);
      setTimeout(() => {
        setImgTransition(true);
        setImgIndex(images.length - 1);
      }, 20);
    } else {
      setImgTransition(true);
      setImgIndex((prev) => prev - 1);
    }
  };

  const nextProd = () => {
    setProdTransition(true);
    setProdIndex((prev) => prev + 1);

    if (prodIndex + 1 === products.length) {
      setTimeout(() => {
        setProdTransition(false);
        setProdIndex(0);
      }, 500);
    }
  };

  const prevProd = () => {
    if (prodIndex === 0) {
      setProdTransition(false);
      setProdIndex(products.length);
      setTimeout(() => {
        setProdTransition(true);
        setProdIndex(products.length - 1);
      }, 20);
    } else {
      setProdTransition(true);
      setProdIndex((prev) => prev - 1);
    }
  };

  return (
    <main style={{ padding: 40 }}>

      {/* ================= BILDER ================= */}
      <h2 style={{ fontSize: 28, marginBottom: 20 }}>
        Weitere Bilder
      </h2>

      <div style={{ position: "relative", overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            gap: 24,
            transform: `translateX(-${imgIndex * 40}%)`,
            transition: imgTransition ? "transform 0.5s ease" : "none",
          }}
        >
          {loopImages.map((img, i) => (
            <div
              key={i}
              style={{
                minWidth: "40%", // 🔒 bleibt gleich
                height: 260,
                background: "#f2f2f2",
                borderRadius: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              {img}
            </div>
          ))}
        </div>

        <Arrow left onClick={prevImg} />
        <Arrow onClick={nextImg} />
      </div>

      {/* ================= PRODUKTE ================= */}
      <h2 style={{ fontSize: 28, margin: "80px 0 20px" }}>
        Ähnliche Produkte
      </h2>

      <div style={{ position: "relative", overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            gap: 24,
            transform: `translateX(-${prodIndex * 20}%)`,
            transition: prodTransition ? "transform 0.5s ease" : "none",
          }}
        >
          {loopProducts.map((p, i) => (
            <div
              key={i}
              style={{
                minWidth: "20%", // ✅ HALB SO GROSS WIE OBEN
                background: "#fff",
                borderRadius: 24,
                padding: 24,
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 16px 32px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(0,0,0,0.08)";
              }}
            >
              <div
                style={{
                  height: 160,
                  background: "#e6e6e6",
                  borderRadius: 18,
                  marginBottom: 16,
                }}
              />
              <h3 style={{ margin: 0 }}>{p.name}</h3>
              <p style={{ fontWeight: "bold", margin: "6px 0" }}>
                {p.price}
              </p>
              <div style={{ color: "#f4b400" }}>★ ★ ★ ★ ★</div>
            </div>
          ))}
        </div>

        <Arrow left onClick={prevProd} />
        <Arrow onClick={nextProd} />
      </div>

    </main>
  );
}

/* ================= PFEIL ================= */
function Arrow({
  left,
  onClick,
}: {
  left?: boolean;
  onClick: () => void;
}) {
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
