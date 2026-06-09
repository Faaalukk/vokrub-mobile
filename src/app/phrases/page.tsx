"use client";

import { useState } from "react";
import { Plus, Quote, ChevronDown, X } from "lucide-react";
import { useStore, SUGGESTED_CATS } from "../store/StoreContext";
import SectionHead from "../components/SectionHead";
import Sheet from "../components/Sheet";
import type { Category, Sentence } from "../store/StoreContext";

function tint(hue: number) {
  return { background: `oklch(0.90 0.055 ${hue})`, color: `oklch(0.42 0.09 ${hue})` };
}

function SentenceRow({ s }: { s: Sentence }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="vk-card" style={{ overflow: "hidden" }}>
      <div className="vk-pressable" style={{ padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}
        onClick={() => setOpen((o) => !o)}>
        <Quote size={18} style={{ color: "var(--accent-ink)", marginTop: 2, flexShrink: 0 }} />
        <div className="vk-col" style={{ flex: 1, gap: open ? 8 : 0, minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 15.5, letterSpacing: "-0.01em" }}>{s.text}</span>
          {open && (
            <div className="vk-col vk-pop" style={{ gap: 6 }}>
              <span className="vk-muted vk-sm" style={{ fontWeight: 400 }}>{s.meaning}</span>
              {s.note && <span className="vk-faint vk-sm" style={{ fontStyle: "italic", fontWeight: 400 }}>"{s.note}"</span>}
            </div>
          )}
        </div>
        <ChevronDown size={17} style={{ color: "var(--ink-faint)", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
      </div>
    </div>
  );
}

function CategoryDetail({ cat, onClose }: { cat: Category; onClose: () => void }) {
  const col = tint(cat.hue);
  return (
    <Sheet open onClose={onClose}>
      <div className="vk-col" style={{ padding: "20px 20px 24px", gap: 16 }}>
        <div className="vk-between">
          <div className="vk-row" style={{ gap: 13, minWidth: 0 }}>
            <div className="vk-row" style={{ width: 48, height: 48, borderRadius: 14, justifyContent: "center", ...col }}>
              <span style={{ fontSize: 22 }}>💬</span>
            </div>
            <div className="vk-col" style={{ gap: 2, minWidth: 0 }}>
              <span className="vk-h1">{cat.name}</span>
              <span className="vk-faint vk-sm">{cat.sentences.length} {cat.sentences.length === 1 ? "sentence" : "sentences"}</span>
            </div>
          </div>
          <button onClick={onClose} className="vk-row" style={{ border: "none", background: "var(--surface-2)", borderRadius: 999, width: 34, height: 34, justifyContent: "center", cursor: "pointer", color: "var(--ink-soft)", flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>
        <div className="vk-col" style={{ gap: 10 }}>
          {cat.sentences.map((s) => <SentenceRow key={s.id} s={s} />)}
        </div>
      </div>
    </Sheet>
  );
}

export default function PhrasesPage() {
  const store = useStore();
  const [detail, setDetail] = useState<Category | null>(null);
  const { phraseStats } = store;

  const have = new Set(store.categories.map((c) => c.name.toLowerCase()));
  const sugg = SUGGESTED_CATS.filter((s) => !have.has(s.name.toLowerCase()));

  return (
    <div style={{ padding: "60px 18px 24px" }}>
      <div className="vk-col" style={{ gap: 22 }}>
        {/* Header */}
        <div className="vk-between" style={{ alignItems: "flex-start" }}>
          <div className="vk-col" style={{ gap: 3 }}>
            <span className="vk-eyebrow">{phraseStats.collections} collections · {phraseStats.sentences} sentences</span>
            <h1 className="vk-display">Phrases</h1>
          </div>
          <button className="vk-btn vk-btn-soft vk-btn-sm">
            <Plus size={16} /> New
          </button>
        </div>

        {/* Collections grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {store.categories.map((c, i) => {
            const col = tint(c.hue);
            return (
              <button key={c.id} className="vk-card vk-pressable vk-rise" onClick={() => setDetail(c)}
                style={{ textAlign: "left", border: "1px solid var(--line)", cursor: "pointer", padding: 15,
                  display: "flex", flexDirection: "column", gap: 11, animationDelay: `${Math.min(i, 8) * 30}ms` }}>
                <div className="vk-between" style={{ alignItems: "flex-start" }}>
                  <div className="vk-row" style={{ width: 42, height: 42, borderRadius: 12, justifyContent: "center", ...col }}>
                    <span style={{ fontSize: 20 }}>💬</span>
                  </div>
                  <span className="vk-tag" style={{ background: "var(--surface-2)", color: "var(--ink-soft)" }}>{c.sentences.length}</span>
                </div>
                <div className="vk-col" style={{ gap: 3, minWidth: 0 }}>
                  <span className="vk-h3" style={{ fontSize: 15.5 }}>{c.name}</span>
                  <span className="vk-faint vk-xs" style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.sentences[0]?.text ?? "Empty collection"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Suggested */}
        {sugg.length > 0 && (
          <div>
            <SectionHead title="Suggested for you" />
            <div className="vk-col" style={{ gap: 10 }}>
              {sugg.map((s) => (
                <div key={s.name} className="vk-between vk-card vk-pressable"
                  style={{ padding: "13px 15px", cursor: "pointer" }}>
                  <div className="vk-row" style={{ gap: 12, minWidth: 0 }}>
                    <div className="vk-row" style={{ width: 40, height: 40, borderRadius: 11, justifyContent: "center", ...tint(s.hue) }}>
                      <span style={{ fontSize: 18 }}>💬</span>
                    </div>
                    <div className="vk-col" style={{ gap: 2, minWidth: 0 }}>
                      <span className="vk-h3" style={{ fontSize: 14.5 }}>{s.name}</span>
                      <span className="vk-faint vk-xs" style={{ fontWeight: 500 }}>{s.samples.length} starter sentences</span>
                    </div>
                  </div>
                  <span className="vk-row vk-accent" style={{ gap: 4, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                    <Plus size={16} /> Add
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {detail && <CategoryDetail cat={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
