// app/data/product-details.ts

export type ProductSpecRow = { label: string; value: string };

export type ProductDetails = {
  id: string;                 // muss zu catalog.ts Produkt id passen
  description: string;        // Text oben
  bullets: string[];          // Bulletpoints (4-6)
  images: string[];           // deine 6 Bilder (oder mehr)
  videoUrl?: string;          // optional
  specs: ProductSpecRow[];    // Tabelle
  highlights?: string[];      // optional: kurze “Werbung” / USPs
};

// ✅ Map: id -> details
export const PRODUCT_DETAILS: Record<string, ProductDetails> = {
  // ✅ DEIN KOPFHÖRER PRODUKT (Beispiel-ID: "produkt1" oder "p-1" – MUSS GENAU PASSEN!)
  // ⚠️ WICHTIG: Diese id muss exakt die gleiche sein wie im catalog.ts bei deinem Produkt.
  "produkt1": {
    id: "produkt1",
    description:
      "Kabellose Ohrhörer mit LED-Anzeige, HiFi-Stereo und ENC-Geräuschunterdrückung – ideal für Alltag, Sport und Schule.",
    bullets: [
      "Bluetooth 5.4 – stabile Verbindung & schneller Pairing-Start",
      "LED-Anzeige am Case – Akku-Status jederzeit sichtbar",
      "ENC Geräuschunterdrückung – klare Calls & besserer Sound",
      "IP7 wasserdicht – geeignet für Sport & Regen",
    ],
    images: [
      "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2018.%20Feb.%202026,%2015_14_39.png",
      "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2018.%20Feb.%202026,%2015_32_07.png",
      "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2018.%20Feb.%202026,%2015_32_13.png",
      "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2018.%20Feb.%202026,%2015_32_23.png",
      "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2018.%20Feb.%202026,%2016_12_24.png",
      "https://tosyddrymxmxcjkcdnmu.supabase.co/storage/v1/object/public/products/ChatGPT%20Image%2018.%20Feb.%202026,%2016_13_58.png",
    ],
    // videoUrl: "", // später optional
    specs: [
      { label: "Modell", value: "UYUXIO BT5.4" },
      { label: "Bluetooth", value: "5.4" },
      { label: "Sound", value: "HiFi Stereo" },
      { label: "Noise Cancelling", value: "ENC" },
      { label: "Wasserfest", value: "IP7" },
      { label: "Anzeige", value: "LED Ladecase" },
    ],
    highlights: [
      "Schnell verbunden",
      "Stark im Alltag",
      "Perfekt als Geschenk",
    ],
  },
};
