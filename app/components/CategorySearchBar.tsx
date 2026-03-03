"use client";

import React from "react";

export default function CategorySearchBar({
  value,
  onChange,
  from,
  to,
  placeholder = "Suche in dieser Kategorie…",
}: {
  value: string;
  onChange: (v: string) => void;
  from: string;
  to: string;
  placeholder?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        borderRadius: 16,
        border: "1px solid rgba(15,23,42,0.10)",
        background: "rgba(255,255,255,0.92)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.08)",
        padding: 12,
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${from}, ${to})`,
          border: "1px solid rgba(15,23,42,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 950,
          color: "#0B1220",
          flex: "0 0 auto",
        }}
        aria-hidden="true"
      >
        🔎
      </div>

      <div style={{ flex: "1 1 280px", minWidth: 220 }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            height: 44,
            borderRadius: 14,
            border: `1px solid rgba(15,23,42,0.10)`,
            outline: "none",
            padding: "0 14px",
            fontWeight: 850,
            fontSize: 14,
            color: "#0B1220",
            background: "rgba(255,255,255,0.96)",
            boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.6)`,
          }}
        />
      </div>

      <button
        type="button"
        onClick={() => onChange("")}
        style={{
          height: 44,
          padding: "0 14px",
          borderRadius: 999,
          border: "1px solid rgba(15,23,42,0.10)",
          background: value ? `linear-gradient(180deg, ${from}, ${to})` : "rgba(255,255,255,0.92)",
          color: "#0B1220",
          fontWeight: 950,
          cursor: "pointer",
          opacity: value ? 1 : 0.7,
          flex: "0 0 auto",
        }}
      >
        Löschen
      </button>
    </div>
  );
}