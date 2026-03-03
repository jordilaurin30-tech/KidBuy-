"use client";

import React from "react";

export default function KidBuySearchHint({ text }: { text: string | null }) {
  if (!text) return null;

  return (
    <div
      style={{
        marginBottom: 10,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        fontWeight: 950,
        fontSize: 13,
        color: "rgba(15,23,42,0.86)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 16 }}>😊</span>
      <span>{text}</span>
    </div>
  );
}
