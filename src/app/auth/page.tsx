"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone, ChevronLeft } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { API_BASE } from "../../lib/api";

type Mode = "hub" | "email-login" | "email-register" | "phone-step1" | "phone-step2";

const ERROR_MESSAGES: Record<string, string> = {
  oauth_denied: "Sign-in was cancelled.",
  oauth_failed: "Could not connect to provider. Try again.",
  server_error: "Something went wrong on our end.",
};

// ── Shared sub-components (declared outside to avoid re-creation on render) ──

function Logo() {
  return (
    <div className="vk-row" style={{ gap: 10, marginBottom: 28 }}>
      <div className="vk-row" style={{ width: 34, height: 34, borderRadius: 10, background: "var(--accent)", color: "#fff", justifyContent: "center", boxShadow: "var(--sh-1)" }}>
        <span style={{ fontSize: 18 }}>✦</span>
      </div>
      <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.03em", color: "var(--ink)" }}>Vokrub</span>
    </div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "var(--ink-soft)", fontSize: 14, fontWeight: 600, marginBottom: 20, padding: 0 }}>
      <ChevronLeft size={16} /> Back
    </button>
  );
}

function Divider() {
  return (
    <div className="vk-row" style={{ gap: 12, margin: "4px 0" }}>
      <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
      <span className="vk-faint" style={{ fontSize: 12, fontWeight: 600 }}>or</span>
      <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.023 10.125 11.927v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.234 2.686.234v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.096 24 18.1 24 12.073z"/>
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function AuthPage() {
  const { login, register, sendOTP, verifyOTP } = useStore();
  const router = useRouter();
  const params = useSearchParams();

  const [mode, setMode] = useState<Mode>("hub");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(() => {
    const e = params.get("error");
    return e ? (ERROR_MESSAGES[e] ?? "Something went wrong.") : "";
  });
  const [loading, setLoading] = useState(false);

  function go(m: Mode) { setError(""); setMode(m); }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "email-login") await login(email, password);
      else await register(name, email, password);
      router.replace("/today");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function doSendOTP() {
    setError("");
    setLoading(true);
    try {
      await sendOTP(phone);
      setMode("phone-step2");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOTP(phone, otp);
      router.replace("/today");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  const card = { width: "100%", maxWidth: 400, padding: "32px 24px" };
  const wrap: React.CSSProperties = { minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 18px" };

  // ── Hub ─────────────────────────────────────────────────────────────────
  if (mode === "hub") {
    return (
      <div style={wrap}>
        <div className="vk-card" style={card}>
          <Logo />
          <div className="vk-col" style={{ gap: 4, marginBottom: 28 }}>
            <h1 className="vk-h1">Welcome to Vokrub</h1>
            <span className="vk-muted vk-sm">Build your vocabulary, every day.</span>
          </div>

          {error && <p className="vk-sm" style={{ color: "oklch(0.55 0.13 28)", marginBottom: 16 }}>{error}</p>}

          <div className="vk-col" style={{ gap: 10 }}>
            <a href={`${API_BASE}/api/customer/auth/oauth/google`}
              className="vk-btn vk-btn-line vk-btn-block vk-btn-lg"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, textDecoration: "none" }}>
              <GoogleIcon />
              Continue with Google
            </a>

            <a href={`${API_BASE}/api/customer/auth/oauth/facebook`}
              className="vk-btn vk-btn-line vk-btn-block vk-btn-lg"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, textDecoration: "none" }}>
              <FacebookIcon />
              Continue with Facebook
            </a>

            <button onClick={() => go("phone-step1")} className="vk-btn vk-btn-line vk-btn-block vk-btn-lg"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <Phone size={18} />
              Continue with Phone
            </button>

            <Divider />

            <button onClick={() => go("email-login")} className="vk-btn vk-btn-primary vk-btn-block vk-btn-lg">
              Sign in with Email
            </button>

            <div style={{ textAlign: "center" }}>
              <span className="vk-faint vk-sm">No account? </span>
              <span onClick={() => go("email-register")} className="vk-accent vk-sm" style={{ cursor: "pointer", fontWeight: 700 }}>
                Create one
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Email login / register ───────────────────────────────────────────────
  if (mode === "email-login" || mode === "email-register") {
    return (
      <div style={wrap}>
        <div className="vk-card" style={card}>
          <Logo />
          <BackBtn onClick={() => go("hub")} />
          <div className="vk-col" style={{ gap: 4, marginBottom: 24 }}>
            <h1 className="vk-h1">{mode === "email-login" ? "Welcome back" : "Create account"}</h1>
            <span className="vk-muted vk-sm">{mode === "email-login" ? "Sign in with your email" : "Start building your word collection"}</span>
          </div>

          <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "email-register" && (
              <div className="vk-col" style={{ gap: 6 }}>
                <label className="vk-label">Name</label>
                <input className="vk-input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}
            <div className="vk-col" style={{ gap: 6 }}>
              <label className="vk-label">Email</label>
              <input className="vk-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="vk-col" style={{ gap: 6 }}>
              <label className="vk-label">Password</label>
              <input className="vk-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="vk-sm" style={{ color: "oklch(0.55 0.13 28)" }}>{error}</p>}
            <button type="submit" className="vk-btn vk-btn-primary vk-btn-block vk-btn-lg" style={{ marginTop: 4 }} disabled={loading}>
              {loading ? "Please wait…" : mode === "email-login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <span className="vk-faint vk-sm">{mode === "email-login" ? "No account? " : "Already have one? "}</span>
            <span onClick={() => go(mode === "email-login" ? "email-register" : "email-login")} className="vk-accent vk-sm" style={{ cursor: "pointer", fontWeight: 700 }}>
              {mode === "email-login" ? "Sign up" : "Sign in"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Phone step 1 — enter number ─────────────────────────────────────────
  if (mode === "phone-step1") {
    return (
      <div style={wrap}>
        <div className="vk-card" style={card}>
          <Logo />
          <BackBtn onClick={() => go("hub")} />
          <div className="vk-col" style={{ gap: 4, marginBottom: 24 }}>
            <h1 className="vk-h1">Enter your number</h1>
            <span className="vk-muted vk-sm">We&apos;ll send a 6-digit code via SMS.</span>
          </div>

          <div className="vk-col" style={{ gap: 14 }}>
            <div className="vk-col" style={{ gap: 6 }}>
              <label className="vk-label">Phone number</label>
              <input
                className="vk-input"
                type="tel"
                placeholder="+66 81 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {error && <p className="vk-sm" style={{ color: "oklch(0.55 0.13 28)" }}>{error}</p>}
            <button onClick={doSendOTP} className="vk-btn vk-btn-primary vk-btn-block vk-btn-lg" disabled={loading || !phone.trim()}>
              {loading ? "Sending…" : "Send code"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Phone step 2 — enter OTP ─────────────────────────────────────────────
  return (
    <div style={wrap}>
      <div className="vk-card" style={card}>
        <Logo />
        <BackBtn onClick={() => go("phone-step1")} />
        <div className="vk-col" style={{ gap: 4, marginBottom: 24 }}>
          <h1 className="vk-h1">Enter the code</h1>
          <span className="vk-muted vk-sm">Sent to {phone}. Valid for 5 minutes.</span>
        </div>

        <form onSubmit={handleVerifyOTP} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            className="vk-input"
            type="text"
            inputMode="numeric"
            placeholder="123456"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            style={{ fontSize: 28, letterSpacing: "0.15em", fontWeight: 700, textAlign: "center" }}
            autoFocus
          />
          {error && <p className="vk-sm" style={{ color: "oklch(0.55 0.13 28)" }}>{error}</p>}
          <button type="submit" className="vk-btn vk-btn-primary vk-btn-block vk-btn-lg" disabled={loading || otp.length < 6}>
            {loading ? "Verifying…" : "Verify"}
          </button>
          <button type="button" onClick={doSendOTP} className="vk-btn vk-btn-ghost vk-btn-block" style={{ fontSize: 13 }} disabled={loading}>
            Resend code
          </button>
        </form>
      </div>
    </div>
  );
}
