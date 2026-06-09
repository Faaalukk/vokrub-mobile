"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { useStore } from "../store/StoreContext";
import WordCard from "../components/WordCard";
import Sheet from "../components/Sheet";
import SectionHead from "../components/SectionHead";
import WordDetail from "../today/WordDetail";
import WordForm from "../today/WordForm";
import type { Word } from "../store/StoreContext";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "due", label: "Due" },
  { key: "recent", label: "Recent" },
  { key: "mastered", label: "Mastered" },
];

export default function WordsPage() {
  const store = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState<Word | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  let list = store.words;
  if (q.trim()) {
    const s = q.toLowerCase();
    list = list.filter((w) => w.word.toLowerCase().includes(s) || w.meaning.toLowerCase().includes(s));
  }
  if (filter === "due") list = list.filter((w) => w.due);
  else if (filter === "mastered") list = list.filter((w) => w.box >= 5);
  else if (filter === "recent") list = list.slice(0, 6);

  return (
    <div style={{ padding: "60px 18px 24px" }}>
      <div className="vk-col" style={{ gap: 16 }}>
        {/* Header */}
        <div className="vk-between" style={{ alignItems: "flex-start" }}>
          <div className="vk-col" style={{ gap: 3 }}>
            <span className="vk-eyebrow">{store.stats.total} words · {store.stats.mastered} mastered</span>
            <h1 className="vk-display">Library</h1>
          </div>
          <button className="vk-btn vk-btn-soft vk-btn-sm" onClick={() => setAddOpen(true)}>
            <Plus size={16} /> Add
          </button>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-faint)" }} />
          <input className="vk-input" placeholder="Search your words…" value={q} onChange={(e) => setQ(e.target.value)}
            style={{ paddingLeft: 42, fontSize: 15 }} />
        </div>

        {/* Filters */}
        <div className="vk-wrap" style={{ gap: 8 }}>
          {FILTERS.map((f) => (
            <span key={f.key} className={`vk-chip${filter === f.key ? " is-on" : ""}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </span>
          ))}
        </div>

        {/* Word list */}
        {list.length ? (
          <div className="vk-col" style={{ gap: 10 }}>
            {list.map((w, i) => <WordCard key={w.id} word={w} index={i} onClick={() => setDetail(w)} />)}
          </div>
        ) : (
          <div className="vk-col" style={{ alignItems: "center", textAlign: "center", padding: "40px 30px", gap: 10 }}>
            <div className="vk-h2">No words found</div>
            <div className="vk-muted vk-sm">Try a different search or add a new word.</div>
            <button className="vk-btn vk-btn-soft vk-btn-sm" style={{ marginTop: 6 }} onClick={() => setAddOpen(true)}>
              <Plus size={16} /> Add a word
            </button>
          </div>
        )}
      </div>

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Add a word">
        <WordForm onCancel={() => setAddOpen(false)} onSave={(d) => { store.addWord(d); setAddOpen(false); }} />
      </Sheet>

      {detail && <WordDetail word={detail} onClose={() => setDetail(null)} onPractice={() => setDetail(null)} />}
    </div>
  );
}
