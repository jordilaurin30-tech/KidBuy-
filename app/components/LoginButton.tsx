"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LoginButton() {
  const [color, setColor] = useState("#60A5FA");

  useEffect(() => {
    const colors = ["#60A5FA", "#34D399", "#F59E0B", "#EF4444", "#A78BFA"];
    let i = 0;

    const interval = setInterval(() => {
      i = (i + 1) % colors.length;
      setColor(colors[i]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/login"
      style={{
        textDecoration: "none",
        fontWeight: 900,
        padding: "10px 18px",
        borderRadius: 999,
        border: "1px solid rgba(15,23,42,0.14)",
        background: "white",
        color,
        transition: "all .4s ease",
        boxShadow: `0 0 12px ${color}55`,
      }}
    >
      Anmelden
    </Link>
  );
}