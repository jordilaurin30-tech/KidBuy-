"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  title: string;
  priceCHF: number;
  imageUrl?: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "kidbuy_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addItem: CartContextValue["addItem"] = (item, qty = 1) => {
    const safeQty = Math.max(1, Math.min(99, qty));

    // ✅ Added: mark "fresh add" so CartCheerAI can show a message
    try {
      localStorage.setItem("kidbuy_cart_last_add", String(Date.now()));
    } catch {}

    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + safeQty } : p));
      }
      return [...prev, { ...item, qty: safeQty }];
    });
  };

  const removeItem: CartContextValue["removeItem"] = (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const setQty: CartContextValue["setQty"] = (id, qty) => {
    const safeQty = Math.max(1, Math.min(99, qty));
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: safeQty } : p)));
  };

  const clear = () => setItems([]);

  const subtotal = useMemo(() => items.reduce((sum, p) => sum + p.priceCHF * p.qty, 0), [items]);
  const count = useMemo(() => items.reduce((sum, p) => sum + p.qty, 0), [items]);

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    setQty,
    clear,
    subtotal,
    count,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}