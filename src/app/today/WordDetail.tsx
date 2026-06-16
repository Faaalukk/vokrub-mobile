"use client";

import { useState, useEffect } from "react";
import { Layers, Pencil, Trash2, Calendar, BookOpen, Pin } from "lucide-react";
import { useStore } from "../store/StoreContext";
import type { Word } from "../store/StoreContext";
import Sheet from "../components/Sheet";
import FlipCard from "../components/FlipCard";
import BoxMeter from "../components/BoxMeter";
import WordForm from "./WordForm";

type WordDetailProps = { word: Word; onClose: () => void; onPractice: () => void; onViewWord?: (w: Word) => void };

export default function WordDetail({ word, onClose, onPractice, onViewWord }: WordDetailProps) {
  const store = useStore();
  const [editing, setEditing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const live = store.words.find((w) => w.id === word.id) || word;

  useEffect(() => {
    setSuggestions([]);
    fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(live.word)}&max=10`)
      .then((r) => r.json())
      .then((results: { word: string }[]) => setSuggestions(results.map((r) => r.word)))
      .catch(() => {});
  }, [live.word]);

  function pinSynonym(syn: string) {
    const next = live.synonyms.includes(syn) ? live.synonyms.filter((s) => s !== syn) : [...live.synonyms, syn];
    store.updateWord(live.id, { word: live.word, pos: live.pos, meaning: live.meaning, note: live.note, synonyms: next, category_id: live.category_id });
  }

  const allSynonyms = Array.from(new Set([...live.synonyms, ...suggestions]));
  const libraryMap = new Map(store.words.map((w) => [w.word.toLowerCase(), w]));

  if (editing) {
    return (
      <Sheet open onClose={onClose} title="Edit word">
        <WordForm
          initial={live}
          onCancel={() => setEditing(false)}
          onSave={(d) => { store.updateWord(live.id, d); setEditing(false); }}
        />
      </Sheet>
    );
  }

  return (
    <Sheet open onClose={onClose}>
      <div className="vk-col" style={{ padding: "20px 20px 24px", gap: 16 }}>
        <FlipCard word={live} height={246} />

        {live.note && (
          <div className="vk-card-flat" style={{ padding: "14px 16px", background: "var(--surface-2)" }}>
            <p className="vk-body" style={{ fontWeight: 500 }}>{live.note}</p>
          </div>
        )}

        {allSynonyms.length > 0 && (
          <div className="vk-card-flat" style={{ padding: "14px 16px" }}>
            <div className="vk-label" style={{ marginBottom: 10 }}>Synonyms</div>
            <div className="vk-wrap" style={{ gap: 8 }}>
              {allSynonyms.map((syn) => {
                const inLibrary = libraryMap.get(syn.toLowerCase());
                const pinned = live.synonyms.includes(syn);
                return (
                  <span
                    key={syn}
                    className="vk-chip"
                    style={inLibrary ? {
                      background: "var(--accent-tint)", borderColor: "var(--accent)",
                      color: "var(--accent-ink)", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 5,
                    } : { display: "flex", alignItems: "center", gap: 5 }}
                    onClick={() => inLibrary && onViewWord?.(inLibrary)}
                  >
                    {inLibrary && <BookOpen size={11} />}
                    {syn}
                    <button
                      onClick={(e) => { e.stopPropagation(); pinSynonym(syn); }}
                      style={{
                        border: "none", background: "none", cursor: "pointer", padding: 0,
                        color: pinned ? "var(--accent-ink)" : "var(--ink-faint)",
                        display: "flex", alignItems: "center",
                      }}
                    >
                      <Pin size={11} fill={pinned ? "currentColor" : "none"} />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="vk-between vk-card-flat" style={{ padding: "13px 16px" }}>
          <div className="vk-row" style={{ gap: 8, color: "var(--ink-soft)" }}>
            <Calendar size={16} />
            <span className="vk-sm">Box {live.box}/5</span>
          </div>
          <BoxMeter box={live.box} />
        </div>

        <div className="vk-row" style={{ gap: 10 }}>
          <button className="vk-btn vk-btn-soft" style={{ flex: 1 }} onClick={onPractice}>
            <Layers size={17} /> Practice
          </button>
          <button className="vk-btn vk-btn-line" onClick={() => setEditing(true)} style={{ width: 50, padding: 0 }}>
            <Pencil size={18} />
          </button>
          <button className="vk-btn vk-btn-line" onClick={() => { store.deleteWord(live.id); onClose(); }}
            style={{ width: 50, padding: 0, color: "oklch(0.55 0.13 28)" }}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </Sheet>
  );
}
