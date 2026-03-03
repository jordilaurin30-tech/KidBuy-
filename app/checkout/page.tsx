"use client";

import { useEffect, useState } from "react";

export default function Checkout() {
  const [total, setTotal] = useState(0);
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const oldBudget = Number(localStorage.getItem("budget")) || 0;
    const sum = cart.reduce((s: number, p: any) => s + p.price, 0);

    setTotal(sum);
    setBudget(oldBudget - sum);

    localStorage.setItem("budget", (oldBudget - sum).toString());
    localStorage.setItem("cart", JSON.stringify([]));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>✅ Kauf abgeschlossen</h1>
      <p>Gesamtbetrag: <strong>{total} €</strong></p>
      <p>Neues Guthaben: <strong>{budget} €</strong></p>
    </div>
  );
}
