"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Styles ─────────────────────────────────────────────────────────────────
const G = {
  bg: "#03030a",
  surface: "#08080f",
  panel: "#0d0d18",
  card: "#111120",
  border: "rgba(255,255,255,0.06)",
  border2: "rgba(255,255,255,0.12)",
  accent: "#c8ff00",
  accentDim: "rgba(200,255,0,0.10)",
  text: "#f4f4ff",
  muted: "#5a5a78",
  muted2: "#8888aa",
  display: "'Bebas Neue', sans-serif",
  body: "'DM Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

const globalCSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; scrollbar-width: thin; scrollbar-color: ${G.accent} ${G.bg}; }
  body { background: ${G.bg}; color: ${G.text}; font-family: ${G.body}; overflow-x: hidden; cursor: none; }
  ::selection { background: ${G.accent}; color: #000; }
  #cur { position:fixed;width:8px;height:8px;background:${G.accent};border-radius:50%;pointer-events:none;z-index:9999;top:0;left:0;transform:translate(-50%,-50%);transition:width .2s,height .2s; }
  #cur-ring { position:fixed;width:36px;height:36px;border:1px solid rgba(200,255,0,.35);border-radius:50%;pointer-events:none;z-index:9998;top:0;left:0;transform:translate(-50%,-50%); }
  body::after { content:'';position:fixed;inset:0;opacity:.35;pointer-events:none;z-index:9996;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E"); }
  @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(200,255,0,.4)} 70%{box-shadow:0 0 0 6px rgba(200,255,0,0)} }
  @keyframes orbFloat { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(24px,-18px) scale(1.04)} 66%{transform:translate(-18px,24px) scale(.97)} }
  @keyframes pFloat { 0%{transform:translateY(100vh);opacity:0} 10%{opacity:.6} 90%{opacity:.1} 100%{transform:translateY(-80px) translateX(var(--dx,20px));opacity:0} }
  @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes bw { from{height:2px} to{height:var(--h,14px)} }
  @keyframes pp { 0%,100%{box-shadow:0 0 40px rgba(200,255,0,.4)} 50%{box-shadow:0 0 60px rgba(200,255,0,.7)} }
  @keyframes scIn { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }
  @keyframes fsu { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  a { text-decoration: none; }
  button { font-family: ${G.body}; cursor: pointer; }
  input { font-family: ${G.body}; }
  input::placeholder { color: ${G.muted}; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${G.bg}; }
  ::-webkit-scrollbar-thumb { background: ${G.accent}; border-radius: 3px; }

  .nav-link::after { content:'';position:absolute;bottom:-2px;left:0;right:0;height:1px;background:${G.accent};transform:scaleX(0);transform-origin:left;transition:transform .3s; }
  .nav-link:hover::after { transform:scaleX(1); }
  .nav-link:hover { color: ${G.text} !important; }
  .feat-card:hover { background: ${G.card} !important; }
  .feat-card::after { content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${G.accent},#0099ff);transform:scaleX(0);transform-origin:left;transition:transform .5s; }
  .feat-card:hover::after { transform:scaleX(1); }
  .feat-card .fi { transition: transform .3s; }
  .feat-card:hover .fi { transform: scale(1.1) rotate(5deg); }
  .step-item:hover .step-num { border-color:${G.accent} !important;color:${G.accent} !important;box-shadow:0 0 40px rgba(200,255,0,.2) !important;transform:scale(1.08); }
  .step-num { transition: all .4s; }
  .fmt-chip.active, .fmt-chip:hover { background:${G.accentDim} !important;border-color:rgba(200,255,0,.35) !important;color:${G.accent} !important; }
  .bpill.on { background:${G.accentDim};border-color:rgba(200,255,0,.35);color:${G.accent}; }
  .plan-btn:hover { opacity:.85;transform:translateY(-1px); }
  .tr-btn:hover { color:${G.text};border-color:${G.border2}; }
  .auth-tab.on { background:${G.card};color:${G.text};border:1px solid ${G.border}; }
  .auth-foot a { color:${G.accent};cursor:pointer; }
  .toast-item { background:${G.card};border:1px solid ${G.border2};border-radius:14px;padding:14px 20px;font-size:14px;color:${G.text};display:flex;align-items:center;gap:10px;transform:translateX(120%);opacity:0;transition:all .4s cubic-bezier(.34,1.56,.64,1);max-width:380px;box-shadow:0 8px 32px rgba(0,0,0,.5); }
  .toast-item.show { transform:translateX(0);opacity:1; }
  .toast-item.success { border-color:rgba(200,255,0,.3); }
  .toast-item.error { border-color:rgba(255,51,102,.3); }
  .toast-item.info { border-color:rgba(0,153,255,.3); }
`;

// ─── Helper: format seconds to MM:SS ────────────────────────────────────────
function fmtTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}
function toSRTTime(s) {
  const h = Math.floor(s / 3600).toString().padStart(2, "0");
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  const ms = Math.floor((s % 1) * 1000).toString().padStart(3, "0");
  return `${h}:${m}:${sec},${ms}`;
}
function dlBlob(content, filename, type = "text/plain") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = filename;
  a.click();
}
function validYT(url) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)[\w-]{6,}/.test(url.trim());
}
function getVid(url) {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([a-zA-Z0-9_-]{6,})/);
  return m ? m[1] : null;
}

// ─── Toast component ─────────────────────────────────────────────────────────
function Toasts({ toasts, onRemove }) {
  return (
    <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 9000, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item ${t.type} ${t.visible ? "show" : ""}`}>
          <span style={{ fontSize: 18 }}>{t.icon}</span>
          <span style={{ flex: 1 }}>{t.msg}</span>
          <span onClick={() => onRemove(t.id)} style={{ cursor: "pointer", color: G.muted, paddingLeft: 8 }}>✕</span>
        </div>
      ))}
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar({ onLogin, onSignup, scrolled, hidden }) {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      height: scrolled ? 64 : 72,
      padding: "0 52px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(3,3,10,.92)" : "transparent",
      backdropFilter: scrolled ? "blur(24px)" : "none",
      borderBottom: scrolled ? `1px solid ${G.border}` : "none",
      transform: hidden ? "translateY(-100%)" : "translateY(0)",
      transition: "all .35s ease",
    }}>
      {/* Logo */}
      <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{
          width: 34, height: 34, background: G.accent, borderRadius: 9,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 900, color: "#000",
          transform: "rotate(-5deg)", transition: "transform .3s",
          fontFamily: G.display,
        }}>Y</div>
        <span style={{ fontFamily: G.display, fontSize: 24, letterSpacing: 3, color: G.text }}>
          YT<span style={{ color: G.accent }}>FLOW</span>
        </span>
      </a>

      {/* Nav links */}
      <ul style={{ display: "flex", alignItems: "center", gap: 36, listStyle: "none" }}>
        {[["Features", "#features"], ["How it Works", "#how"], ["Demo", "#demo"], ["Pricing", "#pricing"]].map(([label, href]) => (
          <li key={label}>
            <a href={href} className="nav-link" style={{
              fontSize: 12, fontWeight: 500, letterSpacing: 1.5,
              textTransform: "uppercase", color: G.muted2,
              position: "relative", padding: "4px 0",
            }}>{label}</a>
          </li>
        ))}
      </ul>

      {/* Auth buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onLogin} style={{
          padding: "9px 22px", borderRadius: 100, fontSize: 13, fontWeight: 600,
          background: "transparent", color: G.muted2, border: `1px solid ${G.border2}`,
          transition: "all .2s",
        }}>Log in</button>
        <button onClick={onSignup} style={{
          padding: "9px 22px", borderRadius: 100, fontSize: 13, fontWeight: 700,
          background: G.accent, color: "#000", border: "none",
          transition: "all .2s",
        }}>Get Started →</button>
      </div>
    </nav>
  );
}

// ─── Auth Modal ──────────────────────────────────────────────────────────────
function AuthModal({ open, initialTab, onClose, onToast }) {
  const [tab, setTab] = useState(initialTab);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [signupErr, setSignupErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { setTab(initialTab); }, [initialTab]);
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [open]);

  if (!open) return null;

  function doLogin(e) {
    e.preventDefault();
    setLoginErr("");
    if (!loginEmail || !loginPass) { setLoginErr("Please fill all fields."); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onClose(); onToast("✅ Signed in! Welcome back.", "success"); }, 1500);
  }
  function doSignup(e) {
    e.preventDefault();
    setSignupErr("");
    if (!signupName || !signupEmail || !signupPass) { setSignupErr("Please fill all fields."); return; }
    if (signupPass.length < 6) { setSignupErr("Password must be 6+ characters."); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onClose(); onToast(`🎉 Welcome to YTFlow, ${signupName.split(" ")[0]}!`, "success"); }, 1800);
  }

  const inp = {
    width: "100%", padding: "14px 18px", background: G.panel,
    border: `1px solid ${G.border}`, borderRadius: 12,
    fontSize: 15, color: G.text, outline: "none",
    transition: "border-color .2s", fontFamily: G.body,
  };
  const label = {
    display: "block", fontSize: 11, fontWeight: 600,
    letterSpacing: 1, color: G.muted2, marginBottom: 8, textTransform: "uppercase",
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(0,0,0,.85)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      animation: "fadeInUp .3s ease",
    }}>
      <div style={{
        background: G.card, border: `1px solid ${G.border2}`,
        borderRadius: 24, width: "100%", maxWidth: 440, padding: 48,
        position: "relative", animation: "scIn .4s cubic-bezier(.34,1.56,.64,1)",
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 20, right: 20, width: 34, height: 34,
          borderRadius: 9, background: G.panel, border: `1px solid ${G.border}`,
          color: G.muted2, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .2s",
        }}>✕</button>

        {/* Logo */}
        <div style={{ fontFamily: G.display, fontSize: 22, letterSpacing: 3, color: G.text, marginBottom: 6 }}>
          YT<span style={{ color: G.accent }}>FLOW</span>
        </div>
        <div style={{ fontSize: 14, color: G.muted2, marginBottom: 28 }}>
          {tab === "login" ? "Welcome back. Sign in to your account." : "Create your free YTFlow account."}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: G.panel, borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {["login", "signup"].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={tab === t ? "auth-tab on" : "auth-tab"} style={{
              flex: 1, padding: 10, borderRadius: 9, fontSize: 13, fontWeight: 600,
              background: "transparent", color: tab === t ? G.text : G.muted2,
              border: "none", transition: "all .2s",
            }}>{t === "login" ? "Sign In" : "Create Account"}</button>
          ))}
        </div>

        {/* Login form */}
        {tab === "login" && (
          <form onSubmit={doLogin}>
            <div style={{ marginBottom: 18 }}>
              <label style={label}>Email</label>
              <input style={inp} type="email" placeholder="you@example.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} onFocus={e => e.target.style.borderColor = "rgba(200,255,0,.4)"} onBlur={e => e.target.style.borderColor = G.border} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={label}>Password</label>
              <input style={inp} type="password" placeholder="Your password" value={loginPass} onChange={e => setLoginPass(e.target.value)} onFocus={e => e.target.style.borderColor = "rgba(200,255,0,.4)"} onBlur={e => e.target.style.borderColor = G.border} />
              {loginErr && <div style={{ fontSize: 12, color: "#ff3366", marginTop: 6 }}>{loginErr}</div>}
            </div>
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: 15, borderRadius: 12, background: G.accent,
              color: "#000", border: "none", fontSize: 15, fontWeight: 800, transition: "all .2s",
            }}>{loading ? "Signing in..." : "Sign In →"}</button>
            <div style={{ textAlign: "center", fontSize: 13, color: G.muted2, marginTop: 16 }}>
              <span>No account? </span>
              <span className="auth-foot" onClick={() => setTab("signup")}><a>Sign up free</a></span>
            </div>
          </form>
        )}

        {/* Signup form */}
        {tab === "signup" && (
          <form onSubmit={doSignup}>
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Full Name</label>
              <input style={inp} type="text" placeholder="Your name" value={signupName} onChange={e => setSignupName(e.target.value)} onFocus={e => e.target.style.borderColor = "rgba(200,255,0,.4)"} onBlur={e => e.target.style.borderColor = G.border} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Email</label>
              <input style={inp} type="email" placeholder="you@example.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} onFocus={e => e.target.style.borderColor = "rgba(200,255,0,.4)"} onBlur={e => e.target.style.borderColor = G.border} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Password</label>
              <input style={inp} type="password" placeholder="6+ characters" value={signupPass} onChange={e => setSignupPass(e.target.value)} onFocus={e => e.target.style.borderColor = "rgba(200,255,0,.4)"} onBlur={e => e.target.style.borderColor = G.border} />
              {signupErr && <div style={{ fontSize: 12, color: "#ff3366", marginTop: 6 }}>{signupErr}</div>}
            </div>
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: 15, borderRadius: 12, background: G.accent,
              color: "#000", border: "none", fontSize: 15, fontWeight: 800, transition: "all .2s",
            }}>{loading ? "Creating..." : "Create Account →"}</button>
            <div style={{ textAlign: "center", fontSize: 13, color: G.muted2, marginTop: 16 }}>
              <span>Already have an account? </span>
              <span className="auth-foot" onClick={() => setTab("login")}><a>Sign in</a></span>
            </div>
          </form>
        )}

        {/* OAuth */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: G.border }} />
          <span style={{ fontSize: 12, color: G.muted }}>or continue with</span>
          <div style={{ flex: 1, height: 1, background: G.border }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[["🔵 Google", "Google"], ["⚫ GitHub", "GitHub"]].map(([label, provider]) => (
            <button key={provider} onClick={() => { onClose(); onToast(`✅ Signed in with ${provider}!`, "success"); }} style={{
              flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${G.border2}`,
              background: G.panel, color: G.text, fontSize: 14, fontWeight: 500, transition: "all .2s",
            }}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [ytUrl, setYtUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const [selFmt, setSelFmt] = useState({ f: "mp4", q: "1080p" });
  const [transcript, setTranscript] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState({ open: false, tab: "login" });
  const [navScrolled, setNavScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const progRef = useRef(null);
  const lastY = useRef(0);

  // ─── Toast helpers ───────────────────────────────────────────────────────
  const addToast = useCallback((msg, type = "info") => {
    const icons = { success: "✅", error: "❌", info: "⚡" };
    const id = Date.now() + Math.random();
    const t = { id, msg, type, icon: icons[type] || "📢", visible: false };
    setToasts(prev => [...prev, t]);
    setTimeout(() => setToasts(prev => prev.map(x => x.id === id ? { ...x, visible: true } : x)), 10);
    setTimeout(() => setToasts(prev => prev.map(x => x.id === id ? { ...x, visible: false } : x)), 5000);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 5500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(x => x.id !== id));
  }, []);

  // ─── Scroll handler ──────────────────────────────────────────────────────
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setNavScrolled(y > 60);
      setNavHidden(y > lastY.current && y > 200);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── GSAP ────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Dynamically load GSAP (it's in node_modules via package.json)
    let gsap, ScrollTrigger;
    import("gsap").then(m => {
      gsap = m.gsap || m.default;
      return import("gsap/ScrollTrigger");
    }).then(m => {
      ScrollTrigger = m.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      // Cursor
      const cur = document.getElementById("cur");
      const ring = document.getElementById("cur-ring");
      if (cur && ring) {
        let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
        document.addEventListener("mousemove", e => {
          mx = e.clientX; my = e.clientY;
          cur.style.left = mx + "px"; cur.style.top = my + "px";
        });
        const animRing = () => {
          rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
          ring.style.left = rx + "px"; ring.style.top = ry + "px";
          requestAnimationFrame(animRing);
        };
        animRing();
        document.querySelectorAll("a,button,input,.fmt-chip,.feat-card,.step-item,.pc,.bpill").forEach(el => {
          el.addEventListener("mouseenter", () => { cur.style.width = "20px"; cur.style.height = "20px"; });
          el.addEventListener("mouseleave", () => { cur.style.width = "8px"; cur.style.height = "8px"; });
        });
      }

      // Hero animations
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.to("#eyebrow", { opacity: 1, y: 0, duration: 0.8, delay: 0.2 })
        .from(".hc", { y: "110%", duration: 1, stagger: 0.14 }, 0.55)
        .to("#hsub", { opacity: 1, y: 0, duration: 0.8 }, 1.25)
        .to("#hform", { opacity: 1, y: 0, duration: 0.9, ease: "back.out(1.7)" }, 1.5);

      // Nav items
      gsap.from(".nav-link", { opacity: 0, y: -14, duration: 0.6, stagger: 0.08, delay: 0.5, ease: "power3.out" });

      // Stats
      ScrollTrigger.create({
        trigger: "#statsStrip", start: "top 85%", once: true,
        onEnter: () => {
          gsap.to("#statsStrip", { opacity: 1, duration: 0.6 });
          [["s1","2.4","M+",1],["s2","140","+",0],["s3","850","K+",0],["s4","98.7","%",1]].forEach(([id, t, suf, dec]) => {
            const el = document.getElementById(id);
            if (!el) return;
            let c = 0; const tv = parseFloat(t); const step = tv / 60;
            const int = setInterval(() => {
              c = Math.min(c + step, tv);
              el.textContent = (dec > 0 ? c.toFixed(dec) : Math.floor(c)) + suf;
              if (c >= tv) clearInterval(int);
            }, 16);
          });
        }
      });

      // Feature cards
      gsap.from(".feat-card", { scrollTrigger: { trigger: "#featGrid", start: "top 80%" }, y: 70, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power3.out" });

      // Steps
      gsap.from(".step-item", { scrollTrigger: { trigger: "#stepsGrid", start: "top 80%" }, y: 50, opacity: 0, duration: 0.7, stagger: 0.15, ease: "power3.out" });

      // Demo
      gsap.from("#demoLeft", { scrollTrigger: { trigger: "#demoSec", start: "top 80%" }, x: -50, opacity: 0, duration: 0.9, ease: "power3.out" });
      gsap.from("#demoRight", { scrollTrigger: { trigger: "#demoSec", start: "top 80%" }, x: 50, opacity: 0, duration: 0.9, ease: "power3.out", delay: 0.15 });

      // Pricing
      gsap.from(".pc", { scrollTrigger: { trigger: "#priceGrid", start: "top 80%" }, y: 60, opacity: 0, duration: 0.7, stagger: 0.15, ease: "power3.out" });

      // Parallax
      gsap.to(".o1", { scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1 }, y: 150 });
      gsap.to(".o2", { scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1.5 }, y: -100 });

      return () => ScrollTrigger.getAll().forEach(t => t.kill());
    }).catch(console.error);
  }, []);

  // ─── Progress bar ────────────────────────────────────────────────────────
  const startProgress = useCallback((label) => {
    if (progRef.current) clearInterval(progRef.current);
    setProgress(0);
    setProgressLabel(label);
    let w = 0;
    progRef.current = setInterval(() => {
      w += Math.random() * 2.5 + 0.5;
      if (w >= 90) { w = 90; clearInterval(progRef.current); }
      setProgress(w);
    }, 150);
  }, []);

  const doneProgress = useCallback(() => {
    if (progRef.current) clearInterval(progRef.current);
    setProgress(100);
    setTimeout(() => setProgress(0), 800);
  }, []);

  // ─── Download handler ────────────────────────────────────────────────────
  async function handleDownload() {
    if (!ytUrl.trim()) { addToast("Please paste a YouTube URL first", "error"); return; }
    if (!validYT(ytUrl)) { addToast("That doesn't look like a valid YouTube URL", "error"); return; }
    const vid = getVid(ytUrl);
    if (!vid) { addToast("Could not extract video ID", "error"); return; }

    setLoading(true); setLoadingType("download");
    setVideoInfo(null); setTranscript(null);
    startProgress("Fetching video information...");

    try {
      // Call our own API route
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: ytUrl }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch video info");

      setVideoInfo({ ...data.video, vid });
      doneProgress();
      addToast(`✅ Video found: "${data.video.title?.substring(0, 40)}..."`, "success");
    } catch (err) {
      // Fallback: noembed (always works, no API key needed)
      try {
        const r = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${vid}`);
        const d = await r.json();
        setVideoInfo({
          vid, title: d.title || "YouTube Video",
          channel: d.author_name || "Unknown",
          thumbnail: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
        });
        doneProgress();
        addToast("✅ Video ready — select format to download", "success");
      } catch {
        doneProgress();
        addToast("Could not load video info. Check the URL and try again.", "error");
      }
    }
    setLoading(false);
  }

  // ─── Actual download ─────────────────────────────────────────────────────
  function doDownload() {
    if (!videoInfo?.vid) { addToast("Process a video URL first", "error"); return; }
    const { f, q } = selFmt;
    addToast("⬇ Opening download...", "info");
    // Try our API stream first, fall back to cobalt.tools
    const apiUrl = `/api/download?url=${encodeURIComponent(ytUrl)}&format=${f}&quality=${q}`;
    // We attempt via anchor; if server errors, open cobalt.tools as fallback
    const a = document.createElement("a");
    a.href = apiUrl;
    a.download = `ytflow-${videoInfo.title?.substring(0, 30) || videoInfo.vid}.${f}`;
    a.click();
    // Fallback after 3s if no download started
    setTimeout(() => {
      window.open(`https://cobalt.tools/#u=${encodeURIComponent(ytUrl)}`, "_blank");
    }, 3000);
  }

  // ─── Transcribe handler ──────────────────────────────────────────────────
  async function handleTranscribe() {
    if (!ytUrl.trim()) { addToast("Please paste a YouTube URL first", "error"); return; }
    if (!validYT(ytUrl)) { addToast("That doesn't look like a valid YouTube URL", "error"); return; }

    setLoading(true); setLoadingType("transcribe");
    setVideoInfo(null); setTranscript(null);
    startProgress("Fetching transcript via AI...");
    addToast("🧠 Transcribing... this takes 15–30 seconds", "info");

    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: ytUrl, language: "auto" }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Transcription failed");

      doneProgress();
      setTranscript(data);
      addToast("✅ Transcript ready!", "success");
    } catch (err) {
      doneProgress();
      addToast(`Transcription error: ${err.message}`, "error");
    }
    setLoading(false);
  }

  // ─── Export handlers ─────────────────────────────────────────────────────
  function doCopy() {
    if (!transcript?.segments) { addToast("No transcript yet", "error"); return; }
    navigator.clipboard.writeText(transcript.segments.map(s => `[${fmtTime(s.start)}] ${s.text}`).join("\n"))
      .then(() => addToast("📋 Copied to clipboard!", "success"));
  }
  function doSRT() {
    if (!transcript?.segments) { addToast("No transcript yet", "error"); return; }
    const srt = transcript.segments.map((s, i) =>
      `${i + 1}\n${toSRTTime(s.start)} --> ${toSRTTime(s.end || s.start + 2)}\n${s.text}\n`
    ).join("\n");
    dlBlob(srt, "transcript.srt");
    addToast("⬇ SRT downloaded!", "success");
  }
  function doTXT() {
    if (!transcript?.segments) { addToast("No transcript yet", "error"); return; }
    dlBlob(transcript.segments.map(s => s.text).join(" "), "transcript.txt");
    addToast("⬇ TXT downloaded!", "success");
  }

  // ─── Shared styles ───────────────────────────────────────────────────────
  const sectionEyebrow = { fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: G.accent, marginBottom: 16 };
  const sectionTitle = { fontFamily: G.display, fontSize: "clamp(48px,6vw,80px)", lineHeight: .95, letterSpacing: 1, marginBottom: 80 };
  const cardBase = { background: G.card, border: `1px solid ${G.border2}`, borderRadius: 20, overflow: "hidden", width: "100%", maxWidth: 760, animation: "fsu .5s cubic-bezier(.34,1.56,.64,1) forwards" };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalCSS }} />

      {/* Cursor */}
      <div id="cur" />
      <div id="cur-ring" />

      {/* Toasts */}
      <Toasts toasts={toasts} onRemove={removeToast} />

      {/* Navbar */}
      <Navbar
        onLogin={() => setModal({ open: true, tab: "login" })}
        onSignup={() => setModal({ open: true, tab: "signup" })}
        scrolled={navScrolled}
        hidden={navHidden}
      />

      {/* Auth Modal */}
      <AuthModal
        open={modal.open}
        initialTab={modal.tab}
        onClose={() => setModal(m => ({ ...m, open: false }))}
        onToast={addToast}
      />

      {/* ══ HERO ══ */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 48px 80px", position: "relative", overflow: "hidden" }}>
        {/* Background */}
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 60% at 50% 0%,rgba(200,255,0,.07) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 80% 60%,rgba(0,153,255,.05) 0%,transparent 70%)` }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(200,255,0,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(200,255,0,.025) 1px,transparent 1px)`, backgroundSize: "64px 64px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent 80%)" }} />
        {/* Orbs */}
        <div className="o1" style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", filter: "blur(80px)", background: "radial-gradient(circle,rgba(200,255,0,.09) 0%,transparent 70%)", top: -150, left: -100, animation: "orbFloat 9s ease-in-out infinite", pointerEvents: "none" }} />
        <div className="o2" style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", filter: "blur(80px)", background: "radial-gradient(circle,rgba(0,153,255,.07) 0%,transparent 70%)", bottom: 0, right: -50, animation: "orbFloat 11s ease-in-out infinite reverse", pointerEvents: "none" }} />

        {/* Particles */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="particle" style={{
              position: "absolute", width: 2, height: 2, background: G.accent, borderRadius: "50%",
              left: `${Math.random() * 100}%`,
              animation: `pFloat ${6 + Math.random() * 12}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 14}s`,
              ["--dx"]: `${Math.random() * 80 - 40}px`,
            }} />
          ))}
        </div>

        {/* Eyebrow */}
        <div id="eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: G.accentDim, border: "1px solid rgba(200,255,0,.2)", borderRadius: 100, padding: "8px 20px", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: G.accent, marginBottom: 36, opacity: 0, transform: "translateY(16px)" }}>
          <span style={{ width: 6, height: 6, background: G.accent, borderRadius: "50%", animation: "pulse 2s infinite" }} />
          Powered by OpenAI Whisper · Real-time Processing
        </div>

        {/* Title */}
        <div style={{ fontFamily: G.display, fontSize: "clamp(68px,11vw,155px)", lineHeight: .9, textAlign: "center", letterSpacing: 2, marginBottom: 28 }}>
          {[["DOWNLOAD", G.text, "none"], ["TRANSCRIBE", "transparent", "1.5px rgba(255,255,255,.18)"], ["DOMINATE.", G.accent, "none"]].map(([word, color, stroke]) => (
            <span key={word} style={{ display: "block", overflow: "hidden" }}>
              <span className="hc" style={{ display: "inline-block", color, WebkitTextStroke: stroke }}>{word}</span>
            </span>
          ))}
        </div>

        {/* Sub */}
        <p id="hsub" style={{ fontSize: 18, color: G.muted2, maxWidth: 520, textAlign: "center", lineHeight: 1.8, marginBottom: 60, opacity: 0 }}>
          The <strong style={{ color: G.text, fontWeight: 500 }}>fastest</strong> way to save YouTube videos and generate{" "}
          <strong style={{ color: G.text, fontWeight: 500 }}>AI-powered transcripts</strong> in 140+ languages.
        </p>

        {/* Form */}
        <div id="hform" style={{ width: "100%", maxWidth: 760, opacity: 0, transform: "translateY(24px)" }}>
          <div style={{ background: G.panel, border: `1px solid ${G.border2}`, borderRadius: 18, padding: 8, display: "flex", alignItems: "center", gap: 8, transition: "border-color .3s,box-shadow .3s" }}
            onFocus={() => { }} // handled by CSS
          >
            <div style={{ width: 38, height: 38, background: "#ff0000", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, marginLeft: 8 }}>▶</div>
            <input
              type="url"
              value={ytUrl}
              onChange={e => setYtUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleDownload()}
              placeholder="Paste a YouTube URL here...  e.g. https://youtube.com/watch?v=..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: G.mono, fontSize: 14, color: G.text, padding: "18px 12px", letterSpacing: ".3px", minWidth: 0 }}
            />
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button
                disabled={loading}
                onClick={handleTranscribe}
                style={{ padding: "14px 20px", borderRadius: 12, fontSize: 13, fontWeight: 700, background: "rgba(0,153,255,.12)", color: "#4db8ff", border: "1px solid rgba(0,153,255,.22)", display: "flex", alignItems: "center", gap: 7, transition: "all .2s", opacity: loading ? .45 : 1 }}
              >🧠 Transcribe</button>
              <button
                disabled={loading}
                onClick={handleDownload}
                style={{ padding: "14px 20px", borderRadius: 12, fontSize: 13, fontWeight: 700, background: G.accent, color: "#000", border: "none", display: "flex", alignItems: "center", gap: 7, transition: "all .2s", opacity: loading ? .45 : 1 }}
              >⬇ Download</button>
            </div>
          </div>

          {/* Progress */}
          {loading && (
            <div style={{ marginTop: 16 }}>
              <div style={{ height: 3, background: G.border, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,#c8ff00,#0099ff)", borderRadius: 4, width: `${progress}%`, transition: "width .3s ease", boxShadow: "0 0 10px rgba(200,255,0,.5)" }} />
              </div>
              <div style={{ fontSize: 12, color: G.muted2, marginTop: 10, display: "flex", justifyContent: "space-between" }}>
                <span>{progressLabel}</span>
                <span>{Math.floor(progress)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Download result card ── */}
        {videoInfo && loadingType === "download" && (
          <div style={{ ...cardBase, marginTop: 18 }}>
            {/* Header */}
            <div style={{ display: "flex", gap: 16, padding: 20, borderBottom: `1px solid ${G.border}`, alignItems: "center" }}>
              <div style={{ width: 120, height: 68, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: G.panel }}>
                {videoInfo.thumbnail && (
                  <img src={videoInfo.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.currentTarget.style.display = "none"; }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{videoInfo.title}</div>
                <div style={{ fontSize: 12, color: G.muted2, display: "flex", gap: 12 }}>
                  {videoInfo.channel && <span>📺 {videoInfo.channel}</span>}
                  {videoInfo.duration && <span>⏱ {fmtTime(parseInt(videoInfo.duration))}</span>}
                </div>
              </div>
            </div>
            {/* Format picker */}
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {[{ f: "mp4", q: "1080p", l: "📹 MP4 1080p" }, { f: "mp4", q: "720p", l: "📹 MP4 720p" }, { f: "mp4", q: "480p", l: "📹 MP4 480p" }, { f: "mp3", q: "128kbps", l: "🎵 MP3 128k" }, { f: "mp3", q: "320kbps", l: "🎵 MP3 320k" }, { f: "webm", q: "1080p", l: "🎬 WebM" }].map(chip => (
                  <div
                    key={chip.l}
                    onClick={() => setSelFmt({ f: chip.f, q: chip.q })}
                    className={`fmt-chip${selFmt.f === chip.f && selFmt.q === chip.q ? " active" : ""}`}
                    style={{ padding: "8px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", background: G.panel, border: `1px solid ${G.border}`, color: G.muted2, transition: "all .2s" }}
                  >{chip.l}</div>
                ))}
              </div>
              <button
                onClick={doDownload}
                style={{ width: "100%", padding: 16, borderRadius: 12, background: G.accent, color: "#000", border: "none", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all .2s" }}
              >⬇ Download Now</button>
            </div>
          </div>
        )}

        {/* ── Transcript result card ── */}
        {transcript && loadingType === "transcribe" && (
          <div style={{ ...cardBase, marginTop: 18 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderBottom: `1px solid ${G.border}` }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>🧠 AI Transcript{transcript.title ? ` — ${transcript.title?.substring(0, 40)}` : ""}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["📋 Copy", doCopy], ["⬇ SRT", doSRT], ["⬇ TXT", doTXT]].map(([l, fn]) => (
                  <button key={l} onClick={fn} className="tr-btn" style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: G.panel, color: G.muted2, border: `1px solid ${G.border}`, transition: "all .2s" }}>{l}</button>
                ))}
              </div>
            </div>
            {/* Segments */}
            <div style={{ padding: 20, maxHeight: 320, overflowY: "auto" }}>
              {transcript.note && (
                <div style={{ fontSize: 12, color: G.accent, background: G.accentDim, border: `1px solid rgba(200,255,0,.2)`, borderRadius: 8, padding: "8px 12px", marginBottom: 16 }}>
                  ℹ️ {transcript.note}
                </div>
              )}
              {(transcript.segments || []).slice(0, 40).map((seg, i) => (
                <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14, paddingBottom: 14, borderBottom: i < 39 ? `1px solid ${G.border}` : "none" }}>
                  <span style={{ fontFamily: G.mono, fontSize: 11, color: G.accent, flexShrink: 0, paddingTop: 2, minWidth: 42 }}>{fmtTime(seg.start)}</span>
                  <span style={{ fontSize: 14, color: G.muted2, lineHeight: 1.7 }}>{seg.text}</span>
                </div>
              ))}
              {transcript.segments?.length > 40 && (
                <div style={{ textAlign: "center", padding: "16px 0", fontSize: 12, color: G.muted2 }}>
                  +{transcript.segments.length - 40} more segments — export for full text
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scroll cue */}
        <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0, animation: "fadeInUp .8s 3.5s forwards" }}>
          <span style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: G.muted }}>Scroll</span>
          <div style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${G.border2}`, display: "flex", alignItems: "center", justifyContent: "center", color: G.muted2, animation: "bounce 2s ease-in-out infinite" }}>↓</div>
        </div>
      </section>

      {/* ══ MARQUEE ══ */}
      <div style={{ padding: "22px 0", background: G.accent, overflow: "hidden" }}>
        <div style={{ display: "flex", animation: "marquee 18s linear infinite", whiteSpace: "nowrap" }}>
          {["DOWNLOAD","TRANSCRIBE","4K QUALITY","AI POWERED","140+ LANGUAGES","INSTANT","ZERO ADS"].flatMap(w => [w, w]).map((w, i) => (
            <span key={i} style={{ fontFamily: G.display, fontSize: 20, letterSpacing: 3, color: "#000", padding: "0 40px", display: "inline-flex", alignItems: "center", gap: 40, flexShrink: 0 }}>
              {w}
              <span style={{ width: 8, height: 8, background: "rgba(0,0,0,.3)", borderRadius: "50%", display: "inline-block" }} />
            </span>
          ))}
        </div>
      </div>

      {/* ══ STATS ══ */}
      <div id="statsStrip" style={{ display: "flex", justifyContent: "center", gap: 80, padding: 48, borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}`, background: G.surface, opacity: 0 }}>
        {[["s1","2.4M+","Videos Processed"],["s2","140+","Languages"],["s3","850K+","Transcripts"],["s4","98.7%","Accuracy"]].map(([id, init, label]) => (
          <div key={id} style={{ textAlign: "center" }}>
            <div id={id} style={{ fontFamily: G.display, fontSize: 52, letterSpacing: 2, lineHeight: 1, color: G.accent }}>{init}</div>
            <div style={{ fontSize: 11, color: G.muted2, letterSpacing: 2.5, textTransform: "uppercase", marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ══ FEATURES ══ */}
      <section id="features" style={{ padding: "120px 48px" }}>
        <div style={sectionEyebrow}>Capabilities</div>
        <div style={sectionTitle}>Built for<br /><span style={{ color: G.muted }}>people who mean</span><br />business</div>
        <div id="featGrid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: G.border }}>
          {[
            { n: "01", icon: "⚡", bg: "rgba(200,255,0,.1)", title: "Lightning Downloads", desc: "Multi-threaded engine rips videos at full speed. MP4, MP3, WebM — any quality from 360p to 4K.", tag: "Up to 4K · 60fps" },
            { n: "02", icon: "🧠", bg: "rgba(0,153,255,.1)", title: "AI Transcription", desc: "OpenAI Whisper delivers 98.7% accurate transcripts with word-level timestamps and speaker detection.", tag: "Whisper Large V3" },
            { n: "03", icon: "🌍", bg: "rgba(255,51,102,.1)", title: "140+ Languages", desc: "Auto-detect or specify the language. Transcribe in one, translate to another in seconds.", tag: "Auto-detect" },
            { n: "04", icon: "📋", bg: "rgba(200,255,0,.1)", title: "6 Export Formats", desc: "Export transcripts as SRT, VTT, TXT, JSON, SBV, or DOCX. Works with every editing workflow.", tag: "SRT · VTT · DOCX" },
            { n: "05", icon: "🔒", bg: "rgba(255,153,0,.1)", title: "Private by Default", desc: "No URLs stored, no logs kept. We process your request and immediately delete all data.", tag: "Zero Logs" },
            { n: "06", icon: "⚙️", bg: "rgba(153,51,255,.1)", title: "REST API", desc: "Full programmatic access with OpenAPI 3.0. Build pipelines, automate workflows, integrate anywhere.", tag: "OpenAPI 3.0" },
          ].map((f) => (
            <div key={f.n} className="feat-card" style={{ background: G.bg, padding: "48px 40px", position: "relative", overflow: "hidden", transition: "background .3s" }}>
              <span style={{ position: "absolute", top: 20, right: 24, fontFamily: G.mono, fontSize: 10, color: G.border2 }}>{f.n}</span>
              <div className="fi" style={{ width: 58, height: 58, borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 28, background: f.bg }}>
                {f.icon}
              </div>
              <div style={{ fontSize: 21, fontWeight: 700, marginBottom: 12 }}>{f.title}</div>
              <div style={{ fontSize: 15, color: G.muted2, lineHeight: 1.75 }}>{f.desc}</div>
              <div style={{ display: "inline-block", marginTop: 20, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "4px 12px", borderRadius: 6, background: G.accentDim, color: G.accent, border: "1px solid rgba(200,255,0,.15)" }}>{f.tag}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how" style={{ padding: "120px 48px", background: G.surface }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <div style={sectionEyebrow}>How It Works</div>
          <div style={{ fontFamily: G.display, fontSize: "clamp(48px,6vw,80px)", lineHeight: .95, letterSpacing: 1 }}>
            Three steps.<br /><span style={{ color: G.muted }}>That's genuinely it.</span>
          </div>
        </div>
        <div id="stepsGrid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 48, position: "relative" }}>
          <div style={{ content: "''" ,position: "absolute", top: 40, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg,transparent,${G.border},${G.border},transparent)` }} />
          {[["01","Paste URL","Copy any YouTube link — regular videos, Shorts, playlists, live streams."],["02","Choose Action","Hit Download to save the file, or Transcribe to generate an AI text version."],["03","We Process","Our servers handle encoding, AI transcription, and format conversion in seconds."],["04","Done ✓","Download your file or export your transcript. Zero friction, no account required."]].map(([n, t, d]) => (
            <div key={n} className="step-item" style={{ textAlign: "center" }}>
              <div className="step-num" style={{ width: 80, height: 80, borderRadius: "50%", background: G.panel, border: `2px solid ${G.border2}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: G.display, fontSize: 32, margin: "0 auto 28px", position: "relative", zIndex: 2 }}>{n}</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{t}</div>
              <div style={{ fontSize: 14, color: G.muted2, lineHeight: 1.65 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ DEMO ══ */}
      <section id="demoSec" style={{ padding: "120px 48px", display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 80, alignItems: "center" }}>
        <div id="demoLeft">
          <div style={sectionEyebrow}>Live Preview</div>
          <div style={{ fontFamily: G.display, fontSize: "clamp(40px,5vw,64px)", lineHeight: .95, marginBottom: 24 }}>See it<br />in action</div>
          <div style={{ fontSize: 16, color: G.muted2, lineHeight: 1.8, marginBottom: 36 }}>Paste a URL, pick your format, watch real-time processing. Always a clean download or a perfectly timestamped transcript.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[["⚡","rgba(200,255,0,.1)","Under 30 seconds","Most videos processed instantly"],["🎯","rgba(0,153,255,.1)","98.7% accuracy","Best-in-class Whisper Large V3"],["🔒","rgba(255,51,102,.1)","Fully private","No storage, no tracking, ever"]].map(([icon, bg, h, p]) => (
              <div key={h} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, background: bg }}>{icon}</div>
                <div><div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{h}</div><div style={{ fontSize: 13, color: G.muted2 }}>{p}</div></div>
              </div>
            ))}
          </div>
        </div>

        {/* Browser mock */}
        <div id="demoRight">
          <div style={{ background: G.panel, border: `1px solid ${G.border2}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,.6)" }}>
            <div style={{ background: G.surface, padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${G.border}` }}>
              <div style={{ display: "flex", gap: 7 }}><div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} /><div style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e" }} /><div style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }} /></div>
              <div style={{ flex: 1, background: "rgba(0,0,0,.3)", borderRadius: 8, padding: "7px 14px", fontFamily: G.mono, fontSize: 11, color: G.muted2, margin: "0 16px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>youtube.com/watch?v=dQw4w9WgXcQ</div>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ background: G.bg, borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
                <div style={{ aspectRatio: "16/9", background: "linear-gradient(135deg,#070714,#0d1a0d,#1a0714)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ width: 54, height: 54, background: "rgba(200,255,0,.9)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#000", paddingLeft: 4, animation: "pp 3s ease-in-out infinite", zIndex: 2 }}>▶</div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", alignItems: "flex-end", gap: 2, padding: "0 16px 8px", height: 36 }}>
                    {Array.from({ length: 34 }).map((_, i) => (
                      <div key={i} style={{ flex: 1, background: G.accent, borderRadius: "2px 2px 0 0", opacity: .28, animation: `bw ${0.4 + Math.random() * 1.4}s ease-in-out infinite alternate`, ["--h"]: `${4 + Math.random() * 22}px`, animationDelay: `${Math.random() * 2}s` }} />
                    ))}
                  </div>
                </div>
                <div style={{ padding: "12px 16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Rick Astley — Never Gonna Give You Up</div>
                  <div style={{ fontSize: 11, color: G.muted2 }}>4:32 · 1.4B views</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
                {["MP4 1080p", "MP4 720p", "MP3 320k"].map((p, i) => (
                  <div key={p} className={`bpill${i === 0 ? " on" : ""}`} onClick={e => { document.querySelectorAll(".bpill").forEach(x => x.classList.remove("on")); e.currentTarget.classList.add("on"); }} style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700, background: G.panel, border: `1px solid ${G.border}`, color: G.muted2, cursor: "pointer", transition: "all .2s" }}>{p}</div>
                ))}
              </div>
              <button onClick={() => addToast("⬇ Demo — real download works in the full app!", "info")} style={{ width: "100%", padding: 13, borderRadius: 11, background: G.accent, color: "#000", border: "none", fontSize: 14, fontWeight: 700, transition: "all .2s" }}>⬇ Download Now</button>
              <div style={{ background: G.bg, borderRadius: 12, border: `1px solid ${G.border}`, overflow: "hidden", marginTop: 12 }}>
                <div style={{ padding: "11px 14px", borderBottom: `1px solid ${G.border}`, display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600 }}>
                  <span>🧠 AI Transcript</span><span style={{ fontSize: 10, color: G.muted2 }}>English • Auto</span>
                </div>
                <div style={{ padding: "12px 14px", maxHeight: 120, overflow: "hidden", position: "relative" }}>
                  {[["0:00","We're no strangers to love, you know the rules and so do I..."],["0:10","A full commitment's what I'm thinking of..."],["0:28","Never gonna give you up, never gonna let you down..."]].map(([ts, tx]) => (
                    <div key={ts} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 12 }}>
                      <span style={{ fontFamily: G.mono, color: G.accent, flexShrink: 0, fontSize: 10, paddingTop: 1 }}>{ts}</span>
                      <span style={{ color: G.muted2, lineHeight: 1.5 }}>{tx}</span>
                    </div>
                  ))}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: `linear-gradient(transparent,${G.bg})` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section id="pricing" style={{ padding: "120px 48px", background: G.surface }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <div style={sectionEyebrow}>Pricing</div>
          <div style={{ fontFamily: G.display, fontSize: "clamp(48px,6vw,80px)", lineHeight: .95, letterSpacing: 1, marginBottom: 12 }}>Simple pricing.<br /><span style={{ color: G.muted }}>No traps.</span></div>
          <p style={{ fontSize: 16, color: G.muted2 }}>Start free. Scale when you need.</p>
        </div>
        <div id="priceGrid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, background: G.border, maxWidth: 1000, margin: "0 auto" }}>
          {[
            { tier: "Free", price: "0", per: "Forever free", hot: false, features: [["5 downloads/day",true],["720p max quality",true],["10 min transcript/mo",true],["Batch processing",false],["API access",false]], cta: "Get Started", onClick: () => setModal({ open: true, tab: "signup" }) },
            { tier: "Pro", price: "12", per: "per month, billed annually", hot: true, features: [["Unlimited downloads",true],["4K + HDR quality",true],["10 hrs transcript/mo",true],["Batch processing",true],["API access",false]], cta: "Start Pro Trial", onClick: () => setModal({ open: true, tab: "signup" }) },
            { tier: "Enterprise", price: "49", per: "per month, billed annually", hot: false, features: [["Unlimited everything",true],["8K quality",true],["Unlimited transcripts",true],["Full API access",true],["Dedicated support + SLA",true]], cta: "Contact Sales", onClick: () => addToast("Our team will reach out!", "success") },
          ].map((p) => (
            <div key={p.tier} className="pc" style={{ background: p.hot ? G.card : G.bg, padding: p.hot ? "72px 40px" : "48px 40px", position: "relative", zIndex: p.hot ? 1 : 0, border: p.hot ? `1px solid rgba(200,255,0,.2)` : "none", margin: p.hot ? "-24px 0" : 0 }}>
              {p.hot && <div style={{ position: "absolute", top: 20, right: 20, background: G.accent, color: "#000", fontSize: 9, fontWeight: 900, letterSpacing: 2, padding: "4px 10px", borderRadius: 4 }}>POPULAR</div>}
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: G.muted2, marginBottom: 16 }}>{p.tier}</div>
              <div style={{ fontFamily: G.display, fontSize: 70, letterSpacing: 2, lineHeight: 1 }}><sup style={{ fontSize: 28, verticalAlign: "super" }}>$</sup>{p.price}</div>
              <div style={{ fontSize: 13, color: G.muted2, marginBottom: 32 }}>{p.per}</div>
              <ul style={{ listStyle: "none", marginBottom: 36 }}>
                {p.features.map(([feat, on]) => (
                  <li key={feat} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: on ? G.text : G.muted2, padding: "10px 0", borderBottom: `1px solid ${G.border}` }}>
                    <span style={{ color: on ? G.accent : G.muted }}>{on ? "✓" : "—"}</span>
                    {feat}
                  </li>
                ))}
              </ul>
              <button onClick={p.onClick} className="plan-btn" style={{ width: "100%", padding: 14, borderRadius: 12, fontFamily: G.body, fontSize: 14, fontWeight: 700, background: p.hot ? G.accent : "rgba(255,255,255,.04)", color: p.hot ? "#000" : G.text, border: p.hot ? `1px solid ${G.accent}` : `1px solid ${G.border2}`, transition: "all .2s" }}>{p.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding: "120px 48px", textAlign: "center", background: `linear-gradient(180deg,${G.bg},rgba(200,255,0,.025) 50%,${G.bg})` }}>
        <div style={sectionEyebrow}>Ready?</div>
        <div style={{ fontFamily: G.display, fontSize: "clamp(56px,8vw,100px)", lineHeight: .92, marginBottom: 24 }}>
          Start<br /><span style={{ color: G.accent }}>downloading</span><br />today.
        </div>
        <p style={{ fontSize: 17, color: G.muted2, margin: "0 auto 48px", maxWidth: 460, lineHeight: 1.8 }}>No credit card. No account required for basic use. Just paste and go.</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setTimeout(() => document.querySelector("input[type=url]")?.focus(), 600); }} style={{ padding: "18px 48px", background: G.accent, color: "#000", border: "none", borderRadius: 100, fontSize: 16, fontWeight: 800, transition: "all .25s" }}>Try It Free →</button>
          <a href="#how" style={{ padding: "18px 48px", background: "transparent", border: `1px solid ${G.border2}`, color: G.text, borderRadius: 100, fontSize: 16, fontWeight: 600, display: "inline-flex", alignItems: "center", transition: "all .2s" }}>See how it works</a>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ padding: "80px 48px 40px", borderTop: `1px solid ${G.border}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 60, marginBottom: 60 }}>
          <div>
            <div style={{ fontFamily: G.display, fontSize: 36, letterSpacing: 3, color: G.text, marginBottom: 12 }}>YT<span style={{ color: G.accent }}>FLOW</span></div>
            <div style={{ fontSize: 14, color: G.muted2, lineHeight: 1.7, marginBottom: 24 }}>The fastest way to download YouTube videos and generate AI-powered transcripts. Built for creators, researchers, and teams.</div>
            <div style={{ display: "flex", gap: 10 }}>
              {["𝕏", "📘", "💼", "🐙"].map(icon => (
                <a key={icon} href="#" style={{ width: 36, height: 36, borderRadius: 10, background: G.panel, border: `1px solid ${G.border}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>{icon}</a>
              ))}
            </div>
          </div>
          {[["Product", ["Download", "Transcribe", "Batch", "API Docs"]], ["Company", ["About", "Blog", "Careers", "Contact"]], ["Legal", ["Privacy", "Terms", "DMCA", "Cookies"]]].map(([heading, links]) => (
            <div key={heading}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: G.muted, marginBottom: 20 }}>{heading}</div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {links.map(l => <li key={l}><a href="#" style={{ fontSize: 14, color: G.muted2, transition: "color .2s" }}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 32, borderTop: `1px solid ${G.border}`, fontSize: 13, color: G.muted2 }}>
          <span>© 2025 YTFlow, Inc. All rights reserved.</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, background: "#28c840", borderRadius: "50%", animation: "pulse 3s infinite" }} />
            All systems operational
          </div>
        </div>
      </footer>
    </>
  );
}
