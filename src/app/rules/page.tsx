"use client";

import { useState } from "react";
import { ScrollText, ArrowRight, X, Check, ChevronRight, Target, ListChecks, Shuffle } from "lucide-react";
import Sheet from "../components/Sheet";
import { GRAMMAR_RULES, type GrammarRule, type GrammarQuiz } from "../../lib/grammarRules";

type TestMode = "blank" | "judge" | "both";
type TestConfig = { ruleIds: string[]; mode: TestMode; title: string };

const MODE_OPTIONS: { key: TestMode; icon: typeof Target; label: string; desc: string }[] = [
  { key: "blank", icon: Target,     label: "Fill the blank", desc: "Pick the correct word for the gap" },
  { key: "judge", icon: ListChecks, label: "Spot the error", desc: "Decide if the sentence is correct" },
  { key: "both",  icon: Shuffle,    label: "Mixed",          desc: "Both types, shuffled together" },
];

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }

function buildDeck(config: TestConfig): GrammarQuiz[] {
  const rules = GRAMMAR_RULES.filter((r) => config.ruleIds.includes(r.id));
  let items = rules.flatMap((r) => r.quiz);
  if (config.mode === "blank") items = items.filter((q) => q.type === "blank");
  else if (config.mode === "judge") items = items.filter((q) => q.type === "judge");
  return shuffle(items).slice(0, 12);
}

// ── Mode picker ───────────────────────────────────────────────────────────────

function ModePickerSheet({ title, onStart, onClose }: { title: string; onStart: (mode: TestMode) => void; onClose: () => void }) {
  return (
    <Sheet open onClose={onClose} title={`Test — ${title}`}>
      <div className="vk-col" style={{ gap: 10, padding: "8px 20px 28px" }}>
        {MODE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <button key={opt.key} onClick={() => onStart(opt.key)} className="vk-card-flat"
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 14px", cursor: "pointer", border: "1px solid var(--line)", borderRadius: "var(--r-md)", textAlign: "left" }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent-tint)", color: "var(--accent-ink)", flexShrink: 0 }}>
                <Icon size={18} />
              </span>
              <span className="vk-col" style={{ gap: 2 }}>
                <span className="vk-h3" style={{ fontSize: 15 }}>{opt.label}</span>
                <span className="vk-faint vk-xs" style={{ fontWeight: 500 }}>{opt.desc}</span>
              </span>
              <ArrowRight size={16} style={{ marginLeft: "auto", color: "var(--ink-faint)" }} />
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

// ── Rule detail ───────────────────────────────────────────────────────────────

function RuleDetailSheet({ rule, onClose, onTest }: { rule: GrammarRule; onClose: () => void; onTest: () => void }) {
  return (
    <Sheet open onClose={onClose} title={rule.title}>
      <div className="vk-col" style={{ gap: 16, padding: "8px 20px 28px" }}>
        <div className="vk-card" style={{ padding: "16px 18px", background: "var(--accent)", color: "var(--on-accent)", border: "none" }}>
          <div className="vk-eyebrow" style={{ color: "color-mix(in oklch, white 65%, transparent)", marginBottom: 6 }}>Pattern</div>
          <div style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>{rule.pattern}</div>
        </div>
        <p className="vk-body">{rule.summary}</p>
        <div className="vk-col" style={{ gap: 7 }}>
          <span className="vk-label">Examples</span>
          <div className="vk-col" style={{ gap: 6 }}>
            {rule.examples.map((ex) => (
              <div key={ex} className="vk-row vk-card-flat" style={{ gap: 8, padding: "10px 14px" }}>
                <Check size={14} style={{ color: "var(--accent-ink)", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--mono)", fontWeight: 600, fontSize: 14 }}>{ex}</span>
              </div>
            ))}
          </div>
        </div>
        <button className="vk-btn vk-btn-primary vk-btn-block vk-btn-lg" onClick={onTest}>
          Test this rule <ArrowRight size={17} />
        </button>
      </div>
    </Sheet>
  );
}

// ── Test steps ────────────────────────────────────────────────────────────────

const okStyle: React.CSSProperties = { background: "oklch(0.88 0.09 145)", borderColor: "oklch(0.60 0.14 145)", color: "oklch(0.28 0.10 145)" };
const badStyle: React.CSSProperties = { background: "oklch(0.90 0.06 28)", borderColor: "oklch(0.58 0.14 28)", color: "oklch(0.35 0.12 28)" };

function BlankStep({ item, onAnswer }: { item: Extract<GrammarQuiz, { type: "blank" }>; onAnswer: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<number | null>(null);

  function style(i: number): React.CSSProperties {
    if (selected === null) return {};
    if (i === item.answer) return okStyle;
    if (i === selected) return badStyle;
    return { opacity: 0.45 };
  }

  return (
    <div className="vk-col" style={{ gap: 14 }}>
      <div className="vk-card" style={{ padding: "24px 20px", background: "var(--surface-2)", border: "1px solid var(--line)" }}>
        <div className="vk-eyebrow vk-faint" style={{ marginBottom: 10 }}>Fill the blank</div>
        <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.4, letterSpacing: "-0.02em" }}>{item.prompt}</div>
      </div>
      <div className="vk-col" style={{ gap: 8 }}>
        {item.options.map((opt, i) => (
          <button key={opt + i} onClick={() => selected === null && setSelected(i)} className="vk-card vk-pressable"
            style={{ textAlign: "left", padding: "14px 16px", border: "1px solid var(--line)", cursor: selected === null ? "pointer" : "default",
              transition: "background .2s, border-color .2s, opacity .2s", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, ...style(i) }}>
            <span className="vk-h3" style={{ fontSize: 15, fontFamily: "var(--mono)" }}>{opt}</span>
            {selected !== null && i === item.answer && <Check size={17} />}
          </button>
        ))}
      </div>
      {selected !== null && (
        <FeedbackBar correct={selected === item.answer} explain={item.explain} onNext={() => onAnswer(selected === item.answer)} />
      )}
    </div>
  );
}

function JudgeStep({ item, onAnswer }: { item: Extract<GrammarQuiz, { type: "judge" }>; onAnswer: (correct: boolean) => void }) {
  const [choice, setChoice] = useState<boolean | null>(null);
  const gotIt = choice !== null && choice === item.correct;

  // Green for the true answer, red for a wrong pick, neutral otherwise.
  function btnStyle(val: boolean): React.CSSProperties {
    if (choice === null) return {};
    if (val === item.correct) return okStyle;
    if (val === choice) return badStyle;
    return {};
  }

  return (
    <div className="vk-col" style={{ gap: 14 }}>
      <div className="vk-card" style={{ padding: "24px 20px", background: "var(--surface-2)", border: "1px solid var(--line)" }}>
        <div className="vk-eyebrow vk-faint" style={{ marginBottom: 10 }}>Is this sentence correct?</div>
        <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.4, letterSpacing: "-0.02em" }}>“{item.sentence}”</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button className="vk-btn vk-btn-line vk-btn-lg" disabled={choice !== null} onClick={() => setChoice(false)} style={btnStyle(false)}>Incorrect</button>
        <button className="vk-btn vk-btn-line vk-btn-lg" disabled={choice !== null} onClick={() => setChoice(true)} style={btnStyle(true)}>Correct</button>
      </div>
      {choice !== null && (
        <FeedbackBar correct={gotIt} explain={item.explain} onNext={() => onAnswer(gotIt)} />
      )}
    </div>
  );
}

