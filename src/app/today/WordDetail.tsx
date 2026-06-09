"use client";

import { useState } from "react";
import { Layers, Pencil, Trash2, Calendar } from "lucide-react";
import { useStore } from "../store/StoreContext";
import type { Word } from "../store/StoreContext";
import Sheet from "../components/Sheet";
import FlipCard from "../components/FlipCard";
import BoxMeter from "../components/BoxMeter";
import WordForm from "./WordForm";

type WordDetailProps = { word: Word; onClose: () => void; onPractice: () => void };

export default function WordDetail({ word, onClose, onPractice }: WordDetailProps) {
  const store = useStore();
  const [editing, setEditing] = useState(false);
  const live = store.words.find((w) => w.id === word.id) || word;

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
