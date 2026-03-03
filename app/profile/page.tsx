"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDailyLogin } from "../lib/kidbuyDailySession";
// ✅ NUR ERGÄNZT: Supabase (für Name fallback aus user_metadata)
import { supabaseBrowser } from "@/app/lib/supabase-browser";


/* ------------------------------ */
/* Storage Keys                   */
/* ------------------------------ */
const LS_PROFILE_AVATAR = "kidbuy_profile_avatar_dataurl";
const LS_USER_NAME = "kidbuy_user_name";

/* ------------------------------ */
/* FX (10 hochwertige Varianten)  */
/* ------------------------------ */

type FxType =
  | "confetti"
  | "sparkleBurst"
  | "firework"
  | "ribbons"
  | "glowPulse"
  | "starShower"
  | "emberFlame"
  | "bubblePop"
  | "checkWave"
  | "prismSwirl";

type FxItem = {
  id: number;
  type: FxType;
  createdAt: number;
  seed: number;
};

const FX_TYPES: FxType[] = [
  "confetti",
  "sparkleBurst",
  "firework",
  "ribbons",
  "glowPulse",
  "starShower",
  "emberFlame",
  "bubblePop",
  "checkWave",
  "prismSwirl",
];

const CATEGORIES = [
  { id: "fashion", label: "Fashion" },
  { id: "gaming", label: "Gaming" },
  { id: "tech", label: "Tech" },
  { id: "sport", label: "Sport" },
  { id: "school", label: "Schule" },
  { id: "home", label: "Home" },
  { id: "beauty", label: "Beauty" },
  { id: "toys", label: "Toys" },
];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------ */
/* Helpers: file -> dataURL       */
/* ------------------------------ */
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Konnte Bild nicht lesen"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

