import { Flame } from "lucide-react";

type StreakCardProps = { streak: number; addedToday: number; goal: number };

export default function StreakCard({ streak, addedToday, goal }: StreakCardProps) {
  const pct = Math.min(1, addedToday / goal);
  const r = 27;
  const circ = 2 * Math.PI * r;

  return (
    <div className="vk-card vk-rise" style={{ padding: 18, display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "center" }}>
      <div className="vk-row" style={{ position: "relative", width: 64, height: 64, justifyContent: "center" }}>
        <svg width="64" height="64" viewBox="0 0 64 64" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
          <circle cx="32" cy="32" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="6" />
          <circle cx="32" cy="32" r={r} fill="none" stroke="var(--clay)" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
            style={{ transition: "stroke-dashoffset .6s cubic-bezier(.22,1,.36,1)" }}
          />
        </svg>
        <Flame size={26} style={{ color: "var(--clay)", position: "relative" }} />
      </div>
      <div className="vk-col" style={{ gap: 3 }}>
        <div className="vk-row" style={{ gap: 8, alignItems: "baseline" }}>
          <span className="vk-display" style={{ fontSize: 26 }}>{streak}</span>
          <span className="vk-muted vk-sm">day streak</span>
        </div>
        <span className="vk-faint vk-sm" style={{ fontWeight: 500 }}>
          {addedToday >= goal
            ? "Daily goal complete — nice."
            : `${addedToday} of ${goal} words today · keep it going`}
        </span>
      </div>
    </div>
  );
}
