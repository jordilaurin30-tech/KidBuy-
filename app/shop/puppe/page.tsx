

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PuppePage() {
  const router = useRouter();

  const [animationStep, setAnimationStep] = useState(0);
  const [showFire, setShowFire] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBox, setShowBox] = useState(false);
  const [confetti, setConfetti] = useState<number[]>([]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({
      id: "puppe",
      name: "Spielpuppe",
      price: 25,
      image: "/puppe.png",
    });
    localStorage.setItem("cart", JSON.stringify(cart));

    setShowBox(true);
    setTimeout(() => setShowBox(false), 2000);

    if (animationStep % 2 === 0) {
      setShowFire(true);
      setTimeout(() => setShowFire(false), 3000);
    } else {
      const pieces = Array.from({ length: 120 }, (_, i) => i);
      setConfetti(pieces);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setConfetti([]);
      }, 5000);
    }

    setAnimationStep((prev) => prev + 1);
  };

  return (
    <div className="page">
      <button className="back" onClick={() => router.back()}>
        ← Zurück
      </button>

      <div className="layout">
        <div className="imageBox">
          <img src="/puppe.png" alt="Spielpuppe" />
        </div>

        <div className="info">
          <h1>Spielpuppe 🎀</h1>
          <p className="stars">⭐⭐⭐⭐⭐ 96 Bewertungen</p>
          <h2>CHF 25.–</h2>

          <p className="desc">
            Liebevoll gestaltete Spielpuppe zum Spielen, Kuscheln und
            Fantasieren.
          </p>

          <button className="cartBtn" onClick={addToCart}>
            🛒 In den Warenkorb
          </button>
        </div>
      </div>

      {showFire && <div className="fire">🔥</div>}

      {showConfetti && (
        <div className="confetti-wrapper">
          {confetti.map((i) => (
            <span
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}vw`,
                animationDuration: `${4 + Math.random() * 3}s`,
                fontSize: `${28 + Math.random() * 18}px`,
              }}
            >
              🎉
            </span>
          ))}
        </div>
      )}

      {showBox && (
        <div className="confirmBox">
          ✅ Produkt zum Warenkorb hinzugefügt
        </div>
      )}

      <style jsx global>{`
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .page {
          padding: 60px;
        }

        .layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          margin-top: 40px;
        }

        .imageBox {
          background: #f5f5f7;
          border-radius: 24px;
          padding: 40px;
          display: flex;
          justify-content: center;
        }

        .imageBox img {
          max-width: 420px;
          border-radius: 20px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
        }

        .cartBtn {
          margin-top: 30px;
          padding: 14px 32px;
          background: black;
          color: white;
          border-radius: 14px;
          border: none;
        }

        .fire {
          position: fixed;
          top: 90px;
          right: 120px;
          font-size: 110px;
          animation: fireLodder 0.6s infinite alternate;
        }

        @keyframes fireLodder {
          0% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.15);
          }
          100% {
            transform: translateY(10px) scale(0.95);
          }
        }

        .confetti-wrapper {
          position: fixed;
          inset: 0;
          pointer-events: none;
        }

        .confetti {
          position: absolute;
          top: -50px;
          animation: confettiFall linear forwards;
        }

        @keyframes confettiFall {
          to {
            transform: translateY(120vh) rotate(720deg);
            opacity: 0;
          }
        }

        .confirmBox {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px 30px;
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}
