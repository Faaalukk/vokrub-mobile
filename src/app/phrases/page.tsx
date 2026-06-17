"use client";

import { useState } from "react";
import { Plus, Quote, ChevronDown, X, Check, Trash2, Pencil } from "lucide-react";
import { useStore, SUGGESTED_CATS } from "../store/StoreContext";
import SectionHead from "../components/SectionHead";
import Sheet from "../components/Sheet";
import type { Category, Sentence } from "../store/StoreContext";

// ── helpers ──────────────────────────────────────────────────────────────────

function tint(hue: number) {
  return { background: `oklch(0.90 0.055 ${hue})`, color: `oklch(0.42 0.09 ${hue})` };
}

const HUES = [150, 62, 250, 28, 200, 300, 130, 340];

// ── SentenceForm ─────────────────────────────────────────────────────────────

type SentenceFormData = { text: string; meaning: string; note: string };

function SentenceForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: SentenceFormData;
  onSave: (d: SentenceFormData) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(initial?.text ?? "");
  const [meaning, setMeaning] = useState(initial?.meaning ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const valid = text.trim() && meaning.trim();

  return (
    <div className="vk-col" style={{ gap: 16, padding: "8px 20px 26px" }}>
      <div className="vk-col" style={{ gap: 7 }}>
        <label className="vk-label">Sentence</label>
        <textarea className="vk-textarea" rows={2} autoFocus placeholder="e.g. How's it going?" value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div className="vk-col" style={{ gap: 7 }}>
        <label className="vk-label">What it means</label>
        <textarea className="vk-textarea" rows={2} placeholder="Describe it in your own words…" value={meaning} onChange={(e) => setMeaning(e.target.value)} />
      </div>
      <div className="vk-col" style={{ gap: 7 }}>
        <label className="vk-label">Note <span className="vk-faint" style={{ fontWeight: 500 }}>· optional</span></label>
        <input className="vk-input" placeholder="A reply, example, where you heard it…" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="vk-row" style={{ gap: 10, marginTop: 2 }}>
        <button className="vk-btn vk-btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
        <button className="vk-btn vk-btn-primary" style={{ flex: 2 }} disabled={!valid}
          onClick={() => valid && onSave({ text, meaning, note })}>
          <Check size={18} /> {initial ? "Save changes" : "Add sentence"}
        </button>
      </div>
    </div>
  );
}

// ── SentenceRow ───────────────────────────────────────────────────────────────

