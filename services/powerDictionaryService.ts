/**
 * ──────────────────────────────────────────────────────────────
 * Power Dictionary Service — Zero AI Dependency
 * ──────────────────────────────────────────────────────────────
 * Kiến trúc Hybrid thuần API mở:
 *   Tier 1 — Local cache (localStorage) → < 10ms
 *   Tier 2 — Free Dictionary API (dictionaryapi.dev) → English definitions, IPA, audio
 *   Tier 3 — MyMemory Translation API → Dịch nghĩa sang Tiếng Việt
 *   Tier 4 — Datamuse API → Synonyms, antonyms, related/associated words
 * ──────────────────────────────────────────────────────────────
 */

import { HybridDictEntry } from '../types';
import { searchOfflineDictionary } from './localDictService';

const CACHE_KEY = 'aura_power_dict_v4';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày

// ─── Cache helpers ───────────────────────────────────────────

interface CachedEntry {
  data: HybridDictEntry;
  savedAt: number;
}

const readCache = (): Record<string, CachedEntry> => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const writeCache = (cache: Record<string, CachedEntry>) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch { /* quota exceeded — ignore */ }
};

export const getCachedEntry = (word: string): HybridDictEntry | null => {
  const cache = readCache();
  const entry = cache[word.trim().toLowerCase()];
  if (!entry) return null;
  if (Date.now() - entry.savedAt > CACHE_TTL_MS) return null; // stale
  return entry.data;
};

export const setCachedEntry = (word: string, data: HybridDictEntry) => {
  const cache = readCache();
  cache[word.trim().toLowerCase()] = { data, savedAt: Date.now() };
  writeCache(cache);
};

export const clearDictionaryCache = () => {
  try { localStorage.removeItem(CACHE_KEY); } catch { /* noop */ }
};

// ─── Tier 2: Free Dictionary API ─────────────────────────────

interface FreeDictEntry {
  word: string;
  phonetic?: string;
  phonetics: { text?: string; audio?: string; sourceUrl?: string }[];
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example?: string; synonyms: string[]; antonyms: string[] }[];
    synonyms: string[];
    antonyms: string[];
  }[];
  sourceUrls?: string[];
}

const fetchFreeDictionary = async (word: string): Promise<FreeDictEntry | null> => {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
};

// ─── Tier 3: MyMemory Translation API ──────────────────────

const translateToVietnamese = async (text: string): Promise<string> => {
  if (!text) return '';
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return '';
    const data = await res.json();
    const translated: string = data?.responseData?.translatedText || '';
    // Filter out poor translations (same as source or empty)
    if (!translated || translated.toLowerCase() === text.toLowerCase()) return '';
    return translated;
  } catch {
    return '';
  }
};

// Batch translate multiple texts concurrently with limit
const batchTranslate = async (texts: string[], maxConcurrent = 3): Promise<string[]> => {
  const results: string[] = new Array(texts.length).fill('');
  for (let i = 0; i < texts.length; i += maxConcurrent) {
    const batch = texts.slice(i, i + maxConcurrent);
    const translations = await Promise.all(batch.map(t => translateToVietnamese(t)));
    translations.forEach((t, j) => { results[i + j] = t; });
  }
  return results;
};

// ─── Tier 4: Datamuse API ────────────────────────────────────

interface DatamuseWord { word: string; score: number; tags?: string[] }

