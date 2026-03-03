

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SpielautoPage() {
  const router = useRouter();

  const [animationStep, setAnimationStep] = useState(0);
  const [showFire, setShowFire] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBox, setShowBox] = useState(false);
  const [confetti, setConfetti] = useState<number[]>([]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({
      id: "spielauto",
      name: "Spielauto",
      price: 15,
      image: "/spielauto.png",
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
      <button onClick={() => router.back()}>← Zurück</button>

      <div className="layout">
        <div className="imageBox">
          <img src="/spielauto.png" alt="Spielauto" />
        </div>

        <div>
          <h1>Spielauto 🚗</h1>
          <p>⭐⭐⭐⭐⭐ 143 Bewertungen</p>
          <h2>CHF 15.–</h2>

          <p>Robustes Spielauto für spannende Rennen.</p>

          <button onClick={addToCart}>🛒 In den Warenkorb</button>
        </div>
      </div>

      {showFire && <div className="fire">🔥</div>}
      {showConfetti && (
        <div className="confetti-wrapper">
          {confetti.map((i) => (
            <span key={i} className="confetti">🎉</span>
          ))}
        </div>
      )}
      {showBox && <div className="confirmBox">✅ Hinzugefügt</div>}

      <style jsx global>{`
        .fire {
          position: fixed;
          top: 90px;
          right: 120px;
          font-size: 110px;
          animation: fireLodder 0.6s infinite alternate;
        }
        @keyframes fireLodder {
          0% { transform: scale(1); }
          100% { transform: scale(1.2); }
        }
        .confirmBox {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border-radius: 14px;
        }
      `}</style>
    </div>
  );
}
