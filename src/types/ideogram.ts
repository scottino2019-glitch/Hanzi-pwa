export interface CompoundWord {
  hanzi: string;
  pinyin: string;
  translation: string;
}

export interface Ideogram {
  id: string;
  char: string;
  pinyin: string;
  meaning: string;
  category: string;
  explanation: string;
  mnemonic: string;
  radical: string;
  strokesCount: number;
  level: number;
  strokes: string[]; // SVG path strings
  words: CompoundWord[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export type ViewTab = 'catalogo' | 'disegno' | 'quiz' | 'memory' | 'giochi' | 'preferiti';
