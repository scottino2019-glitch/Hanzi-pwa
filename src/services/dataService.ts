import { Ideogram, Category } from '../types/ideogram';

const STORAGE_KEYS = {
  CATEGORIES: 'hanzipwa_categories_v1',
  IDEOGRAMS: 'hanzipwa_ideograms_v1',
  FAVORITES: 'hanzipwa_favorites_v1',
  STATS: 'hanzipwa_stats_v1'
};

export interface UserStats {
  completedDrawings: number;
  accuracySum: number;
  accuracyCount: number;
  quizScore: number;
  quizStreak: number;
  bestStreak: number;
  learnedChars: string[];
}

export const defaultStats: UserStats = {
  completedDrawings: 0,
  accuracySum: 0,
  accuracyCount: 0,
  quizScore: 0,
  quizStreak: 0,
  bestStreak: 0,
  learnedChars: []
};

// Fetch categories from JSON with offline fallback
export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch('/data/categories.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Category[] = await res.json();
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data));
    } catch {
      // ignore storage quota error
    }
    return data;
  } catch (err) {
    console.warn('Failed to fetch /data/categories.json from network, using local storage cache:', err);
    const cached = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (cached) {
      return JSON.parse(cached);
    }
    // Minimal fallback if first run offline
    return [
      { id: 'tutti', name: 'Tutti', icon: '✨', description: 'Tutti gli ideogrammi', color: 'from-amber-500 to-red-500' },
      { id: 'natura', name: 'Natura & Elementi', icon: '🌿', description: 'Sole, luna, acqua, fuoco...', color: 'from-emerald-500 to-teal-600' },
      { id: 'corpo', name: 'Uomo & Corpo', icon: '👤', description: 'Persona, mano, occhio...', color: 'from-rose-500 to-orange-500' },
      { id: 'numeri', name: 'Numeri & Quantità', icon: '🔢', description: 'Uno, due, tre...', color: 'from-blue-500 to-indigo-600' },
      { id: 'spazio', name: 'Spazio & Dimensioni', icon: '🧭', description: 'Grande, piccolo, sopra...', color: 'from-violet-500 to-purple-600' },
      { id: 'animali', name: 'Animali', icon: '🐾', description: 'Cavallo, uccello, pesce...', color: 'from-amber-600 to-yellow-600' },
      { id: 'vita', name: 'Società & Vita', icon: '🏮', description: 'Porta, automobile, re...', color: 'from-red-600 to-pink-600' }
    ];
  }
}

// Fetch external games configuration
export async function fetchExternalGames(): Promise<any[]> {
  try {
    const res = await fetch('/data/external-games.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Could not fetch external games, using default fallback:', err);
    return [
      {
        id: 'classic-drawing-html5',
        title: 'Disegno Classico Oracolare',
        description: 'Mini-gioco HTML5 autonomo per il disegno dei caratteri con guida semitrasparente.',
        icon: '🎨',
        path: '/assets/aistudio/disegno_caratteri_f6348661.html',
        type: 'external_html',
        author: 'Locale (public/assets)',
        tags: ['HTML5', 'Disegno', 'Touch', 'Offline']
      },
      {
        id: 'audio-reflex-game',
        title: 'Corsa dei Toni (Speed Reflex)',
        description: 'Mini-gioco rapido esterno in HTML5/JS: ascolta il suono del carattere e seleziona il simbolo prima dello scadere del tempo.',
        icon: '⚡',
        path: '/games/speed-reflex/index.html',
        type: 'external_html',
        author: 'Locale (public/games)',
        tags: ['HTML5', 'Audio', 'Riflessi', 'Pinyin']
      }
    ];
  }
}

// Fetch all ideograms from JSON with offline fallback
export async function fetchIdeograms(): Promise<Ideogram[]> {
  try {
    const res = await fetch('/data/ideograms.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Ideogram[] = await res.json();
    try {
      localStorage.setItem(STORAGE_KEYS.IDEOGRAMS, JSON.stringify(data));
    } catch {
      // ignore storage quota
    }
    return data;
  } catch (err) {
    console.warn('Failed to fetch /data/ideograms.json from network, using local storage cache:', err);
    const cached = localStorage.getItem(STORAGE_KEYS.IDEOGRAMS);
    if (cached) {
      return JSON.parse(cached);
    }
    return [];
  }
}

// Normalize strings for resilient searching (e.g. "ren" matches "rén", case-insensitive)
export function normalizeSearchStr(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Quick Search function
export function searchIdeograms(
  items: Ideogram[],
  query: string,
  category: string = 'tutti',
  levelFilter: number | 'all' = 'all'
): Ideogram[] {
  let filtered = items;

  // Filter by category
  if (category && category !== 'tutti') {
    filtered = filtered.filter((item) => item.category === category);
  }

  // Filter by level
  if (levelFilter !== 'all') {
    filtered = filtered.filter((item) => item.level === levelFilter);
  }

  // Filter by query string
  if (!query || !query.trim()) {
    return filtered;
  }

  const normalizedQuery = normalizeSearchStr(query);

  return filtered.filter((item) => {
    // Exact or partial character match
    if (item.char.includes(query.trim())) return true;

    // Pinyin match
    const normPinyin = normalizeSearchStr(item.pinyin);
    if (normPinyin.includes(normalizedQuery)) return true;

    // Meaning match (Italian)
    const normMeaning = normalizeSearchStr(item.meaning);
    if (normMeaning.includes(normalizedQuery)) return true;

    // Explanation / etymology match
    const normExplanation = normalizeSearchStr(item.explanation);
    if (normExplanation.includes(normalizedQuery)) return true;

    // Radical match
    if (item.radical.includes(query.trim())) return true;

    // Compound words match
    for (const w of item.words) {
      if (
        w.hanzi.includes(query.trim()) ||
        normalizeSearchStr(w.pinyin).includes(normalizedQuery) ||
        normalizeSearchStr(w.translation).includes(normalizedQuery)
      ) {
        return true;
      }
    }

    return false;
  });
}

// Favorites management in localStorage
export function getFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(charId: string): string[] {
  const current = getFavorites();
  const exists = current.includes(charId);
  const updated = exists ? current.filter((id) => id !== charId) : [...current, charId];
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

// User Stats management in localStorage
export function getUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) return defaultStats;
    return { ...defaultStats, ...JSON.parse(raw) };
  } catch {
    return defaultStats;
  }
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

// Native Speech synthesis for standard Mandarin Chinese (100% offline, zero server!)
export function speakChinese(text: string): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85; // Slightly slower for clarity in learning

    // Check if zh voice is available
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(
      (v) => v.lang.startsWith('zh') || v.lang.includes('Chinese') || v.name.includes('Chinese')
    );
    if (zhVoice) {
      utterance.voice = zhVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    console.warn('Speech synthesis error:', e);
    return false;
  }
}
