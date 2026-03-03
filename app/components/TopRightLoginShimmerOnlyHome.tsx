"use client";

import React from "react";
import { usePathname } from "next/navigation";
import TopRightLoginShimmer from "@/app/components/TopRightLoginShimmer";

export default function TopRightLoginShimmerOnlyHome() {
  const pathname = usePathname() || "/";
  if (pathname !== "/") return null;
  return <TopRightLoginShimmer />;
}