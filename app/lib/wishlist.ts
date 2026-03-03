export type WishlistItem = {
  id: string;
  title: string;
  priceCHF?: number;
  imageUrl: string;
  category?: string;
};

const LS_WISHLIST = "kidbuy_wishlist";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  return safeParse<WishlistItem[]>(localStorage.getItem(LS_WISHLIST), []);
}

export function writeWishlist(list: WishlistItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_WISHLIST, JSON.stringify(list));
  window.dispatchEvent(new Event("kidbuy_wishlist_updated"));
}

export function isInWishlist(id: string) {
  return readWishlist().some((x) => x.id === id);
}

export function toggleWishlist(item: WishlistItem) {
  const cur = readWishlist();
  const exists = cur.some((x) => x.id === item.id);
  const next = exists ? cur.filter((x) => x.id !== item.id) : [item, ...cur];
  writeWishlist(next);
  return !exists; // true = now added
}