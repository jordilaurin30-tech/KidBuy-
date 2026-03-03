
"use client";

import { useEffect, useState } from "react";

export default function Parents() {
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    const b = Number(localStorage.getItem("budget")) || 0;
    setBudget(b);
  }, []);

  function addMoney(amount: number) {
    const newBudget = budget + amount;
    setBudget(newBudget);
    localStorage.setItem("budget", newBudget.toString());
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>👨‍👩‍👧 Eltern-Dashboard</h1>

      <p>Aktuelles Guthaben: <strong>{budget} €</strong></p>

      <button onClick={() => addMoney(10)}>+10 €</button>{" "}
      <button onClick={() => addMoney(20)}>+20 €</button>{" "}
      <button onClick={() => addMoney(50)}>+50 €</button>
    </div>
  );
}
