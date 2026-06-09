"use client";

import { useState, useEffect } from "react";
import type { Word } from "../store/StoreContext";
import BoxMeter from "./BoxMeter";

type FlipCardProps = { word: Word; height?: number };

export default function FlipCard({ word, height = 300 }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { setFlipped(false); }, [word.id]);

  const faceBase: React.CSSProperties = {
    display: "flex", flexDirection: "column",
    borderRadius: "var(--r-card)", padding: "26px 24px",
    border: "1px solid var(--line)",
  };

  return (
    <div className={`vk-flip${flipped ? " is-flipped" : ""}`} style={{ height }} onClick={() => setFlipped((f) => !f)}>
      <div className="vk-flip-inner" style={{ width: "100%", height: "100%", cursor: "pointer" }}>
        {/* Front */}
        <div className="vk-flip-face vk-card" style={{ ...faceBase, alignItems: "center", justifyContent: "center", textAlign: "center", boxShadow: "var(--sh-2)" }}>
          <span className="vk-eyebrow" style={{ position: "absolute", top: 20, left: 24 }}>Word</span>
          <BoxMeter box={word.box} />
          <div className="vk-display" style={{ fontSize: 38, marginTop: 16 }}>{word.word}</div>
          {word.pos && <div className="vk-faint vk-sm" style={{ fontStyle: "italic", marginTop: 8, fontWeight: 500 }}>{word.pos}</div>}
          <div className="vk-faint vk-xs" style={{ position: "absolute", bottom: 20, fontWeight: 600 }}>Tap to reveal meaning</div>
        </div>
        {/* Back */}
        <div className="vk-flip-face vk-flip-back" style={{ ...faceBase, background: "var(--accent)", color: "var(--on-accent)", boxShadow: "var(--sh-2)", justifyContent: "center", border: "none" }}>
          <span className="vk-eyebrow" style={{ position: "absolute", top: 20, left: 24, color: "color-mix(in oklch, white 70%, transparent)" }}>Meaning</span>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>{word.meaning}</div>
          {word.note && <div style={{ fontSize: 14, marginTop: 16, opacity: 0.85, lineHeight: 1.5, fontWeight: 500 }}>"{word.note}"</div>}
          <div style={{ position: "absolute", bottom: 20, fontSize: 11.5, fontWeight: 600, opacity: 0.7 }}>Tap to flip back</div>
        </div>
      </div>
    </div>
  );
}
