/* eslint-disable no-restricted-globals */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from "react";

// ── Simple Router ─────────────────────────────────────────────────────────────
function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return path;
}

function navigate(to) {
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
  // Track page view in GA
  if (window.gtag) window.gtag("event", "page_view", { page_path: to });
}

// ── Analytics event tracker ───────────────────────────────────────────────────
function track(eventName, params = {}) {
  if (window.gtag) window.gtag("event", eventName, params);
  // Also save to our own storage for the dashboard
  const key = "habito_analytics";
  try {
    const raw = localStorage.getItem(key);
    const log = raw ? JSON.parse(raw) : [];
    log.push({ event: eventName, params, ts: Date.now(), date: new Date().toISOString().slice(0, 10) });
    // Keep last 2000 events
    if (log.length > 2000) log.splice(0, log.length - 2000);
    localStorage.setItem(key, JSON.stringify(log));
  } catch(_) {}
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const todayKey = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 9);
const STORAGE_KEY = "habito_v1";


// ── Persistence ───────────────────────────────────────────────────────────────
async function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}
async function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
}

// ── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
    share: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    flame: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 6 6 10 8 14c-2-1-3-3-3-5C3 14 5 20 12 22c7-2 9-8 7-13-1 3-3 4-5 3 2-3 1-7-2-10z"/></svg>,
    arrow: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    copy: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
    close: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  };
  return icons[name] || null;
};

// ── Streak calculator ─────────────────────────────────────────────────────────
function calcStreak(history, totalBlocks) {
  if (!totalBlocks) return 0;
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    const done = (history[key] || []).length;
    if (done === totalBlocks) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

function calcCompletion(history, totalBlocks) {
  if (!totalBlocks) return [];
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en", { weekday: "short" });
    const done = (history[key] || []).length;
    last7.push({ label, pct: Math.round((done / totalBlocks) * 100), done, total: totalBlocks });
  }
  return last7;
}

const EMOJIS = ["🌅","💪","📚","🎯","🧘","🚀","🎨","🏃","🌿","⚡","🔥","🎵","💡","🏋️","🌊"];
const COLORS = ["#f4c430","#ff6b35","#5bc8ff","#c084fc","#4ade80","#f87171","#fb923c","#a78bfa","#34d399","#60a5fa"];

const DURATIONS = [
  "5 min", "10 min", "15 min", "20 min", "25 min", "30 min",
  "35 min", "40 min", "45 min", "50 min", "55 min",
  "1 hour", "1 hr 15 min", "1 hr 30 min", "1 hr 45 min",
  "2 hours", "2 hr 30 min", "3 hours",
];

const DurationSelect = ({ value, onChange }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      flex: 1, background: "#161616", border: "1px solid #252525",
      borderRadius: 8, padding: "10px 14px", color: value ? "#f0f0f0" : "#444",
      fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none",
      cursor: "pointer", appearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
      paddingRight: 32,
    }}
  >
    <option value="">Duration (optional)</option>
    {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
  </select>
);


// ── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  app: {
    minHeight: "100vh",
    background: "#0a0a0a",
    backgroundImage: "url('https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=60')",
    backgroundSize: "cover",
    backgroundPosition: "center top",
    backgroundAttachment: "fixed",
    color: "#f0f0f0",
    fontFamily: "'DM Sans', sans-serif",
    padding: "0 0 80px",
    position: "relative",
  },
  topbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 24px 16px",
    borderBottom: "1px solid #1a1a1a",
    position: "sticky", top: 0,
    background: "#0a0a0af5",
    backdropFilter: "blur(12px)",
    zIndex: 50,
  },
  logoWrap: {
    display: "flex", alignItems: "center", gap: 8,
  },
  logoMark: {
    width: 30, height: 30, borderRadius: 8,
    background: "linear-gradient(135deg, #f4c430, #ff6b35)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16,
  },
  logoText: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 26, letterSpacing: "0.12em", color: "#f0f0f0",
  },
  logoSub: {
    fontSize: 9, color: "#444", textTransform: "uppercase",
    letterSpacing: "0.12em", marginTop: -4,
  },
  pill: (active) => ({
    padding: "6px 16px", borderRadius: 20,
    border: `1px solid ${active ? "#f4c430" : "#222"}`,
    background: active ? "#f4c43018" : "transparent",
    color: active ? "#f4c430" : "#555",
    cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  }),
  tabBar: {
    display: "flex", gap: 8, padding: "16px 24px 0",
  },
  section: { padding: "24px 24px 0", maxWidth: 680, margin: "0 auto" },
  card: (accent) => ({
    background: "#111",
    border: `1px solid #1e1e1e`,
    borderLeft: `3px solid ${accent || "#333"}`,
    borderRadius: 12,
    padding: "18px 20px",
    marginBottom: 12,
    cursor: "pointer",
    transition: "border-color 0.2s, transform 0.15s",
  }),
  btn: (variant = "primary") => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: variant === "ghost" ? "6px 10px" : "10px 18px",
    borderRadius: 8,
    border: variant === "outline" ? "1px solid #2a2a2a" : "none",
    background: variant === "primary" ? "#f4c430" : variant === "danger" ? "#ff444418" : "transparent",
    color: variant === "primary" ? "#0a0a0a" : variant === "danger" ? "#ff4444" : "#666",
    fontSize: 13, fontWeight: 500, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.15s",
  }),
  input: {
    width: "100%", background: "#161616", border: "1px solid #252525",
    borderRadius: 8, padding: "10px 14px", color: "#f0f0f0",
    fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none",
    boxSizing: "border-box",
  },
  label: { fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, display: "block" },
  modal: {
    position: "fixed", inset: 0, background: "#000b",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 100, padding: 20,
  },
  modalBox: {
    background: "#111", border: "1px solid #222",
    borderRadius: 16, padding: 28, width: "100%", maxWidth: 480,
    maxHeight: "85vh", overflowY: "auto",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
const GA_ID = "G-6NWM8YEXS7";

export default function Root() {
  const path = usePath();

  useEffect(() => {
    // Inject GA script once
    if (!document.getElementById("ga-script")) {
      const s1 = document.createElement("script");
      s1.id = "ga-script";
      s1.async = true;
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(s1);
      const s2 = document.createElement("script");
      s2.id = "ga-init";
      s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:false});`;
      document.head.appendChild(s2);
    }
    // Track current page
    setTimeout(() => {
      if (window.gtag) window.gtag("event", "page_view", { page_path: path });
    }, 500);
  }, [path]);

  if (path === "/app") return <HabitoApp />;
  if (path === "/dashboard") return <Dashboard />;
  return <Landing />;
}

function Landing() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;1,9..144,300&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      <style>{`
        :root{--bg:#080808;--yellow:#f4c430;--orange:#ff6b35;--green:#4ade80;--text:#f0f0f0;--muted:#555;--card:#0f0f0f;--border:#1a1a1a}
        *{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;overflow-x:hidden}

        /* NAV */
        nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:18px 48px;background:#08080899;backdrop-filter:blur(16px);border-bottom:1px solid #ffffff08}
        .nav-logo{display:flex;align-items:center;gap:10px}
        .nav-mark{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,var(--yellow),var(--orange));display:flex;align-items:center;justify-content:center;font-size:17px}
        .nav-name{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:0.12em}
        .nav-links{display:flex;gap:32px;align-items:center}
        .nav-links a{font-size:13px;color:var(--muted);text-decoration:none;transition:color 0.2s}
        .nav-links a:hover{color:var(--text)}
        .nav-cta{background:var(--yellow);color:#080808;padding:9px 20px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;border:none;font-family:'DM Sans',sans-serif}

        /* HERO with photo background */
        .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;position:relative;overflow:hidden}
        .hero-img{position:absolute;inset:0;background-image:url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&q=80');background-size:cover;background-position:center top;z-index:0}
        .hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom, #080808cc 0%, #080808aa 40%, #080808ee 80%, #080808 100%);z-index:1}
        .hero-glow{position:absolute;inset:0;background:radial-gradient(ellipse 60% 40% at 50% 30%,#f4c43018 0%,transparent 70%);z-index:2;pointer-events:none}
        .hero-content{position:relative;z-index:3}
        .hero-badge{display:inline-flex;align-items:center;gap:7px;background:#f4c43015;border:1px solid #f4c43035;border-radius:20px;padding:6px 14px;font-size:12px;color:var(--yellow);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:32px;animation:fadeUp 0.6s ease both;backdrop-filter:blur(8px)}
        .hero-badge span{width:6px;height:6px;border-radius:50%;background:var(--yellow);display:inline-block}
        .hero-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(72px,14vw,148px);letter-spacing:0.02em;line-height:0.88;margin-bottom:12px;animation:fadeUp 0.6s 0.1s ease both;text-shadow:0 4px 40px #00000080}
        .hero-title em{font-style:italic;font-family:'Fraunces',serif;color:var(--yellow);font-size:0.92em}
        .hero-sub{font-size:clamp(16px,2.5vw,20px);color:#aaa;font-weight:300;max-width:480px;line-height:1.6;margin-bottom:48px;animation:fadeUp 0.6s 0.2s ease both}
        .hero-sub strong{color:#ccc;font-weight:400}
        .hero-actions{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;animation:fadeUp 0.6s 0.3s ease both}
        .btn-primary{background:var(--yellow);color:#080808;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:500;font-family:'DM Sans',sans-serif;display:inline-flex;align-items:center;gap:8px;transition:all 0.2s;box-shadow:0 0 40px #f4c43040;cursor:pointer;border:none}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 0 60px #f4c43060}
        .btn-ghost{background:#ffffff0a;color:#aaa;padding:14px 28px;border-radius:10px;font-size:15px;font-family:'DM Sans',sans-serif;border:1px solid #ffffff18;display:inline-flex;align-items:center;gap:8px;transition:all 0.2s;text-decoration:none;backdrop-filter:blur(8px)}
        .btn-ghost:hover{border-color:#ffffff30;color:var(--text)}
        .hero-social{margin-top:56px;display:flex;gap:32px;align-items:center;font-size:13px;color:#444;animation:fadeUp 0.6s 0.4s ease both;flex-wrap:wrap;justify-content:center}
        .hero-social strong{color:#777}

        /* FEATURES with subtle texture */
        .features-wrap{background:linear-gradient(180deg,#080808 0%,#0a0a0a 50%,#080808 100%);position:relative;overflow:hidden}
        .features-wrap::before{content:'';position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=60') center/cover no-repeat;opacity:0.14;pointer-events:none}
        .features{padding:100px 24px;max-width:1100px;margin:0 auto;position:relative}
        .section-label{text-align:center;font-size:11px;color:var(--yellow);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:16px}
        .section-title{text-align:center;font-family:'Bebas Neue',sans-serif;font-size:clamp(42px,7vw,72px);letter-spacing:0.04em;line-height:0.95;margin-bottom:64px}
        .section-title em{font-family:'Fraunces',serif;font-style:italic;color:var(--yellow)}
        .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
        .feature-card{background:#0d0d0d;border:1px solid #1a1a1a;border-radius:16px;padding:28px;transition:border-color 0.2s,transform 0.2s}
        .feature-card:hover{border-color:#2a2a2a;transform:translateY(-3px)}
        .feature-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:16px}
        .feature-card h3{font-size:17px;font-weight:500;margin-bottom:8px}
        .feature-card p{font-size:14px;color:var(--muted);line-height:1.6;font-weight:300}

        /* PRICING */
        .pricing{padding:100px 24px;border-top:1px solid var(--border);position:relative;overflow:hidden}
        .pricing-img{position:absolute;inset:0;background-image:url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&q=80');background-size:cover;background-position:center;z-index:0;opacity:0.18}
        .pricing::before{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,#080808 0%,transparent 30%,transparent 70%,#080808 100%);z-index:1;pointer-events:none}
        .pricing-inner{max-width:800px;margin:0 auto;position:relative;z-index:2}
        .pricing-cards{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:56px}
        @media(max-width:600px){.pricing-cards{grid-template-columns:1fr}nav{padding:16px 20px}.nav-links{display:none}}
        .pricing-card{background:#0d0d0d;border:1px solid var(--border);border-radius:16px;padding:32px;position:relative}
        .pricing-card.pro{border-color:#f4c43040;background:#0d0d00}
        .pricing-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--yellow);color:#080808;font-size:11px;font-weight:500;padding:4px 14px;border-radius:12px;text-transform:uppercase;letter-spacing:0.06em;white-space:nowrap}
        .pricing-tier{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px}
        .pricing-price{font-family:'Bebas Neue',sans-serif;font-size:52px;letter-spacing:0.04em;line-height:1;margin-bottom:4px}
        .pricing-price span{font-size:20px;color:var(--muted)}
        .pricing-per{font-size:13px;color:var(--muted);margin-bottom:24px}
        .pricing-divider{height:1px;background:var(--border);margin-bottom:20px}
        .pricing-features{list-style:none;display:flex;flex-direction:column;gap:10px;margin-bottom:28px}
        .pricing-features li{display:flex;align-items:center;gap:10px;font-size:14px;color:#aaa}
        .pricing-features li::before{content:'✓';color:var(--green);font-size:12px;min-width:14px}
        .pricing-features li.off{color:#333}
        .pricing-features li.off::before{content:'×';color:#333}
        .pricing-btn{display:block;text-align:center;padding:12px;border-radius:9px;font-size:14px;font-weight:500;font-family:'DM Sans',sans-serif;transition:all 0.2s;cursor:pointer;width:100%}
        .pricing-btn.free{border:1px solid #222;color:#666;background:transparent}
        .pricing-btn.free:hover{border-color:#444;color:var(--text)}
        .pricing-btn.paid{background:var(--yellow);color:#080808;border:none}
        .pricing-btn.paid:hover{opacity:0.88}

        /* CTA with photo background */
        .cta-section{padding:140px 24px;text-align:center;position:relative;overflow:hidden}
        .cta-img{position:absolute;inset:0;background-image:url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80');background-size:cover;background-position:center;z-index:0}
        .cta-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,#080808 0%,#080808bb 30%,#080808bb 70%,#080808 100%);z-index:1}
        .cta-content{position:relative;z-index:2}
        .cta-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(52px,10vw,100px);letter-spacing:0.03em;line-height:0.9;margin-bottom:24px;text-shadow:0 4px 40px #00000080}
        .cta-title em{font-family:'Fraunces',serif;font-style:italic;color:var(--yellow)}
        .cta-sub{font-size:16px;color:#888;margin-bottom:40px;font-weight:300;max-width:400px;margin-left:auto;margin-right:auto;line-height:1.6}

        /* FOOTER */
        footer{border-top:1px solid var(--border);padding:32px 48px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px}
        .footer-logo{display:flex;align-items:center;gap:8px}
        .footer-logo-text{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:0.12em;color:#333}
        .footer-copy{font-size:12px;color:#2a2a2a}
        .footer-links{display:flex;gap:24px}
        .footer-links a{font-size:12px;color:#333;text-decoration:none;transition:color 0.2s}
        .footer-links a:hover{color:#666}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
      `}</style>

      <nav>
        <div className="nav-logo"><div className="nav-mark">🌱</div><div className="nav-name">HABITO</div></div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <button className="nav-cta" onClick={() => navigate("/app")}>Try Free →</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-img" />
        <div className="hero-overlay" />
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-badge"><span></span> Now in public beta</div>
          <h1 className="hero-title">Build habits.<br /><em>Keep momentum.</em></h1>
          <p className="hero-sub">Habito turns your daily routine into a <strong>trackable, shareable system</strong> — with streaks, stats, and zero friction.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate("/app")}>Start for free →</button>
            <a href="#features" className="btn-ghost">See how it works</a>
          </div>
          <div className="hero-social">
            <div>🔥 <strong>Build</strong> daily streaks</div>
            <div>⚡ <strong>Free</strong> to get started</div>
            <div>✓ <strong>No</strong> download needed</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <div className="features-wrap">
        <section className="features" id="features">
          <div className="section-label">Everything you need</div>
          <h2 className="section-title">Built for people who<br /><em>actually want to change</em></h2>
          <div className="features-grid">
            {[
              {icon:"🎯",bg:"#f4c43015",title:"Custom Routines",desc:"Build any routine from scratch — name each task, set durations, pick colors and emoji."},
              {icon:"🔥",bg:"#ff6b3515",title:"Streak Tracking",desc:"Every perfect day adds to your streak. Watch it grow and feel the pull to protect it."},
              {icon:"📊",bg:"#5bc8ff15",title:"Progress Stats",desc:"7-day completion charts, average scores, and perfect-day counts per routine."},
              {icon:"🌱",bg:"#4ade8015",title:"Share Your Routine",desc:"Copy your routine as a clean summary and share it anywhere — Discord, Twitter, Notion."},
              {icon:"💾",bg:"#c084fc15",title:"Auto-Save Progress",desc:"Check a task, switch apps, come back later — your progress is always right where you left it."},
              {icon:"⚡",bg:"#f4c43015",title:"Zero Friction",desc:"Open it, check your tasks, close it. No onboarding, no overwhelm. Just focus on doing."},
            ].map((f,i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon" style={{background:f.bg}}>{f.icon}</div>
                <h3>{f.title}</h3><p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* PRICING */}
      <section className="pricing" id="pricing">
        <div className="pricing-img" />
        <div className="pricing-inner">
          <div className="section-label">Simple pricing</div>
          <h2 className="section-title">Start free.<br /><em>Upgrade when ready.</em></h2>
          <div className="pricing-cards">
            <div className="pricing-card">
              <div className="pricing-tier">Free</div>
              <div className="pricing-price">$0</div>
              <div className="pricing-per">forever</div>
              <div className="pricing-divider"></div>
              <ul className="pricing-features">
                <li>Up to 3 routines</li><li>Streak tracking</li><li>7-day history</li><li>Share routines</li>
                <li className="off">Unlimited routines</li><li className="off">Full stats history</li><li className="off">Reminders</li>
              </ul>
              <button className="pricing-btn free" onClick={() => navigate("/app")}>Get started free</button>
            </div>
            <div className="pricing-card pro">
              <div className="pricing-badge">Most popular</div>
              <div className="pricing-tier" style={{color:"#f4c430"}}>Pro</div>
              <div className="pricing-price" style={{color:"#f4c430"}}>$5 <span>/ mo</span></div>
              <div className="pricing-per">or $36/year — save 40%</div>
              <div className="pricing-divider"></div>
              <ul className="pricing-features">
                <li>Unlimited routines</li><li>Streak tracking</li><li>Full stats history</li>
                <li>Share routines</li><li>Reminders & notifications</li><li>Custom themes</li><li>Priority support</li>
              </ul>
              <button className="pricing-btn paid" onClick={() => navigate("/app")}>Start Pro free for 7 days</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA with mountain/sunrise photo */}
      <section className="cta-section">
        <div className="cta-img" />
        <div className="cta-overlay" />
        <div className="cta-content">
          <h2 className="cta-title">Your streak<br />starts <em>today.</em></h2>
          <p className="cta-sub">No download. No credit card. Just open it and start building the routine you've been putting off.</p>
          <button className="btn-primary" style={{fontSize:16,padding:"16px 40px",margin:"0 auto"}} onClick={() => navigate("/app")}>Launch Habito free →</button>
        </div>
      </section>

      <footer>
        <div className="footer-logo"><div className="nav-mark" style={{width:26,height:26,fontSize:14}}>🌱</div><div className="footer-logo-text">HABITO</div></div>
        <div className="footer-copy">© 2025 Habito. habit + momentum.</div>
        <div className="footer-links"><span style={{cursor:"pointer",fontSize:12,color:"#333"}}>Privacy</span><span style={{cursor:"pointer",fontSize:12,color:"#333"}}>Terms</span><span style={{cursor:"pointer",fontSize:12,color:"#333"}}>Contact</span></div>
      </footer>
    </>
  );
}

function HabitoApp() {
  const [tab, setTab] = useState("routines");
  const [routines, setRoutines] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showShare, setShowShare] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadData().then(d => {
      setRoutines(d?.routines || []);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveData({ routines });
  }, [routines, loaded]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const createRoutine = (data) => {
    const r = { id: uid(), history: {}, createdAt: Date.now(), shared: false, ...data };
    setRoutines(prev => [r, ...prev]);
    setShowCreate(false);
    showToast("Routine created! 🎉");
  };

  const deleteRoutine = (id) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    if (activeRoutine === id) setActiveRoutine(null);
  };

  const editBlock = (routineId, blockId, newTitle, newDuration) => {
    setRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      return { ...r, blocks: r.blocks.map(b => b.id === blockId ? { ...b, title: newTitle, duration: newDuration } : b) };
    }));
  };

  const deleteBlock = (routineId, blockId) => {
    setRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      return { ...r, blocks: r.blocks.filter(b => b.id !== blockId) };
    }));
  };

  const toggleBlock = (routineId, blockId) => {
    const today = todayKey();
    setRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      const todayDone = r.history[today] || [];
      const isCompleting = !todayDone.includes(blockId);
      const newDone = isCompleting
        ? [...todayDone, blockId]
        : todayDone.filter(b => b !== blockId);
      // Track full routine completion
      if (isCompleting && newDone.length === r.blocks.length) {
        track("routine_completed", { routine_name: r.name, date: today });
      }
      return { ...r, history: { ...r.history, [today]: newDone } };
    }));
  };

  if (!loaded) return (
    <div style={{ ...S.app, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <div style={{ fontSize: 32 }}>🌱</div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#333", letterSpacing: "0.2em" }}>HABITO</div>
    </div>
  );

  const active = routines.find(r => r.id === activeRoutine);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      <div style={S.app}>
        {/* Dark overlay so image is subtle */}
        <div style={{ position: "fixed", inset: 0, background: "linear-gradient(135deg, #0a0a0aee 0%, #0a0a0af0 50%, #0a0a0aee 100%)", zIndex: 0, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
        {/* Topbar */}
        <div style={S.topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {activeRoutine && (
              <button style={S.btn("ghost")} onClick={() => setActiveRoutine(null)}>
                <Icon name="back" size={15} />
              </button>
            )}
            <div style={{...S.logoWrap, cursor:"pointer"}} onClick={() => navigate("/")}>
              <div style={S.logoMark}>🌱</div>
              <div>
                <div style={S.logoText}>HABITO</div>
                <div style={S.logoSub}>habit + momentum</div>
              </div>
            </div>
          </div>
          {!activeRoutine && (
            <button style={S.btn("primary")} onClick={() => setShowCreate(true)}>
              <Icon name="plus" size={14} /> New Routine
            </button>
          )}
          {activeRoutine && active && (
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btn("ghost")} onClick={() => setShowShare(active)} title="Share">
                <Icon name="share" size={15} />
              </button>
              <button style={S.btn("danger")} onClick={() => { if (window.confirm("Delete this routine?")) deleteRoutine(activeRoutine); }} title="Delete">
                <Icon name="trash" size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Tab bar */}
        {!activeRoutine && (
          <div style={S.tabBar}>
            {["routines", "stats"].map(t => (
              <button key={t} style={S.pill(tab === t)} onClick={() => setTab(t)}>
                {t === "routines" ? "My Routines" : "Stats & Streaks"}
              </button>
            ))}
          </div>
        )}

        {/* Views */}
        {activeRoutine && active ? (
          <RoutineDetail
            routine={active}
            onToggle={(bid) => toggleBlock(active.id, bid)}
            onEditBlock={(bid, title, dur) => editBlock(active.id, bid, title, dur)}
            onDeleteBlock={(bid) => deleteBlock(active.id, bid)}
            onShare={() => setShowShare(active)}
          />
        ) : tab === "routines" ? (
          <RoutineList routines={routines} onSelect={setActiveRoutine} onCreate={() => setShowCreate(true)} />
        ) : (
          <StatsView routines={routines} />
        )}

        </div>
        {showCreate && <CreateModal onSave={createRoutine} onClose={() => setShowCreate(false)} />}
        {showShare && <ShareModal routine={showShare} onClose={() => setShowShare(null)} onToast={showToast} />}

        {toast && (
          <div style={{
            position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
            background: "#f4c430", color: "#0a0a0a", padding: "10px 22px",
            borderRadius: 24, fontSize: 13, fontWeight: 500, zIndex: 200,
            whiteSpace: "nowrap", boxShadow: "0 4px 24px #f4c43044",
          }}>{toast}</div>
        )}
      </div>
    </>
  );
}

// ── Routine List ──────────────────────────────────────────────────────────────

// ── Articles Library ──────────────────────────────────────────────────────────
const ARTICLES = [
  {
    id: "a1",
    category: "Movement",
    emoji: "🚶",
    color: "#4ade80",
    title: "The Life-Changing Benefits of Walking 30 Minutes Every Day",
    readTime: "4 min read",
    keywords: ["walk", "steps", "movement", "exercise", "cardio", "run", "jog", "stroll", "hiking", "outdoor", "nature", "fresh air", "daily walk", "morning walk", "evening walk"],
    summary: "A simple daily walk might be the most underrated health habit you can build.",
    content: `Most people underestimate walking. It's not flashy, it doesn't burn as many calories as a HIIT session, and it doesn't come with a leaderboard. But study after study shows that walking 30 minutes a day is one of the most powerful things you can do for your long-term health.

**What happens to your body when you walk daily:**

After just 1 week, your mood improves. Walking triggers the release of endorphins and serotonin — the same chemicals that antidepressants target. Many people report feeling noticeably calmer and more optimistic after just a few days of consistent walking.

After 1 month, your cardiovascular health improves measurably. Blood pressure drops, resting heart rate decreases, and your heart becomes more efficient. You'll notice you're less winded going up stairs.

After 3 months, your risk of type 2 diabetes decreases significantly. Walking improves insulin sensitivity, meaning your body handles blood sugar more effectively after meals.

**The cognitive benefits are just as impressive.** A Stanford study found that walking increases creative output by an average of 60%. Many of history's greatest thinkers — Darwin, Beethoven, Nietzsche — were obsessive daily walkers who credited their walks for their best ideas.

**How to make it stick:**

The biggest mistake people make is treating walking as optional. Schedule it like a meeting. The best time is right after a meal — even a 10-minute post-meal walk dramatically blunts blood sugar spikes.

You don't need special gear, a gym membership, or perfect weather. You just need shoes and a door.

Start with 10 minutes. Build to 30. Your future self will thank you.`,
  },
  {
    id: "a2",
    category: "Deep Work",
    emoji: "🧠",
    color: "#5bc8ff",
    title: "Why Your Brain Can Only Do 4 Hours of Deep Work Per Day",
    readTime: "5 min read",
    keywords: ["deep work", "focus", "work", "study", "productivity", "concentration", "writing", "coding", "research", "project", "build", "create", "design", "develop", "client", "deadline", "output", "block #1", "block #2", "hard task", "main task", "priority"],
    summary: "Science explains why pushing past your cognitive limit makes you less productive, not more.",
    content: `Cal Newport, who coined the term "deep work," estimates that most people can sustain only 3-4 hours of truly focused cognitive work per day. Elite performers — chess grandmasters, concert pianists, world-class writers — rarely exceed this ceiling, no matter how motivated they are.

Why? Because deep work depletes a finite neurological resource.

**The science of cognitive fatigue:**

Your prefrontal cortex — the part of your brain responsible for complex reasoning, decision-making, and focused attention — consumes enormous amounts of glucose and oxygen. After sustained effort, it simply runs low. This isn't a willpower problem. It's biology.

Research from Anders Ericsson (the psychologist behind the "10,000 hours" concept) found that expert performers across fields practice deliberately for no more than 4 hours per day, almost always in the morning, split into sessions of 90 minutes or less.

**What this means for your routine:**

Stop trying to grind through 8 hours of "productive" work. Instead, protect your peak cognitive hours — usually the first 2-3 hours after waking — for your most important, hardest task. Guard this time fiercely. No meetings, no email, no social media.

After your deep work block, switch to shallow work: emails, admin, calls. Your brain can handle these tasks even when fatigued.

**The 90-minute rule:**

Work in focused 90-minute blocks, then take a genuine rest (not a "check your phone" rest). This aligns with your brain's natural ultradian rhythm — the 90-minute cycle between higher and lower alertness that runs throughout your day.

Fewer hours, more depth. That's the counterintuitive secret to getting more done.`,
  },
  {
    id: "a3",
    category: "Morning",
    emoji: "🌅",
    color: "#f4c430",
    title: "What Happens to Your Brain in the First 30 Minutes After Waking",
    readTime: "4 min read",
    keywords: ["morning", "wake", "sleep", "intention", "routine", "alarm", "breakfast", "mindset", "ritual", "rise", "sunrise", "am", "first thing", "start", "begin", "7am", "6am", "5am", "8am", "fuel", "hydrate", "water"],
    summary: "The first 30 minutes after waking sets the neurological tone for your entire day.",
    content: `The way you spend the first 30 minutes after waking has an outsized impact on your mood, focus, and energy for the rest of the day. This isn't motivational speak — it's neuroscience.

**Cortisol and the morning spike:**

Within minutes of waking, your brain triggers a surge of cortisol — the "stress hormone" that's actually your body's natural alarm system. This Cortisol Awakening Response (CAR) peaks about 30 minutes after waking and is responsible for mobilizing energy, sharpening focus, and preparing you for the day.

The mistake most people make: reaching for their phone immediately. Checking social media, news, or messages during this cortisol spike floods your brain with external stressors and dopamine hits before you've even gotten out of bed. This hijacks your brain's natural morning calibration.

**What to do instead:**

Neuroscientist Andrew Huberman recommends getting outside and exposing your eyes to natural morning light within 30 minutes of waking. This sets your circadian clock, boosts morning cortisol appropriately, and improves sleep quality the following night.

Avoid screens for the first 30 minutes. Instead: stretch, drink water, journal, meditate, or simply sit quietly with your thoughts.

**Setting an intention:**

Research on "implementation intentions" shows that people who set a specific plan at the start of the day complete significantly more of their goals than those who rely on motivation alone. Spend 2 minutes writing down your single most important task for the day.

Your morning doesn't have to be a 5am ice-bath marathon. It just has to be yours — calm, intentional, and screen-free.`,
  },
  {
    id: "a4",
    category: "Recovery",
    emoji: "💤",
    color: "#c084fc",
    title: "The Hidden Power of Rest: Why Doing Nothing Makes You More Productive",
    readTime: "5 min read",
    keywords: ["rest", "break", "recovery", "lunch", "nap", "relax", "shutdown", "wind", "evening", "sleep", "recharge", "pause", "downtime", "switch off", "decompress", "reset", "cool down", "buffer", "transition"],
    summary: "Taking real breaks isn't lazy — it's one of the highest-leverage habits you can build.",
    content: `We live in a culture that glamorizes busyness. But the science is unambiguous: rest is not the opposite of productivity. It's what makes productivity possible.

**The Default Mode Network:**

When you stop focusing on a task, your brain doesn't go idle. It activates the Default Mode Network (DMN) — a system associated with memory consolidation, creative insight, and self-reflection. Some of your best ideas will come in the shower, on a walk, or just before sleep — precisely because you've stopped trying.

Scientists believe the DMN is where your brain "connects the dots" between information it has absorbed. Rest isn't downtime. It's processing time.

**The Zeigarnik Effect:**

Your brain naturally obsesses over unfinished tasks. This is called the Zeigarnik Effect, and it's why you can't stop thinking about work when you're trying to relax. The solution? A clear "shutdown ritual" at the end of your workday — closing tabs, writing tomorrow's task list, and saying (out loud if needed) "I'm done for today." This signals your brain that it can stop monitoring the unfinished work.

**Strategic rest during the day:**

A 10-20 minute nap in the early afternoon (before 3pm) has been shown to restore alertness and cognitive performance to morning levels. NASA found that pilots who napped for 26 minutes showed 34% improvement in performance.

Even sitting quietly with your eyes closed for 10 minutes — no phone, no input — produces measurable cognitive restoration.

The highest performers aren't the ones who rest the least. They're the ones who rest most deliberately.`,
  },
  {
    id: "a5",
    category: "Fitness",
    emoji: "💪",
    color: "#ff6b35",
    title: "The Minimum Effective Dose of Exercise for Maximum Results",
    readTime: "5 min read",
    keywords: ["workout", "gym", "exercise", "fitness", "weights", "strength", "training", "lift", "yoga", "stretch", "run", "cardio", "push", "pull", "squat", "session", "hiit", "circuit", "body", "sweat", "sport", "athletic", "active", "move", "physical"],
    summary: "You don't need to spend hours in the gym. Science reveals the exact minimum that delivers maximum benefit.",
    content: `More isn't always better when it comes to exercise. In fact, the concept of the "minimum effective dose" — the smallest amount of stimulus needed to produce the desired result — is one of the most liberating ideas in fitness science.

**What the research actually shows:**

The American College of Sports Medicine's guidelines recommend 150 minutes of moderate aerobic activity per week — that's just 22 minutes per day. For strength training, 2 sessions per week of 8-10 exercises is enough to build and maintain muscle for most people.

A landmark study published in the British Journal of Sports Medicine found that even 11 minutes of exercise per day significantly reduced the risk of cardiovascular disease, cancer, and all-cause mortality. Eleven minutes.

**High-Intensity Interval Training (HIIT):**

If time is your constraint, HIIT is your answer. Research consistently shows that 20-minute HIIT sessions produce comparable cardiovascular improvements to 45-60 minutes of steady-state cardio. The key is intensity — you have to actually push hard during the work intervals.

**The consistency principle:**

Three 30-minute workouts per week, done consistently for a year, will produce far better results than six 90-minute sessions done sporadically. Your body adapts to consistent stimulation — not occasional heroic efforts.

**What to prioritize:**

If you can only do one thing, make it strength training. Muscle mass is the single best predictor of long-term metabolic health, mobility, and quality of life as you age. Even two sessions per week is enough to see meaningful progress.

The best workout plan is the one you'll actually stick to. Start small. Show up consistently. Adjust as you go.`,
  },
  {
    id: "a6",
    category: "Learning",
    emoji: "📚",
    color: "#f4c430",
    title: "How to Actually Retain What You Learn (The Science of Memory)",
    readTime: "5 min read",
    keywords: ["learn", "read", "study", "book", "course", "skill", "practice", "hobby", "language", "music", "chapter", "lesson", "tutorial", "podcast", "develop", "improve", "growth", "knowledge", "educate", "pages", "audiobook", "article"],
    summary: "Most people learn wrong. Here's how your brain actually stores information long-term.",
    content: `You've probably had this experience: you read a book, feel inspired, and then a month later can barely remember what it was about. This isn't a memory problem. It's a learning strategy problem.

**The Forgetting Curve:**

In the 1880s, psychologist Hermann Ebbinghaus discovered that we forget about 50% of new information within an hour, 70% within 24 hours, and 90% within a week — unless we actively do something about it. This became known as the Forgetting Curve.

The good news: the curve can be dramatically flattened with the right techniques.

**Spaced Repetition:**

Instead of reviewing material once right after learning it, review it at increasing intervals: after 1 day, then 3 days, then a week, then a month. Each review strengthens the memory trace and pushes the next review further into the future. Apps like Anki are built on this principle.

**The Testing Effect:**

Actively recalling information (testing yourself) is dramatically more effective than re-reading. Close the book and try to explain what you just learned — out loud, in writing, or to another person. This is called the Feynman Technique: if you can't explain it simply, you don't really understand it.

**Interleaving:**

Mixing different subjects or skills during a learning session feels harder but produces better long-term retention than focusing on one thing at a time. Your brain works harder to retrieve and apply knowledge when the context keeps changing.

**Sleep is non-negotiable:**

Memory consolidation happens during sleep — specifically during deep sleep stages. Pulling an all-nighter to cram is one of the worst things you can do for retention. Sleeping after learning accelerates the transfer from short-term to long-term memory by up to 40%.

Learn less, more often, with more sleep. That's the formula.`,
  },
  {
    id: "a7",
    category: "Mindset",
    emoji: "🧘",
    color: "#4ade80",
    title: "The Neuroscience of Habits: Why Streaks Work and How to Build Them",
    readTime: "4 min read",
    keywords: ["habit", "streak", "consistency", "routine", "daily", "mindset", "motivation", "meditation", "discipline", "journal", "reflect", "gratitude", "affirmation", "breathe", "breathing", "mindful", "calm", "intention", "clarity", "visualise", "visualize", "review"],
    summary: "Your brain is literally rewiring itself every time you complete a habit. Here's how to use that.",
    content: `Every time you complete a habit, your brain lays down a little more myelin — a fatty sheath that wraps around neural pathways and makes them fire faster and more efficiently. Habits aren't just behavioral patterns. They're physical structures in your brain.

**The Habit Loop:**

Charles Duhigg's research identified a three-part loop that governs all habits: Cue → Routine → Reward. Your brain is constantly scanning for cues that trigger automatic behaviors, because automating routine decisions conserves cognitive energy for more complex tasks.

The implication: habits are your brain's way of being efficient, not lazy. Building good habits is one of the highest-leverage things you can do.

**Why streaks are so powerful:**

Tracking streaks works because of loss aversion — one of the most robust findings in behavioral economics. We feel the pain of breaking a streak more intensely than we feel the pleasure of maintaining it. This asymmetry makes streaks uniquely motivating.

The "don't break the chain" method, popularized by Jerry Seinfeld, works precisely because of this psychology. Each day you complete your habit, you're not just ticking a box — you're protecting something you've built.

**The two-minute rule:**

James Clear recommends starting every habit with a version that takes two minutes or less. Want to exercise? Your habit is "put on your workout clothes." Want to read? Your habit is "open the book." The goal is to make starting frictionless. Once you've started, momentum usually carries you forward.

**Missing once vs. missing twice:**

Research shows that missing a habit once has almost no effect on long-term outcomes. Missing twice starts a new habit — the habit of not doing it. The rule: never miss twice.

Your habits are a vote for the person you want to become. Cast enough votes, and identity follows.`,
  },
  {
    id: "a8",
    category: "Nutrition",
    emoji: "🥗",
    color: "#4ade80",
    title: "What to Eat (and When) to Maximize Your Energy and Focus",
    readTime: "4 min read",
    keywords: ["eat", "meal", "food", "breakfast", "lunch", "dinner", "nutrition", "fuel", "diet", "coffee", "cook", "prep", "prepare", "healthy", "protein", "snack", "hydrate", "water", "smoothie", "shake", "fast", "fasting"],
    summary: "Your diet is the foundation your productivity is built on. Here's what the science says.",
    content: `You can have the best routine in the world, but if your nutrition is off, you're running on a bad fuel source. Cognitive performance, mood, and sustained energy are all directly influenced by what you eat — and when.

**The blood sugar rollercoaster:**

Most people's energy crashes mid-morning and mid-afternoon are caused by blood sugar spikes and crashes. The typical pattern: eat a high-carb breakfast (cereal, toast, pastry), blood sugar spikes, insulin kicks in hard, blood sugar crashes, you feel foggy, tired, and irritable.

The fix: prioritize protein and fat at breakfast. Eggs, Greek yogurt, nuts, or even a protein shake stabilize blood sugar and provide sustained energy for 3-4 hours.

**Coffee and cortisol:**

Most people drink coffee immediately after waking, which is actually the worst time. Your cortisol is naturally at its peak in the first 30-60 minutes after waking. Adding caffeine on top of peak cortisol reduces its effectiveness and accelerates tolerance.

Delay your first coffee by 90 minutes after waking. You'll get more of the alertness benefit and build less dependence.

**Eating for focus:**

Omega-3 fatty acids (found in salmon, sardines, walnuts, and flaxseed) are directly incorporated into brain cell membranes and have been shown to improve cognitive performance and reduce brain fog.

Staying hydrated is equally critical — even mild dehydration (1-2% of body weight) causes measurable decreases in focus, mood, and short-term memory.

**The post-lunch dip:**

The afternoon energy dip isn't inevitable — it's largely caused by large, carb-heavy lunches. Eat a smaller, protein-rich lunch and you'll largely avoid the 2pm slump that drives most people to reach for sugar or more caffeine.

Food is information for your brain. Feed it well.`,
  },
  {
    id: "a9",
    category: "Evening",
    emoji: "🌙",
    color: "#c084fc",
    title: "The Perfect Evening Routine: How to Set Up Tomorrow's Success Tonight",
    readTime: "4 min read",
    keywords: ["evening", "night", "shutdown", "review", "plan", "tomorrow", "wind", "sleep", "journal", "diary", "reflect", "recap", "end", "finish", "close", "pm", "bedtime", "unwind", "decompress", "debrief", "check in", "wrap up", "daily review", "hard shutdown"],
    summary: "What you do in the last hour before bed determines how good tomorrow will be.",
    content: `Most productivity advice focuses on mornings. But the truth is, your morning starts the night before. How you wind down in the evening determines how well you sleep, how rested you feel, and how clearly you think the next day.

**The shutdown ritual:**

Cal Newport recommends ending every workday with a "shutdown complete" ritual — a set of actions that signal to your brain that work is finished. This might include: reviewing your task list, moving unfinished items to tomorrow, closing all tabs, and saying a specific phrase aloud (something like "shutdown complete").

This matters because without a clear signal, your brain continues processing work-related thoughts into the evening — spiking cortisol and disrupting sleep.

**The evening review:**

Spend 5-10 minutes each evening reviewing your day. What did you complete? What didn't get done and why? What's the single most important task for tomorrow? Writing this down clears your mental RAM and reduces the "unfinished business" your brain will otherwise chew on during the night.

**Light and sleep:**

Exposure to blue light (phones, laptops, TVs) in the 2 hours before bed suppresses melatonin production by up to 50%, delaying sleep onset and reducing sleep quality. If you must use screens, use night mode or blue-light-blocking glasses.

The ideal wind-down: dim lights, no screens, light reading, gentle stretching, or journaling. These activities signal to your nervous system that it's safe to downshift from sympathetic ("fight or flight") to parasympathetic ("rest and digest") mode.

**Temperature matters:**

Your core body temperature needs to drop by about 1-2 degrees Fahrenheit to initiate sleep. A warm shower 1-2 hours before bed paradoxically helps with this — it draws blood to the skin's surface, which then dissipates heat rapidly after you get out.

End your day with intention. Your future self wakes up to whatever you set up tonight.`,
  },
  {
    id: "a10",
    category: "Productivity",
    emoji: "📧",
    color: "#5bc8ff",
    title: "Why Batching Your Email Makes You Dramatically More Productive",
    readTime: "3 min read",
    keywords: ["email", "messages", "admin", "batch", "inbox", "slack", "notifications", "communication", "respond", "reply", "correspondence", "paperwork", "tasks", "admin", "errands", "quick wins", "low energy", "calls", "meetings", "catch up"],
    summary: "Checking email constantly is one of the most expensive habits modern workers have.",
    content: `The average knowledge worker checks their email 74 times per day. Each check takes about 64 seconds, but the real cost is far higher — it takes an average of 23 minutes to fully regain deep focus after an interruption.

Do the math. If you're checking email 74 times a day, you're potentially losing hours of focused work time to recovery from interruptions alone.

**The attention residue problem:**

Researcher Sophie Leroy coined the term "attention residue" to describe what happens when you switch tasks. Even after you've moved to a new task, part of your brain remains stuck on the previous one. The more frequently you switch, the more residue accumulates, and the lower your cognitive performance becomes.

Email is an attention residue machine.

**The batching solution:**

Process email in 2-3 dedicated batches per day — perhaps at 9am, 12pm, and 4pm. Outside these windows, your email client is closed. Your notifications are off.

Most emails that feel urgent aren't. If something is truly urgent, people will call. The expectation that you respond within minutes to emails is a norm you can and should reset — by responding reliably during your batch times and communicating this to colleagues.

**What to do with emails when you open them:**

Use the "touch it once" rule. When you open an email, either: delete it, respond (if it takes under 2 minutes), delegate it, or schedule time to handle it. Never read an email and leave it in your inbox to be re-read later. That's double-handling.

Your inbox is not your to-do list. Treat it like a mailbox — process it, empty it, close it. Then get back to the work that actually matters.`,
  },
];

// Match articles to user's routine tasks
function getRelevantArticles(routines) {
  if (!routines || routines.length === 0) {
    // No routines — return a shuffled selection of 3
    return [...ARTICLES].sort(() => Math.random() - 0.5).slice(0, 3);
  }

  const allTaskTitles = routines.flatMap(r => r.blocks.map(b => b.title.toLowerCase()));
  const allText = allTaskTitles.join(" ");

  const scored = ARTICLES.map(article => {
    const matches = article.keywords.filter(kw => allText.includes(kw.toLowerCase())).length;
    return { ...article, score: matches };
  }).sort((a, b) => b.score - a.score);

  const matched = scored.filter(a => a.score > 0).slice(0, 6);

  // If we have enough matches, return them
  if (matched.length >= 3) return matched;

  // Otherwise fill remaining slots with random unmatched articles
  const unmatched = scored.filter(a => a.score === 0).sort(() => Math.random() - 0.5);
  return [...matched, ...unmatched].slice(0, 4);
}

// ── Article Section ───────────────────────────────────────────────────────────
function ArticleSection({ routines }) {
  const [openId, setOpenId] = useState(null);
  const articles = getRelevantArticles(routines);

  return (
    <div style={{ marginTop: 36, paddingBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.12em" }}>📖 For You</div>
        <div style={{ flex: 1, height: 1, background: "#1a1a1a" }} />
        <div style={{ fontSize: 11, color: "#2a2a2a" }}>Based on your routines</div>
      </div>

      {articles.map(article => (
        <div key={article.id} style={{
          background: "#111",
          border: `1px solid ${openId === article.id ? article.color + "44" : "#1a1a1a"}`,
          borderRadius: 14,
          marginBottom: 10,
          overflow: "hidden",
          transition: "border-color 0.2s",
        }}>
          {/* Article header — always visible */}
          <div onClick={() => setOpenId(openId === article.id ? null : article.id)} style={{
            padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, minWidth: 44, borderRadius: 12,
              background: article.color + "18",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>{article.emoji}</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, color: article.color, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>{article.category}</span>
                <span style={{ fontSize: 10, color: "#333" }}>· {article.readTime}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#e0e0e0", lineHeight: 1.3, marginBottom: 3 }}>{article.title}</div>
              {openId !== article.id && (
                <div style={{ fontSize: 12, color: "#444", lineHeight: 1.4 }}>{article.summary}</div>
              )}
            </div>

            <div style={{ color: "#333", fontSize: 18, transition: "transform 0.2s", transform: openId === article.id ? "rotate(180deg)" : "none", minWidth: 20 }}>›</div>
          </div>

          {/* Article body — expanded */}
          {openId === article.id && (
            <div style={{ padding: "0 18px 20px 18px" }}>
              <div style={{ height: 1, background: "#1a1a1a", marginBottom: 16 }} />
              {article.content.split("\n\n").map((para, i) => {
                if (para.startsWith("**") && para.endsWith("**")) {
                  return (
                    <div key={i} style={{ fontSize: 13, fontWeight: 600, color: article.color, marginBottom: 8, marginTop: i > 0 ? 16 : 0 }}>
                      {para.replace(/\*\*/g, "")}
                    </div>
                  );
                }
                // Handle inline bold
                const parts = para.split(/\*\*(.*?)\*\*/g);
                return (
                  <p key={i} style={{ fontSize: 13, color: "#888", lineHeight: 1.8, marginBottom: 12, fontWeight: 300 }}>
                    {parts.map((part, j) =>
                      j % 2 === 1
                        ? <strong key={j} style={{ color: "#bbb", fontWeight: 500 }}>{part}</strong>
                        : part
                    )}
                  </p>
                );
              })}
              <button onClick={() => setOpenId(null)} style={{
                marginTop: 8, background: "transparent", border: `1px solid ${article.color}44`,
                borderRadius: 8, padding: "8px 16px", color: article.color,
                fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>Close article ↑</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RoutineList({ routines, onSelect, onCreate }) {
  if (routines.length === 0) return (
    <div style={{ ...S.section, textAlign: "center", paddingTop: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
      <div style={{ color: "#333", fontSize: 15, marginBottom: 20 }}>No routines yet — plant your first habit!</div>
      <button style={S.btn("primary")} onClick={onCreate}><Icon name="plus" size={14} /> Create Routine</button>
    </div>
  );

  return (
    <div style={S.section}>
      <div style={{ marginTop: 20 }}>
        {routines.map(r => {
          const today = todayKey();
          const done = (r.history[today] || []).length;
          const total = r.blocks.length;
          const pct = total ? Math.round((done / total) * 100) : 0;
          const streak = calcStreak(r.history, total);
          const motivationalMsg = pct === 0
            ? "Tap to start your routine →"
            : pct === 100
            ? "🏆 Perfect day! Come back tomorrow."
            : `${total - done} task${total - done !== 1 ? "s" : ""} left — keep going!`;

          return (
            <div key={r.id} onClick={() => onSelect(r.id)} style={{
              background: "#111",
              border: `1px solid #1e1e1e`,
              borderRadius: 16,
              padding: "22px 22px 18px",
              marginBottom: 14,
              cursor: "pointer",
              transition: "transform 0.15s, border-color 0.2s",
              position: "relative",
              overflow: "hidden",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = r.color + "66"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "#1e1e1e"; }}
            >
              {/* Color accent top bar */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${r.color}, ${r.color}44)`, borderRadius: "16px 16px 0 0" }} />

              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: r.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{r.emoji}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 3, color: "#f0f0f0" }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: "#444" }}>{total} tasks</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  {streak > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#ff6b3518", border: "1px solid #ff6b3530", borderRadius: 20, padding: "3px 10px", color: "#ff6b35", fontSize: 12, fontWeight: 500 }}>
                      🔥 {streak}d streak
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 500, color: pct === 100 ? "#4ade80" : r.color }}>
                    {done}/{total}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#4ade80" : r.color, borderRadius: 3, transition: "width 0.4s" }} />
              </div>

              {/* Mini task preview */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {r.blocks.slice(0, 4).map(b => {
                  const isDone = (r.history[today] || []).includes(b.id);
                  return (
                    <div key={b.id} style={{
                      fontSize: 11, padding: "3px 8px", borderRadius: 6,
                      background: isDone ? r.color + "22" : "#1a1a1a",
                      color: isDone ? r.color : "#333",
                      border: `1px solid ${isDone ? r.color + "40" : "#222"}`,
                      textDecoration: isDone ? "line-through" : "none",
                    }}>{b.title}</div>
                  );
                })}
                {r.blocks.length > 4 && (
                  <div style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "#1a1a1a", color: "#333" }}>+{r.blocks.length - 4} more</div>
                )}
              </div>

              {/* Status message */}
              <div style={{ fontSize: 12, color: pct === 100 ? "#4ade80" : "#383838" }}>{motivationalMsg}</div>
            </div>
          );
        })}
      </div>
      <ArticleSection routines={routines} />
    </div>
  );
}

// ── Routine Detail ────────────────────────────────────────────────────────────
function RoutineDetail({ routine, onToggle, onEditBlock, onDeleteBlock }) {
  const today = todayKey();
  const todayDone = routine.history[today] || [];
  const total = routine.blocks.length;
  const done = todayDone.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const streak = calcStreak(routine.history, total);
  const last7 = calcCompletion(routine.history, total);

  return (
    <div style={S.section}>
      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 38 }}>{routine.emoji}</span>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: "0.05em", color: routine.color, lineHeight: 1 }}>{routine.name}</div>
            <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>{total} tasks</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <StatChip icon="flame" label="Streak" value={`${streak}d`} color="#ff6b35" />
          <StatChip icon="check" label="Today" value={`${pct}%`} color={pct === 100 ? "#4ade80" : routine.color} />
          <StatChip icon="chart" label="This week" value={`${last7.filter(d => d.pct === 100).length}/7`} color="#5bc8ff" />
        </div>

        <div style={{ height: 4, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: routine.color, borderRadius: 3, transition: "width 0.5s" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#444", marginTop: 6 }}>
          <span>Today's progress</span><span>{done}/{total} done</span>
        </div>
      </div>

      <TaskList
        blocks={routine.blocks}
        todayDone={todayDone}
        color={routine.color}
        onToggle={onToggle}
        onEditBlock={onEditBlock}
        onDeleteBlock={onDeleteBlock}
      />

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "#3a3a3a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Last 7 days</div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          {last7.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: "100%", background: "#141414", borderRadius: 4, height: 56, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                <div style={{
                  width: "100%", borderRadius: 4,
                  height: `${d.pct}%`, minHeight: d.pct > 0 ? 4 : 0,
                  background: d.pct === 100 ? routine.color : `${routine.color}44`,
                  transition: "height 0.5s",
                }} />
              </div>
              <div style={{ fontSize: 10, color: "#333" }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {done === total && total > 0 && (
        <div style={{
          textAlign: "center", padding: "22px",
          background: "#0d1a00",
          border: `1px solid ${routine.color}44`, borderRadius: 12, marginBottom: 16,
        }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: routine.color, letterSpacing: "0.08em" }}>🏆 Day Complete!</div>
          <div style={{ color: "#444", fontSize: 13, marginTop: 4 }}>Full routine done. See you tomorrow.</div>
        </div>
      )}
    </div>
  );
}

// ── TaskList with inline editing ─────────────────────────────────────────────
function TaskList({ blocks, todayDone, color, onToggle, onEditBlock, onDeleteBlock }) {
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [editDur, setEditDur] = useState("");

  const startEdit = (e, block) => {
    e.stopPropagation();
    setEditingId(block.id);
    setEditVal(block.title);
    setEditDur(block.duration || "");
  };

  const saveEdit = (blockId) => {
    if (editVal.trim()) onEditBlock(blockId, editVal.trim(), editDur.trim());
    setEditingId(null);
  };

  return (
    <div style={{ marginBottom: 28 }}>
      {blocks.map((block) => {
        const isDone = todayDone.includes(block.id);
        const isEditing = editingId === block.id;

        if (isEditing) {
          return (
            <div key={block.id} style={{
              padding: "12px 16px", borderRadius: 10, marginBottom: 8,
              background: "#0e0e0e", border: `1px solid ${color}66`,
            }}>
              <input
                autoFocus
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveEdit(block.id)}
                style={{ width: "100%", background: "#161616", border: "1px solid #333", borderRadius: 6, padding: "8px 12px", color: "#f0f0f0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", marginBottom: 8, boxSizing: "border-box" }}
                placeholder="Task name..."
              />
              <div style={{ marginBottom: 10 }}>
                <DurationSelect value={editDur} onChange={setEditDur} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => saveEdit(block.id)} style={{ flex: 2, background: color, color: "#080808", border: "none", borderRadius: 7, padding: "8px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Save
                </button>
                <button onClick={() => setEditingId(null)} style={{ flex: 1, background: "transparent", color: "#555", border: "1px solid #222", borderRadius: 7, padding: "8px", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Cancel
                </button>
                <button onClick={() => { onDeleteBlock(block.id); setEditingId(null); }} style={{ background: "#ff444418", color: "#ff4444", border: "1px solid #ff444430", borderRadius: 7, padding: "8px 12px", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  <Icon name="trash" size={13} />
                </button>
              </div>
            </div>
          );
        }

        return (
          <div key={block.id} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 18px", borderRadius: 10, marginBottom: 8,
            background: isDone ? "#0d1a00" : "#0e0e0e",
            border: `1px solid ${isDone ? "#263d00" : "#1a1a1a"}`,
            transition: "all 0.2s", position: "relative",
          }}>
            {/* Check circle */}
            <div onClick={() => onToggle(block.id)} style={{
              width: 22, height: 22, minWidth: 22, borderRadius: "50%",
              border: `2px solid ${isDone ? color : "#2a2a2a"}`,
              background: isDone ? color : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", cursor: "pointer",
            }}>
              {isDone && <Icon name="check" size={12} />}
            </div>

            {/* Text */}
            <div style={{ flex: 1 }} onClick={() => onToggle(block.id)} >
              <div style={{ fontSize: 15, fontWeight: 500, color: isDone ? "#444" : "#f0f0f0", textDecoration: isDone ? "line-through" : "none", transition: "all 0.2s", cursor: "pointer" }}>{block.title}</div>
              {block.startTime
                ? <div style={{ fontSize: 12, color: "#383838", marginTop: 1 }}>{block.startTime} – {block.endTime} · {block.duration}</div>
                : block.duration
                ? <div style={{ fontSize: 12, color: "#383838", marginTop: 1 }}>{block.duration}</div>
                : null
              }
            </div>

            {/* Edit button */}
            <button onClick={(e) => startEdit(e, block)} style={{
              background: "transparent", border: "none", color: "#2a2a2a",
              cursor: "pointer", padding: "4px 6px", borderRadius: 6,
              fontSize: 13, transition: "color 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#666"}
              onMouseLeave={e => e.currentTarget.style.color = "#2a2a2a"}
              title="Edit task"
            >✏️</button>
          </div>
        );
      })}
    </div>
  );
}

function StatChip({ icon, label, value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#111", border: "1px solid #1e1e1e", borderRadius: 8, padding: "7px 12px" }}>
      <span style={{ color }}><Icon name={icon} size={13} /></span>
      <span style={{ fontSize: 12, color: "#444" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color }}>{value}</span>
    </div>
  );
}

// ── Stats View ────────────────────────────────────────────────────────────────
function StatsView({ routines }) {
  if (routines.length === 0) return (
    <div style={{ ...S.section, textAlign: "center", paddingTop: 80 }}>
      <div style={{ color: "#333", fontSize: 15 }}>Create a routine to see your stats.</div>
    </div>
  );

  return (
    <div style={S.section}>
      <div style={{ marginTop: 24 }}>
        {routines.map(r => {
          const streak = calcStreak(r.history, r.blocks.length);
          const last7 = calcCompletion(r.history, r.blocks.length);
          const perfect = last7.filter(d => d.pct === 100).length;
          const avgPct = last7.length ? Math.round(last7.reduce((a, d) => a + d.pct, 0) / last7.length) : 0;
          return (
            <div key={r.id} style={{ ...S.card(r.color), cursor: "default", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>{r.emoji}</span>
                <div style={{ fontWeight: 500, fontSize: 15 }}>{r.name}</div>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                <MiniStat label="Streak" value={`${streak}d 🔥`} color="#ff6b35" />
                <MiniStat label="Perfect (7d)" value={`${perfect}/7`} color={r.color} />
                <MiniStat label="Avg completion" value={`${avgPct}%`} color="#5bc8ff" />
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
                {last7.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: "100%", background: "#1a1a1a", borderRadius: 3, height: 40, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                      <div style={{ width: "100%", height: `${d.pct}%`, minHeight: d.pct > 0 ? 3 : 0, background: d.pct === 100 ? r.color : `${r.color}44`, borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 9, color: "#2a2a2a" }}>{d.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ background: "#0a0a0a", borderRadius: 8, padding: "8px 12px", flex: 1, minWidth: 90 }}>
      <div style={{ fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 500, color }}>{value}</div>
    </div>
  );
}

// ── Create Modal ──────────────────────────────────────────────────────────────
function CreateModal({ onSave, onClose }) {
  const [mode, setMode] = useState("choose"); // "choose" | "ai" | "manual"

  return (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modalBox}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.1em", color: "#f4c430" }}>
            {mode === "choose" ? "NEW ROUTINE" : mode === "ai" ? "AI ROUTINE BUILDER" : "BUILD MANUALLY"}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {mode !== "choose" && (
              <button style={S.btn("ghost")} onClick={() => setMode("choose")}>← Back</button>
            )}
            <button style={S.btn("ghost")} onClick={onClose}><Icon name="close" size={16} /></button>
          </div>
        </div>

        {mode === "choose" && <ChooseMode onSelect={setMode} />}
        {mode === "ai" && <AIQuestionnaire onSave={onSave} />}
        {mode === "manual" && <ManualBuilder onSave={onSave} />}
      </div>
    </div>
  );
}

// ── Choose Mode ───────────────────────────────────────────────────────────────
function ChooseMode({ onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <button onClick={() => { track("routine_create_start", { method: "ai" }); onSelect("ai"); }} style={{
        background: "#0d1a00", border: "1px solid #f4c43040", borderRadius: 12,
        padding: "24px 20px", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#f4c430"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "#f4c43040"}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
        <div style={{ fontSize: 16, fontWeight: 500, color: "#f4c430", marginBottom: 6 }}>Generate with AI</div>
        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>Answer a few questions and let AI build a personalized routine based on your goals, schedule, and lifestyle.</div>
      </button>

      <button onClick={() => { track("routine_create_start", { method: "manual" }); onSelect("manual"); }} style={{
        background: "#0e0e0e", border: "1px solid #222", borderRadius: 12,
        padding: "24px 20px", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#444"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "#222"}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>✏️</div>
        <div style={{ fontSize: 16, fontWeight: 500, color: "#f0f0f0", marginBottom: 6 }}>Build Manually</div>
        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>Create your own routine from scratch — add blocks, set durations, and customise everything yourself.</div>
      </button>
    </div>
  );
}

// ── AI Questionnaire ──────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: "goal",
    question: "What are your main goals?",
    type: "multi",
    options: ["Be more productive", "Get fit & healthy", "Learn new skills", "Reduce stress & improve wellbeing", "Build a morning routine", "Eat better & nutrition", "Sleep better", "Build more discipline"],
  },
  {
    id: "schedule",
    question: "What's your work schedule?",
    type: "multi",
    options: ["9-5 office job", "Remote / work from home", "Freelancer / self-employed", "Student", "Shift worker", "Stay at home"],
  },
  {
    id: "time",
    question: "How much time can you dedicate daily?",
    type: "single",
    options: ["30 minutes", "1 hour", "1-2 hours", "2-3 hours", "3+ hours"],
  },
  {
    id: "wakeup",
    question: "What time do you usually wake up?",
    type: "single",
    options: ["5:00 AM", "5:30 AM", "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM"],
  },
  {
    id: "struggle",
    question: "What are your biggest daily struggles?",
    type: "multi",
    options: ["Procrastination & focus", "No energy or motivation", "Too many distractions", "Poor sleep", "No time for myself", "Staying consistent", "Lack of discipline", "Overwhelm & anxiety", "Poor diet habits"],
  },
  {
    id: "workout",
    question: "Do you want to include exercise?",
    type: "multi",
    options: ["Morning workout", "Midday movement", "Evening training", "Daily walks", "Yoga / stretching", "No exercise for now"],
  },
  {
    id: "learning",
    question: "What do you want to learn or develop?",
    type: "multi",
    options: ["Work / career skills", "A hobby or passion", "Daily reading", "Language learning", "Journaling & reflection", "No learning block"],
  },
  {
    id: "wind",
    question: "How do you want to end your day?",
    type: "multi",
    options: ["Evening review & planning", "Relaxation & wind-down", "Creative time", "Family / social time", "Light reading", "Meditation or breathing", "Just shut down and rest"],
  },
];

// Suggestions for each task type shown in preview
const TASK_SUGGESTIONS = {
  "morning ritual": ["10 min stretching", "5 min meditation", "Drink 500ml water", "Cold shower", "Journaling (5 min)", "Read 10 pages", "Healthy breakfast", "Gratitude list (3 things)"],
  "morning routine": ["10 min stretching", "5 min meditation", "Drink 500ml water", "Cold shower", "Journaling (5 min)", "Read 10 pages", "Healthy breakfast"],
  "workout": ["20 min run", "30 min gym session", "15 min HIIT", "20 min yoga", "30 min cycling", "Bodyweight circuit", "Swimming"],
  "exercise": ["20 min run", "30 min gym session", "15 min HIIT", "20 min yoga", "30 min cycling"],
  "walk": ["Neighbourhood walk", "Podcast walk", "Mindful walk (no phone)", "Walk to work", "Post-meal walk"],
  "meditation": ["Box breathing (4-4-4-4)", "Body scan meditation", "Guided meditation app", "5 min breathwork", "Mindful sitting"],
  "reading": ["Non-fiction chapter", "Industry articles", "Personal development book", "Fiction (leisure)", "Audiobook"],
  "deep work": ["Write / create content", "Code a feature", "Strategic planning", "Research project", "Design work", "Client deliverable"],
  "focus": ["Write / create content", "Code a feature", "Strategic planning", "Research project"],
  "email": ["Process inbox to zero", "Respond to priority emails", "Unsubscribe from junk", "Draft replies", "Archive old emails"],
  "learning": ["Online course lesson", "Skill practice (30 min)", "Watch tutorial", "Language app (Duolingo)", "Take notes on topic"],
  "journal": ["Gratitude list (3 things)", "Brain dump", "Daily reflection", "Goals check-in", "Mood tracking"],
  "meal": ["Prep healthy lunch", "Cook dinner", "Meal plan for week", "Smoothie / shake", "Mindful eating (no screens)"],
  "review": ["Review today's tasks", "Plan tomorrow", "Weekly goals check", "Habit tracker update", "Celebrate wins"],
  "wind down": ["No screens (1hr before bed)", "Light stretching", "Read fiction", "Herbal tea", "Dim lights ritual"],
  "sleep": ["Sleep by target time", "No screens 1hr before", "Room temperature check", "Write tomorrow's top 3 tasks"],
  "default": ["Break it into smaller steps", "Set a 25-min timer (Pomodoro)", "Remove distractions first", "Do the hardest part first", "Track completion"],
};

function getTaskSuggestions(taskTitle) {
  const lower = taskTitle.toLowerCase();
  for (const [key, suggestions] of Object.entries(TASK_SUGGESTIONS)) {
    if (lower.includes(key)) return suggestions;
  }
  return TASK_SUGGESTIONS["default"];
}

// Parse wake time string to minutes since midnight
function parseWakeTime(wakeStr) {
  const match = wakeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 7 * 60; // default 7am
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

// Format minutes since midnight to "7:00 AM"
function fmtTime(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const ampm = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// Parse duration string to minutes
function parseDuration(durStr) {
  if (!durStr) return 30;
  const hourMatch = durStr.match(/(\d+)\s*hr/i);
  const minMatch = durStr.match(/(\d+)\s*min/i);
  let total = 0;
  if (hourMatch) total += parseInt(hourMatch[1]) * 60;
  if (minMatch) total += parseInt(minMatch[1]);
  return total || 30;
}

// Add start/end times to blocks given a wake time string
function addTimesToBlocks(blocks, wakeTimeStr) {
  let cursor = parseWakeTime(wakeTimeStr);
  return blocks.map(b => {
    const dur = parseDuration(b.duration);
    const start = fmtTime(cursor);
    cursor += dur;
    const end = fmtTime(cursor);
    return { ...b, startTime: start, endTime: end };
  });
}

function AIQuestionnaire({ onSave }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState([]); // for multi-select current step
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [emoji, setEmoji] = useState("🌅");
  const [color, setColor] = useState("#f4c430");
  const [openSuggestions, setOpenSuggestions] = useState(null); // block id

  const q = QUESTIONS[step];
  const progress = Math.round((step / QUESTIONS.length) * 100);
  const isMulti = q.type === "multi";

  const toggleOption = (opt) => {
    setSelected(prev =>
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    );
  };

  const commitStep = (val) => {
    const newAnswers = { ...answers, [q.id]: val };
    setAnswers(newAnswers);
    setSelected([]);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      generateRoutine(newAnswers);
    }
  };

  const generateRoutine = async (finalAnswers) => {
    setLoading(true);
    setError(null);
    try {
      const wakeTime = finalAnswers.wakeup || "7:00 AM";
      const prompt = `You are a productivity and wellness coach. Based on the user's answers below, generate a personalized daily routine.

User answers:
- Main goals: ${Array.isArray(finalAnswers.goal) ? finalAnswers.goal.join(", ") : finalAnswers.goal}
- Work schedule: ${Array.isArray(finalAnswers.schedule) ? finalAnswers.schedule.join(", ") : finalAnswers.schedule}
- Available time per day: ${finalAnswers.time}
- Wake up time: ${wakeTime}
- Biggest struggles: ${Array.isArray(finalAnswers.struggle) ? finalAnswers.struggle.join(", ") : finalAnswers.struggle}
- Exercise preferences: ${Array.isArray(finalAnswers.workout) ? finalAnswers.workout.join(", ") : finalAnswers.workout}
- Learning preferences: ${Array.isArray(finalAnswers.learning) ? finalAnswers.learning.join(", ") : finalAnswers.learning}
- Evening preferences: ${Array.isArray(finalAnswers.wind) ? finalAnswers.wind.join(", ") : finalAnswers.wind}

Create a realistic daily routine with 8-12 tasks starting from their wake time of ${wakeTime}.
Use real time durations like "30 min", "1 hour", "45 min" etc.

Respond ONLY with a valid JSON object in this exact format:
{
  "name": "Routine name (short, 2-4 words)",
  "tasks": [
    { "title": "Task name", "duration": "X min" },
    ...
  ]
}`;

      const response = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error("API error: " + data.error.message);
      if (!data.content || !data.content[0]) throw new Error("No content in response");

      const rawText = data.content[0].text;
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");

      const parsed = JSON.parse(jsonMatch[0]);
      const rawBlocks = parsed.tasks || parsed.blocks || parsed.routine?.tasks || parsed.routine?.blocks;
      if (!rawBlocks || !Array.isArray(rawBlocks) || rawBlocks.length === 0) throw new Error("Invalid tasks in response");

      const blocks = rawBlocks.map(b => ({
        id: uid(),
        title: b.title || b.name || b.task || "",
        duration: b.duration || b.time || "30 min",
      })).filter(b => b.title.trim());

      // Add start/end times based on wake time
      const timedBlocks = addTimesToBlocks(blocks, wakeTime);
      setPreview({ name: parsed.name, blocks: timedBlocks });
    } catch (e) {
      console.error("API Error:", e);
      setError("Something went wrong: " + e.message);
    }
    setLoading(false);
  };

  const handleSave = () => {
    if (preview) {
      track("routine_created", { method: "ai", name: preview.name, goal: answers.goal || "" });
      onSave({ name: preview.name, emoji, color, blocks: preview.blocks });
    }
  };

  const addSuggestion = (blockId, suggestion) => {
    setPreview(p => ({
      ...p,
      blocks: p.blocks.map(b =>
        b.id === blockId ? { ...b, title: suggestion } : b
      ),
    }));
    setOpenSuggestions(null);
  };

  // Loading state
  if (loading) return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <div style={{ fontSize: 40, marginBottom: 16, animation: "spin 1.5s linear infinite", display: "inline-block" }}>🌱</div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#f4c430", letterSpacing: "0.1em", marginBottom: 8 }}>Building your routine...</div>
      <div style={{ fontSize: 13, color: "#555" }}>AI is personalising your daily tasks</div>
    </div>
  );

  // Error state
  if (error) return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 13, color: "#ff4444", marginBottom: 16 }}>{error}</div>
      <button style={{ ...S.btn("primary"), margin: "0 auto" }} onClick={() => generateRoutine(answers)}>Try Again</button>
    </div>
  );

  // Preview generated routine
  if (preview) return (
    <div>
      <div style={{ fontSize: 13, color: "#555", marginBottom: 16, textAlign: "center" }}>
        ✨ Review your routine — tap any task to see suggestions
      </div>

      <label style={S.label}>Routine Name</label>
      <input style={{ ...S.input, marginBottom: 18 }} value={preview.name}
        onChange={e => setPreview(p => ({ ...p, name: e.target.value }))} />

      <label style={S.label}>Emoji</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {EMOJIS.map(e => (
          <button key={e} onClick={() => setEmoji(e)} style={{
            width: 36, height: 36, borderRadius: 8,
            border: `2px solid ${emoji === e ? color : "#222"}`,
            background: emoji === e ? "#ffffff0a" : "transparent",
            fontSize: 18, cursor: "pointer",
          }}>{e}</button>
        ))}
      </div>

      <label style={S.label}>Color</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)} style={{
            width: 26, height: 26, borderRadius: "50%", background: c,
            border: `3px solid ${color === c ? "#fff" : "transparent"}`,
            cursor: "pointer",
          }} />
        ))}
      </div>

      <label style={S.label}>Generated Tasks ({preview.blocks.length}) — tap to expand</label>
      <div style={{ maxHeight: 320, overflowY: "auto", marginBottom: 18 }}>
        {preview.blocks.map((block, i) => {
          const suggestions = getTaskSuggestions(block.title);
          const isOpen = openSuggestions === block.id;
          return (
            <div key={block.id} style={{ marginBottom: 6 }}>
              {/* Task row */}
              <div
                onClick={() => setOpenSuggestions(isOpen ? null : block.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", background: isOpen ? "#161600" : "#0e0e0e",
                  border: `1px solid ${isOpen ? color + "60" : "#1a1a1a"}`,
                  borderRadius: isOpen ? "8px 8px 0 0" : 8,
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#080808", fontWeight: 700, minWidth: 20 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#ddd" }}>{block.title}</div>
                  {block.startTime && (
                    <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>
                      {block.startTime} – {block.endTime} · {block.duration}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: isOpen ? color : "#333", transition: "transform 0.2s", transform: isOpen ? "rotate(90deg)" : "none" }}>›</div>
              </div>

              {/* Suggestions dropdown */}
              {isOpen && (
                <div style={{ background: "#0a0a00", border: `1px solid ${color}30`, borderTop: "none", borderRadius: "0 0 8px 8px", padding: "8px" }}>
                  <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", padding: "4px 6px 8px" }}>
                    Suggestions — tap to replace
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {suggestions.map((s, si) => (
                      <button key={si} onClick={() => addSuggestion(block.id, s)} style={{
                        background: "#1a1a00", border: `1px solid ${color}30`,
                        borderRadius: 6, padding: "5px 10px", fontSize: 12,
                        color: "#aaa", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.15s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = color + "22"; e.currentTarget.style.color = color; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#1a1a00"; e.currentTarget.style.color = "#aaa"; }}
                      >{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ ...S.btn("outline"), flex: 1, justifyContent: "center" }} onClick={() => { setPreview(null); setStep(0); setAnswers({}); setSelected([]); }}>
          Start Over
        </button>
        <button style={{ ...S.btn("primary"), flex: 2, justifyContent: "center", padding: "12px" }} onClick={handleSave}>
          Save Routine <Icon name="arrow" size={14} />
        </button>
      </div>
    </div>
  );

  // Question steps — single or multi select
  return (
    <div>
      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#444", marginBottom: 8 }}>
          <span>Question {step + 1} of {QUESTIONS.length}</span>
          <span>{progress}%</span>
        </div>
        <div style={{ height: 3, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "#f4c430", borderRadius: 2, transition: "width 0.3s" }} />
        </div>
      </div>

      <div style={{ fontSize: 17, fontWeight: 500, color: "#f0f0f0", marginBottom: 6, lineHeight: 1.4 }}>{q.question}</div>
      {isMulti && <div style={{ fontSize: 12, color: "#444", marginBottom: 16 }}>Select all that apply</div>}
      {!isMulti && <div style={{ fontSize: 12, color: "#444", marginBottom: 16 }}>Choose one</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map(opt => {
          const isSelected = selected.includes(opt);
          return (
            <button key={opt} onClick={() => isMulti ? toggleOption(opt) : commitStep(opt)} style={{
              background: isSelected ? "#f4c43015" : "#0e0e0e",
              border: `1px solid ${isSelected ? "#f4c430" : "#1e1e1e"}`,
              borderRadius: 9, padding: "12px 16px", cursor: "pointer",
              textAlign: "left", fontSize: 14,
              color: isSelected ? "#f4c430" : "#aaa",
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              {isMulti && (
                <div style={{
                  width: 18, height: 18, minWidth: 18, borderRadius: 4,
                  border: `2px solid ${isSelected ? "#f4c430" : "#333"}`,
                  background: isSelected ? "#f4c430" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, color: "#080808", fontWeight: 700,
                }}>{isSelected ? "✓" : ""}</div>
              )}
              {opt}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        {step > 0
          ? <button style={{ ...S.btn("ghost") }} onClick={() => { setStep(step - 1); setSelected([]); }}>← Back</button>
          : <div />
        }
        {isMulti && (
          <button
            style={{ ...S.btn(selected.length > 0 ? "primary" : "outline"), opacity: selected.length > 0 ? 1 : 0.4 }}
            onClick={() => selected.length > 0 && commitStep(selected)}
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  );
}

// ── Manual Builder ────────────────────────────────────────────────────────────
// ── Manual Builder ────────────────────────────────────────────────────────────
function ManualBuilder({ onSave }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [color, setColor] = useState("#f4c430");
  const [blocks, setBlocks] = useState([{ id: uid(), title: "", duration: "" }]);
  const [useTimings, setUseTimings] = useState(false);
  const [startTime, setStartTime] = useState("7:00 AM");

  const addBlock = () => setBlocks(b => [...b, { id: uid(), title: "", duration: "" }]);
  const removeBlock = (id) => setBlocks(b => b.filter(x => x.id !== id));
  const updateBlock = (id, field, val) => setBlocks(b => b.map(x => x.id === id ? { ...x, [field]: val } : x));

  // Live-compute time slots for preview
  const blocksWithTimes = useTimings
    ? addTimesToBlocks(blocks, startTime)
    : blocks;

  const handleSave = () => {
    if (!name.trim()) return window.alert("Give your routine a name!");
    const validBlocks = blocksWithTimes.filter(b => b.title.trim());
    if (validBlocks.length === 0) return window.alert("Add at least one task.");
    track("routine_created", { method: "manual", name: name.trim() });
    onSave({ name: name.trim(), emoji, color, blocks: validBlocks });
  };

  return (
    <div>
      <label style={S.label}>Routine Name</label>
      <input style={{ ...S.input, marginBottom: 18 }} placeholder="e.g. Morning Focus" value={name} onChange={e => setName(e.target.value)} />

      <label style={S.label}>Emoji</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {EMOJIS.map(e => (
          <button key={e} onClick={() => setEmoji(e)} style={{
            width: 36, height: 36, borderRadius: 8,
            border: `2px solid ${emoji === e ? color : "#222"}`,
            background: emoji === e ? "#ffffff0a" : "transparent",
            fontSize: 18, cursor: "pointer",
          }}>{e}</button>
        ))}
      </div>

      <label style={S.label}>Color</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
        {COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)} style={{
            width: 26, height: 26, borderRadius: "50%", background: c,
            border: `3px solid ${color === c ? "#fff" : "transparent"}`,
            cursor: "pointer",
          }} />
        ))}
      </div>

      {/* Time scheduling toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, padding: "12px 16px", background: "#0e0e0e", border: "1px solid #1e1e1e", borderRadius: 10 }}>
        <div>
          <div style={{ fontSize: 13, color: "#ddd", fontWeight: 500 }}>⏰ Time-specific schedule</div>
          <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>Auto-calculate start & end times</div>
        </div>
        <div
          onClick={() => setUseTimings(t => !t)}
          style={{
            width: 42, height: 24, borderRadius: 12, cursor: "pointer",
            background: useTimings ? "#f4c430" : "#222",
            position: "relative", transition: "background 0.2s",
          }}
        >
          <div style={{
            width: 18, height: 18, borderRadius: "50%", background: "#fff",
            position: "absolute", top: 3,
            left: useTimings ? 21 : 3,
            transition: "left 0.2s",
          }} />
        </div>
      </div>

      {/* Start time picker — only shown when toggle is on */}
      {useTimings && (
        <div style={{ marginBottom: 18 }}>
          <label style={S.label}>Routine Start Time</label>
          <select
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            style={{
              width: "100%", background: "#161616", border: "1px solid #252525",
              borderRadius: 8, padding: "10px 14px", color: "#f0f0f0",
              fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none",
              cursor: "pointer", appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 32,
            }}
          >
            {["5:00 AM","5:30 AM","6:00 AM","6:30 AM","7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM"].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      <label style={S.label}>Tasks</label>
      {blocks.map((block, i) => {
        const timed = blocksWithTimes[i];
        return (
          <div key={block.id} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ ...S.input, flex: 2 }}
                placeholder="Task name e.g. Morning run, Deep work, Read..."
                value={block.title}
                onChange={e => updateBlock(block.id, "title", e.target.value)}
              />
              <DurationSelect value={block.duration} onChange={val => updateBlock(block.id, "duration", val)} />
              {blocks.length > 1 && (
                <button style={S.btn("danger")} onClick={() => removeBlock(block.id)}><Icon name="trash" size={14} /></button>
              )}
            </div>
            {/* Show computed time slot live */}
            {useTimings && timed.startTime && timed.duration && (
              <div style={{ fontSize: 11, color: "#f4c43066", marginTop: 4, paddingLeft: 4 }}>
                🕐 {timed.startTime} – {timed.endTime}
              </div>
            )}
          </div>
        );
      })}

      <button style={{ ...S.btn("outline"), marginBottom: 22, width: "100%", justifyContent: "center" }} onClick={addBlock}>
        <Icon name="plus" size={14} /> Add Task
      </button>

      <button style={{ ...S.btn("primary"), width: "100%", justifyContent: "center", padding: "12px" }} onClick={handleSave}>
        Create Routine <Icon name="arrow" size={14} />
      </button>
    </div>
  );
}

// ── Share Modal ───────────────────────────────────────────────────────────────
function ShareModal({ routine, onClose, onToast }) {
  const shareText = `🌱 My "${routine.name}" routine on Habito\n\n${routine.blocks.map((b, i) => `${i + 1}. ${b.title}${b.duration ? ` · ${b.duration}` : ""}`).join("\n")}\n\nBuilt with Habito — habit + momentum`;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      onToast("Copied to clipboard! 🌱");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modalBox}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.1em", color: "#f4c430" }}>SHARE ROUTINE</div>
          <button style={S.btn("ghost")} onClick={onClose}><Icon name="close" size={16} /></button>
        </div>
        <div style={{ background: "#0a0a0a", borderRadius: 10, padding: 16, marginBottom: 16, fontSize: 13, color: "#666", lineHeight: 1.8, whiteSpace: "pre-line", border: "1px solid #1a1a1a" }}>
          {shareText}
        </div>
        <button style={{ ...S.btn(copied ? "outline" : "primary"), width: "100%", justifyContent: "center", padding: "12px" }} onClick={copy}>
          <Icon name="copy" size={14} /> {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
        <div style={{ marginTop: 10, fontSize: 12, color: "#2a2a2a", textAlign: "center" }}>
          Share anywhere — messages, Discord, Twitter, Notion
        </div>
      </div>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function Dashboard() {
  const [log, setLog] = useState([]);
  const [routines, setRoutines] = useState([]);

  useEffect(() => {
    // Load analytics log
    try {
      const raw = localStorage.getItem("habito_analytics");
      setLog(raw ? JSON.parse(raw) : []);
    } catch(_) { setLog([]); }
    // Load routines
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const d = raw ? JSON.parse(raw) : null;
      setRoutines(d?.routines || []);
    } catch(_) { setRoutines([]); }
  }, []);

  // ── Computed stats ──
  const today = todayKey();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const totalVisits = log.filter(e => e.event === "page_view").length;
  const aiCreations = log.filter(e => e.event === "routine_created" && e.params?.method === "ai").length;
  const manualCreations = log.filter(e => e.event === "routine_created" && e.params?.method === "manual").length;
  const totalCompletions = log.filter(e => e.event === "routine_completed").length;
  const todayCompletions = log.filter(e => e.event === "routine_completed" && e.date === today).length;

  // Completions per day (last 7)
  const completionsPerDay = last7Days.map(date => ({
    date,
    label: new Date(date + "T12:00:00").toLocaleDateString("en", { weekday: "short" }),
    count: log.filter(e => e.event === "routine_completed" && e.date === date).length,
  }));
  const maxCompletions = Math.max(...completionsPerDay.map(d => d.count), 1);

  // AI vs manual
  const totalCreations = aiCreations + manualCreations;
  const aiPct = totalCreations ? Math.round((aiCreations / totalCreations) * 100) : 0;
  const manualPct = totalCreations ? 100 - aiPct : 0;

  // Popular goals from AI questionnaire
  const goalCounts = {};
  log.filter(e => e.event === "routine_created" && e.params?.goal).forEach(e => {
    const g = e.params.goal;
    goalCounts[g] = (goalCounts[g] || 0) + 1;
  });
  const topGoals = Object.entries(goalCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Popular routine names
  const nameCounts = {};
  log.filter(e => e.event === "routine_created" && e.params?.name).forEach(e => {
    const n = e.params.name;
    nameCounts[n] = (nameCounts[n] || 0) + 1;
  });
  const topNames = Object.entries(nameCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const DS = {
    page: { minHeight: "100vh", background: "#080808", color: "#f0f0f0", fontFamily: "'DM Sans', sans-serif", padding: "0 0 60px" },
    topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: "1px solid #1a1a1a", position: "sticky", top: 0, background: "#080808", zIndex: 50 },
    title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.1em", color: "#f4c430" },
    body: { padding: "28px", maxWidth: 900, margin: "0 auto" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 },
    statCard: (color) => ({ background: "#111", border: `1px solid #1e1e1e`, borderLeft: `3px solid ${color}`, borderRadius: 12, padding: "20px" }),
    statVal: (color) => ({ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: "0.04em", color, lineHeight: 1, marginBottom: 4 }),
    statLabel: { fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em" },
    section: { background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "22px", marginBottom: 16 },
    sectionTitle: { fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 },
    bar: (pct, color) => ({ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, minWidth: pct > 0 ? 4 : 0, transition: "width 0.5s" }),
  };

  return (
    <div style={DS.page}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      <div style={DS.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }} onClick={() => navigate("/app")}>← Back to App</button>
          <div style={DS.title}>📊 HABITO DASHBOARD</div>
        </div>
        <div style={{ fontSize: 12, color: "#333" }}>Your analytics · {new Date().toLocaleDateString("en", { dateStyle: "medium" })}</div>
      </div>

      <div style={DS.body}>

        {/* Key stats */}
        <div style={DS.grid}>
          <div style={DS.statCard("#f4c430")}>
            <div style={DS.statVal("#f4c430")}>{totalVisits}</div>
            <div style={DS.statLabel}>Total Page Views</div>
          </div>
          <div style={DS.statCard("#5bc8ff")}>
            <div style={DS.statVal("#5bc8ff")}>{totalCreations}</div>
            <div style={DS.statLabel}>Routines Created</div>
          </div>
          <div style={DS.statCard("#4ade80")}>
            <div style={DS.statVal("#4ade80")}>{totalCompletions}</div>
            <div style={DS.statLabel}>Total Completions</div>
          </div>
          <div style={DS.statCard("#ff6b35")}>
            <div style={DS.statVal("#ff6b35")}>{todayCompletions}</div>
            <div style={DS.statLabel}>Completions Today</div>
          </div>
          <div style={DS.statCard("#c084fc")}>
            <div style={DS.statVal("#c084fc")}>{routines.length}</div>
            <div style={DS.statLabel}>Active Routines</div>
          </div>
        </div>

        {/* Completions chart */}
        <div style={DS.section}>
          <div style={DS.sectionTitle}>Routine completions — last 7 days</div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 80 }}>
            {completionsPerDay.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 11, color: "#555" }}>{d.count > 0 ? d.count : ""}</div>
                <div style={{ width: "100%", background: "#1a1a1a", borderRadius: 4, height: 52, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                  <div style={{ width: "100%", height: `${(d.count / maxCompletions) * 100}%`, minHeight: d.count > 0 ? 4 : 0, background: "#4ade80", borderRadius: 4, transition: "height 0.5s" }} />
                </div>
                <div style={{ fontSize: 10, color: "#333" }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI vs Manual */}
        <div style={DS.section}>
          <div style={DS.sectionTitle}>Creation method — AI vs Manual</div>
          {totalCreations === 0 ? (
            <div style={{ fontSize: 13, color: "#333" }}>No routines created yet</div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f4c430" }} />
                  <span style={{ fontSize: 13, color: "#888" }}>🤖 AI Generated</span>
                  <span style={{ fontSize: 15, fontWeight: 500, color: "#f4c430" }}>{aiCreations} ({aiPct}%)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#5bc8ff" }} />
                  <span style={{ fontSize: 13, color: "#888" }}>✏️ Manual</span>
                  <span style={{ fontSize: 15, fontWeight: 500, color: "#5bc8ff" }}>{manualCreations} ({manualPct}%)</span>
                </div>
              </div>
              <div style={{ height: 12, background: "#1a1a1a", borderRadius: 6, overflow: "hidden", display: "flex" }}>
                <div style={{ width: `${aiPct}%`, background: "#f4c430", transition: "width 0.5s", minWidth: aiPct > 0 ? 4 : 0 }} />
                <div style={{ width: `${manualPct}%`, background: "#5bc8ff", transition: "width 0.5s", minWidth: manualPct > 0 ? 4 : 0 }} />
              </div>
            </>
          )}
        </div>

        {/* Top goals + Top routine names */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={DS.section}>
            <div style={DS.sectionTitle}>Top goals (AI users)</div>
            {topGoals.length === 0 ? (
              <div style={{ fontSize: 13, color: "#333" }}>No data yet</div>
            ) : topGoals.map(([goal, count], i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 4 }}>
                  <span>{goal}</span><span style={{ color: "#f4c430" }}>{count}</span>
                </div>
                <div style={{ height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(count / topGoals[0][1]) * 100}%`, background: "#f4c430", borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>

          <div style={DS.section}>
            <div style={DS.sectionTitle}>Popular routine names</div>
            {topNames.length === 0 ? (
              <div style={{ fontSize: 13, color: "#333" }}>No data yet</div>
            ) : topNames.map(([name, count], i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 4 }}>
                  <span>{name}</span><span style={{ color: "#5bc8ff" }}>{count}</span>
                </div>
                <div style={{ height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(count / topNames[0][1]) * 100}%`, background: "#5bc8ff", borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20, fontSize: 12, color: "#2a2a2a", textAlign: "center" }}>
          Note: Stats are stored locally per browser. For cross-device analytics, check Google Analytics at analytics.google.com
        </div>
      </div>
    </div>
  );
}
