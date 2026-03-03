export type CategoryKey = "elektronik" | "sport" | "office" | "gadgets" | "wissen" | "mode";

export type Product = {
  id: string;
  category: CategoryKey;
  title: string;
  priceCHF: number;
  rating: number;
  ratingCount: number;
  imageUrl: string;
};

export const EXTRA_PRODUCTS: Product[] = [
  {
    id: "uyuxio-bt54",
    category: "elektronik",
    title:
      "UYUXIO BT5.4 Kabellose Ohrhörer mit LED-Anzeige, HiFi-Stereo, IP7 wasserdicht, ENC Geräuschunterdrückung",
    priceCHF: 19.9,
    rating: 4.8,
    ratingCount: 1287,
    imageUrl: "",
  },
];
