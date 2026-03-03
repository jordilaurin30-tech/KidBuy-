"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCount(cart.length);
    };

    update();
    window.addEventListener("cart-update", update);
    return () => window.removeEventListener("cart-update", update);
  }, []);

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 30,
        padding: "20px 40px",
        borderBottom: "1px solid #eee",
      }}
    >
      <Link href="/" style={{ fontSize: 26, fontWeight: 800 }}>
        KidsBuy
      </Link>

      <input
        placeholder="Produkte suchen…"
        style={{
          flex: 1,
          padding: 12,
          borderRadius: 999,
          border: "1px solid #ccc",
        }}
      />

      <Link href="/cart" style={{ fontWeight: 600 }}>
        🛒 Warenkorb ({count})
      </Link>
    </header>
  );
}

