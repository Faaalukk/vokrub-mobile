"use client";

import { useState } from "react";
import { Plus, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "../store/StoreContext";
import Avatar from "../components/Avatar";
import StreakCard from "../components/StreakCard";
import FlipCard from "../components/FlipCard";
import WordCard from "../components/WordCard";
import SectionHead from "../components/SectionHead";
import Sheet from "../components/Sheet";
import WordForm from "./WordForm";
import WordDetail from "./WordDetail";
import type { Word } from "../store/StoreContext";

export default function TodayPage() {
  const store = useStore();
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState<Word | null>(null);

  const today = store.words.filter((w) => w.added === store.TODAY);
  const recent = today.length ? today : store.words.slice(0, 3);

  return (
    <div style={{ padding: "60px 18px 24px" }}>
      <div className="vk-col" style={{ gap: 22 }}>
        {/* Header */}
        <div className="vk-between" style={{ alignItems: "flex-start" }}>
          <div className="vk-col" style={{ gap: 3 }}>
            <span className="vk-eyebrow">Monday · Jun 9</span>
            <h1 className="vk-display">Good morning, Sam.</h1>
          </div>
          <Avatar name="Sam Rivera" size={40} />
        </div>

        {/* Streak */}
        <StreakCard streak={store.STREAK} addedToday={store.stats.addedToday} goal={store.GOAL} />

        {/* Word of the day */}
        <div>
          <SectionHead title="Word of the day" />
          {store.wordOfDay && <FlipCard word={store.wordOfDay} height={234} />}
        </div>

        {/* Recent words */}
        <div>
          <SectionHead
            title={today.length ? "Added today" : "Recently learned"}
            action="See all"
            onAction={() => router.push("/words")}
          />
          <div className="vk-col" style={{ gap: 10 }}>
            {recent.map((w, i) => (
              <WordCard key={w.id} word={w} index={i} onClick={() => setDetail(w)} />
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button className="vk-btn vk-btn-primary vk-btn-lg" onClick={() => setAddOpen(true)}>
            <Plus size={18} /> Add a word
          </button>
          <button className="vk-btn vk-btn-ghost vk-btn-lg" onClick={() => router.push("/practice")}>
            <Layers size={18} /> Practice
          </button>
        </div>
      </div>

      {/* Add word sheet */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Add a word">
        <WordForm
          onCancel={() => setAddOpen(false)}
          onSave={(d) => { store.addWord(d); setAddOpen(false); }}
        />
      </Sheet>

      {/* Word detail sheet */}
      {detail && (
        <WordDetail
          word={detail}
          onClose={() => setDetail(null)}
          onPractice={() => { setDetail(null); router.push("/practice"); }}
        />
      )}
    </div>
  );
}
