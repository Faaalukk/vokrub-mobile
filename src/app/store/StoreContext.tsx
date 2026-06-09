"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from "react";

export type Word = {
  id: string;
  word: string;
  pos: string;
  meaning: string;
  note: string;
  added: string;
  box: number;
  seen: number;
  due: boolean;
};

export type Sentence = { id: string; text: string; meaning: string; note: string };
export type Category = { id: string; name: string; icon: string; hue: number; sentences: Sentence[] };

const TODAY = "2026-06-09";
const days = (n: number) => {
  const d = new Date("2026-06-09");
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const INITIAL_WORDS: Word[] = [
  { id: "w1", word: "Ephemeral", pos: "adjective", meaning: "Lasting for a very short time; fleeting.", note: 'Heard in a podcast about morning fog — "ephemeral light".', added: days(0), box: 1, seen: 2, due: true },
  { id: "w2", word: "Serendipity", pos: "noun", meaning: "A happy accident; finding something good without looking for it.", note: "Met my old roommate at a random café. Pure serendipity.", added: days(0), box: 1, seen: 1, due: true },
  { id: "w3", word: "Petrichor", pos: "noun", meaning: "The earthy smell after rain falls on dry ground.", note: "That smell after the first summer rain.", added: days(1), box: 2, seen: 4, due: true },
  { id: "w4", word: "Lucid", pos: "adjective", meaning: "Clear and easy to understand; thinking clearly.", note: "Used to describe a really clear explanation.", added: days(1), box: 3, seen: 6, due: false },
  { id: "w5", word: "Resilience", pos: "noun", meaning: "The ability to recover quickly from difficulties.", note: "", added: days(2), box: 2, seen: 3, due: true },
  { id: "w6", word: "Quaint", pos: "adjective", meaning: "Attractively unusual or old-fashioned.", note: "A quaint little bookshop on the corner.", added: days(3), box: 4, seen: 8, due: false },
  { id: "w7", word: "Nuance", pos: "noun", meaning: "A subtle difference in meaning, feeling, or tone.", note: "", added: days(4), box: 3, seen: 5, due: true },
  { id: "w8", word: "Wanderlust", pos: "noun", meaning: "A strong desire to travel and explore the world.", note: "Saved while planning the autumn trip.", added: days(5), box: 1, seen: 2, due: true },
  { id: "w9", word: "Eloquent", pos: "adjective", meaning: "Fluent and persuasive in speaking or writing.", note: "", added: days(6), box: 5, seen: 11, due: false },
  { id: "w10", word: "Solace", pos: "noun", meaning: "Comfort or consolation in a time of distress.", note: "Found solace in a long walk.", added: days(8), box: 4, seen: 9, due: false },
  { id: "w11", word: "Vivid", pos: "adjective", meaning: "Producing strong, clear images in the mind.", note: "", added: days(10), box: 5, seen: 12, due: false },
  { id: "w12", word: "Candor", pos: "noun", meaning: "The quality of being open and honest.", note: "Appreciated her candor in the review.", added: days(12), box: 4, seen: 7, due: false },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: "cat1", name: "Say Hello", icon: "wave", hue: 150, sentences: [
    { id: "s1", text: "How's it going?", meaning: "A casual, friendly way to ask how someone is.", note: 'Reply: "Pretty good, you?"' },
    { id: "s2", text: "Long time no see!", meaning: "You say this when you meet someone you haven't seen in a while.", note: "" },
    { id: "s3", text: "What have you been up to?", meaning: "Asking what someone has been doing recently.", note: "" },
  ]},
  { id: "cat2", name: "At a Café", icon: "coffee", hue: 62, sentences: [
    { id: "s4", text: "Could I get a flat white, please?", meaning: "A polite way to order a coffee.", note: "" },
    { id: "s5", text: "Is this seat taken?", meaning: "Asking if you can sit somewhere.", note: "" },
  ]},
  { id: "cat3", name: "Small Talk", icon: "chat", hue: 250, sentences: [
    { id: "s6", text: "Any plans for the weekend?", meaning: "A light question to start a friendly conversation.", note: "" },
    { id: "s7", text: "Crazy weather we're having, right?", meaning: "A classic, easy conversation starter.", note: "" },
  ]},
];

