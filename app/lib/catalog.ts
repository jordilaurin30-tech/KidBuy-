// app/lib/catalog.ts
export type CatalogProduct = {
  id: string;
  name: string;
  unitAmountCents: number; // z.B. 999 = 9,99€
};

export const CATALOG: Record<string, CatalogProduct> = {
  demo1: { id: "demo1", name: "KidBuy Demo Item", unitAmountCents: 999 },
  demo2: { id: "demo2", name: "KidBuy Sticker Pack", unitAmountCents: 299 },
};