/* ------------------------------ */
/* PAGE                           */
/* ------------------------------ */

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  // Avatar: starts empty until user picks one
  const [avatar, setAvatar] = useState<string | null>(null);

  // Name from login/register
  const [displayName, setDisplayName] = useState<string>("");

  // Tabs
  const [tab, setTab] = useState<"products" | "cats" | "reviews">("products");

  // Following state
  const [following, setFollowing] = useState(false);

  // FX state
  const [fx, setFx] = useState<FxItem[]>([]);

  // Categories
  const [activeCat, setActiveCat] = useState<string | null>(null);

  // Slightly larger theme colors + soft bg
  const theme = useMemo(() => {
    return {
      blue: "#2563EB",
      blue2: "#3B82F6",
      green: "#22C55E",
      yellow: "#FACC15",
      red: "#EF4444",
      ink: "#0F172A",
      card: "rgba(255,255,255,0.92)",
    };
  }, []);

   /* ------------------------------
     ✅ Load persisted avatar + name
     ------------------------------ */
  useEffect(() => {
    // Avatar: load from localStorage (for now)
    const savedAvatar = typeof window !== "undefined" ? localStorage.getItem(LS_PROFILE_AVATAR) : null;
    if (savedAvatar) setAvatar(savedAvatar);

    // Name: 1) localStorage 2) Supabase user_metadata 3) daily login 4) fallback
    const dl = getDailyLogin?.();
    const nameFromDaily = dl?.name?.trim() || "";

    const nameFromLS = typeof window !== "undefined" ? localStorage.getItem(LS_USER_NAME)?.trim() : "";

    const pick = (s: any) => (typeof s === "string" ? s.trim() : "");

    (async () => {
      const fromLS = pick(nameFromLS);
      const fromDaily = pick(nameFromDaily);

      // 1) localStorage (Login/Register Name)
      if (fromLS) {
        setDisplayName(fromLS);
        return;
      }

      // 2) Supabase user_metadata.full_name
      try {
        const { data } = await supabaseBrowser.auth.getUser();
        const metaName = pick(data?.user?.user_metadata?.full_name);
        if (metaName) {
          try {
            localStorage.setItem(LS_USER_NAME, metaName);
          } catch {}
          setDisplayName(metaName);
          return;
        }
      } catch {}

      // 3) daily login fallback
      if (fromDaily) {
        setDisplayName(fromDaily);
        return;
      }

      // 4) final fallback
      setDisplayName("Profil");
    })();
  }, []);
    

  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to DataURL so it can be persisted immediately
    const dataUrl = await fileToDataURL(file);

    setAvatar(dataUrl);

    // ✅ Persist (now) - later we switch this to Supabase Storage + DB
    localStorage.setItem(LS_PROFILE_AVATAR, dataUrl);
  };

  const onPickAvatar = () => fileRef.current?.click();

  const triggerFX = () => {
    const type = FX_TYPES[Math.floor(Math.random() * FX_TYPES.length)];
    const id = Date.now() + Math.floor(Math.random() * 999);
    const seed = Math.floor(Math.random() * 1_000_000);

    setFx((prev) => [...prev, { id, type, createdAt: Date.now(), seed }]);

    window.setTimeout(() => {
      setFx((prev) => prev.filter((x) => x.id !== id));
    }, 3000);
  };

  const onFollowClick = () => {
    setFollowing((v) => !v);
    triggerFX();
  };

  const onCategoryClick = (id: string) => {
    setActiveCat((prev) => (prev === id ? null : id));
  };

  // ✅ Guthaben click -> navigate (wallet page comes later)
  const onWalletClick = () => {
    router.push("/wallet");
  };

  return (
    <main className="kb-page">
      {/* FX overlay top-right (Teams style) */}
      <div className="kb-fxLayer" aria-hidden>
        {fx.map((item) => (
          <FollowFX key={item.id} item={item} />
        ))}
      </div>

      {/* Top header */}
      <header className="kb-top">
        <div className="kb-brand">
          <span className="kb-kid">Kid</span>
          <span className="kb-buy">Buy</span>
          <span className="kb-sub">DEIN SHOP</span>
        </div>
      </header>

      {/* Main profile card */}
      <section className="kb-shell">
        <div className="kb-profile">
          {/* Avatar */}
          <div className="kb-avatarWrap" onClick={onPickAvatar} role="button" tabIndex={0}>
            <div className="kb-avatarRing" />
            <div className="kb-avatar">
              {avatar ? (
                <img src={avatar} alt="Profilbild" className="kb-avatarImg" />
              ) : (
                <div className="kb-avatarEmpty">
                  <div className="kb-plus">+</div>
                  <div className="kb-emptyText">Bild auswählen</div>
                </div>
              )}
            </div>
          </div>

          <input ref={fileRef} type="file" hidden accept="image/*" onChange={pickImage} />

          {/* Name + buttons */}
          <div className="kb-meta">
            <div className="kb-nameRow">
              <h1 className="kb-name">{displayName}</h1>
            </div>

            <div className="kb-actions">
              <button className={`kb-follow ${following ? "isOn" : ""}`} onClick={onFollowClick}>
                {following ? "✓ Gefolgt" : "+ Folgen"}
              </button>

              {/* ✅ Guthaben clickable */}
              <button className="kb-wallet" type="button" onClick={onWalletClick} title="Guthaben öffnen">
                <span className="kb-walletIcon">🎁</span>
                <span className="kb-walletLabel">Guthaben</span>
                <span className="kb-walletValue">€127,00</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <nav className="kb-tabs">
            <button className={`kb-tab ${tab === "products" ? "active" : ""}`} onClick={() => setTab("products")}>
              Produkte
            </button>
            <button className={`kb-tab ${tab === "cats" ? "active" : ""}`} onClick={() => setTab("cats")}>
              Lieblingskategorien
            </button>
            <button className={`kb-tab ${tab === "reviews" ? "active" : ""}`} onClick={() => setTab("reviews")}>
              Bewertungen
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="kb-content">
          {tab === "products" && (
            <>
              <h2 className="kb-h2">Lieblingsprodukte</h2>

              {/* Placeholder grid (no products yet) */}
              <div className="kb-grid4">
                <PlaceholderCard badge="Top" tone="yellow" />
                <PlaceholderCard />
                <PlaceholderCard badge="Neu" tone="green" />
                <PlaceholderCard badge="Sale" tone="red" />
              </div>

              <h2 className="kb-h2" style={{ marginTop: 40 }}>
                Zuletzt angesehen
              </h2>

              <div className="kb-grid3">
                <PlaceholderWide />
                <PlaceholderWide />
                <PlaceholderWide />
              </div>

              <div className="kb-note">
                Produkte kommen später – hier ist nur das Raster/Design, damit du schon alles klicken/sehen kannst.
              </div>
            </>
          )}

          {tab === "cats" && (
            <>
              <h2 className="kb-h2">Lieblingskategorien</h2>
              <div className="kb-catsWrap">
                <div className="kb-catsGrid">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      className={`kb-cat ${activeCat === c.id ? "active" : ""}`}
                      onClick={() => onCategoryClick(c.id)}
                      type="button"
                    >
                      <div className="kb-catGlow" aria-hidden />
                      <div className="kb-catLabel">{c.label}</div>
                      <div className="kb-catSub">{activeCat === c.id ? "Aktiv" : "Tippen"}</div>
                    </button>
                  ))}
                </div>

                <div className="kb-catPanel">
                  <div className="kb-catPanelTitle">Ausgewählt</div>
                  <div className="kb-catPanelBody">
                    {activeCat ? (
                      <div className="kb-pill">
                        {CATEGORIES.find((x) => x.id === activeCat)?.label}
                        <button className="kb-pillX" onClick={() => setActiveCat(null)} type="button">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="kb-muted">Klicke eine Kategorie an – dann erscheint sie hier.</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === "reviews" && (
            <>
              <h2 className="kb-h2">Bewertungen</h2>
              <div className="kb-reviewBox">
                <div className="kb-reviewStar">★★★★★</div>
                <div className="kb-reviewText">Hier kommen später Bewertungen rein. (Platzhalter)</div>
              </div>
            </>
          )}
        </div>
      </section>

      <style jsx>{`
        .kb-page{
          min-height:100vh;
          padding: 34px 18px 90px;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
          color: ${theme.ink};
          background:
            radial-gradient(1200px 680px at 16% 12%, rgba(59,130,246,0.14), transparent 60%),
            radial-gradient(1200px 700px at 86% 18%, rgba(250,204,21,0.12), transparent 58%),
            radial-gradient(1200px 700px at 74% 58%, rgba(34,197,94,0.10), transparent 60%),
            radial-gradient(1200px 700px at 38% 78%, rgba(239,68,68,0.08), transparent 62%),
            linear-gradient(180deg, #F7FAFF 0%, #FFFFFF 58%, #F8FBFF 100%);
          overflow-x:hidden;
        }

        .kb-top{ max-width: 1180px; margin: 0 auto 18px; }
        .kb-brand{ display:inline-flex; align-items:baseline; gap: 10px; user-select:none; }
        .kb-kid{ font-weight:950; font-size: 30px; letter-spacing:-0.6px; color:#111827; }
        .kb-buy{ font-weight:950; font-size: 30px; letter-spacing:-0.6px; color:${theme.blue}; }
        .kb-sub{ font-weight:800; font-size: 14px; letter-spacing: 1.6px; color: rgba(15,23,42,0.55); margin-left: 6px; transform: translateY(-2px); }

        .kb-shell{ max-width: 1180px; margin: 0 auto; }

        .kb-profile{
          position:relative;
          display:grid;
          grid-template-columns: 160px 1fr;
          gap: 26px;
          align-items:center;
          background: ${theme.card};
          border: 1px solid rgba(15,23,42,0.10);
          border-radius: 30px;
          padding: 26px 26px 18px;
          box-shadow: 0 30px 90px rgba(0,0,0,0.12);
          backdrop-filter: blur(10px);
        }

        .kb-avatarWrap{
          position:relative;
          width: 150px;
          height: 150px;
          cursor:pointer;
          display:grid;
          place-items:center;
        }
        .kb-avatarRing{
          position:absolute;
          inset: 0;
          border-radius: 999px;
          background: conic-gradient(from 140deg, ${theme.red}, ${theme.yellow}, ${theme.green}, ${theme.blue2}, ${theme.red});
          box-shadow: 0 18px 55px rgba(0,0,0,0.18);
        }
        .kb-avatar{
          position:relative;
          width: 134px;
          height: 134px;
          border-radius: 999px;
          background: rgba(255,255,255,0.96);
          border: 6px solid rgba(255,255,255,0.95);
          overflow:hidden;
          display:grid;
          place-items:center;
        }
        .kb-avatarImg{ width:100%; height:100%; object-fit:cover; display:block; }
        .kb-avatarEmpty{
          display:flex;
          flex-direction:column;
          align-items:center;
          gap: 6px;
          color: rgba(15,23,42,0.55);
          font-weight: 900;
          user-select:none;
        }
        .kb-plus{
          width: 44px;
          height: 44px;
          border-radius: 16px;
          display:grid;
          place-items:center;
          background: rgba(15,23,42,0.06);
          border: 1px solid rgba(15,23,42,0.08);
          font-size: 26px;
          color: rgba(15,23,42,0.65);
        }
        .kb-emptyText{ font-size: 13px; letter-spacing: -0.1px; }

        .kb-meta{ display:flex; flex-direction:column; gap: 12px; }
        .kb-nameRow{ display:flex; align-items:baseline; gap: 12px; }
        .kb-name{ margin:0; font-size: 46px; line-height: 1.05; letter-spacing: -0.8px; font-weight: 950; }

        .kb-actions{ display:flex; gap: 16px; flex-wrap:wrap; align-items:center; }

        .kb-follow{
          height: 56px;
          padding: 0 22px;
          border-radius: 16px;
          border: none;
          cursor:pointer;
          background: linear-gradient(180deg, ${theme.blue2}, ${theme.blue});
          color: white;
          font-weight: 950;
          font-size: 18px;
          box-shadow: 0 18px 55px rgba(37,99,235,0.25);
          transition: transform .16s cubic-bezier(.2,.8,.2,1), filter .16s;
        }
        .kb-follow:hover{ transform: translateY(-2px); filter: saturate(1.08); }
        .kb-follow.isOn{
          background: linear-gradient(180deg, rgba(34,197,94,1), rgba(34,197,94,0.86));
          box-shadow: 0 18px 55px rgba(34,197,94,0.20);
        }

        /* wallet button */
        .kb-wallet{
          height: 56px;
          display:flex;
          align-items:center;
          gap: 10px;
          padding: 0 18px;
          border-radius: 16px;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 16px 45px rgba(0,0,0,0.10);
          font-weight: 900;
          color: rgba(15,23,42,0.72);
          cursor: pointer;
          transition: transform .16s cubic-bezier(.2,.8,.2,1);
        }
        .kb-wallet:hover{ transform: translateY(-2px); }
        .kb-walletIcon{ font-size: 18px; }
        .kb-walletLabel{ opacity: .8; }
        .kb-walletValue{ color: ${theme.ink}; }

        .kb-tabs{
          grid-column: 1 / -1;
          display:flex;
          gap: 34px;
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid rgba(15,23,42,0.08);
        }
        .kb-tab{
          background: transparent;
          border: none;
          cursor: pointer;
          font-weight: 900;
          font-size: 18px;
          color: rgba(15,23,42,0.55);
          padding: 10px 0;
          position:relative;
        }
        .kb-tab.active{ color: ${theme.ink}; }
        .kb-tab.active::after{
          content:"";
          position:absolute;
          left:0;
          bottom:-6px;
          height:4px;
          width:100%;
          background:${theme.blue2};
          border-radius: 999px;
        }

        .kb-content{
          margin-top: 22px;
          background: rgba(255,255,255,0.70);
          border: 1px solid rgba(15,23,42,0.06);
          border-radius: 26px;
          padding: 24px;
          box-shadow: 0 22px 70px rgba(0,0,0,0.08);
          backdrop-filter: blur(10px);
        }
        .kb-h2{ margin: 0 0 18px; font-size: 28px; font-weight: 950; letter-spacing: -0.3px; }

        .kb-grid4{ display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 22px; }
        .kb-grid3{ display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
        .kb-note{ margin-top: 18px; font-weight: 850; color: rgba(15,23,42,0.55); }

        .kb-catsWrap{ display:grid; grid-template-columns: 1.4fr 0.9fr; gap: 22px; align-items:start; }
        .kb-catsGrid{ display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
        .kb-cat{
          position:relative;
          border:none;
          cursor:pointer;
          border-radius: 18px;
          padding: 16px 14px;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 16px 45px rgba(0,0,0,0.10);
          text-align:left;
          overflow:hidden;
          transition: transform .16s cubic-bezier(.2,.8,.2,1), box-shadow .16s;
        }
        .kb-cat:hover{ transform: translateY(-3px); box-shadow: 0 22px 60px rgba(0,0,0,0.14); }
        .kb-catGlow{
          position:absolute;
          inset:-30px;
          background:
            radial-gradient(140px 120px at 20% 25%, rgba(250,204,21,0.28), transparent 60%),
            radial-gradient(140px 120px at 80% 30%, rgba(59,130,246,0.22), transparent 60%),
            radial-gradient(140px 120px at 60% 85%, rgba(34,197,94,0.18), transparent 60%),
            radial-gradient(140px 120px at 40% 70%, rgba(239,68,68,0.14), transparent 60%);
          filter: blur(10px);
          opacity: 0.9;
          pointer-events:none;
        }
        .kb-catLabel{ position:relative; z-index:1; font-weight: 950; font-size: 18px; color: ${theme.ink}; letter-spacing: -0.2px; }
        .kb-catSub{ position:relative; z-index:1; margin-top: 6px; font-weight: 900; font-size: 13px; color: rgba(15,23,42,0.55); }
        .kb-cat.active{ outline: 3px solid rgba(59,130,246,0.40); transform: translateY(-2px); }

        .kb-catPanel{
          border-radius: 20px;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 18px 55px rgba(0,0,0,0.10);
          padding: 18px;
        }
        .kb-catPanelTitle{ font-weight: 950; font-size: 16px; color: ${theme.ink}; margin-bottom: 10px; }
        .kb-catPanelBody{ display:flex; align-items:center; gap: 10px; flex-wrap:wrap; min-height: 54px; }
        .kb-muted{ font-weight: 900; color: rgba(15,23,42,0.55); }
        .kb-pill{
          display:inline-flex;
          align-items:center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 999px;
          background: rgba(59,130,246,0.10);
          border: 1px solid rgba(59,130,246,0.20);
          font-weight: 950;
          color: ${theme.ink};
        }
        .kb-pillX{
          border:none;
          background: rgba(15,23,42,0.06);
          width: 30px;
          height: 30px;
          border-radius: 12px;
          cursor:pointer;
          font-weight: 950;
          color: rgba(15,23,42,0.65);
        }

        .kb-reviewBox{
          border-radius: 22px;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 18px 55px rgba(0,0,0,0.10);
          padding: 22px;
          display:flex;
          align-items:center;
          gap: 14px;
        }
        .kb-reviewStar{ color: ${theme.yellow}; font-weight: 950; letter-spacing: 2px; font-size: 18px; }
        .kb-reviewText{ font-weight: 900; color: rgba(15,23,42,0.60); }

        .kb-fxLayer{
          position: fixed;
          top: 16px;
          right: 16px;
          pointer-events: none;
          z-index: 9999;
          width: 320px;
          height: 220px;
        }

        @media (max-width: 980px){
          .kb-profile{ grid-template-columns: 1fr; }
          .kb-tabs{ justify-content: space-between; gap: 10px; }
          .kb-grid4{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .kb-grid3{ grid-template-columns: 1fr; }
          .kb-catsWrap{ grid-template-columns: 1fr; }
          .kb-catsGrid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
      `}</style>
    </main>
  );
}

