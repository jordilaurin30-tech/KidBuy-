"use client";

export type CategoryKey =
  | "elektronik"
  | "sport"
  | "office"
  | "gadgets"
  | "wissen"
  | "mode";

export type ViewedItem = {
  id: string; // stabiler Key
  title: string;
  priceCHF: number;
  imageUrl?: string;
  category?: CategoryKey;
};

export const RECENT_KEY = "kidbuy_recent_viewed_v1";
const MAX_ITEMS = 20;
const LOCAL_EVENT = "kidbuy_recent_updated_v1";

function safeJsonParse(raw: string | null) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function readRecent(): ViewedItem[] {
  const data = safeJsonParse(window.localStorage.getItem(RECENT_KEY));
  if (!Array.isArray(data)) return [];
  return data.slice(0, MAX_ITEMS);
}

// kleine Hilfe: falls du keine Product-ID hast, bauen wir eine aus dem Titel
function makeIdFromTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .slice(0, 60);
}

export function addRecentViewed(input: {
  id?: string;
  title: string;
  priceCHF: number;
  image?: string; // dein Feld heißt "image"
  category?: CategoryKey;
}) {
  const item: ViewedItem = {
    id: input.id && String(input.id).trim().length ? String(input.id) : makeIdFromTitle(input.title),
    title: input.title,
    priceCHF: input.priceCHF,
    imageUrl: input.image,
    category: input.category,
  };

  const current = readRecent();
  const withoutDupes = current.filter((x) => x.id !== item.id);
  const next = [item, ...withoutDupes].slice(0, MAX_ITEMS);

  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));

  // wichtig: same-tab update triggern
  window.dispatchEvent(new Event(LOCAL_EVENT));
}

export function onRecentUpdated(cb: () => void) {
  const handler = () => cb();

  // other tabs
  const onStorage = (e: StorageEvent) => {
    if (e.key === RECENT_KEY) handler();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(LOCAL_EVENT, handler);
  window.addEventListener("focus", handler);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOCAL_EVENT, handler);
    window.removeEventListener("focus", handler);
  };
}
