"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { apiFetch, createWord, getToken, saveToken, clearToken, type ApiWord, type ApiCategory, type ApiWordCategory, type ApiWordFamily } from "../../lib/api";

export type WordCategory = {
  id: string;
  name: string;
  color: number;
};

export type WordFamily = {
  id: string;
  name: string;
  wordIds: string[];
};

export type Word = {
  id: string;
  word: string;
  pos: string;
  translate: string;
  meaning: string;
  note: string;
  category_id: string | null;
  synonyms: string[];
  added: string;
  box: number;
  seen: number;
  due: boolean;
};

export type Sentence = { id: string; text: string; meaning: string; note: string };
export type Category = { id: string; name: string; icon: string; hue: number; sentences: Sentence[] };

const TODAY = new Date().toISOString().slice(0, 10);

function toWord(w: ApiWord): Word {
  return {
    ...w,
    id: String(w.id),
    translate: w.translate ?? "",
    category_id: w.category_id != null ? String(w.category_id) : null,
    synonyms: w.synonyms ?? [],
  };
}

function toWordCategory(c: ApiWordCategory): WordCategory {
  return { id: String(c.id), name: c.name, color: c.color };
}

function toWordFamily(f: ApiWordFamily): WordFamily {
  return { id: String(f.id), name: f.name, wordIds: (f.members ?? []).map((m) => String(m.word_id)) };
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
  wordCategories: WordCategory[];
  wordFamilies: WordFamily[];
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
  addWord: (data: { word: string; pos: string; translate?: string; meaning: string; note: string; synonyms?: string[]; category_id?: string | null }) => Promise<Word>;
  updateWord: (id: string, data: { word: string; pos: string; translate?: string; meaning: string; note: string; synonyms?: string[]; category_id?: string | null }) => Promise<void>;
  addWordCategory: (data: { name: string; color: number }) => Promise<WordCategory>;
  deleteWordCategory: (id: string) => Promise<void>;
  createWordFamily: (data: { name: string; wordId?: string; newWord?: { word: string; pos: string; translate?: string; meaning: string; note: string; synonyms?: string[]; category_id?: string | null } }) => Promise<WordFamily>;
  addToFamily: (familyId: string, wordId: string) => Promise<void>;
  addNewWordToFamily: (familyId: string, data: { word: string; pos: string; translate?: string; meaning: string; note: string; synonyms?: string[]; category_id?: string | null }) => Promise<void>;
  removeFromFamily: (familyId: string, wordId: string) => Promise<void>;
  deleteWordFamily: (id: string) => Promise<void>;
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
  const [wordCategories, setWordCategories] = useState<WordCategory[]>([]);
  const [wordFamilies, setWordFamilies] = useState<WordFamily[]>([]);
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
          apiFetch<ApiWordCategory[]>("/api/word/category"),
          apiFetch<ApiWordFamily[]>("/api/word/family"),
          apiFetch<ApiCategory[]>("/api/phrase/category"),
        ]);
      })
      .then(([ws, wcs, wfs, cats]) => {
        setWords(ws.map(toWord));
        setWordCategories(wcs.map(toWordCategory));
        setWordFamilies(wfs.map(toWordFamily));
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
    const [ws, wcs, wfs, cats] = await Promise.all([
      apiFetch<ApiWord[]>("/api/word"),
      apiFetch<ApiWordCategory[]>("/api/word/category"),
      apiFetch<ApiWordFamily[]>("/api/word/family"),
      apiFetch<ApiCategory[]>("/api/phrase/category"),
    ]);
    setWords(ws.map(toWord));
    setWordCategories(wcs.map(toWordCategory));
    setWordFamilies(wfs.map(toWordFamily));
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
    setWordCategories([]);
    setWordFamilies([]);
    setCategories([]);
  }, []);

  const addWord = useCallback(async (data: { word: string; pos: string; translate?: string; meaning: string; note: string; synonyms?: string[]; category_id?: string | null }) => {
    const payload = { ...data, category_id: data.category_id ? Number(data.category_id) : null, synonyms: data.synonyms ?? [] };
    const { word: w, streak } = await createWord(payload); // throws DuplicateWordError on 409
    const word = toWord(w);
    setWords((prev) => [word, ...prev]);
    setProfile((prev) => prev ? { ...prev, streak } : prev);
    return word;
  }, []);

  const updateWord = useCallback(async (id: string, data: { word: string; pos: string; translate?: string; meaning: string; note: string; synonyms?: string[]; category_id?: string | null }) => {
    const payload = { ...data, category_id: data.category_id ? Number(data.category_id) : null, synonyms: data.synonyms ?? [] };
    const w = await apiFetch<ApiWord>(`/api/word/${id}`, { method: "PUT", body: JSON.stringify(payload) });
    setWords((prev) => prev.map((x) => (x.id === id ? toWord(w) : x)));
  }, []);

  const createWordFamily = useCallback(async (data: { name: string; wordId?: string; newWord?: { word: string; pos: string; translate?: string; meaning: string; note: string; synonyms?: string[]; category_id?: string | null } }) => {
    const body: Record<string, unknown> = { name: data.name };
    if (data.wordId) body.word_id = Number(data.wordId);
    if (data.newWord) {
      body.new_word = {
        word: data.newWord.word,
        pos: data.newWord.pos,
        meaning: data.newWord.meaning,
        note: data.newWord.note,
        category_id: data.newWord.category_id ? Number(data.newWord.category_id) : null,
        synonyms: data.newWord.synonyms ?? [],
      };
    }
    const f = await apiFetch<ApiWordFamily>("/api/word/family", { method: "POST", body: JSON.stringify(body) });
    const family = toWordFamily(f);
    setWordFamilies((prev) => [...prev, family]);
    // An inline word is created server-side; refetch so it appears in the library.
    if (data.newWord) {
      const ws = await apiFetch<ApiWord[]>("/api/word");
      setWords(ws.map(toWord));
    }
    return family;
  }, []);

  const addToFamily = useCallback(async (familyId: string, wordId: string) => {
    const f = await apiFetch<ApiWordFamily>(`/api/word/family/${familyId}/member`, { method: "POST", body: JSON.stringify({ word_id: Number(wordId) }) });
    setWordFamilies((prev) => prev.map((x) => x.id === familyId ? toWordFamily(f) : x));
  }, []);

  const addNewWordToFamily = useCallback(async (familyId: string, data: { word: string; pos: string; translate?: string; meaning: string; note: string; synonyms?: string[]; category_id?: string | null }) => {
    const newWord = {
      word: data.word,
      pos: data.pos,
      meaning: data.meaning,
      note: data.note,
      category_id: data.category_id ? Number(data.category_id) : null,
      synonyms: data.synonyms ?? [],
    };
    const f = await apiFetch<ApiWordFamily>(`/api/word/family/${familyId}/member`, { method: "POST", body: JSON.stringify({ new_word: newWord }) });
    // The word is created server-side; refetch so it appears in the library + chips.
    const ws = await apiFetch<ApiWord[]>("/api/word");
    setWords(ws.map(toWord));
    setWordFamilies((prev) => prev.map((x) => x.id === familyId ? toWordFamily(f) : x));
  }, []);

  const removeFromFamily = useCallback(async (familyId: string, wordId: string) => {
    const f = await apiFetch<ApiWordFamily>(`/api/word/family/${familyId}/member/${wordId}`, { method: "DELETE" });
    setWordFamilies((prev) => prev.map((x) => x.id === familyId ? toWordFamily(f) : x));
  }, []);

  const deleteWordFamily = useCallback(async (id: string) => {
    await apiFetch(`/api/word/family/${id}`, { method: "DELETE" });
    setWordFamilies((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addWordCategory = useCallback(async (data: { name: string; color: number }) => {
    const c = await apiFetch<ApiWordCategory>("/api/word/category", { method: "POST", body: JSON.stringify(data) });
    const cat = toWordCategory(c);
    setWordCategories((prev) => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
    return cat;
  }, []);

  const deleteWordCategory = useCallback(async (id: string) => {
    await apiFetch(`/api/word/category/${id}`, { method: "DELETE" });
    setWordCategories((prev) => prev.filter((c) => c.id !== id));
    setWords((prev) => prev.map((w) => w.category_id === id ? { ...w, category_id: null } : w));
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
      words, wordCategories, wordFamilies, categories, TODAY,
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
      addWordCategory, deleteWordCategory,
      createWordFamily, addToFamily, addNewWordToFamily, removeFromFamily, deleteWordFamily,
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
