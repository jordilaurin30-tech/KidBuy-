import { NextResponse } from "next/server";

function isValidDate(y: number, m: number, d: number) {
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return false;
  if (y < 1900 || y > 2100) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;

  // Check actual calendar validity (e.g. Feb 30 invalid)
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

function calcAge(y: number, m: number, d: number) {
  const now = new Date();
  let age = now.getFullYear() - y;
  const hasHadBirthdayThisYear =
    now.getMonth() + 1 > m || (now.getMonth() + 1 === m && now.getDate() >= d);
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const mode = typeof body?.mode === "string" ? body.mode : "";
  const dayStr = typeof body?.dob?.day === "string" ? body.dob.day.trim() : "";
  const monthStr = typeof body?.dob?.month === "string" ? body.dob.month.trim() : "";
  const yearStr = typeof body?.dob?.year === "string" ? body.dob.year.trim() : "";

  // Only digits
  const d = Number(dayStr.replace(/[^\d]/g, ""));
  const m = Number(monthStr.replace(/[^\d]/g, ""));
  const y = Number(yearStr.replace(/[^\d]/g, ""));

  if (mode !== "parent") {
    return NextResponse.json({ ok: false, message: "Ungültiger Modus." }, { status: 400 });
  }

  if (!isValidDate(y, m, d)) {
    return NextResponse.json(
      { ok: false, message: "Bitte ein echtes Geburtsdatum eingeben (Tag 1–31, Monat 1–12, Jahr korrekt)." },
      { status: 400 }
    );
  }

  const age = calcAge(y, m, d);

  if (age < 18) {
    return NextResponse.json(
      { ok: false, message: "Minderjährig: Elternkonto ist erst ab 18 Jahren möglich." },
      { status: 403 }
    );
  }

  // Optional demo flag (photo can be true/false) — not required for validation.
  // const hasIdPhoto = body?.hasIdPhoto === true;

  const res = NextResponse.json({ ok: true });

  res.cookies.set("kidbuy_parent_verified", "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}
