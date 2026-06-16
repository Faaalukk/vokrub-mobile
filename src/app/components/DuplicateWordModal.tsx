"use client";

import { BookOpen, X } from "lucide-react";
import Sheet from "./Sheet";
import type { Word } from "../store/StoreContext";

type Props = {
  word: Word;
  onView: (word: Word) => void;
  onClose: () => void;
};

export default function DuplicateWordModal({ word, onView, onClose }: Props) {
  return (
    <Sheet open onClose={onClose}>
      <div className="vk-col" style={{ padding: "20px 20px 28px", gap: 18 }}>
        <div className="vk-col" style={{ gap: 6 }}>
          <div className="vk-row" style={{ gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 20 }}>📖</span>
            <span className="vk-h2">Already in your library</span>
          </div>
          <p className="vk-body" style={{ color: "var(--ink-soft)" }}>
            You saved <strong>&ldquo;{word.word}&rdquo;</strong> before. Here&apos;s what you wrote:
          </p>
        </div>

        <div className="vk-card-flat" style={{ padding: "16px", background: "var(--surface-2)", borderRadius: "var(--r-card)" }}>
          <div className="vk-col" style={{ gap: 8 }}>
            <div className="vk-row" style={{ gap: 8, alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>{word.word}</span>
              {word.pos && <span className="vk-chip" style={{ fontSize: 11 }}>{word.pos}</span>}
            </div>
            <p className="vk-body" style={{ color: "var(--ink-soft)", margin: 0 }}>{word.meaning}</p>
            {word.note && (
              <p className="vk-sm" style={{ color: "var(--ink-faint)", margin: 0, fontStyle: "italic" }}>{word.note}</p>
            )}
          </div>
        </div>

        <div className="vk-row" style={{ gap: 10 }}>
          <button className="vk-btn vk-btn-ghost" style={{ flex: 1 }} onClick={onClose}>
            <X size={17} /> Dismiss
          </button>
          <button className="vk-btn vk-btn-primary" style={{ flex: 2 }} onClick={() => { onClose(); onView(word); }}>
            <BookOpen size={17} /> View word
          </button>
        </div>
      </div>
    </Sheet>
  );
}
