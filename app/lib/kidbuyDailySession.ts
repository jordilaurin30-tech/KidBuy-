// app/lib/kidbuyDailySession.ts

export type KidBuyDailyLogin = { name: string; dayKey: string };

const STORAGE_KEY = "kidbuy_daily_login";

function getTodayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function saveDailyLogin(name: string) {
  if (typeof window === "undefined") return;
  const clean = (name || "").trim();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: clean, dayKey: getTodayKey() }));
}

export function getDailyLogin(): KidBuyDailyLogin | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<KidBuyDailyLogin>;
    if (!parsed?.name || !parsed?.dayKey) return null;
    if (String(parsed.dayKey) !== getTodayKey()) return null;
    return { name: String(parsed.name), dayKey: String(parsed.dayKey) };
  } catch {
    return null;
  }
}

export function clearDailyLogin() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}