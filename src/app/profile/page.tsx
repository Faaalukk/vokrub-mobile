"use client";

import { Book, Flame, Star, Clock, Crown, Bell, Globe, Shield, ChevronRight, LogOut, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "../store/StoreContext";
import { useTheme } from "../store/ThemeContext";
import Avatar from "../components/Avatar";
import SectionHead from "../components/SectionHead";

export default function ProfilePage() {
  const store = useStore();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const s = store.stats;
  const { plan, logout } = store;
  const pro = plan === "pro";

  function handleLogout() {
    logout();
    router.replace("/auth");
  }

  const tiles = [
    { icon: Book,  label: "Words",   val: s.total,   clay: false },
    { icon: Flame, label: "Streak",  val: store.STREAK, clay: true },
    { icon: Star,  label: "Mastered",val: s.mastered, clay: false },
    { icon: Clock, label: "Due",     val: s.due,      clay: false },
  ];

  const settings = [
    { icon: Bell,   label: "Daily reminders", sub: "On · 8:00 AM" },
    { icon: Globe,  label: "Language",        sub: "English" },
    { icon: Shield, label: "Privacy & data",  sub: "" },
  ];

  return (
    <div className="vk-page">
      <div className="vk-col" style={{ gap: 22 }}>
        {/* User */}
        <div className="vk-row" style={{ gap: 14 }}>
          <Avatar name={store.profile?.name ?? "You"} size={56} />
          <div className="vk-col" style={{ gap: 5 }}>
            <h1 className="vk-h1">{store.profile?.name ?? "You"}</h1>
            <div className="vk-row" style={{ gap: 8 }}>
              <span className={`vk-tag${pro ? " vk-tag-clay" : ""}`} style={pro ? {} : { background: "var(--surface-2)", color: "var(--ink-soft)" }}>
                {pro && <Crown size={13} />} {pro ? "Pro" : "Free"}
              </span>
              <span className="vk-faint vk-sm">Joined Mar 2025</span>
            </div>
          </div>
        </div>

        {/* Stats tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.label} className="vk-card" style={{ padding: "14px 10px", textAlign: "center" }}>
                <Icon size={18} style={{ color: t.clay ? "var(--clay)" : "var(--accent-ink)", margin: "0 auto 6px", display: "block" }} />
                <div className="vk-h2" style={{ fontSize: 20 }}>{t.val}</div>
                <div className="vk-faint vk-xs" style={{ fontWeight: 600 }}>{t.label}</div>
              </div>
            );
          })}
        </div>

        {/* Subscription */}
        <div>
          <SectionHead title="Subscription" />
          {pro ? (
            <div className="vk-card" style={{ padding: 18, background: "var(--accent)", color: "var(--on-accent)", border: "none", boxShadow: "var(--sh-2)" }}>
              <div className="vk-between">
                <div className="vk-row" style={{ gap: 10 }}>
                  <div className="vk-row" style={{ width: 40, height: 40, borderRadius: 12, background: "color-mix(in oklch, white 22%, transparent)", justifyContent: "center" }}>
                    <Crown size={22} />
                  </div>
                  <div className="vk-col" style={{ gap: 2 }}>
                    <span style={{ fontWeight: 800, fontSize: 17 }}>Vokrub Pro</span>
                    <span style={{ fontSize: 12.5, opacity: 0.85, fontWeight: 500 }}>$6/mo · renews Jun 30</span>
                  </div>
                </div>
              </div>
              <button className="vk-btn vk-btn-block" style={{ marginTop: 16, background: "color-mix(in oklch, white 18%, transparent)", color: "var(--on-accent)" }}
              >Manage plan</button>
            </div>
          ) : (
            <div className="vk-col" style={{ gap: 12 }}>
              <div className="vk-card" style={{ padding: 18 }}>
                <div className="vk-row" style={{ gap: 10, marginBottom: 4 }}>
                  <div className="vk-row" style={{ width: 40, height: 40, borderRadius: 12, background: "var(--clay-soft)", color: "oklch(0.45 0.09 55)", justifyContent: "center" }}>
                    <Crown size={22} />
                  </div>
                  <div className="vk-col" style={{ gap: 2 }}>
                    <span className="vk-h2">Upgrade to Pro</span>
                    <span className="vk-faint vk-sm" style={{ fontWeight: 500 }}>Unlimited words & every practice mode</span>
                  </div>
                </div>
                <div className="vk-row" style={{ gap: 6, alignItems: "baseline", margin: "8px 0 2px" }}>
                  <span className="vk-display" style={{ fontSize: 30 }}>$6</span>
                  <span className="vk-muted vk-sm">/ month</span>
                </div>
                <button className="vk-btn vk-btn-primary vk-btn-block vk-btn-lg" style={{ marginTop: 12 }}>
                  <Crown size={18} /> Go Pro
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div>
          <SectionHead title="Settings" />
          <div className="vk-card" style={{ overflow: "hidden" }}>
            {/* Appearance toggle */}
            <div className="vk-between" style={{ padding: "14px 16px", borderBottom: "1px solid var(--line-soft)" }}>
              <div className="vk-row" style={{ gap: 12 }}>
                {theme === "dark" ? <Moon size={19} style={{ color: "var(--ink-soft)" }} /> : <Sun size={19} style={{ color: "var(--ink-soft)" }} />}
                <span style={{ fontWeight: 600, fontSize: 14.5 }}>Appearance</span>
              </div>
              <button
                onClick={toggleTheme}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "var(--surface-2)", border: "1px solid var(--line)",
                  borderRadius: 999, padding: "6px 12px", cursor: "pointer",
                  fontSize: 13, fontWeight: 700, color: "var(--ink-soft)",
                  fontFamily: "var(--ff)",
                }}
              >
                {theme === "dark"
                  ? <><Moon size={14} /> Dark</>
                  : <><Sun size={14} /> Light</>}
              </button>
            </div>

            {settings.map((r, i) => {
              const Icon = r.icon;
              return (
                <div key={r.label} className="vk-between vk-pressable"
                  style={{ padding: "14px 16px", borderBottom: i < settings.length - 1 ? "1px solid var(--line-soft)" : "none" }}>
                  <div className="vk-row" style={{ gap: 12 }}>
                    <Icon size={19} style={{ color: "var(--ink-soft)" }} />
                    <span style={{ fontWeight: 600, fontSize: 14.5 }}>{r.label}</span>
                  </div>
                  <div className="vk-row" style={{ gap: 8, color: "var(--ink-faint)" }}>
                    {r.sub && <span className="vk-sm">{r.sub}</span>}
                    <ChevronRight size={16} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logout */}
        <button className="vk-btn vk-btn-line vk-btn-block" onClick={handleLogout}
          style={{ color: "oklch(0.55 0.13 28)", borderColor: "oklch(0.88 0.04 28)" }}>
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </div>
  );
}
