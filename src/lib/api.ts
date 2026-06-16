const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://210.246.202.213:3000";
console.log(BASE)

export function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("vokrub_customer_token") ?? "";
}

export function saveToken(token: string): void {
  localStorage.setItem("vokrub_customer_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("vokrub_customer_token");
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}

export type ApiWord = {
  id: number;
  customer_id: number;
  word: string;
  pos: string;
  meaning: string;
  note: string;
  box: number;
  seen: number;
  due: boolean;
  added: string;
};

export class DuplicateWordError extends Error {
  existing: ApiWord;
  constructor(word: ApiWord) {
    super("Word already exists");
    this.name = "DuplicateWordError";
    this.existing = word;
  }
}

export async function createWord(data: { word: string; pos: string; meaning: string; note: string }): Promise<ApiWord> {
  const res = await fetch(`${BASE}/api/word`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  });
  if (res.status === 409) {
    const body = await res.json();
    throw new DuplicateWordError(body.word);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}

export type ApiCategory = {
  id: number;
  customer_id: number;
  name: string;
  icon: string;
  hue: number;
  sentences: ApiSentence[];
};

export type ApiSentence = {
  id: number;
  category_id: number;
  text: string;
  meaning: string;
  note: string;
};

export type CustomerProfile = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  image: string;
  plan: string;
  streak: number;
  words: number;
  status: string;
};

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://210.246.202.213:3000";
