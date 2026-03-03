// components/parent/ParentCards.tsx
"use client";

import React from "react";

export function Card({
  title,
  subtitle,
  right,
  children,
  style,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <section
      style={{
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 22,
        boxShadow: "0 14px 40px rgba(0,0,0,0.08)",
        padding: 18,
        backdropFilter: "blur(10px)",
        ...style,
      }}
    >
      {(title || subtitle || right) && (
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div style={{ minWidth: 0 }}>
            {title && (
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                {title}
              </div>
            )}
            {subtitle && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: "rgba(0,0,0,0.58)",
                  lineHeight: 1.3,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>

          {right && <div style={{ flexShrink: 0 }}>{right}</div>}
        </header>
      )}

      <div>{children}</div>
    </section>
  );
}

export function Badge({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: "green" | "blue" | "gray";
}) {
  const toneMap: Record<string, { bg: string; border: string; fg: string }> = {
    green: {
      bg: "rgba(28, 180, 120, 0.10)",
      border: "rgba(28, 180, 120, 0.22)",
      fg: "rgba(16, 120, 80, 0.95)",
    },
    blue: {
      bg: "rgba(70, 120, 255, 0.10)",
      border: "rgba(70, 120, 255, 0.22)",
      fg: "rgba(40, 80, 190, 0.95)",
    },
    gray: {
      bg: "rgba(0,0,0,0.04)",
      border: "rgba(0,0,0,0.10)",
      fg: "rgba(0,0,0,0.70)",
    },
  };

  const t = toneMap[tone] ?? toneMap.gray;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 999,
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.fg,
        fontSize: 12,
        fontWeight: 650,
        letterSpacing: "-0.01em",
        boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
        userSelect: "none",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: t.fg,
          opacity: 0.6,
        }}
      />
      {children}
    </span>
  );
}

export function FieldRow({
  label,
  hint,
  right,
  children,
}: {
  label: string;
  hint?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 650 }}>{label}</div>
        {hint && (
          <div style={{ fontSize: 12, color: "rgba(0,0,0,0.55)" }}>{hint}</div>
        )}
        <div style={{ marginLeft: "auto" }}>{right}</div>
      </div>
      {children}
    </div>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  prefix,
  inputMode = "decimal",
  width,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  width?: number | string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 12px",
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "rgba(255,255,255,0.85)",
        boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
        width: width ?? "100%",
      }}
    >
      {prefix && (
        <span style={{ fontSize: 12, fontWeight: 750, color: "rgba(0,0,0,0.55)" }}>
          {prefix}
        </span>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        style={{
          width: "100%",
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: 14,
          fontWeight: 650,
          letterSpacing: "-0.01em",
        }}
      />
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const v =
    variant === "primary"
      ? {
          bg: "rgba(20, 90, 255, 0.12)",
          border: "rgba(20, 90, 255, 0.22)",
          fg: "rgba(20, 70, 190, 1)",
        }
      : variant === "danger"
      ? {
          bg: "rgba(230, 70, 70, 0.10)",
          border: "rgba(230, 70, 70, 0.20)",
          fg: "rgba(170, 30, 30, 0.98)",
        }
      : {
          bg: "rgba(0,0,0,0.04)",
          border: "rgba(0,0,0,0.10)",
          fg: "rgba(0,0,0,0.78)",
        };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        borderRadius: 18,
        border: `1px solid ${v.border}`,
        background: v.bg,
        color: v.fg,
        padding: "11px 14px",
        fontSize: 13,
        fontWeight: 750,
        letterSpacing: "-0.01em",
        boxShadow: "0 12px 26px rgba(0,0,0,0.08)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transform: "translateY(0px)",
        transition: "transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 16px 34px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 26px rgba(0,0,0,0.08)";
      }}
    >
      {children}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        borderRadius: 999,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "rgba(255,255,255,0.80)",
        padding: "8px 10px",
        boxShadow: "0 10px 22px rgba(0,0,0,0.06)",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <span
        style={{
          width: 40,
          height: 22,
          borderRadius: 999,
          position: "relative",
          background: checked ? "rgba(28, 180, 120, 0.22)" : "rgba(0,0,0,0.10)",
          border: `1px solid ${checked ? "rgba(28, 180, 120, 0.28)" : "rgba(0,0,0,0.12)"}`,
          transition: "background 180ms ease, border 180ms ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 20 : 2,
            width: 18,
            height: 18,
            borderRadius: 999,
            background: "white",
            boxShadow: "0 8px 18px rgba(0,0,0,0.14)",
            transition: "left 180ms ease",
          }}
        />
      </span>

      {label && (
        <span style={{ fontSize: 12, fontWeight: 750, color: "rgba(0,0,0,0.72)" }}>
          {label}
        </span>
      )}
    </button>
  );
}

export function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: "rgba(0,0,0,0.06)",
        margin: "14px 0",
        borderRadius: 999,
      }}
    />
  );
}
