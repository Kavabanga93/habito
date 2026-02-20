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
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const todayKey = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 9);
const STORAGE_KEY = "habito_v1";

const DEFAULT_ROUTINES = [
  {
    id: "demo1",
    name: "Daily Productivity",
    emoji: "🌅",
    color: "#f4c430",
    blocks: [
      { id: "b1",  title: "Morning intention — no phone yet", duration: "15 min" },
      { id: "b2",  title: "Light movement & fuel up", duration: "15 min" },
      { id: "b3",  title: "Deep Work #1 — Your hardest task", duration: "90 min" },
      { id: "b4",  title: "Email & messages batch", duration: "20 min" },
      { id: "b5",  title: "Workout — full energy reset", duration: "60 min" },
      { id: "b6",  title: "Cool down, shower & lunch", duration: "20 min" },
      { id: "b7",  title: "Deep Work #2 — Secondary tasks", duration: "60 min" },
      { id: "b8",  title: "Quick wins & low-energy tasks", duration: "20 min" },
      { id: "b9",  title: "Dedicated hobby learning time", duration: "45 min" },
      { id: "b10", title: "Daily review — what got done?", duration: "10 min" },
      { id: "b11", title: "Hard shutdown — close everything", duration: "5 min" },
    ],
    history: {},
    createdAt: Date.now(),
    shared: false,
  },
];

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

// ── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  app: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#f0f0f0",
    fontFamily: "'DM Sans', sans-serif",
    padding: "0 0 80px",
  },
  topbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 24px 16px",
    borderBottom: "1px solid #1a1a1a",
    position: "sticky", top: 0, background: "#0a0a0a", zIndex: 50,
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
export default function Root() {
  const path = usePath();
  if (path === "/app") return <HabitoApp />;
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
        nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:18px 48px;background:#08080899;backdrop-filter:blur(12px);border-bottom:1px solid #ffffff08}
        .nav-logo{display:flex;align-items:center;gap:10px}
        .nav-mark{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,var(--yellow),var(--orange));display:flex;align-items:center;justify-content:center;font-size:17px}
        .nav-name{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:0.12em}
        .nav-links{display:flex;gap:32px;align-items:center}
        .nav-links a{font-size:13px;color:var(--muted);text-decoration:none;transition:color 0.2s}
        .nav-links a:hover{color:var(--text)}
        .nav-cta{background:var(--yellow);color:#080808;padding:9px 20px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;border:none;font-family:'DM Sans',sans-serif}
        .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;position:relative;overflow:hidden}
        .hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 40% at 50% 30%,#f4c43014 0%,transparent 70%);pointer-events:none}
        .hero-badge{display:inline-flex;align-items:center;gap:7px;background:#f4c43012;border:1px solid #f4c43030;border-radius:20px;padding:6px 14px;font-size:12px;color:var(--yellow);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:32px;animation:fadeUp 0.6s ease both}
        .hero-badge span{width:6px;height:6px;border-radius:50%;background:var(--yellow);display:inline-block}
        .hero-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(72px,14vw,148px);letter-spacing:0.02em;line-height:0.88;margin-bottom:12px;animation:fadeUp 0.6s 0.1s ease both}
        .hero-title em{font-style:italic;font-family:'Fraunces',serif;color:var(--yellow);font-size:0.92em}
        .hero-sub{font-size:clamp(16px,2.5vw,22px);color:var(--muted);font-weight:300;max-width:480px;line-height:1.6;margin-bottom:48px;animation:fadeUp 0.6s 0.2s ease both}
        .hero-sub strong{color:#888;font-weight:400}
        .hero-actions{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;animation:fadeUp 0.6s 0.3s ease both}
        .btn-primary{background:var(--yellow);color:#080808;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:500;font-family:'DM Sans',sans-serif;display:inline-flex;align-items:center;gap:8px;transition:all 0.2s;box-shadow:0 0 40px #f4c43030;cursor:pointer;border:none}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 0 60px #f4c43050}
        .btn-ghost{background:transparent;color:var(--muted);padding:14px 28px;border-radius:10px;font-size:15px;font-family:'DM Sans',sans-serif;border:1px solid #222;display:inline-flex;align-items:center;gap:8px;transition:all 0.2s;text-decoration:none}
        .btn-ghost:hover{border-color:#444;color:var(--text)}
        .hero-social{margin-top:56px;display:flex;gap:32px;align-items:center;font-size:13px;color:#333;animation:fadeUp 0.6s 0.4s ease both;flex-wrap:wrap;justify-content:center}
        .hero-social strong{color:#666}
        .features{padding:100px 24px;max-width:1100px;margin:0 auto}
        .section-label{text-align:center;font-size:11px;color:var(--yellow);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:16px}
        .section-title{text-align:center;font-family:'Bebas Neue',sans-serif;font-size:clamp(42px,7vw,72px);letter-spacing:0.04em;line-height:0.95;margin-bottom:64px}
        .section-title em{font-family:'Fraunces',serif;font-style:italic;color:var(--yellow)}
        .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
        .feature-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:28px;transition:border-color 0.2s,transform 0.2s}
        .feature-card:hover{border-color:#2a2a2a;transform:translateY(-3px)}
        .feature-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:16px}
        .feature-card h3{font-size:17px;font-weight:500;margin-bottom:8px}
        .feature-card p{font-size:14px;color:var(--muted);line-height:1.6;font-weight:300}
        .pricing{padding:100px 24px;background:#050505;border-top:1px solid var(--border)}
        .pricing-inner{max-width:800px;margin:0 auto}
        .pricing-cards{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:56px}
        @media(max-width:600px){.pricing-cards{grid-template-columns:1fr}nav{padding:16px 20px}.nav-links{display:none}}
        .pricing-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:32px;position:relative}
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
        .cta-section{padding:120px 24px;text-align:center;position:relative;overflow:hidden}
        .cta-section::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 50% 60% at 50% 50%,#f4c43010 0%,transparent 70%);pointer-events:none}
        .cta-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(52px,10vw,100px);letter-spacing:0.03em;line-height:0.9;margin-bottom:24px}
        .cta-title em{font-family:'Fraunces',serif;font-style:italic;color:var(--yellow)}
        .cta-sub{font-size:16px;color:var(--muted);margin-bottom:40px;font-weight:300;max-width:400px;margin-left:auto;margin-right:auto;line-height:1.6}
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
      <section className="hero">
        <div className="hero-badge"><span></span> Now in public beta</div>
        <h1 className="hero-title">Build habits.<br /><em>Keep momentum.</em></h1>
        <p className="hero-sub">Habito turns your daily routine into a <strong>trackable, shareable system</strong> — with streaks, stats, and zero friction.</p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => navigate("/app")}>Start for free →</button>
          <a href="#features" className="btn-ghost">See how it works</a>
        </div>
        <div className="hero-social"><div>🔥 <strong>Build</strong> daily streaks</div><div>⚡ <strong>Free</strong> to get started</div><div>✓ <strong>No</strong> download needed</div></div>
      </section>
      <section className="features" id="features">
        <div className="section-label">Everything you need</div>
        <h2 className="section-title">Built for people who<br /><em>actually want to change</em></h2>
        <div className="features-grid">
          {[
            {icon:"🎯",bg:"#f4c43015",title:"Custom Routines",desc:"Build any routine from scratch — name each block, set durations, pick colors and emoji."},
            {icon:"🔥",bg:"#ff6b3515",title:"Streak Tracking",desc:"Every perfect day adds to your streak. Watch it grow and feel the pull to protect it."},
            {icon:"📊",bg:"#5bc8ff15",title:"Progress Stats",desc:"7-day completion charts, average scores, and perfect-day counts per routine."},
            {icon:"🌱",bg:"#4ade8015",title:"Share Your Routine",desc:"Copy your routine as a clean summary and share it anywhere — Discord, Twitter, Notion."},
            {icon:"💾",bg:"#c084fc15",title:"Auto-Save Progress",desc:"Check a block, switch apps, come back later — your progress is always right where you left it."},
            {icon:"⚡",bg:"#f4c43015",title:"Zero Friction",desc:"Open it, check your blocks, close it. No onboarding, no overwhelm. Just focus on doing."},
          ].map((f,i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon" style={{background:f.bg}}>{f.icon}</div>
              <h3>{f.title}</h3><p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="pricing" id="pricing">
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
      <section className="cta-section">
        <h2 className="cta-title">Your streak<br />starts <em>today.</em></h2>
        <p className="cta-sub">No download. No credit card. Just open it and start.</p>
        <button className="btn-primary" style={{fontSize:16,padding:"16px 40px"}} onClick={() => navigate("/app")}>Launch Habito free →</button>
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
      setRoutines(d?.routines || DEFAULT_ROUTINES);
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

  const toggleBlock = (routineId, blockId) => {
    const today = todayKey();
    setRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      const todayDone = r.history[today] || [];
      const newDone = todayDone.includes(blockId)
        ? todayDone.filter(b => b !== blockId)
        : [...todayDone, blockId];
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
        {/* Topbar */}
        <div style={S.topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {activeRoutine && (
              <button style={S.btn("ghost")} onClick={() => setActiveRoutine(null)}>
                <Icon name="back" size={15} />
              </button>
            )}
            <div style={S.logoWrap}>
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
          <RoutineDetail routine={active} onToggle={(bid) => toggleBlock(active.id, bid)} onShare={() => setShowShare(active)} />
        ) : tab === "routines" ? (
          <RoutineList routines={routines} onSelect={setActiveRoutine} onCreate={() => setShowCreate(true)} />
        ) : (
          <StatsView routines={routines} />
        )}

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
          return (
            <div key={r.id} style={S.card(r.color)} onClick={() => onSelect(r.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 26 }}>{r.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 2 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: "#444" }}>{total} blocks</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                  {streak > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#ff6b35", fontSize: 12, fontWeight: 500 }}>
                      <Icon name="flame" size={12} /> {streak}d streak
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: pct === 100 ? "#4ade80" : "#444" }}>
                    {done}/{total} today
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 14, height: 3, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: r.color, borderRadius: 2, transition: "width 0.4s" }} />
              </div>
              {pct === 100 && (
                <div style={{ marginTop: 8, fontSize: 11, color: "#4ade80" }}>✓ Complete today!</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Routine Detail ────────────────────────────────────────────────────────────
function RoutineDetail({ routine, onToggle }) {
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
            <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>{total} blocks</div>
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

      <div style={{ marginBottom: 28 }}>
        {routine.blocks.map((block, i) => {
          const isDone = todayDone.includes(block.id);
          return (
            <div key={block.id} onClick={() => onToggle(block.id)} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 18px", borderRadius: 10, marginBottom: 8,
              background: isDone ? "#0d1a00" : "#0e0e0e",
              border: `1px solid ${isDone ? "#263d00" : "#1a1a1a"}`,
              cursor: "pointer", transition: "all 0.2s",
            }}>
              <div style={{
                width: 22, height: 22, minWidth: 22, borderRadius: "50%",
                border: `2px solid ${isDone ? routine.color : "#2a2a2a"}`,
                background: isDone ? routine.color : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}>
                {isDone && <Icon name="check" size={12} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: isDone ? "#444" : "#f0f0f0", textDecoration: isDone ? "line-through" : "none", transition: "all 0.2s" }}>{block.title}</div>
                {block.duration && <div style={{ fontSize: 12, color: "#383838", marginTop: 1 }}>{block.duration}</div>}
              </div>
            </div>
          );
        })}
      </div>

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
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [color, setColor] = useState("#f4c430");
  const [blocks, setBlocks] = useState([{ id: uid(), title: "", duration: "" }]);

  const addBlock = () => setBlocks(b => [...b, { id: uid(), title: "", duration: "" }]);
  const removeBlock = (id) => setBlocks(b => b.filter(x => x.id !== id));
  const updateBlock = (id, field, val) => setBlocks(b => b.map(x => x.id === id ? { ...x, [field]: val } : x));

  const handleSave = () => {
    if (!name.trim()) return alert("Give your routine a name!");
    const validBlocks = blocks.filter(b => b.title.trim());
    if (validBlocks.length === 0) return alert("Add at least one block.");
    onSave({ name: name.trim(), emoji, color, blocks: validBlocks });
  };

  return (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modalBox}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.1em", color: "#f4c430" }}>NEW ROUTINE</div>
          <button style={S.btn("ghost")} onClick={onClose}><Icon name="close" size={16} /></button>
        </div>

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

        <label style={S.label}>Blocks</label>
        {blocks.map((block, i) => (
          <div key={block.id} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input style={{ ...S.input, flex: 2 }} placeholder={`Block ${i + 1}`} value={block.title} onChange={e => updateBlock(block.id, "title", e.target.value)} />
            <input style={{ ...S.input, flex: 1 }} placeholder="Duration" value={block.duration} onChange={e => updateBlock(block.id, "duration", e.target.value)} />
            {blocks.length > 1 && (
              <button style={S.btn("danger")} onClick={() => removeBlock(block.id)}><Icon name="trash" size={14} /></button>
            )}
          </div>
        ))}

        <button style={{ ...S.btn("outline"), marginBottom: 22, width: "100%", justifyContent: "center" }} onClick={addBlock}>
          <Icon name="plus" size={14} /> Add Block
        </button>

        <button style={{ ...S.btn("primary"), width: "100%", justifyContent: "center", padding: "12px" }} onClick={handleSave}>
          Create Routine <Icon name="arrow" size={14} />
        </button>
      </div>
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
