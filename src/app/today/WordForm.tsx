"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const POS = ["noun", "verb", "adjective", "adverb", "phrase"];

type WordFormData = { word: string; pos: string; meaning: string; note: string };
type WordFormProps = {
  initial?: WordFormData;
  onSave: (d: WordFormData) => void;
  onCancel?: () => void;
};

export default function WordForm({ initial, onSave, onCancel }: WordFormProps) {
  const [word, setWord] = useState(initial?.word ?? "");
  const [pos, setPos] = useState(initial?.pos ?? "");
  const [meaning, setMeaning] = useState(initial?.meaning ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const valid = word.trim() && meaning.trim();

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
      <div className="vk-row" style={{ gap: 10, marginTop: 2 }}>
        {onCancel && <button className="vk-btn vk-btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>}
        <button className="vk-btn vk-btn-primary" style={{ flex: 2 }} disabled={!valid}
          onClick={() => valid && onSave({ word, pos, meaning, note })}>
          <Check size={18} /> {initial ? "Save changes" : "Save word"}
        </button>
      </div>
    </div>
  );
}
