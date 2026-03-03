import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="kb-wrap">
      {/* Header */}
      <header className="kb-header">
        <div className="kb-logo" aria-label="KidBuy dein Shop">
          <span className="kb-logo-kid">Kid</span>
          <span className="kb-logo-buy">Buy</span>
          <span className="kb-logo-sub">DEIN SHOP</span>
        </div>
      </header>

      {/* Hero */}
      <section className="kb-hero">
        {/* Left */}
        <div className="kb-left">
          <h1 className="kb-title">
            Bestellung
            <br />
            <span className="kb-title-grad">abgebrochen</span>
          </h1>

          <Link href="/cart" className="kb-cta">
            Zurück zum Warenkorb
          </Link>
        </div>

        {/* Right */}
        <div className="kb-right" aria-hidden>
          <div className="kb-glow">
            {/* free-floating glow layer (no box) */}
            <span className="kb-glowLayer" aria-hidden />

            {/* decorative dots */}
            <span className="kb-dot d1" />
            <span className="kb-dot d2" />
            <span className="kb-dot d3" />
            <span className="kb-dot d4" />
            <span className="kb-dot d5" />
            <span className="kb-dot d6" />
            <span className="kb-dot d7" />
            <span className="kb-dot d8" />

            {/* small chat bubble icon */}
            <div className="kb-mini-bubble" />

            {/* speech bubble (pops in on page load) */}
            <div className="kb-speech">
              Keine Sorge, es wurde noch kein Geld
              <br />
              abgebucht. Geh einfach zurück zum
              <br />
              Warenkorb und versuche es erneut.
              <span className="kb-speech-tail" />
            </div>

            {/* big face */}
            <div className="kb-face">
              <div className="kb-eye left" />
              <div className="kb-eye right" />

              {/* HAPPY mouth (default) */}
              <div className="kb-smile" />

              {/* ANGRY mouth (shows first 5s) */}
              <div className="kb-angryMouth" />

              {/* ANGRY brows (shows first 5s) */}
              <div className="kb-angryBrow b-left" />
              <div className="kb-angryBrow b-right" />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom features */}
      <section className="kb-features">
        <div className="kb-feature">
          <div className="kb-icon green">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 2l7 4v6c0 5-3 9-7 10C8 21 5 17 5 12V6l7-4z"
                stroke="currentColor"
                strokeWidth="1.7"
                opacity="0.9"
              />
              <path
                d="M8.5 12.2l2.1 2.2 5-5.4"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="kb-feature-text">
            <div className="kb-feature-title">Sicher &amp; zuverlässig</div>
          </div>
        </div>

        <div className="kb-divider" />

        <div className="kb-feature">
          <div className="kb-icon blue">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 12a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path
                d="M4 12v5a2 2 0 0 0 2 2h1v-7H6a2 2 0 0 0-2 2z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M20 12v5a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d="M9 20h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="kb-feature-text">
            <div className="kb-feature-title">24/7 Support</div>
          </div>
        </div>

        <div className="kb-divider" />

        <div className="kb-feature">
          <div className="kb-icon blueLight">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="7" y="2.8" width="10" height="18.4" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M10 18.3h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="kb-feature-text">
            <div className="kb-feature-title">Einfach shoppen</div>
          </div>
        </div>
      </section>

      <style>{`
        /* ===== Base ===== */
        .kb-wrap{
          min-height: 100vh;
          background:
            radial-gradient(900px 520px at 18% 18%, rgba(59,130,246,0.12), transparent 60%),
            radial-gradient(900px 520px at 78% 20%, rgba(255, 186, 70, 0.14), transparent 60%),
            radial-gradient(1000px 700px at 50% 86%, rgba(2,6,23,0.06), transparent 65%),
            linear-gradient(180deg, #F6FAFF 0%, #FFFFFF 58%, #F7FBFF 100%);
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
          color: #0F172A;
          overflow: hidden;
        }

        /* ===== Header ===== */
        .kb-header{
          padding: 28px 52px 8px;
        }
        .kb-logo{
          display: inline-flex;
          align-items: baseline;
          gap: 10px;
          user-select: none;
        }
        .kb-logo-kid{
          font-weight: 900;
          font-size: 30px;
          letter-spacing: -0.6px;
          color: #111827;
        }
        .kb-logo-buy{
          font-weight: 900;
          font-size: 30px;
          letter-spacing: -0.6px;
          color: #2563EB;
        }
        .kb-logo-sub{
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 1.6px;
          color: rgba(15,23,42,0.55);
          margin-left: 6px;
          transform: translateY(-2px);
        }

        /* ===== Hero layout ===== */
        .kb-hero{
          max-width: 1180px;
          margin: 0 auto;
          padding: 34px 52px 28px;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          align-items: center;
          gap: 40px;
        }

        .kb-title{
  font-size: 74px;
  line-height: 1.15;   /* war zu klein → jetzt genug Platz */
  margin: 0 0 50px;    /* mehr Abstand nach unten */
  font-weight: 900;
  color: rgba(15,23,42,0.92);
}    
   /* NEW: gradient text for "abgebrochen" (red/green/blue/yellow) */
        .kb-title-grad{
          background: linear-gradient(
            90deg,
            rgba(255, 70, 90, 1) 0%,
            rgba(255, 214, 90, 1) 32%,
            rgba(34, 220, 110, 1) 62%,
            rgba(59, 150, 255, 1) 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          display: inline-block;
          text-shadow: 0 10px 26px rgba(0,0,0,0.08); /* subtle clean depth */

padding-bottom: 10px;
display: inline-block;

        }

        /* CTA */
        .kb-cta{
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 62px;
          min-width: 420px;
          padding: 0 28px;
          background: #F4C430;
          color: rgba(255,255,255,0.95);
          font-weight: 800;
          font-size: 22px;
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 18px 45px rgba(0,0,0,0.12);
          transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
          margin-top: 30px;
        }
        .kb-cta:hover{
          transform: translateY(-1px);
          box-shadow: 0 22px 56px rgba(0,0,0,0.14);
          filter: saturate(1.02);
        }
        .kb-cta:active{ transform: translateY(0px); }

        /* ===== Right panel ===== */
        .kb-right{
          display: grid;
          place-items: center;
        }

        .kb-glow{
          position: relative;
          width: 520px;
          height: 420px;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          overflow: visible;
        }

        /* Free floating blended glow (brighter + includes RED) */
        .kb-glowLayer{
          position: absolute;
          inset: -90px -110px -110px -110px;
          border-radius: 999px;
          background:
            radial-gradient(280px 280px at 34% 28%, rgba(255, 214, 90, 1.00), rgba(255,214,90,0.0) 72%),   /* yellow */
            radial-gradient(320px 280px at 70% 50%, rgba(34, 220, 110, 0.70), rgba(34,220,110,0.0) 74%),    /* green */
            radial-gradient(380px 320px at 54% 84%, rgba(59, 150, 255, 0.75), rgba(59,150,255,0.0) 76%),    /* blue */
            radial-gradient(260px 240px at 42% 46%, rgba(255, 80, 110, 0.55), rgba(255,80,110,0.0) 70%);     /* red */
          filter: blur(18px);
          opacity: 0.98;
          z-index: 0;
          pointer-events: none;
          animation: kbGlowFlicker 3.6s ease-in-out infinite;
        }

        @keyframes kbGlowFlicker{
          0%   { transform: translate3d(0,0,0) scale(1);   filter: blur(18px) saturate(1.15) brightness(1.05); opacity: 0.95; }
          35%  { transform: translate3d(6px,-4px,0) scale(1.02); filter: blur(18px) saturate(1.30) brightness(1.10); opacity: 1.00; }
          70%  { transform: translate3d(-5px,3px,0) scale(0.99); filter: blur(19px) saturate(1.22) brightness(1.06); opacity: 0.96; }
          100% { transform: translate3d(0,0,0) scale(1);   filter: blur(18px) saturate(1.15) brightness(1.05); opacity: 0.95; }
        }

        .kb-glow > *:not(.kb-glowLayer){
          position: relative;
          z-index: 2;
        }

        /* Dots */
        .kb-dot{
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.55);
          filter: blur(0.1px);
        }
        .d1{ left: 72px; top: 130px; background: rgba(255, 214, 90, 0.95); }
        .d2{ left: 96px; top: 170px; background: rgba(34,220,110,0.85); }
        .d3{ right: 90px; top: 120px; background: rgba(59,150,255,0.90); }
        .d4{ right: 66px; top: 170px; background: rgba(255,255,255,0.55); }
        .d5{ right: 86px; top: 230px; background: rgba(255,255,255,0.55); }
        .d6{ right: 58px; top: 270px; background: rgba(255,255,255,0.55); }
        .d7{ right: 112px; top: 280px; background: rgba(255,255,255,0.45); width: 10px; height: 10px; }
        .d8{ left: 78px; top: 210px; background: rgba(255,255,255,0.45); width: 10px; height: 10px; }

        /* small bubble icon */
        .kb-mini-bubble{
          position: absolute;
          left: 96px;
          top: 180px;
          width: 44px;
          height: 34px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(255,122,0,0.95), rgba(239,68,68,0.85));
          box-shadow: 0 18px 40px rgba(0,0,0,0.16);
          transform: rotate(-8deg);
          z-index: 3;
        }
        .kb-mini-bubble::after{
          content: "";
          position: absolute;
          left: 12px;
          bottom: -10px;
          width: 18px;
          height: 18px;
          border-radius: 6px;
          background: rgba(239,68,68,0.78);
          transform: rotate(32deg);
        }

        /* speech bubble */
        .kb-speech{
          position: absolute;
          right: -6px;
          top: -10px;
          width: 440px;
          padding: 22px 22px;
          border-radius: 18px;
          background: rgba(255,255,255,0.86);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 28px 80px rgba(0,0,0,0.12);
          color: rgba(15,23,42,0.70);
          font-size: 22px;
          line-height: 1.35;
          font-weight: 650;
          z-index: 6;
          transform-origin: 70% 80%;
          animation: kbSpeechPop 520ms cubic-bezier(.2, .9, .2, 1) 80ms both;
        }
        @keyframes kbSpeechPop{
          0%   { opacity: 0; transform: translateY(10px) scale(0.92); filter: blur(1px); }
          70%  { opacity: 1; transform: translateY(0px) scale(1.02); filter: blur(0px); }
          100% { opacity: 1; transform: translateY(0px) scale(1.00); filter: blur(0px); }
        }

        .kb-speech-tail{
          position: absolute;
          right: 92px;
          bottom: -12px;
          width: 24px;
          height: 24px;
          background: rgba(255,255,255,0.86);
          border-right: 1px solid rgba(15,23,42,0.08);
          border-bottom: 1px solid rgba(15,23,42,0.08);
          transform: rotate(45deg);
          border-radius: 6px;
        }

        /* big face circle — MOVED UP to align with CTA height */
        .kb-face{
          position: absolute;
          left: 50%;
          top: 42%; /* NEW: higher (closer to CTA height) */
          transform: translate(-50%, -50%);
          width: 290px;
          height: 290px;
          border-radius: 999px;
          background: #FFFFFF;
          box-shadow:
            0 40px 110px rgba(0,0,0,0.12),
            inset 0 14px 28px rgba(255,255,255,0.70);
          z-index: 4;
        }

        .kb-eye{
          position: absolute;
          top: 108px;
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: rgba(15,23,42,0.78);
          overflow: hidden;
        }
        .kb-eye.left{ left: 96px; }
        .kb-eye.right{ right: 96px; }

        /* Blink every 5s */
        .kb-eye::after{
          content: "";
          position: absolute;
          inset: 0;
          background: #FFFFFF;
          transform: translateY(110%);
          animation: kbBlink5s 5s ease-in-out infinite;
        }
        @keyframes kbBlink5s{
          0%, 92%   { transform: translateY(110%); }
          94%       { transform: translateY(0%); }
          96%       { transform: translateY(0%); }
          98%, 100% { transform: translateY(110%); }
        }

        /* HAPPY mouth */
        .kb-smile{
          position: absolute;
          left: 50%;
          top: 152px;
          width: 114px;
          height: 66px;
          transform: translateX(-50%);
          border-bottom: 9px solid rgba(15,23,42,0.70);
          border-radius: 0 0 114px 114px;
          opacity: 1;
          animation: kbHappyHide 10s ease-in-out infinite;
        }

        /* ANGRY mouth (only first 5s of each 10s loop) */
        .kb-angryMouth{
          position: absolute;
          left: 50%;
          top: 176px;
          width: 118px;
          height: 40px;
          transform: translateX(-50%);
          border-top: 10px solid rgba(15,23,42,0.75);
          border-radius: 120px 120px 0 0;
          opacity: 0;
          animation: kbAngryShow 10s ease-in-out infinite;
        }

        /* ANGRY brows */
        .kb-angryBrow{
          position: absolute;
          top: 86px;
          width: 56px;
          height: 10px;
          background: rgba(15,23,42,0.75);
          border-radius: 999px;
          opacity: 0;
          animation: kbAngryShow 10s ease-in-out infinite;
        }
        .kb-angryBrow.b-left{
          left: 74px;
          transform: rotate(18deg);
        }
        .kb-angryBrow.b-right{
          right: 74px;
          transform: rotate(-18deg);
        }

        /* Timing:
           - First 5 seconds: angry visible, happy hidden
           - Next 5 seconds: happy visible, angry hidden
        */
        @keyframes kbAngryShow{
          0%   { opacity: 1; }
          48%  { opacity: 1; }
          50%  { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes kbHappyHide{
          0%   { opacity: 0; }
          48%  { opacity: 0; }
          50%  { opacity: 1; }
          100% { opacity: 1; }
        }

        /* ===== Features ===== */
        .kb-features{
          max-width: 1180px;
          margin: 26px auto 0;
          padding: 26px 52px 60px;
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr;
          align-items: center;
          gap: 28px;
        }

        .kb-feature{
          display: grid;
          grid-template-columns: 64px 1fr;
          align-items: center;
          gap: 16px;
        }

        .kb-icon{
          width: 54px;
          height: 54px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,0.70);
          border: 1px solid rgba(15,23,42,0.06);
          box-shadow: 0 16px 45px rgba(0,0,0,0.08);
        }

        .kb-icon.green{ color: rgba(34,197,94,0.85); }
        .kb-icon.blue{ color: rgba(59,130,246,0.95); }
        .kb-icon.blueLight{ color: rgba(96,165,250,0.95); }

        .kb-feature-title{
          font-size: 20px;
          font-weight: 700;
          color: rgba(15,23,42,0.62);
        }

        .kb-divider{
          width: 1px;
          height: 60px;
          background: rgba(15,23,42,0.08);
          border-radius: 999px;
        }

        /* ===== Responsive ===== */
        @media (max-width: 1100px){
          .kb-hero{
            grid-template-columns: 1fr;
            gap: 26px;
          }
          .kb-right{ order: 2; }
          .kb-left{ order: 1; }
          padding-top: 6px;
          .kb-title{ font-size: 64px; }
          .kb-cta{ min-width: 360px; }
          .kb-face{ top: 48%; } /* keep higher on smaller screens too */
        }

        @media (max-width: 820px){
          .kb-header{ padding: 22px 22px 8px; }
          .kb-hero{ padding: 24px 22px 18px; }
          .kb-features{
            padding: 22px 22px 50px;
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .kb-divider{ display: none; }
          .kb-title{ font-size: 54px; }
          .kb-cta{ width: 100%; min-width: 0; }
          .kb-glow{ width: min(520px, 92vw); height: 390px; }
          .kb-speech{ right: 0px; top: -6px; width: min(440px, 88vw); font-size: 20px; }
          .kb-face{ width: 260px; height: 260px; top: 44%; left: 50%; }
          .kb-eye{ top: 98px; }
          .kb-smile{ top: 138px; width: 104px; height: 62px; border-bottom-width: 8px; border-radius: 0 0 104px 104px; }
          .kb-angryMouth{ top: 156px; width: 108px; border-top-width: 9px; }
          .kb-angryBrow{ top: 78px; width: 52px; height: 9px; }
        }
      `}</style>
    </main>
  );
}