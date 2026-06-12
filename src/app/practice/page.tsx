"use client";

import { useState } from "react";
import { Layers, Target, Type, Clock, Sparkles, X, ArrowRight, Check, ChevronRight } from "lucide-react";
import { useStore } from "../store/StoreContext";
import FlipCard from "../components/FlipCard";
import type { Word } from "../store/StoreContext";

const MODES = [
  { key: "flash",  icon: Layers,    title: "Flashcards",      desc: "Flip to reveal the meaning" },
  { key: "mc",     icon: Target,    title: "Multiple choice", desc: "Pick the right meaning" },
  { key: "type",   icon: Type,      title: "Type it",         desc: "See meaning, spell the word" },
  { key: "due",    icon: Clock,     title: "Review due",      desc: "Spaced repetition for due words" },
  { key: "daily",  icon: Sparkles,  title: "Word of the day", desc: "One fresh word, every day" },
];

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }

// ── Flash ─────────────────────────────────────────────────────────────────────

function FlashStep({ card, onAnswer }: { card: Word; onAnswer: (correct: boolean) => void }) {
  return (
    <div className="vk-col" style={{ gap: 16 }}>
      <FlipCard word={card} height={296} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button className="vk-btn vk-btn-line vk-btn-lg" onClick={() => onAnswer(false)} style={{ color: "oklch(0.5 0.12 28)" }}>Review again</button>
        <button className="vk-btn vk-btn-primary vk-btn-lg" onClick={() => onAnswer(true)}>I knew it</button>
      </div>
      <p className="vk-faint vk-xs" style={{ textAlign: "center", fontWeight: 500 }}>Be honest — it tunes your spaced repetition.</p>
    </div>
  );
}

// ── Multiple choice ───────────────────────────────────────────────────────────

