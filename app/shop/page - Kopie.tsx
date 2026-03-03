
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const products = [
  {
    slug: "teddy",
    name: "Teddy Bär",
    price: 15,
    image: "/teddy.png",
    description: "Weicher Kuschelteddy",
  },
  {
    slug: "lego",
    name: "LEGO Set",
    price: 25,
    image: "/lego.png",
    description: "Kreatives Bauen",
  },
];

export default function Shop() {
  const [budget, setBudget] = useState(50);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
    setBudget(Number(localStorage.getItem("budget")) || 50);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        <h1 style={{ fontSize: 42 }}>🧸 KidsBuy</h1>

        <div style={{ display: "flex", gap: 20 }}>
          <div
            style={{
              background: "white",
              padding: "10px 20px",
              borderRadius: 30,
              boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
            }}
          >
            💰 {budget} €
          </div>

          <Link href="/cart">
            <button
              style={{
                background: "black",
                color: "white",
                padding: "12px 22px",
                borderRadius: 30,
                cursor: "pointer",
              }}
            >
              🛒 Warenkorb ({cart.length})
            </button>
          </Link>
        </div>
      </div>

      {/* PRODUKTE */}
      <div style={{ display: "flex", gap: 30 }}>
        {products.map((p) => (
          <Link key={p.slug} href={`/shop/${p.slug}`}>
            <div
              style={{
                background: "white",
                borderRadius: 20,
                padding: 20,
                width: 260,
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-6px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <img
                src={p.image}
                style={{
                  width: "100%",
                  height: 180,
                  objectFit: "contain",
                }}
              />
              <h3>{p.name}</h3>
              <p>{p.price} €</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
