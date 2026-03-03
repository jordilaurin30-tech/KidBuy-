"use client";

import React from "react";
import { CartProvider } from "./cart-context";

export default function CartProviderShell({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
