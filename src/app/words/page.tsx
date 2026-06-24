"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Users, BookOpen, Trash2, Dumbbell, X, Check, Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "../store/StoreContext";
import type { Word, WordFamily } from "../store/StoreContext";
import { suggestForms, lookupWord, translateToThai, type FormSuggestion } from "../../lib/dictionary";
import WordCard from "../components/WordCard";
import Sheet from "../components/Sheet";
import WordDetail from "../today/WordDetail";
import WordForm from "../today/WordForm";
import DuplicateWordModal from "../components/DuplicateWordModal";
import { DuplicateWordError } from "../../lib/api";

const STATUS_FILTERS = [
  { key: "all",      label: "All" },
  { key: "due",      label: "Due" },
  { key: "recent",   label: "Recent" },
  { key: "mastered", label: "Mastered" },
];

// ── Add-words-to-family sheet ─────────────────────────────────────────────────

function AddWordsSheet({ family, onClose }: { family: WordFamily; onClose: () => void }) {
  const store = useStore();
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [suggestions, setSuggestions] = useState<FormSuggestion[]>([]);
  const [addingSug, setAddingSug] = useState<string | null>(null);

  const liveFamily = store.wordFamilies.find((f) => f.id === family.id) ?? family;
  const term = q.trim().toLowerCase();
  const available = store.words.filter((w) =>
    !liveFamily.wordIds.includes(w.id) &&
    (term === "" || w.word.includes(term) || w.meaning.toLowerCase().includes(term))
  );
  // Offer inline creation when the typed word isn't anywhere in the library yet.
  const canCreate = term !== "" && !store.words.some((w) => w.word === term);

  // Suggest related family forms (exclusive → exclusively, exclusiveness …) for the typed word.
  const memberWords = new Set(store.words.filter((w) => liveFamily.wordIds.includes(w.id)).map((w) => w.word));
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      const forms = term.length < 3 ? [] : await suggestForms(term);
      if (!cancelled) setSuggestions(forms);
    }, 500);
    return () => { cancelled = true; clearTimeout(t); };
  }, [term]);
  const freshSuggestions = suggestions.filter((s) => s.word !== term && !memberWords.has(s.word));

  async function add(wordId: string) {
    setAdding(wordId);
    try { await store.addToFamily(family.id, wordId); }
    catch { /* already a member — ignore */ }
    finally { setAdding(null); }
  }

  // Add a suggested form: auto-fetch its meaning, then create + link it.
  async function addSuggestion(s: FormSuggestion) {
    setAddingSug(s.word);
    try {
      const existing = store.words.find((w) => w.word === s.word);
      if (existing) { await store.addToFamily(family.id, existing.id); return; }
      const [info, thai] = await Promise.all([lookupWord(s.word), translateToThai(s.word)]);
      const meaning = thai || info.definition || "";
      await store.addNewWordToFamily(family.id, { word: s.word, pos: s.pos ? [s.pos] : [], meaning, note: "", synonyms: [] });
    } catch { /* ignore — likely already a member */ }
    finally { setAddingSug(null); }
  }

  if (creatingNew) {
    return (
      <Sheet open onClose={onClose} title={`New word — ${family.name}`}>
        <WordForm
          initial={{ word: term, pos: [], meaning: "", note: "", category_id: null }}
          onCancel={() => setCreatingNew(false)}
          onSave={async (d) => {
            await store.addNewWordToFamily(family.id, { ...d, synonyms: [] });
            setCreatingNew(false);
            setQ("");
          }}
        />
      </Sheet>
    );
  }

  return (
    <Sheet open onClose={onClose} title={`Add words — ${family.name}`}>
      <div className="vk-col" style={{ gap: 14, padding: "8px 20px 28px" }}>
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-faint)" }} />
          <input className="vk-input" placeholder="Search or type a new word…" value={q} onChange={(e) => setQ(e.target.value)}
            style={{ paddingLeft: 38, fontSize: 14 }} autoFocus />
        </div>
        {available.length === 0 ? (
          <p className="vk-body vk-muted" style={{ textAlign: "center", padding: "24px 0" }}>
            {store.words.length === 0 ? "No words in library yet." : "All words already in this family."}
          </p>
        ) : (
          <div className="vk-col" style={{ gap: 8 }}>
            {available.map((w) => (
              <div key={w.id} className="vk-between vk-card-flat" style={{ padding: "12px 14px" }}>
                <div className="vk-col" style={{ gap: 2 }}>
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 15 }}>{w.word}</span>
                  {w.pos.length > 0 && <span className="vk-xs vk-faint">{w.pos.join(", ")}</span>}
                </div>
                <button
                  className="vk-btn vk-btn-soft vk-btn-sm"
                  disabled={adding === w.id}
                  onClick={() => add(w.id)}
                  style={{ padding: "7px 14px", fontSize: 13 }}
                >
                  {adding === w.id ? "Adding…" : <><Plus size={14} /> Add</>}
                </button>
              </div>
            ))}
          </div>
        )}
        {canCreate && (
          <button className="vk-btn vk-btn-line vk-btn-block" onClick={() => setCreatingNew(true)} style={{ fontSize: 14 }}>
            <Plus size={16} /> Create &ldquo;{term}&rdquo; as a new word
          </button>
        )}
        {freshSuggestions.length > 0 && (
          <div className="vk-col" style={{ gap: 8 }}>
            <span className="vk-xs vk-faint vk-row" style={{ gap: 5 }}>
              <Sparkles size={12} /> Related forms
            </span>
            <div className="vk-wrap" style={{ gap: 8 }}>
              {freshSuggestions.map((s) => (
                <button
                  key={s.word}
                  className="vk-chip"
                  disabled={addingSug === s.word}
                  onClick={() => addSuggestion(s)}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{s.word}</span>
                  {s.pos && <span className="vk-faint" style={{ fontSize: 11 }}>{s.pos}</span>}
                  {addingSug === s.word ? <Loader2 size={12} className="vk-spin" /> : <Plus size={12} />}
                </button>
              ))}
            </div>
          </div>
        )}
        <button className="vk-btn vk-btn-ghost vk-btn-block" onClick={onClose}>
          <Check size={16} /> Done
        </button>
      </div>
    </Sheet>
  );
}

