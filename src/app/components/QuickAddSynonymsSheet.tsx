"use client";

import { useState } from "react";
import { Check, ChevronRight, SkipForward } from "lucide-react";
import Sheet from "./Sheet";
import { useStore } from "../store/StoreContext";
import { DuplicateWordError } from "../../lib/api";

const POS = ["noun", "verb", "adjective", "adverb", "phrase"];

type Item = {
  word: string;
  pos: string;
  meaning: string;
  status: "idle" | "saved" | "skipped" | "duplicate";
};

type Props = {
  synonyms: string[];
  originalWord: string;
  onClose: () => void;
};

export default function QuickAddSynonymsSheet({ synonyms, originalWord, onClose }: Props) {
  const store = useStore();
  const [items, setItems] = useState<Item[]>(synonyms.map((w) => ({ word: w, pos: "", meaning: "", status: "idle" })));
  const [saving, setSaving] = useState<string | null>(null);

  const allDone = items.every((i) => i.status !== "idle");

  function updateField(word: string, field: "pos" | "meaning", value: string) {
    setItems((prev) => prev.map((i) => i.word === word ? { ...i, [field]: value } : i));
  }

  function togglePos(word: string, p: string) {
    setItems((prev) => prev.map((i) => i.word === word ? { ...i, pos: i.pos === p ? "" : p } : i));
  }

  async function save(item: Item) {
    if (!item.meaning.trim() || saving) return;
    setSaving(item.word);
    try {
      await store.addWord({
        word: item.word,
        pos: item.pos,
        meaning: item.meaning.trim(),
        note: "",
        synonyms: [originalWord],
        category_id: null,
      });
      setItems((prev) => prev.map((i) => i.word === item.word ? { ...i, status: "saved" } : i));
    } catch (err) {
      if (err instanceof DuplicateWordError) {
        setItems((prev) => prev.map((i) => i.word === item.word ? { ...i, status: "duplicate" } : i));
      }
    } finally {
      setSaving(null);
    }
  }

  function skip(word: string) {
    setItems((prev) => prev.map((i) => i.word === word ? { ...i, status: "skipped" } : i));
  }

  return (
    <Sheet open onClose={onClose} title="Add synonyms to practice">
      <div className="vk-col" style={{ gap: 16, padding: "8px 20px 28px" }}>
        <p className="vk-body vk-muted">
          Similar to <strong style={{ color: "var(--ink)" }}>{originalWord}</strong>. Fill in meanings for words you want to practice.
        </p>

        <div className="vk-col" style={{ gap: 12 }}>
          {items.map((item) => (
            <div key={item.word} className="vk-card-flat" style={{ padding: "14px 14px" }}>
              <div className="vk-between" style={{ marginBottom: item.status === "idle" ? 10 : 0 }}>
                <span className="vk-h3" style={{ fontFamily: "var(--mono)", fontSize: 16 }}>{item.word}</span>
                {item.status === "saved" && (
                  <span className="vk-row" style={{ gap: 5, color: "var(--accent-ink)", fontWeight: 700, fontSize: 13 }}>
                    <Check size={15} /> Saved
                  </span>
                )}
                {item.status === "duplicate" && <span className="vk-faint vk-sm">Already in library</span>}
                {item.status === "skipped" && <span className="vk-faint vk-sm">Skipped</span>}
              </div>

              {item.status === "idle" && (
                <div className="vk-col" style={{ gap: 8 }}>
                  <div className="vk-col" style={{ gap: 5 }}>
                    <label className="vk-label">Part of speech <span className="vk-faint" style={{ fontWeight: 500 }}>· optional</span></label>
                    <div className="vk-wrap" style={{ gap: 6 }}>
                      {POS.map((p) => (
                        <span
                          key={p}
                          className={`vk-chip${item.pos === p ? " is-on" : ""}`}
                          onClick={() => togglePos(item.word, p)}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <textarea
                    className="vk-textarea"
                    rows={2}
                    placeholder="What does it mean?"
                    value={item.meaning}
                    onChange={(e) => updateField(item.word, "meaning", e.target.value)}
                  />
                  <div className="vk-row" style={{ gap: 8 }}>
                    <button
                      className="vk-btn vk-btn-ghost vk-btn-sm"
                      onClick={() => skip(item.word)}
                      style={{ color: "var(--ink-faint)" }}
                    >
                      <SkipForward size={14} /> Skip
                    </button>
                    <button
                      className="vk-btn vk-btn-primary vk-btn-sm"
                      style={{ flex: 1 }}
                      disabled={!item.meaning.trim() || saving === item.word}
                      onClick={() => save(item)}
                    >
                      <ChevronRight size={15} /> Save word
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {allDone && (
          <button className="vk-btn vk-btn-primary vk-btn-block vk-btn-lg" onClick={onClose}>
            <Check size={18} /> Done
          </button>
        )}
        {!allDone && (
          <button className="vk-btn vk-btn-ghost vk-btn-block" onClick={onClose}>
            Do this later
          </button>
        )}
      </div>
    </Sheet>
  );
}