function FeedbackBar({ correct, explain, onNext }: { correct: boolean; explain: string; onNext: () => void }) {
  return (
    <div className="vk-col" style={{ gap: 10 }}>
      <div className="vk-card" style={{ padding: "14px 16px", border: "1px solid", ...(correct ? okStyle : badStyle) }}>
        <div className="vk-row" style={{ gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
          {correct ? <><Check size={17} /> Correct!</> : <><X size={17} /> Not quite</>}
        </div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{explain}</div>
      </div>
      <button className="vk-btn vk-btn-primary vk-btn-block vk-btn-lg" onClick={onNext}>
        Next <ChevronRight size={17} />
      </button>
    </div>
  );
}

// ── Session ───────────────────────────────────────────────────────────────────

function TestSession({ config, onExit }: { config: TestConfig; onExit: () => void }) {
  const [deck] = useState(() => buildDeck(config));
  const [i, setI] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);

  function answer(correct: boolean) {
    setResults((prev) => [...prev, correct]);
    if (i + 1 >= deck.length) setDone(true);
    else setI(i + 1);
  }

  const header = (mid: React.ReactNode, right: React.ReactNode) => (
    <div className="vk-between">
      <button onClick={onExit} className="vk-row" style={{ border: "none", background: "var(--surface-2)", borderRadius: 999, width: 36, height: 36, justifyContent: "center", cursor: "pointer", color: "var(--ink-soft)" }}>
        <X size={18} />
      </button>
      <span className="vk-h3">{mid}</span>
      {right}
    </div>
  );

  if (!deck.length) {
    return (
      <div className="vk-col" style={{ gap: 16 }}>
        {header(config.title, <span />)}
        <div className="vk-col" style={{ alignItems: "center", gap: 8, padding: "40px 0", textAlign: "center" }}>
          <div className="vk-h2">No questions</div>
          <div className="vk-muted vk-sm">This rule has no items for that mode.</div>
        </div>
        <button className="vk-btn vk-btn-ghost vk-btn-block" onClick={onExit}>Back</button>
      </div>
    );
  }

  if (done) {
    const right = results.filter(Boolean).length;
    const pct = Math.round((right / results.length) * 100);
    return (
      <div className="vk-col" style={{ gap: 16 }}>
        {header("Test complete", <span />)}
        <div className="vk-col vk-pop" style={{ alignItems: "center", gap: 6, padding: "8px 0 18px", textAlign: "center" }}>
          <div className="vk-display" style={{ fontSize: 44 }}>{pct}%</div>
          <div className="vk-muted vk-sm">{right} of {results.length} correct</div>
        </div>
        <button className="vk-btn vk-btn-primary vk-btn-block vk-btn-lg" onClick={onExit}>Done</button>
      </div>
    );
  }

  const item = deck[i];
  return (
    <div className="vk-col" style={{ gap: 16 }}>
      {header(config.title, <span className="vk-faint vk-sm">{i + 1} / {deck.length}</span>)}
      <div className="vk-bar"><span style={{ width: `${(i / deck.length) * 100}%` }} /></div>
      {item.type === "blank"
        ? <BlankStep key={i} item={item} onAnswer={answer} />
        : <JudgeStep key={i} item={item} onAnswer={answer} />}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RulesPage() {
  const [detail, setDetail] = useState<GrammarRule | null>(null);
  const [picker, setPicker] = useState<TestConfig | null>(null); // ruleIds + title; mode chosen in sheet
  const [session, setSession] = useState<TestConfig | null>(null);

  if (session) return (
    <div className="vk-page">
      <TestSession config={session} onExit={() => setSession(null)} />
    </div>
  );

  return (
    <div className="vk-page">
      <div className="vk-col" style={{ gap: 18 }}>
        <div className="vk-col" style={{ gap: 3 }}>
          <span className="vk-eyebrow">Grammar</span>
          <h1 className="vk-display">Rules &amp; tests</h1>
        </div>

        {/* Test-all banner */}
        <div className="vk-card vk-rise" style={{ padding: 20, background: "var(--accent)", color: "var(--on-accent)", border: "none", boxShadow: "var(--sh-2)",
          display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 12 }}>
          <div className="vk-col" style={{ gap: 4 }}>
            <span className="vk-eyebrow" style={{ color: "color-mix(in oklch, white 70%, transparent)" }}>Quiz yourself</span>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>{GRAMMAR_RULES.length} rules</div>
            <span style={{ fontSize: 13, opacity: 0.85, fontWeight: 500 }}>mixed questions from every rule</span>
          </div>
          <button className="vk-btn" onClick={() => setPicker({ ruleIds: GRAMMAR_RULES.map((r) => r.id), mode: "both", title: "All rules" })}
            style={{ background: "var(--surface)", color: "var(--accent-ink)" }}>
            Test all <ArrowRight size={17} />
          </button>
        </div>

        {/* Rule list */}
        <div className="vk-col" style={{ gap: 12 }}>
          {GRAMMAR_RULES.map((rule, idx) => (
            <button key={rule.id} onClick={() => setDetail(rule)} className="vk-card vk-pressable vk-rise"
              style={{ textAlign: "left", padding: "16px 18px", border: "1px solid var(--line)", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8, animationDelay: `${idx * 30}ms` }}>
              <div className="vk-row" style={{ gap: 8 }}>
                <ScrollText size={15} style={{ color: "var(--accent-ink)" }} />
                <span className="vk-h3">{rule.title}</span>
              </div>
              <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 13, color: "var(--accent-ink)" }}>{rule.pattern}</span>
              <span className="vk-faint vk-sm" style={{ fontWeight: 500, lineHeight: 1.4 }}>{rule.summary}</span>
            </button>
          ))}
        </div>
      </div>

      {detail && (
        <RuleDetailSheet rule={detail} onClose={() => setDetail(null)}
          onTest={() => { setPicker({ ruleIds: [detail.id], mode: "both", title: detail.title }); setDetail(null); }} />
      )}

      {picker && (
        <ModePickerSheet title={picker.title} onClose={() => setPicker(null)}
          onStart={(mode) => { setSession({ ...picker, mode }); setPicker(null); }} />
      )}
    </div>
  );
}