// ── Auto-wrap-into-family prompt (after adding a word) ────────────────────────

function FamilyFromWordSheet({ base, forms, onClose }: { base: Word; forms: FormSuggestion[]; onClose: () => void }) {
  const store = useStore();
  const [name, setName] = useState(`${base.word} family`);
  const [selected, setSelected] = useState<Set<string>>(new Set(forms.map((f) => f.word)));
  const [busy, setBusy] = useState(false);

  function toggle(word: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word); else next.add(word);
      return next;
    });
  }

  async function create() {
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      const fam = await store.createWordFamily({ name: name.trim(), wordId: base.id });
      for (const f of forms.filter((f) => selected.has(f.word))) {
        const existing = store.words.find((w) => w.word === f.word);
        if (existing) {
          await store.addToFamily(fam.id, existing.id);
          continue;
        }
        const [info, thai] = await Promise.all([lookupWord(f.word), translateToThai(f.word)]);
        await store.addNewWordToFamily(fam.id, { word: f.word, pos: f.pos ? [f.pos] : [], meaning: thai || info.definition || "", note: "", synonyms: [] });
      }
      onClose();
    } finally { setBusy(false); }
  }

  return (
    <Sheet open onClose={onClose} title="Word family found">
      <div className="vk-col" style={{ gap: 14, padding: "8px 20px 28px" }}>
        <p className="vk-sm vk-faint vk-row" style={{ gap: 6 }}>
          <Sparkles size={13} /> Related forms of &ldquo;{base.word}&rdquo; — wrap them into a family?
        </p>
        <div className="vk-col" style={{ gap: 7 }}>
          <label className="vk-label">Family name</label>
          <input className="vk-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="vk-col" style={{ gap: 7 }}>
          <label className="vk-label">Forms to include</label>
          <div className="vk-wrap" style={{ gap: 8 }}>
            {forms.map((f) => (
              <button key={f.word} className={`vk-chip${selected.has(f.word) ? " is-on" : ""}`} onClick={() => toggle(f.word)}
                style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {selected.has(f.word) ? <Check size={12} /> : <Plus size={12} />}
                <span style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{f.word}</span>
                {f.pos && <span className="vk-faint" style={{ fontSize: 11 }}>{f.pos}</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="vk-row" style={{ gap: 10 }}>
          <button className="vk-btn vk-btn-ghost" style={{ flex: 1 }} onClick={onClose} disabled={busy}>Skip</button>
          <button className="vk-btn vk-btn-primary" style={{ flex: 2 }} disabled={!name.trim() || busy} onClick={create}>
            {busy ? <><Loader2 size={16} className="vk-spin" /> Creating…</> : <><Users size={16} /> Create family</>}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

// ── Families tab ──────────────────────────────────────────────────────────────

function FamiliesTab({ onViewWord }: { onViewWord: (w: Word) => void }) {
  const store = useStore();
  const router = useRouter();
  const [newFamilyOpen, setNewFamilyOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [withWord, setWithWord] = useState(false); // new-family sheet: starter-word step
  const [addingTo, setAddingTo] = useState<WordFamily | null>(null);

  function closeNewFamily() {
    setNewFamilyOpen(false);
    setWithWord(false);
    setNewName("");
  }

  async function createFamily() {
    if (!newName.trim() || creating) return;
    setCreating(true);
    try {
      await store.createWordFamily({ name: newName.trim() });
      closeNewFamily();
    } finally { setCreating(false); }
  }

  return (
    <div className="vk-col" style={{ gap: 14 }}>
      {/* New family button */}
      <button className="vk-btn vk-btn-soft vk-btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => setNewFamilyOpen(true)}>
        <Plus size={15} /> New family
      </button>

      {store.wordFamilies.length === 0 ? (
        <div className="vk-col" style={{ alignItems: "center", textAlign: "center", padding: "48px 30px", gap: 12 }}>
          <div style={{ fontSize: 36 }}>🌱</div>
          <div className="vk-h2">No families yet</div>
          <p className="vk-body vk-muted" style={{ maxWidth: 260 }}>
            Create a family and add related word forms like run, running, runner.
          </p>
        </div>
      ) : (
        <div className="vk-col" style={{ gap: 12 }}>
          {store.wordFamilies.map((family) => {
            const members = store.words.filter((w) => family.wordIds.includes(w.id));
            return (
              <div key={family.id} className="vk-card" style={{ padding: "16px 18px" }}>
                <div className="vk-between" style={{ marginBottom: members.length > 0 ? 12 : 0 }}>
                  <div className="vk-row" style={{ gap: 8 }}>
                    <Users size={15} style={{ color: "var(--accent-ink)" }} />
                    <span className="vk-h3">{family.name}</span>
                    <span className="vk-faint vk-xs" style={{ fontWeight: 600 }}>{members.length}</span>
                  </div>
                  <div className="vk-row" style={{ gap: 6 }}>
                    <button className="vk-btn vk-btn-soft vk-btn-sm" style={{ padding: "7px 12px", fontSize: 12 }}
                      onClick={() => router.push("/practice")}>
                      <Dumbbell size={13} /> Practice
                    </button>
                    <button className="vk-btn vk-btn-line vk-btn-sm" style={{ padding: "7px 12px", fontSize: 12 }}
                      onClick={() => setAddingTo(family)}>
                      <Plus size={13} /> Add words
                    </button>
                    <button onClick={() => store.deleteWordFamily(family.id)}
                      style={{ border: "none", background: "none", cursor: "pointer", color: "var(--ink-faint)", padding: 4, display: "flex" }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {members.length > 0 && (
                  <div className="vk-wrap" style={{ gap: 8 }}>
                    {members.map((w) => (
                      <div key={w.id} className="vk-row" style={{ gap: 0, background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 999 }}>
                        <button
                          onClick={() => onViewWord(w)}
                          style={{ border: "none", background: "none", cursor: "pointer", padding: "7px 12px 7px 14px", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 13, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}
                        >
                          {w.word}
                          {w.pos.length > 0 && <span style={{ fontSize: 11, color: "var(--ink-faint)", fontFamily: "var(--ff)", fontWeight: 600 }}>{w.pos.join(", ")}</span>}
                          <BookOpen size={11} style={{ color: "var(--ink-faint)" }} />
                        </button>
                        <button
                          onClick={() => store.removeFromFamily(family.id, w.id)}
                          style={{ border: "none", background: "none", cursor: "pointer", padding: "7px 10px 7px 4px", color: "var(--ink-faint)", display: "flex", alignItems: "center" }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New family sheet */}
      <Sheet open={newFamilyOpen} onClose={closeNewFamily} title={withWord ? "Starter word" : "New word family"}>
        {withWord ? (
          <WordForm
            onCancel={() => setWithWord(false)}
            onSave={async (d) => {
              await store.createWordFamily({ name: newName.trim(), newWord: { ...d, synonyms: [] } });
              closeNewFamily();
            }}
          />
        ) : (
          <div className="vk-col" style={{ gap: 14, padding: "8px 20px 28px" }}>
            <div className="vk-col" style={{ gap: 7 }}>
              <label className="vk-label">Family name</label>
              <input className="vk-input" autoFocus placeholder='e.g. "run family"'
                value={newName} onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createFamily()} />
            </div>
            <button className="vk-btn vk-btn-line vk-btn-block" disabled={!newName.trim()} onClick={() => setWithWord(true)} style={{ fontSize: 14 }}>
              <Plus size={16} /> Add a starter word
            </button>
            <p className="vk-sm vk-faint">Add a starter word now, or create empty and use &ldquo;Add words&rdquo; later.</p>
            <div className="vk-row" style={{ gap: 10 }}>
              <button className="vk-btn vk-btn-ghost" style={{ flex: 1 }} onClick={closeNewFamily}>Cancel</button>
              <button className="vk-btn vk-btn-primary" style={{ flex: 2 }} disabled={!newName.trim() || creating} onClick={createFamily}>
                <Check size={17} /> Create family
              </button>
            </div>
          </div>
        )}
      </Sheet>

      {/* Add words sheet */}
      {addingTo && <AddWordsSheet family={addingTo} onClose={() => setAddingTo(null)} />}
    </div>
  );
}

// ── Words tab ─────────────────────────────────────────────────────────────────

function WordsTab({ onViewWord, onAddWord }: { onViewWord: (w: Word) => void; onAddWord: () => void }) {
  const store = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState<string | null>(null);

  let list = store.words;
  if (q.trim()) {
    const s = q.toLowerCase();
    list = list.filter((w) => w.word.toLowerCase().includes(s) || w.meaning.toLowerCase().includes(s));
  }
  if (catFilter) list = list.filter((w) => w.category_id === catFilter);
  if (filter === "due")           list = list.filter((w) => w.due);
  else if (filter === "mastered") list = list.filter((w) => w.box >= 5);
  else if (filter === "recent")   list = list.slice(0, 6);

  return (
    <div className="vk-col" style={{ gap: 14 }}>
      <div style={{ position: "relative" }}>
        <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-faint)" }} />
        <input className="vk-input" placeholder="Search your words…" value={q} onChange={(e) => setQ(e.target.value)}
          style={{ paddingLeft: 42, fontSize: 15 }} />
      </div>

      <div className="vk-wrap" style={{ gap: 8 }}>
        {STATUS_FILTERS.map((f) => (
          <span key={f.key} className={`vk-chip${filter === f.key ? " is-on" : ""}`} onClick={() => setFilter(f.key)}>{f.label}</span>
        ))}
      </div>

      {store.wordCategories.length > 0 && (
        <div className="vk-wrap" style={{ gap: 8 }}>
          <span className={`vk-chip${catFilter === null ? " is-on" : ""}`} onClick={() => setCatFilter(null)}>All categories</span>
          {store.wordCategories.map((cat) => (
            <span key={cat.id}
              className={`vk-chip${catFilter === cat.id ? " is-on" : ""}`}
              onClick={() => setCatFilter(catFilter === cat.id ? null : cat.id)}
              style={catFilter === cat.id ? { background: `oklch(0.85 0.10 ${cat.color})`, borderColor: `oklch(0.60 0.14 ${cat.color})`, color: `oklch(0.25 0.08 ${cat.color})` } : {}}
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}

      {list.length ? (
        <div className="vk-col" style={{ gap: 10 }}>
          {list.map((w, i) => <WordCard key={w.id} word={w} index={i} onClick={() => onViewWord(w)} />)}
        </div>
      ) : (
        <div className="vk-col" style={{ alignItems: "center", textAlign: "center", padding: "40px 30px", gap: 10 }}>
          <div className="vk-h2">No words found</div>
          <div className="vk-muted vk-sm">Try a different search or add a new word.</div>
          <button className="vk-btn vk-btn-soft vk-btn-sm" style={{ marginTop: 6 }} onClick={onAddWord}>
            <Plus size={16} /> Add a word
          </button>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WordsPage() {
  const store = useStore();
  const [tab, setTab] = useState<"words" | "families">("words");
  const [detail, setDetail] = useState<Word | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [dupWord, setDupWord] = useState<Word | null>(null);
  const [familyPrompt, setFamilyPrompt] = useState<{ base: Word; forms: FormSuggestion[] } | null>(null);

  return (
    <div className="vk-page">
      <div className="vk-col" style={{ gap: 16 }}>
        <div className="vk-between" style={{ alignItems: "flex-start" }}>
          <div className="vk-col" style={{ gap: 3 }}>
            <span className="vk-eyebrow">{store.stats.total} words · {store.wordFamilies.length} families</span>
            <h1 className="vk-display">Library</h1>
          </div>
          {tab === "words" && (
            <button className="vk-btn vk-btn-soft vk-btn-sm" onClick={() => setAddOpen(true)}>
              <Plus size={16} /> Add
            </button>
          )}
        </div>

        {/* Tab switcher */}
        <div className="vk-row" style={{ gap: 0, background: "var(--surface-2)", borderRadius: 999, padding: 4 }}>
          {(["words", "families"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, border: "none", cursor: "pointer", borderRadius: 999,
              padding: "9px 0", fontSize: 13, fontWeight: 700, fontFamily: "var(--ff)",
              letterSpacing: "-0.01em", transition: "all .15s ease",
              background: tab === t ? "var(--surface)" : "transparent",
              color: tab === t ? "var(--ink)" : "var(--ink-faint)",
              boxShadow: tab === t ? "var(--sh-1)" : "none",
            }}>
              {t === "words" ? "Words" : "Families"}
            </button>
          ))}
        </div>

        {tab === "words"
          ? <WordsTab onViewWord={setDetail} onAddWord={() => setAddOpen(true)} />
          : <FamiliesTab onViewWord={setDetail} />
        }
      </div>

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Add a word">
        <WordForm
          onCancel={() => setAddOpen(false)}
          onSave={async (d) => {
            try {
              const created = await store.addWord(d);
              setAddOpen(false);
              // Offer to wrap the new word + its related forms into a family.
              const forms = (await suggestForms(created.word)).filter((f) => f.word !== created.word);
              if (forms.length) setFamilyPrompt({ base: created, forms });
            } catch (err) {
              if (err instanceof DuplicateWordError) {
                setAddOpen(false);
                const existing = store.words.find((w) => w.id === String(err.existing.id));
                if (existing) setDupWord(existing);
              }
            }
          }}
        />
      </Sheet>

      {familyPrompt && (
        <FamilyFromWordSheet base={familyPrompt.base} forms={familyPrompt.forms} onClose={() => setFamilyPrompt(null)} />
      )}

      {dupWord && (
        <DuplicateWordModal word={dupWord} onClose={() => setDupWord(null)} onView={(w) => { setDupWord(null); setDetail(w); }} />
      )}

      {detail && (
        <WordDetail word={detail} onClose={() => setDetail(null)} onPractice={() => setDetail(null)} onViewWord={(w) => setDetail(w)} />
      )}
    </div>
  );
}
