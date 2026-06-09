"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../store/StoreContext";

export default function AuthPage() {
  const { login, register } = useStore();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      router.replace("/today");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 18px" }}>
      <div className="vk-card" style={{ width: "100%", maxWidth: 400, padding: "32px 24px" }}>
        {/* Logo */}
        <div className="vk-row" style={{ gap: 10, marginBottom: 28 }}>
          <div className="vk-row" style={{ width: 34, height: 34, borderRadius: 10, background: "var(--accent)", color: "#fff", justifyContent: "center", boxShadow: "var(--sh-1)" }}>
            <span style={{ fontSize: 18 }}>✦</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.03em", color: "var(--ink)" }}>Vokrub</span>
        </div>

        <div className="vk-col" style={{ gap: 4, marginBottom: 24 }}>
          <h1 className="vk-h1">{mode === "login" ? "Welcome back" : "Create account"}</h1>
          <span className="vk-muted vk-sm">{mode === "login" ? "Sign in to your vocabulary" : "Start building your word collection"}</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "register" && (
            <div className="vk-col" style={{ gap: 6 }}>
              <label className="vk-label">Name</label>
              <input className="vk-input" placeholder="Sam Rivera" value={name} onChange={(e) => setName(e.target.value)} required />
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
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span className="vk-faint vk-sm">
            {mode === "login" ? "No account? " : "Already have one? "}
          </span>
          <span
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="vk-accent vk-sm"
            style={{ cursor: "pointer", fontWeight: 700 }}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </span>
        </div>
      </div>
    </div>
  );
}
