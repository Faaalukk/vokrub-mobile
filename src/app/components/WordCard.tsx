import type { Word } from "../store/StoreContext";
import BoxMeter from "./BoxMeter";

function when(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date("2026-06-09");
  const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff}d ago`;
}

type WordCardProps = { word: Word; onClick: () => void; index?: number };

export default function WordCard({ word, onClick, index = 0 }: WordCardProps) {
  return (
    <div
      className="vk-card vk-pressable vk-rise"
      onClick={onClick}
      style={{ padding: "15px 16px", display: "flex", alignItems: "center", gap: 14, animationDelay: `${Math.min(index, 8) * 28}ms` }}
    >
      <div className="vk-col" style={{ flex: 1, gap: 4, minWidth: 0 }}>
        <div className="vk-row" style={{ gap: 8 }}>
          <span className="vk-h3" style={{ fontSize: 16 }}>{word.word}</span>
          {word.pos && <span className="vk-faint vk-xs" style={{ fontStyle: "italic", fontWeight: 500 }}>{word.pos}</span>}
          {word.due && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--clay)", display: "inline-block" }} title="Due for review" />}
        </div>
        <div className="vk-muted vk-sm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 400 }}>
          {word.meaning}
        </div>
      </div>
      <div className="vk-col" style={{ alignItems: "flex-end", gap: 7 }}>
        <BoxMeter box={word.box} />
        <span className="vk-faint vk-xs" style={{ fontWeight: 500 }}>{when(word.added)}</span>
      </div>
    </div>
  );
}
