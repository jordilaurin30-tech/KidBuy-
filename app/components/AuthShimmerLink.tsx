"use client";

import Link from "next/link";
import React from "react";

export default function AuthShimmerLink({
  href,
  from,
  to,
  label = "Anmelden",
}: {
  href: string;
  from: string;
  to: string;
  label?: string;
}) {
  // Fallback, falls from/to mal leer sind
  const safeFrom = from || "#3B82F6";
  const safeTo = to || "#A5D8FF";

  return (
    <>
      <style>{`
        @keyframes kidbuyShimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      <Link
        href={href}
        style={{
          textDecoration: "none",
          fontWeight: 950,
          fontSize: 14,
          padding: "10px 14px",
          borderRadius: 999,
          border: "1px solid rgba(15,23,42,0.12)",
          background: "rgba(255,255,255,0.90)",
          boxShadow: "0 12px 28px rgba(0,0,0,0.06)",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          lineHeight: 1,
        }}
      >
        {/* WICHTIG: Fallback-Farbe ist safeFrom -> sonst wäre Text unsichtbar, wenn backgroundClip spinnt */}
        <span
          style={{
            color: safeFrom, // fallback sichtbar
            backgroundImage: `linear-gradient(90deg, ${safeFrom}, ${safeTo}, ${safeFrom})`,
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "kidbuyShimmer 1.8s linear infinite",
            letterSpacing: 0.2,
          }}
        >
          {label}
        </span>

        <span style={{ opacity: 0.85 }}>🙂</span>
      </Link>
    </>
  );
}