"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { apiFetch, getToken, saveToken, clearToken, type ApiWord, type ApiCategory } from "../../lib/api";

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

const TODAY = new Date().toISOString().slice(0, 10);

function toWord(w: ApiWord): Word {
  return { ...w, id: String(w.id) };
}

function toCategory(c: ApiCategory): Category {
  return {
    ...c,
    id: String(c.id),
    sentences: (c.sentences ?? []).map((s) => ({ ...s, id: String(s.id) })),
  };
}

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

type Profile = { id: number; name: string; email: string | null; phone: string | null; image: string; plan: string; streak: number; words: number };

type StoreValue = {
  words: Word[];
  categories: Category[];
  TODAY: string;
  STREAK: number;
  GOAL: number;
  wordOfDay: Word | null;
  stats: { total: number; mastered: number; due: number; addedToday: number };
  phraseStats: { collections: number; sentences: number };
  suggestions: typeof SUGGESTED_CATS;
  plan: "free" | "pro";
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, code: string) => Promise<void>;
  setPlan: (p: "free" | "pro") => void;
  addWord: (data: { word: string; pos: string; meaning: string; note: string }) => Promise<Word>;
  updateWord: (id: string, data: { word: string; pos: string; meaning: string; note: string }) => Promise<void>;
  deleteWord: (id: string) => Promise<void>;
  markReview: (id: string, correct: boolean) => Promise<void>;
  addCategory: (data: { name: string; icon: string; hue: number }) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  addSentence: (catId: string, data: { text: string; meaning: string; note: string }) => Promise<void>;
  updateSentence: (sentId: string, data: { text: string; meaning: string; note: string }) => Promise<void>;
  deleteSentence: (sentId: string) => Promise<void>;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Bootstrap: check token on mount
  useEffect(() => {
    const token = getToken();
    if (!token) { setIsLoading(false); return; }
    apiFetch<Profile>("/api/customer/auth/me")
      .then((p) => {
        setProfile(p);
        setIsAuthenticated(true);
        return Promise.all([
          apiFetch<ApiWord[]>("/api/word"),
          apiFetch<ApiCategory[]>("/api/phrase/category"),
        ]);
      })
      .then(([ws, cats]) => {
        setWords(ws.map(toWord));
        setCategories(cats.map(toCategory));
      })
      .catch(() => { clearToken(); })
      .finally(() => setIsLoading(false));
  }, []);

  const bootSession = useCallback(async (token: string, customerData?: Profile) => {
    saveToken(token);
    const profile = customerData ?? await apiFetch<Profile>("/api/customer/auth/me");
    setProfile(profile);
    setIsAuthenticated(true);
    const [ws, cats] = await Promise.all([
      apiFetch<ApiWord[]>("/api/word"),
      apiFetch<ApiCategory[]>("/api/phrase/category"),
    ]);
    setWords(ws.map(toWord));
    setCategories(cats.map(toCategory));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<{ token: string; customer: Profile }>("/api/customer/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await bootSession(data.token, data.customer);
  }, [bootSession]);

  const loginWithToken = useCallback(async (token: string) => {
    await bootSession(token);
  }, [bootSession]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await apiFetch("/api/customer/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    await login(email, password);
  }, [login]);

  const sendOTP = useCallback(async (phone: string) => {
    await apiFetch("/api/customer/auth/otp/send", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  }, []);

  const verifyOTP = useCallback(async (phone: string, code: string) => {
    const data = await apiFetch<{ token: string; customer: Profile }>("/api/customer/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone, code }),
    });
    await bootSession(data.token, data.customer);
  }, [bootSession]);

  const logout = useCallback(() => {
    clearToken();
    setIsAuthenticated(false);
    setProfile(null);
    setWords([]);
    setCategories([]);
  }, []);

  const addWord = useCallback(async (data: { word: string; pos: string; meaning: string; note: string }) => {
    const w = await apiFetch<ApiWord>("/api/word", { method: "POST", body: JSON.stringify(data) });
    const word = toWord(w);
    setWords((prev) => [word, ...prev]);
    return word;
  }, []);

  const updateWord = useCallback(async (id: string, data: { word: string; pos: string; meaning: string; note: string }) => {
    const w = await apiFetch<ApiWord>(`/api/word/${id}`, { method: "PUT", body: JSON.stringify(data) });
    setWords((prev) => prev.map((x) => (x.id === id ? toWord(w) : x)));
  }, []);

  const deleteWord = useCallback(async (id: string) => {
    await apiFetch(`/api/word/${id}`, { method: "DELETE" });
    setWords((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const markReview = useCallback(async (id: string, correct: boolean) => {
    const w = await apiFetch<ApiWord>(`/api/word/${id}/review`, { method: "POST", body: JSON.stringify({ correct }) });
    setWords((prev) => prev.map((x) => (x.id === id ? toWord(w) : x)));
  }, []);

  const addCategory = useCallback(async (data: { name: string; icon: string; hue: number }) => {
    const c = await apiFetch<ApiCategory>("/api/phrase/category", { method: "POST", body: JSON.stringify(data) });
    const cat = toCategory(c);
    setCategories((prev) => [...prev, cat]);
    return cat;
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await apiFetch(`/api/phrase/category/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addSentence = useCallback(async (catId: string, data: { text: string; meaning: string; note: string }) => {
    const s = await apiFetch<{ id: number; text: string; meaning: string; note: string }>(`/api/phrase/category/${catId}/sentence`, { method: "POST", body: JSON.stringify(data) });
    setCategories((prev) => prev.map((c) => c.id === catId ? { ...c, sentences: [...c.sentences, { ...s, id: String(s.id) }] } : c));
  }, []);

  const updateSentence = useCallback(async (sentId: string, data: { text: string; meaning: string; note: string }) => {
    const s = await apiFetch<{ id: number; text: string; meaning: string; note: string }>(`/api/phrase/sentence/${sentId}`, { method: "PUT", body: JSON.stringify(data) });
    setCategories((prev) => prev.map((c) => ({
      ...c,
      sentences: c.sentences.map((x) => x.id === sentId ? { ...s, id: String(s.id) } : x),
    })));
  }, []);

  const deleteSentence = useCallback(async (sentId: string) => {
    await apiFetch(`/api/phrase/sentence/${sentId}`, { method: "DELETE" });
    setCategories((prev) => prev.map((c) => ({ ...c, sentences: c.sentences.filter((x) => x.id !== sentId) })));
  }, []);

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

  return (
    <StoreContext.Provider value={{
      words, categories, TODAY,
      STREAK: profile?.streak ?? 0,
      GOAL: 3,
      wordOfDay: words[0] ?? null,
      stats, phraseStats,
      suggestions: SUGGESTED_CATS,
      plan: (profile?.plan === "pro_monthly" || profile?.plan === "pro_annual") ? "pro" : "free",
      profile,
      isAuthenticated, isLoading,
      login, loginWithToken, logout, register, sendOTP, verifyOTP, setPlan: () => {},
      addWord, updateWord, deleteWord, markReview,
      addCategory, deleteCategory, addSentence, updateSentence, deleteSentence,
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
