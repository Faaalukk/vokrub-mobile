// Word data helpers — all free, no-key public APIs, called straight from the client.
//
//  - lookupWord   → dictionaryapi.dev : is-it-real + English definition + parts of speech
//  - translateToThai → MyMemory       : English → Thai
//  - suggestForms → Datamuse          : related word-family forms (exclusive → exclusively, …)

// App's canonical POS values (must match WordForm's POS list).
const POS_CANON = ["noun", "verb", "adjective", "adverb"] as const;

// Datamuse short tags → canonical POS.
const DATAMUSE_POS: Record<string, string> = { n: "noun", v: "verb", adj: "adjective", adv: "adverb" };

export type WordInfo = {
  valid: boolean;          // found in the English dictionary
  pos: string[];           // canonical parts of speech, e.g. ["adjective","adverb"]
  definition: string | null;
};

export type FormSuggestion = { word: string; pos: string };

// dictionaryapi.dev: 200 with entries = real word; 404 = not found.
export async function lookupWord(word: string): Promise<WordInfo> {
  const w = word.trim().toLowerCase();
  if (!w) return { valid: false, pos: [], definition: null };
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`);
    if (!res.ok) return { valid: false, pos: [], definition: null };
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return { valid: false, pos: [], definition: null };

    const pos: string[] = [];
    let definition: string | null = null;
    for (const entry of data) {
      for (const m of entry.meanings ?? []) {
        const p = String(m.partOfSpeech ?? "").toLowerCase();
        if ((POS_CANON as readonly string[]).includes(p) && !pos.includes(p)) pos.push(p);
        if (!definition && m.definitions?.[0]?.definition) definition = m.definitions[0].definition;
      }
    }
    return { valid: true, pos, definition };
  } catch {
    return { valid: false, pos: [], definition: null };
  }
}

// MyMemory free endpoint. Returns "" on any failure so callers can fall back.
export async function translateToThai(word: string): Promise<string> {
  const w = word.trim();
  if (!w) return "";
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(w)}&langpair=en|th`);
    if (!res.ok) return "";
    const data = await res.json();
    const t = data?.responseData?.translatedText ?? "";
    // MyMemory echoes the input (or an error sentence) when it has no translation.
    if (!t || t.toLowerCase() === w.toLowerCase() || t.includes("MYMEMORY WARNING")) return "";
    return t;
  } catch {
    return "";
  }
}

// Prefix stem for spelling-wildcard form search. "exclusive" → "exclus".
function stemOf(word: string): string {
  const s = word.toLowerCase().replace(/[^a-z]/g, "");
  if (s.length <= 4) return s;
  return s.slice(0, Math.max(4, Math.ceil(s.length * 0.6)));
}

function posFromTags(tags?: string[]): string {
  for (const t of tags ?? []) if (DATAMUSE_POS[t]) return DATAMUSE_POS[t];
  return "";
}

// Datamuse spelling-wildcard on the stem, with part-of-speech metadata.
export async function suggestForms(word: string): Promise<FormSuggestion[]> {
  const w = word.trim().toLowerCase();
  if (w.length < 3) return [];
  const stem = stemOf(w);
  try {
    const res = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(stem)}*&md=p&max=25`);
    if (!res.ok) return [];
    const data: { word: string; tags?: string[] }[] = await res.json();
    const seen = new Set([w]);
    const out: FormSuggestion[] = [];
    for (const d of data) {
      const cand = (d.word ?? "").toLowerCase();
      if (seen.has(cand) || !/^[a-z]+$/.test(cand) || !cand.startsWith(stem)) continue;
      seen.add(cand);
      out.push({ word: cand, pos: posFromTags(d.tags) });
      if (out.length >= 6) break;
    }
    return out;
  } catch {
    return [];
  }
}