export const SUGGESTED_CATS = [
  { name: "Ordering Food", icon: "utensils", hue: 28, samples: [
    { text: "Could we see the menu, please?", meaning: "Politely asking for the menu." },
    { text: "I'll have the same, please.", meaning: "Ordering the same thing as someone else." },
    { text: "Could I get the bill, please?", meaning: "Asking to pay at the end of a meal." },
  ]},
  { name: "Asking Directions", icon: "compass", hue: 200, samples: [
    { text: "How do I get to the station?", meaning: "Asking the way to a place." },
    { text: "Is it far from here?", meaning: "Asking about distance." },
  ]},
  { name: "Polite Requests", icon: "hand", hue: 300, samples: [
    { text: "Would you mind helping me?", meaning: "A very polite way to ask for help." },
    { text: "Could you possibly…?", meaning: "Softening a request to sound more polite." },
  ]},
  { name: "Making Plans", icon: "calendar", hue: 130, samples: [
    { text: "Are you free on Friday?", meaning: "Asking about availability." },
    { text: "Let's grab a coffee sometime.", meaning: "A casual invitation." },
  ]},
];

type StoreValue = {
  words: Word[];
  categories: Category[];
  TODAY: string;
  STREAK: number;
  GOAL: number;
  wordOfDay: Word;
  stats: { total: number; mastered: number; due: number; addedToday: number };
  phraseStats: { collections: number; sentences: number };
  suggestions: typeof SUGGESTED_CATS;
  plan: "free" | "pro";
  setPlan: (p: "free" | "pro") => void;
  addWord: (data: { word: string; pos: string; meaning: string; note: string }) => Word;
  updateWord: (id: string, data: Partial<Word>) => void;
  deleteWord: (id: string) => void;
  markReview: (id: string, correct: boolean) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [words, setWords] = useState<Word[]>(INITIAL_WORDS);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [plan, setPlan] = useState<"free" | "pro">("pro");

  const stats = useMemo(() => ({
    total: words.length,
    mastered: words.filter((w) => w.box >= 5).length,
    due: words.filter((w) => w.due).length,
    addedToday: words.filter((w) => w.added === TODAY).length,
  }), [words]);

  const phraseStats = useMemo(() => ({
    collections: categories.length,
    sentences: categories.reduce((s, c) => s + c.sentences.length, 0),
  }), [categories]);

  const wordOfDay = words[0];

  const addWord = useCallback((data: { word: string; pos: string; meaning: string; note: string }) => {
    const w: Word = { id: `w${Date.now()}`, ...data, added: TODAY, box: 1, seen: 0, due: true };
    setWords((prev) => [w, ...prev]);
    return w;
  }, []);

  const updateWord = useCallback((id: string, data: Partial<Word>) => {
    setWords((prev) => prev.map((w) => (w.id === id ? { ...w, ...data } : w)));
  }, []);

  const deleteWord = useCallback((id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const markReview = useCallback((id: string, correct: boolean) => {
    setWords((prev) => prev.map((w) => {
      if (w.id !== id) return w;
      const box = correct ? Math.min(5, w.box + 1) : Math.max(1, w.box - 1);
      return { ...w, box, seen: w.seen + 1, due: box <= 2 };
    }));
  }, []);

  return (
    <StoreContext.Provider value={{
      words, categories, TODAY, STREAK: 14, GOAL: 3,
      wordOfDay, stats, phraseStats, suggestions: SUGGESTED_CATS,
      plan, setPlan, addWord, updateWord, deleteWord, markReview,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}