const fetchDatamuse = async (word: string): Promise<{
  synonyms: string[];
  antonyms: string[];
  relatedWords: string[];
  rhymes: string[];
}> => {
  try {
    const [synRes, antRes, relRes] = await Promise.allSettled([
      fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=10`),
      fetch(`https://api.datamuse.com/words?rel_ant=${encodeURIComponent(word)}&max=8`),
      fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=8`),
    ]);

    const parse = async (res: PromiseFulfilledResult<Response> | PromiseRejectedResult): Promise<DatamuseWord[]> => {
      if (res.status === 'rejected') return [];
      try {
        const r = (res as PromiseFulfilledResult<Response>).value;
        return r.ok ? await r.json() : [];
      } catch { return []; }
    };

    const [synWords, antWords, relWords] = await Promise.all([
      parse(synRes), parse(antRes), parse(relRes)
    ]);

    return {
      synonyms: synWords.map(w => w.word),
      antonyms: antWords.map(w => w.word),
      relatedWords: relWords.map(w => w.word),
      rhymes: [],
    };
  } catch {
    return { synonyms: [], antonyms: [], relatedWords: [], rhymes: [] };
  }
};

// ─── IPA parser ──────────────────────────────────────────────

interface PhoneticsResult {
  ukIpa: string;
  usIpa: string;
  ukAudio: string;
  usAudio: string;
}

const extractPhonetics = (entry: FreeDictEntry): PhoneticsResult => {
  let ukIpa = '', usIpa = '', ukAudio = '', usAudio = '';

  for (const p of entry.phonetics || []) {
    const audioLower = (p.audio || '').toLowerCase();
    const isUk = audioLower.includes('-uk') || audioLower.includes('_uk');
    const isUs = audioLower.includes('-us') || audioLower.includes('_us');

    if (isUk) {
      if (p.text && !ukIpa) ukIpa = p.text;
      if (p.audio && !ukAudio) ukAudio = p.audio;
    } else if (isUs) {
      if (p.text && !usIpa) usIpa = p.text;
      if (p.audio && !usAudio) usAudio = p.audio;
    } else {
      // Generic — assign to whichever side is still empty
      if (p.text && !ukIpa) ukIpa = p.text;
      if (p.audio && !ukAudio) ukAudio = p.audio;
    }
  }

  // Ultimate fallback: entry.phonetic
  const fallback = entry.phonetic || '';
  if (!ukIpa && !usIpa) { ukIpa = fallback; usIpa = fallback; }
  else if (!ukIpa) ukIpa = usIpa;
  else if (!usIpa) usIpa = ukIpa;

  return { ukIpa, usIpa, ukAudio, usAudio };
};

// ─── Wiktionary Simple API ────────────────────────────────────
// Used to get etymology when available

const fetchEtymology = async (word: string): Promise<string> => {
  try {
    const res = await fetch(
      `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return '';
    const data = await res.json();
    // Extract etymology from the Wiktionary REST data
    const etym = data?.en?.[0]?.etymology;
    return typeof etym === 'string' ? etym.slice(0, 300) : '';
  } catch {
    return '';
  }
};

// ─── Main Export: lookupWord ──────────────────────────────────

export interface PowerDictResult extends HybridDictEntry {
  // Extended fields beyond HybridDictEntry
  ukAudio?: string;
  usAudio?: string;
  relatedWords?: string[];
  allSynonyms?: string[];
  allAntonyms?: string[];
  sourceUrl?: string;
  isFromCache?: boolean;
}

export const lookupWord = async (
  word: string,
  options: { skipCache?: boolean } = {}
): Promise<PowerDictResult | null> => {
  const clean = word.trim().toLowerCase();
  if (!clean) return null;

  // ── Tier 0: Cache hit ─────────────────────────────────────
  if (!options.skipCache) {
    const cached = getCachedEntry(clean);
    if (cached) return { ...cached, isFromCache: true };
  }

  // ── Tier 1: Local Offline JSON (Rich VI + Specialized) ──────
  const localData = await searchOfflineDictionary(clean);
  if (localData) {
    // We have base data with perfect Vietnamese and specialized meanings!
    // Enhance it with Audio/IPA from Free Dictionary and Synonyms from Datamuse (non-blocking if they fail)
    
    const [freeDictData, datamuseData, etymology] = await Promise.all([
      fetchFreeDictionary(clean),
      fetchDatamuse(clean),
      fetchEtymology(clean)
    ]);

    let ukIpa = localData.ipa;
    let usIpa = localData.ipa;
    let ukAudio, usAudio;

    if (freeDictData) {
      const phonetics = extractPhonetics(freeDictData);
      ukIpa = phonetics.ukIpa || ukIpa;
      usIpa = phonetics.usIpa || usIpa;
      ukAudio = phonetics.ukAudio;
      usAudio = phonetics.usAudio;
    }

    const result: PowerDictResult = {
      ...localData,
      ipa: ukIpa || usIpa,
      phonetics: { uk: ukIpa, us: usIpa },
      ukAudio,
      usAudio,
      allSynonyms: datamuseData.synonyms.slice(0, 15),
      allAntonyms: datamuseData.antonyms.slice(0, 10),
      relatedWords: datamuseData.relatedWords,
      etymology: etymology || undefined,
      isFromCache: false,
    };

    setCachedEntry(clean, result);
    return result;
  }

  // ── Tier 2: Free Dictionary API (Fallback) ──────────────────
  const freeDictData = await fetchFreeDictionary(clean);
  if (!freeDictData) return null; // word not found anywhere

  const { ukIpa, usIpa, ukAudio, usAudio } = extractPhonetics(freeDictData);

  // Collect all English definitions for translation
  const allDefinitions: string[] = [];
  for (const meaning of freeDictData.meanings) {
    for (const def of meaning.definitions.slice(0, 3)) { // Top 3 per POS
      allDefinitions.push(def.definition);
    }
  }

  // ── Tier 3 + 4: Parallel fetch ────────────────────────────
  const [viTranslations, datamuseData, etymology] = await Promise.all([
    batchTranslate(allDefinitions, 4),
    fetchDatamuse(clean),
    fetchEtymology(clean),
  ]);

  // ── Build HybridDictEntry ─────────────────────────────────
  let defIndex = 0;
  const allFreeSynonyms = new Set<string>();
  const allFreeAntonyms = new Set<string>();

  const details: HybridDictEntry['details'] = freeDictData.meanings.map(meaning => {
    meaning.synonyms?.forEach(s => allFreeSynonyms.add(s));
    meaning.antonyms?.forEach(a => allFreeAntonyms.add(a));

    const means = meaning.definitions.slice(0, 3).map(def => {
      const viMeaning = viTranslations[defIndex] || '';
      defIndex++;

      def.synonyms?.forEach(s => allFreeSynonyms.add(s));
      def.antonyms?.forEach(a => allFreeAntonyms.add(a));

      return {
        mean: def.definition,
        meanVi: viMeaning, // Vietnamese translation fallback
        example: def.example || '',
        examples: def.example ? [def.example] : [],
        synonyms: def.synonyms?.slice(0, 5) || [],
        antonyms: def.antonyms?.slice(0, 5) || [],
      };
    });

    return { pos: meaning.partOfSpeech, means };
  });

  const allSynonyms = [...new Set([...allFreeSynonyms, ...datamuseData.synonyms])].slice(0, 15);
  const allAntonyms = [...new Set([...allFreeAntonyms, ...datamuseData.antonyms])].slice(0, 10);

  const result: PowerDictResult = {
    vocabulary: freeDictData.word,
    ipa: ukIpa || usIpa,
    phonetics: { uk: ukIpa, us: usIpa },
    ukAudio: ukAudio || undefined,
    usAudio: usAudio || undefined,
    details,
    allSynonyms,
    allAntonyms,
    relatedWords: datamuseData.relatedWords,
    wordFamily: undefined, // Populated by Datamuse if available
    etymology: etymology || undefined,
    sourceUrl: freeDictData.sourceUrls?.[0],
    isFromCache: false,
  };

  // ── Save to cache ─────────────────────────────────────────
  setCachedEntry(clean, result);

  return result;
};

// ─── Autocomplete via Datamuse ────────────────────────────────

export const fetchAutocompleteSuggestions = async (prefix: string): Promise<string[]> => {
  if (prefix.length < 2) return [];
  try {
    const res = await fetch(
      `https://api.datamuse.com/sug?s=${encodeURIComponent(prefix)}&max=7`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: { word: string }) => item.word);
  } catch {
    return [];
  }
};

export const fetchSpellCheck = async (word: string): Promise<string[]> => {
  const clean = word.trim().toLowerCase();
  if (!clean) return [];
  try {
    const res = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(clean)}&v=enwiki&max=4`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: { word: string }) => item.word);
  } catch {
    return [];
  }
};