/* ------------------------------ */
/* Placeholders                   */
/* ------------------------------ */

function PlaceholderCard({ badge, tone }: { badge?: string; tone?: "yellow" | "green" | "red" | "blue" }) {
  const map: Record<string, string> = {
    yellow: "rgba(250,204,21,0.95)",
    green: "rgba(34,197,94,0.95)",
    red: "rgba(239,68,68,0.92)",
    blue: "rgba(59,130,246,0.95)",
  };

  return (
    <div className="phCard">
      {badge ? (
        <div className="phBadge" style={{ background: map[tone ?? "blue"] ?? map.blue }}>
          {badge}
        </div>
      ) : null}
      <div className="phImage" />
      <style>{`
        .phCard{
          height: 190px;
          border-radius: 22px;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 18px 55px rgba(0,0,0,0.10);
          position:relative;
          overflow:hidden;
        }
        .phImage{
          position:absolute;
          inset: 0;
          background:
            radial-gradient(280px 160px at 30% 25%, rgba(250,204,21,0.18), transparent 65%),
            radial-gradient(260px 180px at 80% 30%, rgba(59,130,246,0.14), transparent 65%),
            radial-gradient(260px 180px at 55% 85%, rgba(34,197,94,0.12), transparent 65%),
            linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,255,0.92));
        }
        .phBadge{
          position:absolute;
          top: 12px;
          left: 12px;
          padding: 8px 14px;
          border-radius: 999px;
          color: white;
          font-weight: 950;
          font-size: 13px;
          box-shadow: 0 16px 45px rgba(0,0,0,0.12);
          z-index: 2;
        }
      `}</style>
    </div>
  );
}