function SentenceRow({
  s,
  onEdit,
  onDelete,
}: {
  s: Sentence;
  onEdit: (s: Sentence) => void;
  onDelete: (s: Sentence) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="vk-card" style={{ overflow: "hidden" }}>
      <div className="vk-pressable" style={{ padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}
        onClick={() => setOpen((o) => !o)}>
        <Quote size={18} style={{ color: "var(--accent-ink)", marginTop: 2, flexShrink: 0 }} />
        <div className="vk-col" style={{ flex: 1, gap: open ? 10 : 0, minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 15.5, letterSpacing: "-0.01em" }}>{s.text}</span>
          {open && (
            <div className="vk-col vk-pop" style={{ gap: 8 }}>
              <span className="vk-muted vk-sm" style={{ fontWeight: 400 }}>{s.meaning}</span>
              {s.note && <span className="vk-faint vk-sm" style={{ fontStyle: "italic", fontWeight: 400 }}>"{s.note}"</span>}
              <div className="vk-row" style={{ gap: 8, marginTop: 2 }}>
                <button className="vk-btn vk-btn-ghost vk-btn-sm" onClick={(e) => { e.stopPropagation(); onEdit(s); }}>
                  <Pencil size={14} /> Edit
                </button>
                <button className="vk-btn vk-btn-ghost vk-btn-sm" style={{ color: "oklch(0.55 0.13 28)" }}
                  onClick={(e) => { e.stopPropagation(); onDelete(s); }}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
        <ChevronDown size={17} style={{ color: "var(--ink-faint)", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
      </div>
    </div>
  );
}

// ── CategoryDetail ────────────────────────────────────────────────────────────

function CategoryDetail({ cat, onClose, onDeleted }: { cat: Category; onClose: () => void; onDeleted: () => void }) {
  const store = useStore();
  const live = store.categories.find((c) => c.id === cat.id) ?? cat;
  const col = tint(live.hue);
  const [addingSheet, setAddingSheet] = useState(false);
  const [editingSentence, setEditingSentence] = useState<Sentence | null>(null);

  async function handleAddSentence(d: SentenceFormData) {
    await store.addSentence(live.id, d);
    setAddingSheet(false);
  }

  async function handleEditSentence(d: SentenceFormData) {
    if (!editingSentence) return;
    await store.updateSentence(editingSentence.id, d);
    setEditingSentence(null);
  }

  async function handleDeleteSentence(s: Sentence) {
    await store.deleteSentence(s.id);
  }

  async function handleDeleteCategory() {
    await store.deleteCategory(live.id);
    onDeleted();
  }

  if (addingSheet) {
    return (
      <Sheet open onClose={() => setAddingSheet(false)} title="Add sentence">
        <SentenceForm onCancel={() => setAddingSheet(false)} onSave={handleAddSentence} />
      </Sheet>
    );
  }

  if (editingSentence) {
    return (
      <Sheet open onClose={() => setEditingSentence(null)} title="Edit sentence">
        <SentenceForm initial={editingSentence} onCancel={() => setEditingSentence(null)} onSave={handleEditSentence} />
      </Sheet>
    );
  }

  return (
    <Sheet open onClose={onClose}>
      <div className="vk-col" style={{ padding: "20px 20px 28px", gap: 16 }}>
        {/* Header */}
        <div className="vk-between">
          <div className="vk-row" style={{ gap: 13, minWidth: 0 }}>
            <div className="vk-row" style={{ width: 48, height: 48, borderRadius: 14, justifyContent: "center", ...col }}>
              <span style={{ fontSize: 22 }}>💬</span>
            </div>
            <div className="vk-col" style={{ gap: 2, minWidth: 0 }}>
              <span className="vk-h1">{live.name}</span>
              <span className="vk-faint vk-sm">{live.sentences.length} {live.sentences.length === 1 ? "sentence" : "sentences"}</span>
            </div>
          </div>
          <button onClick={onClose} className="vk-row" style={{ border: "none", background: "var(--surface-2)", borderRadius: 999, width: 34, height: 34, justifyContent: "center", cursor: "pointer", color: "var(--ink-soft)", flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>

        {/* Sentences */}
        {live.sentences.length > 0 ? (
          <div className="vk-col" style={{ gap: 10 }}>
            {live.sentences.map((s) => (
              <SentenceRow key={s.id} s={s} onEdit={setEditingSentence} onDelete={handleDeleteSentence} />
            ))}
          </div>
        ) : (
          <div className="vk-col" style={{ alignItems: "center", textAlign: "center", padding: "24px 0", gap: 8 }}>
            <span className="vk-h3" style={{ color: "var(--ink-soft)" }}>No sentences yet</span>
            <span className="vk-sm vk-faint">Add your first sentence to this collection.</span>
          </div>
        )}

        {/* Actions */}
        <button className="vk-btn vk-btn-primary vk-btn-block vk-btn-lg" onClick={() => setAddingSheet(true)}>
          <Plus size={18} /> Add a sentence
        </button>
        <button className="vk-btn vk-btn-line vk-btn-block" onClick={handleDeleteCategory}
          style={{ color: "oklch(0.55 0.13 28)", borderColor: "oklch(0.88 0.04 28)" }}>
          <Trash2 size={16} /> Delete collection
        </button>
      </div>
    </Sheet>
  );
}

// ── NewCategorySheet ──────────────────────────────────────────────────────────

type SuggestedSample = { text: string; meaning: string };

function NewCategorySheet({
  seed,
  onClose,
  onCreated,
}: {
  seed: { name: string; hue: number; samples: SuggestedSample[] } | null;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const store = useStore();
  const [name, setName] = useState(seed?.name ?? "");
  const [hue, setHue] = useState(seed?.hue ?? 150);
  const [samples, setSamples] = useState<SuggestedSample[]>(seed?.samples ?? []);
  const [loading, setLoading] = useState(false);
  const valid = name.trim();

  async function handleCreate() {
    if (!valid || loading) return;
    setLoading(true);
    const cat = await store.addCategory({ name, icon: "chat", hue });
    for (const s of samples) {
      await store.addSentence(cat.id, { text: s.text, meaning: s.meaning, note: "" });
    }
    setLoading(false);
    onCreated(cat.id);
  }

  return (
    <Sheet open onClose={onClose} title={seed ? "Add collection" : "New collection"}>
      <div className="vk-col" style={{ gap: 16, padding: "8px 20px 26px" }}>
        {/* Preview + name */}
        <div className="vk-row" style={{ gap: 13 }}>
          <div className="vk-row" style={{ width: 52, height: 52, borderRadius: 15, justifyContent: "center", flexShrink: 0, ...tint(hue) }}>
            <span style={{ fontSize: 24 }}>💬</span>
          </div>
          <div className="vk-col" style={{ gap: 7, flex: 1 }}>
            <label className="vk-label">Collection name</label>
            <input className="vk-input" autoFocus placeholder="e.g. Say Hello" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>

        {/* Hue picker */}
        <div className="vk-col" style={{ gap: 8 }}>
          <label className="vk-label">Colour</label>
          <div className="vk-wrap" style={{ gap: 10 }}>
            {HUES.map((h) => (
              <button key={h} onClick={() => setHue(h)} aria-label="colour"
                style={{ width: 30, height: 30, borderRadius: "50%", cursor: "pointer",
                  background: `oklch(0.78 0.11 ${h})`,
                  border: hue === h ? "2.5px solid var(--ink)" : "2.5px solid transparent",
                  transition: "border .15s ease" }} />
            ))}
          </div>
        </div>

        {/* Starter sentences from suggestion */}
        {samples.length > 0 && (
          <div className="vk-col" style={{ gap: 8 }}>
            <label className="vk-label">Starter sentences <span className="vk-faint" style={{ fontWeight: 500 }}>· tap ✕ to remove</span></label>
            {samples.map((s, i) => (
              <div key={i} className="vk-between vk-card-flat" style={{ padding: "11px 14px", background: "var(--surface-2)" }}>
                <div className="vk-col" style={{ gap: 2, flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{s.text}</span>
                  <span className="vk-faint vk-xs" style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.meaning}</span>
                </div>
                <button onClick={() => setSamples((prev) => prev.filter((_, j) => j !== i))}
                  className="vk-row" style={{ border: "none", background: "var(--surface)", borderRadius: 999, width: 28, height: 28, justifyContent: "center", cursor: "pointer", color: "var(--ink-faint)", flexShrink: 0, marginLeft: 10 }}>
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button className="vk-btn vk-btn-primary vk-btn-block vk-btn-lg" disabled={!valid || loading} onClick={handleCreate}>
          <Check size={18} />
          {loading ? "Creating…" : `Create collection${samples.length ? ` · ${samples.length} sentences` : ""}`}
        </button>
      </div>
    </Sheet>
  );
}

// ── PhrasesPage ───────────────────────────────────────────────────────────────

export default function PhrasesPage() {
  const store = useStore();
  const [detail, setDetail] = useState<Category | null>(null);
  const [creating, setCreating] = useState<{ seed: typeof SUGGESTED_CATS[0] | null } | null>(null);
  const { phraseStats } = store;

  const have = new Set(store.categories.map((c) => c.name.toLowerCase()));
  const sugg = SUGGESTED_CATS.filter((s) => !have.has(s.name.toLowerCase()));

  function openDetail(cat: Category) {
    setCreating(null);
    setDetail(cat);
  }

  return (
    <div className="vk-page">
      <div className="vk-col" style={{ gap: 22 }}>
        {/* Header */}
        <div className="vk-between" style={{ alignItems: "flex-start" }}>
          <div className="vk-col" style={{ gap: 3 }}>
            <span className="vk-eyebrow">{phraseStats.collections} collections · {phraseStats.sentences} sentences</span>
            <h1 className="vk-display">Phrases</h1>
          </div>
          <button className="vk-btn vk-btn-soft vk-btn-sm" onClick={() => setCreating({ seed: null })}>
            <Plus size={16} /> New
          </button>
        </div>

        {/* Collections grid */}
        {store.categories.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {store.categories.map((c, i) => {
              const col = tint(c.hue);
              return (
                <button key={c.id} className="vk-card vk-pressable vk-rise" onClick={() => openDetail(c)}
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
        ) : (
          <div className="vk-col" style={{ alignItems: "center", textAlign: "center", padding: "32px 0", gap: 10 }}>
            <div className="vk-row" style={{ width: 60, height: 60, borderRadius: 18, background: "var(--accent-tint)", color: "var(--accent-ink)", justifyContent: "center" }}>
              <Quote size={26} />
            </div>
            <span className="vk-h2">No collections yet</span>
            <span className="vk-muted vk-sm" style={{ maxWidth: 260, fontWeight: 400 }}>Group sentences by theme and give each one a meaning.</span>
            <button className="vk-btn vk-btn-soft vk-btn-sm" style={{ marginTop: 6 }} onClick={() => setCreating({ seed: null })}>
              <Plus size={16} /> New collection
            </button>
          </div>
        )}

        {/* Suggested */}
        {sugg.length > 0 && (
          <div>
            <SectionHead title="Suggested for you" />
            <div className="vk-col" style={{ gap: 10 }}>
              {sugg.map((s) => (
                <div key={s.name} className="vk-between vk-card vk-pressable"
                  onClick={() => setCreating({ seed: s })}
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

      {/* Sheets */}
      {detail && (
        <CategoryDetail
          cat={detail}
          onClose={() => setDetail(null)}
          onDeleted={() => setDetail(null)}
        />
      )}

      {creating !== null && (
        <NewCategorySheet
          seed={creating.seed}
          onClose={() => setCreating(null)}
          onCreated={(id) => {
            setCreating(null);
            const cat = store.categories.find((c) => c.id === id);
            if (cat) setTimeout(() => setDetail(cat), 80);
          }}
        />
      )}
    </div>
  );
}
