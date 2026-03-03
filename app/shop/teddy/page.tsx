

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TeddyShopPage() {
  const router = useRouter();

  const images = ["/teddy.png", "/teddy2.png", "/teddy3.png"];
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [search, setSearch] = useState("");

  const changeImage = (dir: number) => {
    setFade(true);
    setTimeout(() => {
      setIndex((prev) => (prev + dir + images.length) % images.length);
      setFade(false);
    }, 200);
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({
      id: "teddy",
      name: "Kuschelteddy",
      price: 20,
      image: images[index],
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("🧸 Teddy wurde in den Warenkorb gelegt!");
  };

  return (
    <div className="page">
      {/* HEADER */}
      <header className="header">
        <h1>KidsBuy</h1>

        <input
          className="search"
          placeholder="Produkte suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={() => router.push("/cart")}>🛒</button>
      </header>

      {/* PRODUKT OBEN */}
      <section className="product">
        <div className="imageBox">
          <img
            src={images[index]}
            alt="Teddy"
            className={fade ? "fade" : ""}
          />

          <button className="arrow left" onClick={() => changeImage(-1)}>
            ‹
          </button>
          <button className="arrow right" onClick={() => changeImage(1)}>
            ›
          </button>
        </div>

        <div className="details">
          <span className="badge">Bestseller</span>
          <h2>Kuschelteddy 🧸</h2>
          <p className="stars">⭐⭐⭐⭐⭐ 4.9 (128 Bewertungen)</p>

          <h3 className="price">CHF 20.–</h3>

          <p className="desc">
            Extra weicher Kuschelteddy – perfekt zum Einschlafen, Spielen
            und Liebhaben.
          </p>

          <button className="cartBtn" onClick={addToCart}>
            🛒 In den Warenkorb
          </button>
        </div>
      </section>

      {/* SCROLL BEREICH */}
      <section className="info brown">
        <h2>🤎 Produktbeschreibung</h2>
        <p>
          Unser Kuschelteddy besteht aus besonders weichem Plüsch und ist
          ideal für Kinder jeden Alters.
        </p>
      </section>

      <section className="info cream">
        <h2>✨ Warum dieser Teddy?</h2>
        <ul>
          <li>Extra weich & flauschig</li>
          <li>Ideal als Geschenk</li>
          <li>Fördert Geborgenheit</li>
        </ul>
      </section>

      <section className="info orange">
        <h2>🧵 Material & Pflege</h2>
        <p>
          Hochwertiger Plüsch, maschinenwaschbar bei 30°C,
          langlebig und formstabil.
        </p>
      </section>

      <section className="info yellow">
        <h2>🛡️ Sicherheit</h2>
        <p>
          Frei von Schadstoffen, kindersicher verarbeitet,
          keine verschluckbaren Teile.
        </p>
      </section>

      <section className="info white">
        <h2>⭐ Kundenbewertungen</h2>
        <p>
          „Mein Kind liebt diesen Teddy!“ – ⭐⭐⭐⭐⭐  
          „Super weich und tolle Qualität.“
        </p>
      </section>

      <style jsx global>{`
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          background: #fffaf3;
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: white;
          padding: 16px 30px;
          display: flex;
          gap: 20px;
          align-items: center;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
        }

        .search {
          flex: 1;
          padding: 12px 16px;
          border-radius: 14px;
          border: 1px solid #ddd;
          font-size: 15px;
        }

        .product {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 70px;
          padding: 60px;
        }

        .imageBox {
          position: relative;
          aspect-ratio: 1 / 1;
          border-radius: 30px;
          overflow: hidden;
          background: linear-gradient(135deg, #e8c9a3, #fff);
        }

        .imageBox img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.25s ease, transform 0.25s ease;
        }

        .fade {
          opacity: 0;
          transform: scale(0.97);
        }

        .arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.9);
          border: none;
          font-size: 40px;
          width: 52px;
          height: 90px;
          cursor: pointer;
          opacity: 0;
        }

        .imageBox:hover .arrow {
          opacity: 1;
        }

        .left { left: 10px; }
        .right { right: 10px; }

        .details h2 {
          font-size: 36px;
        }

        .price {
          color: #b12704;
          font-size: 30px;
        }

        .cartBtn {
          padding: 16px 34px;
          background: linear-gradient(135deg, #ffb347, #ff9900);
          border-radius: 18px;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }

        .info {
          padding: 80px;
          line-height: 1.7;
        }

        .brown { background: #f3e4d7; }
        .cream { background: #fff5e1; }
        .orange { background: #ffe0c1; }
        .yellow { background: #fff2b3; }
        .white { background: white; }
      `}</style>
    </div>
  );
}