function MCStep({ card, pool, onAnswer }: { card: Word; pool: Word[]; onAnswer: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  const [options] = useState<Word[]>(() =>
    shuffle([card, ...shuffle(pool.filter((w) => w.id !== card.id)).slice(0, 3)])
  );

  function pick(w: Word) {
    if (selected) return;
    setSelected(w.id);
    setTimeout(() => onAnswer(w.id === card.id), 900);
  }

  function optionStyle(w: Word): React.CSSProperties {
    if (!selected) return {};
    if (w.id === card.id) return { background: "oklch(0.88 0.09 145)", borderColor: "oklch(0.60 0.14 145)", color: "oklch(0.28 0.10 145)" };
    if (w.id === selected) return { background: "oklch(0.90 0.06 28)", borderColor: "oklch(0.58 0.14 28)", color: "oklch(0.35 0.12 28)" };
    return { opacity: 0.45 };
  }

  return (
    <div className="vk-col" style={{ gap: 14 }}>
      <div className="vk-card" style={{ padding: "24px 20px", background: "var(--accent)", color: "var(--on-accent)", border: "none", boxShadow: "var(--sh-2)" }}>
        <div className="vk-eyebrow" style={{ color: "color-mix(in oklch, white 65%, transparent)", marginBottom: 10 }}>What word means…</div>
        <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.35, letterSpacing: "-0.02em" }}>{card.meaning}</div>
        {card.note && <div style={{ marginTop: 10, fontSize: 13, opacity: 0.8, fontStyle: "italic" }}>&ldquo;{card.note}&rdquo;</div>}
      </div>
      <div className="vk-col" style={{ gap: 8 }}>
        {options.map((w) => (
          <button
            key={w.id}
            onClick={() => pick(w)}
            className="vk-card vk-pressable"
            style={{
              textAlign: "left", padding: "14px 16px", border: "1px solid var(--line)",
              cursor: selected ? "default" : "pointer", transition: "background 0.2s, border-color 0.2s, opacity 0.2s",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
              ...optionStyle(w),
            }}
          >
            <span className="vk-h3" style={{ fontSize: 15 }}>{w.word}</span>
            {selected && w.id === card.id && <Check size={17} />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Type it ───────────────────────────────────────────────────────────────────

function TypeStep({ card, onAnswer }: { card: Word; onAnswer: (correct: boolean) => void }) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const correct = value.trim().toLowerCase() === card.word.trim().toLowerCase();

  function submit() {
    if (!value.trim() || submitted) return;
    setSubmitted(true);
  }

  return (
    <div className="vk-col" style={{ gap: 14 }}>
      <div className="vk-card" style={{ padding: "24px 20px", background: "var(--accent)", color: "var(--on-accent)", border: "none", boxShadow: "var(--sh-2)" }}>
        <div className="vk-eyebrow" style={{ color: "color-mix(in oklch, white 65%, transparent)", marginBottom: 10 }}>Spell the word for…</div>
        <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.35, letterSpacing: "-0.02em" }}>{card.meaning}</div>
        {card.pos && <div style={{ marginTop: 8, fontSize: 13, opacity: 0.75, fontStyle: "italic" }}>{card.pos}</div>}
      </div>

      {!submitted ? (
        <div className="vk-col" style={{ gap: 10 }}>
          <input
            autoFocus
            className="vk-input"
            placeholder="Type the word…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            style={{ fontSize: 18, letterSpacing: "-0.01em", fontWeight: 600 }}
          />
          <button className="vk-btn vk-btn-primary vk-btn-block vk-btn-lg" onClick={submit} disabled={!value.trim()}>
            Check
          </button>
        </div>
      ) : (
        <div className="vk-col" style={{ gap: 10 }}>
          <div className="vk-card" style={{
            padding: "16px 18px", border: "1px solid",
            borderColor: correct ? "oklch(0.60 0.14 145)" : "oklch(0.58 0.14 28)",
            background: correct ? "oklch(0.88 0.09 145)" : "oklch(0.90 0.06 28)",
            color: correct ? "oklch(0.28 0.10 145)" : "oklch(0.35 0.12 28)",
          }}>
            <div className="vk-row" style={{ gap: 8, marginBottom: correct ? 0 : 6, fontWeight: 700, fontSize: 15 }}>
              {correct ? <><Check size={17} /> Correct!</> : <><X size={17} /> Not quite</>}
            </div>
            {!correct && (
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 4 }}>
                Answer: <strong style={{ fontWeight: 800 }}>{card.word}</strong>
              </div>
            )}
          </div>
          <button className="vk-btn vk-btn-primary vk-btn-block vk-btn-lg" onClick={() => onAnswer(correct)}>
            Next <ChevronRight size={17} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Session ───────────────────────────────────────────────────────────────────

function PracticeSession({ mode, onExit }: { mode: string; onExit: () => void }) {
  const store = useStore();
  const [deck] = useState(() => {
    if (mode === "daily") return store.wordOfDay ? [store.wordOfDay] : [];
    const pool = mode === "due" ? store.words.filter((w) => w.due) : store.words;
    return shuffle(pool.length ? pool : store.words).slice(0, Math.min(10, pool.length || store.words.length));
  });
  const [i, setI] = useState(0);
  const [results, setResults] = useState<{ word: string; correct: boolean }[]>([]);
  const [done, setDone] = useState(false);

  const label = MODES.find((m) => m.key === mode)?.title ?? "Practice";
  const card = deck[i];

  function answer(correct: boolean) {
    if (card) store.markReview(card.id, correct);
    const next = [...results, { word: card?.word ?? "", correct }];
    setResults(next);
    if (i + 1 >= deck.length) setDone(true);
    else setI(i + 1);
  }

  if (!deck.length) {
    return (
      <div className="vk-col" style={{ gap: 16 }}>
        <div className="vk-between">
          <button onClick={onExit} className="vk-row" style={{ border: "none", background: "var(--surface-2)", borderRadius: 999, width: 36, height: 36, justifyContent: "center", cursor: "pointer", color: "var(--ink-soft)" }}>
            <X size={18} />
          </button>
          <span className="vk-h3">{label}</span>
          <span />
        </div>
        <div className="vk-col" style={{ alignItems: "center", gap: 8, padding: "40px 0", textAlign: "center" }}>
          <Check size={30} style={{ color: "var(--accent-ink)" }} />
          <div className="vk-h2">All caught up</div>
          <div className="vk-muted vk-sm">Nothing due right now — add more words to keep going.</div>
        </div>
      </div>
    );
  }

  if (done) {
    const right = results.filter((r) => r.correct).length;
    const pct = Math.round((right / results.length) * 100);
    return (
      <div className="vk-col" style={{ gap: 16 }}>
        <div className="vk-between">
          <button onClick={onExit} className="vk-row" style={{ border: "none", background: "var(--surface-2)", borderRadius: 999, width: 36, height: 36, justifyContent: "center", cursor: "pointer", color: "var(--ink-soft)" }}>
            <X size={18} />
          </button>
          <span className="vk-h3">Session complete</span>
          <span />
        </div>
        <div className="vk-col vk-pop" style={{ alignItems: "center", gap: 6, padding: "8px 0 18px", textAlign: "center" }}>
          <div className="vk-display" style={{ fontSize: 44 }}>{pct}%</div>
          <div className="vk-muted vk-sm">{right} of {results.length} correct</div>
        </div>
        <div className="vk-col" style={{ gap: 8 }}>
          {results.map((r, k) => (
            <div key={k} className="vk-between vk-card-flat" style={{ padding: "11px 14px" }}>
              <span className="vk-h3" style={{ fontSize: 15 }}>{r.word}</span>
              <span className="vk-row" style={{ gap: 6, color: r.correct ? "var(--accent-ink)" : "oklch(0.55 0.13 28)", fontWeight: 700, fontSize: 13 }}>
                {r.correct ? <><Check size={16} /> Got it</> : <><X size={16} /> Review</>}
              </span>
            </div>
          ))}
        </div>
        <button className="vk-btn vk-btn-primary vk-btn-block vk-btn-lg" style={{ marginTop: 18 }} onClick={onExit}>Done</button>
      </div>
    );
  }

  const effectiveMode = (mode === "mc" && store.words.length < 2) ? "flash" : mode;

  return (
    <div className="vk-col" style={{ gap: 16 }}>
      <div className="vk-between">
        <button onClick={onExit} className="vk-row" style={{ border: "none", background: "var(--surface-2)", borderRadius: 999, width: 36, height: 36, justifyContent: "center", cursor: "pointer", color: "var(--ink-soft)" }}>
          <X size={18} />
        </button>
        <span className="vk-h3">{label}</span>
        <span className="vk-faint vk-sm">{i + 1} / {deck.length}</span>
      </div>
      <div className="vk-bar"><span style={{ width: `${(i / deck.length) * 100}%` }} /></div>
      {card && effectiveMode === "mc" && <MCStep key={card.id} card={card} pool={store.words} onAnswer={answer} />}
      {card && effectiveMode === "type" && <TypeStep key={card.id} card={card} onAnswer={answer} />}
      {card && (effectiveMode === "flash" || effectiveMode === "due" || effectiveMode === "daily") && <FlashStep card={card} onAnswer={answer} />}
    </div>
  );
}

// ── Hub ───────────────────────────────────────────────────────────────────────

export default function PracticePage() {
  const store = useStore();
  const [mode, setMode] = useState<string | null>(null);

  if (mode) return (
    <div style={{ padding: "60px 18px 24px" }}>
      <PracticeSession mode={mode} onExit={() => setMode(null)} />
    </div>
  );

  return (
    <div style={{ padding: "60px 18px 24px" }}>
      <div className="vk-col" style={{ gap: 18 }}>
        <div className="vk-col" style={{ gap: 3 }}>
          <span className="vk-eyebrow">Practice</span>
          <h1 className="vk-display">Test yourself</h1>
        </div>

        {/* Due banner */}
        <div className="vk-card vk-rise" style={{
          padding: 20, background: "var(--accent)", color: "var(--on-accent)",
          border: "none", boxShadow: "var(--sh-2)",
          display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 12,
        }}>
          <div className="vk-col" style={{ gap: 4 }}>
            <span className="vk-eyebrow" style={{ color: "color-mix(in oklch, white 70%, transparent)" }}>Ready to review</span>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>{store.stats.due} words</div>
            <span style={{ fontSize: 13, opacity: 0.85, fontWeight: 500 }}>due for practice today</span>
          </div>
          <button className="vk-btn" onClick={() => setMode("due")} disabled={!store.stats.due}
            style={{ background: "var(--surface)", color: "var(--accent-ink)", opacity: store.stats.due ? 1 : 0.6 }}>
            Start <ArrowRight size={17} />
          </button>
        </div>

        {/* Mode grid */}
        <div>
          <div className="vk-eyebrow" style={{ marginBottom: 12 }}>Choose a mode</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {MODES.map((m, idx) => {
              const Icon = m.icon;
              return (
                <button key={m.key} onClick={() => setMode(m.key)} className="vk-card vk-pressable vk-rise"
                  style={{ textAlign: "left", padding: 16, border: "1px solid var(--line)", cursor: "pointer",
                    display: "flex", flexDirection: "column", gap: 10, animationDelay: `${idx * 35}ms`,
                    gridColumn: m.key === "daily" ? "1 / -1" : "auto" }}>
                  <div className="vk-row" style={{ width: 40, height: 40, borderRadius: 12, justifyContent: "center", background: "var(--accent-tint)", color: "var(--accent-ink)" }}>
                    <Icon size={21} />
                  </div>
                  <div className="vk-col" style={{ gap: 2 }}>
                    <span className="vk-h3">{m.title}</span>
                    <span className="vk-faint vk-xs" style={{ fontWeight: 500 }}>{m.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