function PlaceholderWide() {
  return (
    <div className="phWide">
      <div className="phWideImg" />
      <style>{`
        .phWide{
          height: 190px;
          border-radius: 22px;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 18px 55px rgba(0,0,0,0.10);
          overflow:hidden;
          position:relative;
        }
        .phWideImg{
          position:absolute;
          inset: 0;
          background:
            radial-gradient(260px 160px at 20% 35%, rgba(59,130,246,0.14), transparent 65%),
            radial-gradient(260px 160px at 78% 32%, rgba(250,204,21,0.14), transparent 65%),
            radial-gradient(260px 160px at 55% 85%, rgba(34,197,94,0.12), transparent 65%),
            linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,255,0.92));
        }
      `}</style>
    </div>
  );
}

/* ------------------------------ */
/* Follow FX Component            */
/* ------------------------------ */

function FollowFX({ item }: { item: FxItem }) {
  const rand = useMemo(() => mulberry32(item.seed), [item.seed]);

  const particles = useMemo(() => {
    const count =
      item.type === "glowPulse" ? 0 :
      item.type === "checkWave" ? 10 :
      item.type === "prismSwirl" ? 14 :
      item.type === "ribbons" ? 16 :
      item.type === "firework" ? 18 :
      item.type === "bubblePop" ? 18 :
      item.type === "emberFlame" ? 20 :
      item.type === "starShower" ? 22 :
      item.type === "sparkleBurst" ? 24 :
      26;

    const out: Array<{
      x: number; y: number; s: number; r: number; d: number;
      t: "sq" | "dot" | "star" | "spark";
      hue: "red" | "yellow" | "green" | "blue";
    }> = [];

    const hues: Array<"red" | "yellow" | "green" | "blue"> = ["red", "yellow", "green", "blue"];

    for (let i = 0; i < count; i++) {
      const x = rand() * 260;
      const y = rand() * 120 + 30;
      const s = 6 + rand() * 12;
      const r = (rand() * 80 - 40) | 0;
      const d = rand() * 0.35;
      const tPick = rand();
      const t: "sq" | "dot" | "star" | "spark" =
        tPick < 0.25 ? "sq" : tPick < 0.55 ? "dot" : tPick < 0.8 ? "star" : "spark";
      out.push({ x, y, s, r, d, t, hue: hues[Math.floor(rand() * hues.length)] });
    }
    return out;
  }, [item.type, rand]);

  return (
    <div className={`fxRoot ${item.type}`}>
      <div className="fxToast">
        <div className="fxToastIcon">{item.type === "checkWave" ? "✅" : "✨"}</div>
        <div className="fxToastText">Folgen</div>
      </div>

      <div className="fxRing" />
      <div className="fxFlare" />

      {particles.map((p, idx) => (
        <span
          key={idx}
          className={`p ${p.t} ${p.hue}`}
          style={{
            left: p.x,
            top: p.y,
            width: p.s,
            height: p.s,
            transform: `rotate(${p.r}deg)`,
            animationDelay: `${p.d}s`,
          }}
        />
      ))}

      <style>{`
        .fxRoot{ position:absolute; top:0; right:0; width:320px; height:220px; overflow:hidden; }

        .fxToast{
          position:absolute;
          top:10px; right:10px;
          display:flex; align-items:center; gap:10px;
          padding:10px 12px;
          border-radius:14px;
          background: rgba(255,255,255,0.88);
          border:1px solid rgba(15,23,42,0.08);
          box-shadow: 0 18px 55px rgba(0,0,0,0.12);
          backdrop-filter: blur(10px);
          transform-origin: 90% 10%;
          animation: toastIn 520ms cubic-bezier(.2,.9,.2,1) both;
        }
        .fxToastIcon{
          width:34px; height:34px; border-radius:14px;
          display:grid; place-items:center;
          background: rgba(15,23,42,0.06);
          border: 1px solid rgba(15,23,42,0.08);
          font-size:18px;
        }
        .fxToastText{ font-weight:950; color: rgba(15,23,42,0.80); }

        @keyframes toastIn{
          0%{ opacity:0; transform: translateY(-6px) scale(.92); }
          60%{ opacity:1; transform: translateY(0) scale(1.02); }
          100%{ opacity:1; transform: translateY(0) scale(1); }
        }

        .fxRing{
          position:absolute; right:44px; top:50px;
          width:90px; height:90px; border-radius:999px;
          border:2px solid rgba(59,130,246,0.30);
          box-shadow: 0 0 0 10px rgba(59,130,246,0.06);
          opacity:0;
          animation: ring 900ms ease-out 60ms forwards;
        }
        @keyframes ring{
          0%{ transform: scale(.65); opacity: 0; }
          20%{ opacity: 1; }
          100%{ transform: scale(1.25); opacity: 0; }
        }

        .fxFlare{
          position:absolute; right:54px; top:60px;
          width:70px; height:70px; border-radius:999px;
          background:
            radial-gradient(circle at 30% 30%, rgba(250,204,21,0.9), transparent 55%),
            radial-gradient(circle at 70% 40%, rgba(34,197,94,0.7), transparent 60%),
            radial-gradient(circle at 50% 78%, rgba(59,130,246,0.75), transparent 60%),
            radial-gradient(circle at 45% 55%, rgba(239,68,68,0.55), transparent 62%);
          filter: blur(10px);
          opacity:0;
          animation: flare 1200ms ease-in-out 80ms forwards;
        }
        @keyframes flare{
          0%{ opacity: 0; transform: scale(.75); }
          30%{ opacity: 0.95; transform: scale(1.05); }
          100%{ opacity: 0; transform: scale(1.25); }
        }

        .p{ position:absolute; border-radius:999px; opacity:0; will-change: transform, opacity; }
        .p.sq{ border-radius:4px; }
        .p.star{ clip-path: polygon(50% 0%, 62% 35%, 98% 35%, 68% 57%, 80% 92%, 50% 70%, 20% 92%, 32% 57%, 2% 35%, 38% 35%); }

        .p.red{ background: rgba(239,68,68,0.95); }
        .p.yellow{ background: rgba(250,204,21,0.95); }
        .p.green{ background: rgba(34,197,94,0.95); }
        .p.blue{ background: rgba(59,130,246,0.95); }

        .p{ animation: floatUp 3s ease forwards; }
        @keyframes floatUp{
          0%{ opacity:0; transform: translate3d(0,18px,0) scale(.75) rotate(0deg); }
          12%{ opacity:1; }
          100%{ opacity:0; transform: translate3d(0,-120px,0) scale(1.05) rotate(40deg); }
        }

        .confetti .p{ animation: confetti 3s cubic-bezier(.2,.8,.2,1) forwards; }
        @keyframes confetti{
          0%{ opacity:0; transform: translate3d(0,0,0) scale(.7) rotate(0deg); }
          10%{ opacity:1; }
          100%{ opacity:0; transform: translate3d(-30px,120px,0) scale(1) rotate(220deg); }
        }

        .sparkleBurst .p{ animation: sparkle 3s ease forwards; }
        @keyframes sparkle{
          0%{ opacity:0; transform: translate3d(0,10px,0) scale(.5) rotate(0deg); }
          14%{ opacity:1; transform: translate3d(0,0,0) scale(1.1) rotate(10deg); }
          100%{ opacity:0; transform: translate3d(0,-110px,0) scale(.95) rotate(90deg); }
        }

        .firework .p{ animation: firework 3s ease forwards; }
        @keyframes firework{
          0%{ opacity:0; transform: translate3d(0,30px,0) scale(.55); }
          12%{ opacity:1; transform: translate3d(0,0,0) scale(1); }
          100%{ opacity:0; transform: translate3d(0,-140px,0) scale(.9); }
        }

        .ribbons .p.sq{
          width: 10px !important;
          height: 22px !important;
          border-radius: 8px !important;
          animation: ribbon 3s ease forwards;
        }
        @keyframes ribbon{
          0%{ opacity:0; transform: translate3d(0,10px,0) rotate(-10deg); }
          12%{ opacity:1; }
          100%{ opacity:0; transform: translate3d(30px,-120px,0) rotate(180deg); }
        }

        .glowPulse .p{ display:none; }
        .glowPulse .fxRing{ border-color: rgba(250,204,21,0.30); box-shadow: 0 0 0 10px rgba(250,204,21,0.06); }
        .glowPulse .fxFlare{ animation: flare 1600ms ease-in-out 80ms forwards; }

        .starShower .p.star{ animation: starFall 3s ease forwards; }
        @keyframes starFall{
          0%{ opacity:0; transform: translate3d(0,-30px,0) scale(.6) rotate(0deg); }
          12%{ opacity:1; }
          100%{ opacity:0; transform: translate3d(-20px,140px,0) scale(.95) rotate(180deg); }
        }

        .emberFlame .p.dot{ animation: ember 3s ease forwards; }
        @keyframes ember{
          0%{ opacity:0; transform: translate3d(0,20px,0) scale(.7); }
          12%{ opacity:1; }
          40%{ opacity:0.9; transform: translate3d(10px,-40px,0) scale(1); }
          100%{ opacity:0; transform: translate3d(14px,-130px,0) scale(.9); }
        }

        .bubblePop .p{
          animation: bubble 3s ease forwards;
          background: rgba(255,255,255,0.60) !important;
          border: 1px solid rgba(15,23,42,0.10);
          backdrop-filter: blur(6px);
        }
        @keyframes bubble{
          0%{ opacity:0; transform: translate3d(0,20px,0) scale(.6); }
          18%{ opacity:1; }
          100%{ opacity:0; transform: translate3d(0,-130px,0) scale(1.15); }
        }

        .checkWave .fxRing{
          border-color: rgba(34,197,94,0.35);
          box-shadow: 0 0 0 10px rgba(34,197,94,0.08);
        }

        .prismSwirl .p{ animation: swirl 3s ease forwards; }
        @keyframes swirl{
          0%{ opacity:0; transform: translate3d(0,20px,0) scale(.75) rotate(0deg); }
          14%{ opacity:1; }
          60%{ opacity:0.9; transform: translate3d(-26px,-60px,0) scale(1.05) rotate(120deg); }
          100%{ opacity:0; transform: translate3d(18px,-130px,0) scale(.95) rotate(220deg); }
        }
      `}</style>
    </div>
  );
}