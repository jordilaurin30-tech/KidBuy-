import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export function supabaseAuthServer() {
  const cookieStore = cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL");
  if (!anon) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY");

  // ✅ READ-ONLY Client (liest Cookies aus dem Request)
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        const anyStore = cookieStore as any;
        if (typeof anyStore.getAll === "function") return anyStore.getAll();
        return [];
      },
      // ✅ Hier NICHT setzen (ohne Response geht das nicht sauber)
      setAll() {
        // absichtlich leer
      },
    },
  });
}

// ✅ WICHTIG: Client der Cookies AUCH IN DIE RESPONSE SCHREIBEN kann
export function supabaseAuthServerWithResponse(res: NextResponse) {
  const cookieStore = cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL");
  if (!anon) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        const anyStore = cookieStore as any;
        if (typeof anyStore.getAll === "function") return anyStore.getAll();
        return [];
      },

      // ✅ ERGÄNZT: JSDoc-Typ, damit "cookiesToSet" nicht als implicit any zählt (falls noImplicitAny aktiv ist)
      /** @param {Array<{ name: string; value: string; options?: any }>} cookiesToSet */
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, {
            ...options,
            // ✅ wichtig: localhost ist http -> secure MUSS false sein, sonst speichert Chrome nix
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          });
        });
      },
    },
  });
}

// =======================================================
// HELPER: Route-ready Supabase Client + Response
// =======================================================
export function supabaseAuthRouteHelper() {
  const res = new NextResponse();
  const supabase = supabaseAuthServerWithResponse(res);
  return { supabase, res };
}