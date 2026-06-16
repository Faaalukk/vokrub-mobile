"use client";

import { useState } from "react";
import { Check, Plus, Tag } from "lucide-react";
import { useStore } from "../store/StoreContext";

const POS = ["noun", "verb", "adjective", "adverb", "phrase"];

const CAT_COLORS = [
  { hue: 145, label: "Green" },
  { hue: 200, label: "Blue" },
  { hue: 280, label: "Purple" },
  { hue: 28,  label: "Orange" },
  { hue: 350, label: "Red" },
  { hue: 60,  label: "Yellow" },
];

type WordFormData = { word: string; pos: string; meaning: string; note: string; category_id?: string | null };
type WordFormProps = {
  initial?: WordFormData;
  onSave: (d: WordFormData) => void;
  onCancel?: () => void;
};

export default function WordForm({ initial, onSave, onCancel }: WordFormProps) {
  const store = useStore();
  const [word, setWord] = useState(initial?.word ?? "");
  const [pos, setPos] = useState(initial?.pos ?? "");
  const [meaning, setMeaning] = useState(initial?.meaning ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(initial?.category_id ?? null);

  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(145);
  const [creatingCat, setCreatingCat] = useState(false);

  const valid = word.trim() && meaning.trim();

  async function handleCreateCategory() {
    if (!newCatName.trim() || creatingCat) return;
    setCreatingCat(true);
    try {
      const cat = await store.addWordCategory({ name: newCatName.trim(), color: newCatColor });
      setCategoryId(cat.id);
      setNewCatName("");
      setShowNewCat(false);
    } finally {
      setCreatingCat(false);
    }
  }

  return (
    <div className="vk-col" style={{ gap: 16, padding: "8px 20px 26px" }}>
      <div className="vk-col" style={{ gap: 7 }}>
        <label className="vk-label">Word</label>
        <input className="vk-input" autoFocus placeholder="e.g. Ephemeral" value={word} onChange={(e) => setWord(e.target.value)} />
      </div>

      <div className="vk-col" style={{ gap: 7 }}>
        <label className="vk-label">Part of speech <span className="vk-faint" style={{ fontWeight: 500 }}>· optional</span></label>
        <div className="vk-wrap" style={{ gap: 7 }}>
          {POS.map((p) => (
            <span key={p} className={`vk-chip${pos === p ? " is-on" : ""}`} onClick={() => setPos(pos === p ? "" : p)}>{p}</span>
          ))}
        </div>
      </div>

      <div className="vk-col" style={{ gap: 7 }}>
        <label className="vk-label">Meaning</label>
        <textarea className="vk-textarea" rows={2} placeholder="Describe it in your own words…" value={meaning} onChange={(e) => setMeaning(e.target.value)} />
      </div>

      <div className="vk-col" style={{ gap: 7 }}>
        <label className="vk-label">Personal note <span className="vk-faint" style={{ fontWeight: 500 }}>· optional</span></label>
        <textarea className="vk-textarea" rows={2} placeholder="Where you heard it, an example, a memory…" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      {/* Category */}
      <div className="vk-col" style={{ gap: 7 }}>
        <label className="vk-label">
          <Tag size={12} style={{ display: "inline", marginRight: 4 }} />
          Category <span className="vk-faint" style={{ fontWeight: 500 }}>· optional</span>
        </label>
        <div className="vk-wrap" style={{ gap: 7 }}>
          <span
            className={`vk-chip${categoryId === null ? " is-on" : ""}`}
            onClick={() => setCategoryId(null)}
          >
            None
          </span>
          {store.wordCategories.map((cat) => (
            <span
              key={cat.id}
              className={`vk-chip${categoryId === cat.id ? " is-on" : ""}`}
              onClick={() => setCategoryId(cat.id === categoryId ? null : cat.id)}
              style={categoryId === cat.id ? {
                background: `oklch(0.85 0.10 ${cat.color})`,
                borderColor: `oklch(0.60 0.14 ${cat.color})`,
                color: `oklch(0.25 0.08 ${cat.color})`,
              } : {}}
            >
              {cat.name}
            </span>
          ))}
          <span className="vk-chip" onClick={() => setShowNewCat(!showNewCat)} style={{ color: "var(--accent-ink)", borderColor: "var(--accent)" }}>
            <Plus size={12} /> New
          </span>
        </div>

        {showNewCat && (
          <div className="vk-card-flat" style={{ padding: "14px 14px", marginTop: 4, display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              className="vk-input"
              placeholder="Category name…"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
              autoFocus
            />
            <div className="vk-row" style={{ gap: 8 }}>
              {CAT_COLORS.map((c) => (
                <button
                  key={c.hue}
                  onClick={() => setNewCatColor(c.hue)}
                  style={{
                    width: 26, height: 26, borderRadius: "50%", border: "none", cursor: "pointer",
                    background: `oklch(0.68 0.14 ${c.hue})`,
                    outline: newCatColor === c.hue ? `2px solid oklch(0.40 0.10 ${c.hue})` : "none",
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
            <button
              className="vk-btn vk-btn-primary vk-btn-sm"
              disabled={!newCatName.trim() || creatingCat}
              onClick={handleCreateCategory}
            >
              <Check size={15} /> Create category
            </button>
          </div>
        )}
      </div>

      <div className="vk-row" style={{ gap: 10, marginTop: 2 }}>
        {onCancel && <button className="vk-btn vk-btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>}
        <button className="vk-btn vk-btn-primary" style={{ flex: 2 }} disabled={!valid}
          onClick={() => valid && onSave({ word, pos, meaning, note, category_id: categoryId })}>
          <Check size={18} /> {initial ? "Save changes" : "Save word"}
        </button>
      </div>
    </div>
  );
}
