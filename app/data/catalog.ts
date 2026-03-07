export type CategoryKey =
  | "elektronik"
  | "kueche"
  | "sport"
  | "haus_garten"
  | "mode"
  | "Office"
  | "Gadgets";

export type CategoryTheme = {
  key: CategoryKey;
  label: string;
  // für Buttons / Highlights
  from: string;
  to: string;
  // leichter Seiten-Tint
  tint: string; // rgba(...)
};

export type Product = {
  id: string;
  category: CategoryKey;
  title: string;
  priceCHF: number;
  rating: number; // 0..5
  ratingCount: number;
  imageUrl: string; // supabase/public url
};

export const CATEGORY_THEMES = {
  elektronik: {
    key: "elektronik",
    label: "Elektronik",
    from: "#3B82F6",
    to: "#A5D8FF",
    tint: "rgba(59,130,246,0.06)",
  },
  Office: {
    key: "Office",
    label: "Office",
    from: "#34D399",
    to: "#D9FBE3",
    tint: "rgba(52,211,153,0.06)",
  },
  sport: {
    key: "sport",
    label: "Sport & Outdoor",
    from: "#EF4444",
    to: "#FCA5A5",
    tint: "rgba(239,68,68,0.06)",
  },
  Gadgets: {
    key: "Gadgets",
    label: "Gadgets",
    from: "#22C55E",
    to: "#BBF7D0",
    tint: "rgba(34,197,94,0.06)",
  },
  mode: {
    key: "mode",
    label: "Mode & Accessoires",
    from: "#F59E0B",
    to: "#FDE68A",
    tint: "rgba(245,158,11,0.06)",
  },
};

export const CATEGORIES = [
  CATEGORY_THEMES.mode,
  CATEGORY_THEMES.elektronik,
  CATEGORY_THEMES.Gadgets,
  CATEGORY_THEMES.sport,
  CATEGORY_THEMES.Office,
];

// ✅ Demo-Produkte (ersetzen wir später durch echte DB)
export const PRODUCTS: Product[] = [
  // Elektronik (du kannst hier echte supabase links einfügen)
  {
    id: "p-1",
    category: "elektronik",
    title: "PHILIPS 2025 Kabellose Kopfhörer – Neuer ...",
    priceCHF: 15.47,
    rating: 4.8,
    ratingCount: 2922,
    imageUrl:
      "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2013.%20Feb.%202026,%2020_49_23.png",
  },
  {
    id: "p-2",
    category: "elektronik",
    title: "PHILIPS TAT1320 HD Kabellose Kopfhörer",
    priceCHF: 13.05,
    rating: 4.6,
    ratingCount: 1250,
    imageUrl:
      "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2013.%20Feb.%202026,%2021_30_56.png",
  },

  // Sport
  {
    id: "p-3",
    category: "sport",
    title: "Sport Sneaker – Outdoor Komfort",
    priceCHF: 11.28,
    rating: 4.7,
    ratingCount: 4765,
    imageUrl: "https://picsum.photos/seed/sport1/700/700",
  },
  {
    id: "p-4",
    category: "sport",
    title: "Laufschuh – Leicht & flexibel",
    priceCHF: 17.04,
    rating: 4.5,
    ratingCount: 187,
    imageUrl: "https://picsum.photos/seed/sport2/700/700",
  },

  // Office
  {
    id: "p-5",
    category: "Office",
    title: "Office Set – Starter Pack",
    priceCHF: 19.90,
    rating: 4.4,
    ratingCount: 456,
    imageUrl: "https://picsum.photos/seed/kitchen1/700/700",
  },

  // Gadgets
  {
    id: "p-6",
    category: "Gadgets",
    title: "Mini Pflanze – Deko",
    priceCHF: 9.66,
    rating: 4.2,
    ratingCount: 765,
    imageUrl: "https://picsum.photos/seed/home1/700/700",
  },

  // Mode
  {
    id: "p-7",
    category: "mode",
    title: "Accessoire Bundle – Trend",
    priceCHF: 5.92,
    rating: 4.1,
    ratingCount: 3711,
    imageUrl: "https://picsum.photos/seed/mode1/700/700",
  },
];
