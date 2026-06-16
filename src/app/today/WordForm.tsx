"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Plus, Tag, X, Sparkles } from "lucide-react";
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

export type WordFormData = {
  word: string;
  pos: string;
  meaning: string;
  note: string;
  synonyms?: string[];
  category_id?: string | null;
  queuedSynonyms?: string[];
};

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
  const [synonyms, setSynonyms] = useState<string[]>(initial?.synonyms ?? []);
  const [synInput, setSynInput] = useState("");
  const synRef = useRef<HTMLInputElement>(null);

  // Datamuse suggestions for "add to practice"
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [queued, setQueued] = useState<Set<string>>(new Set());

  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(145);
  const [creatingCat, setCreatingCat] = useState(false);

  const valid = word.trim() && meaning.trim();
  const libraryWords = new Set(store.words.map((w) => w.word.toLowerCase()));

  // Debounced fetch suggestions
  useEffect(() => {
    const trimmed = word.trim();
    if (!trimmed || initial) { setSuggestions([]); return; }
    const timer = setTimeout(() => {
      fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(trimmed)}&max=12`)
        .then((r) => r.json())
        .then((results: { word: string }[]) => {
          const filtered = results
            .map((r) => r.word)
            .filter((w) => w.toLowerCase() !== trimmed.toLowerCase() && !libraryWords.has(w.toLowerCase()));
          setSuggestions(filtered.slice(0, 8));
        })
        .catch(() => {});
    }, 600);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);

  function toggleQueued(syn: string) {
    setQueued((prev) => {
      const next = new Set(prev);
      next.has(syn) ? next.delete(syn) : next.add(syn);
      return next;
    });
  }

  function addSynonym() {
    const val = synInput.trim().toLowerCase();
    if (!val || synonyms.includes(val)) { setSynInput(""); return; }
    setSynonyms((prev) => [...prev, val]);
    setSynInput("");
    synRef.current?.focus();
  }

  function removeSynonym(s: string) {
    setSynonyms((prev) => prev.filter((x) => x !== s));
  }

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
        <input className="vk-input" autoFocus placeholder="e.g. ephemeral" value={word} onChange={(e) => setWord(e.target.value.toLowerCase())} />
      </div>

      {/* Synonym suggestions — add to practice */}
      {suggestions.length > 0 && (
        <div className="vk-card-flat" style={{ padding: "13px 14px", background: "var(--accent-tint)", borderColor: "var(--accent)" }}>
          <div className="vk-row" style={{ gap: 6, marginBottom: 10 }}>
            <Sparkles size={13} style={{ color: "var(--accent-ink)" }} />
            <span className="vk-label" style={{ color: "var(--accent-ink)" }}>Also add to practice?</span>
          </div>
          <div className="vk-wrap" style={{ gap: 7 }}>
            {suggestions.map((syn) => {
              const on = queued.has(syn);
              return (
                <span
                  key={syn}
                  className={`vk-chip${on ? " is-on" : ""}`}
                  onClick={() => toggleQueued(syn)}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  {on && <Check size={11} />}
                  {syn}
                </span>
              );
            })}
          </div>
          {queued.size > 0 && (
            <p className="vk-xs vk-faint" style={{ marginTop: 10, fontWeight: 500 }}>
              {queued.size} word{queued.size > 1 ? "s" : ""} queued — you&apos;ll fill in meanings after saving.
            </p>
          )}
        </div>
      )}

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

      {/* Synonyms (labels) */}
      <div className="vk-col" style={{ gap: 7 }}>
        <label className="vk-label">Synonyms <span className="vk-faint" style={{ fontWeight: 500 }}>· optional</span></label>
        <div className="vk-wrap" style={{ gap: 7, minHeight: 32 }}>
          {synonyms.map((s) => (
            <span key={s} className="vk-chip is-on" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {s}
              <X size={11} style={{ cursor: "pointer", opacity: 0.7 }} onClick={() => removeSynonym(s)} />
            </span>
          ))}
        </div>
        <div className="vk-row" style={{ gap: 8 }}>
          <input
            ref={synRef}
            className="vk-input"
            placeholder="e.g. fleeting"
            value={synInput}
            onChange={(e) => setSynInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSynonym(); } }}
            style={{ flex: 1 }}
          />
          <button className="vk-btn vk-btn-soft vk-btn-sm" onClick={addSynonym} disabled={!synInput.trim()}>
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {/* Category */}
      <div className="vk-col" style={{ gap: 7 }}>
        <label className="vk-label">
          <Tag size={12} style={{ display: "inline", marginRight: 4 }} />
          Category <span className="vk-faint" style={{ fontWeight: 500 }}>· optional</span>
        </label>
        <div className="vk-wrap" style={{ gap: 7 }}>
          <span className={`vk-chip${categoryId === null ? " is-on" : ""}`} onClick={() => setCategoryId(null)}>None</span>
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
        <button
          className="vk-btn vk-btn-primary"
          style={{ flex: 2 }}
          disabled={!valid}
          onClick={() => valid && onSave({ word, pos, meaning, note, synonyms, category_id: categoryId, queuedSynonyms: Array.from(queued) })}
        >
          <Check size={18} /> {initial ? "Save changes" : queued.size > 0 ? `Save + add ${queued.size} more` : "Save word"}
        </button>
      </div>
    </div>
  );
}
