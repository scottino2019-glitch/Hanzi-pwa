import React from 'react';
import { Ideogram } from '../types/ideogram';
import { speakChinese } from '../services/dataService';
import { X, Volume2, Heart, PenTool, Sparkles, BookOpen, Layers } from 'lucide-react';

interface CharacterModalProps {
  ideogram: Ideogram | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPractice: (ideogram: Ideogram) => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  ideogram,
  onClose,
  isFavorite,
  onToggleFavorite,
  onPractice,
}) => {
  if (!ideogram) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-800 via-red-700 to-amber-700 p-3.5 sm:p-5 text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold bg-white/20 rounded-md sm:rounded-lg uppercase tracking-wider backdrop-blur-sm shrink-0">
              {ideogram.category}
            </span>
            <span className="text-[11px] sm:text-xs text-amber-200 flex items-center gap-1 font-medium truncate">
              <Layers className="w-3.5 h-3.5 shrink-0" /> {ideogram.strokesCount} tratti • Radicale: {ideogram.radical}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => onToggleFavorite(ideogram.id)}
              className={`p-1.5 sm:p-2 rounded-xl transition ${
                isFavorite
                  ? 'bg-amber-400 text-red-950 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              title="Chiudi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Main Character Showcase with Mi Zi Ge background */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-200">
            {/* Traditional Calligraphy Grid Box (米字格) */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 bg-white rounded-xl border-2 border-red-700/60 shadow-inner flex items-center justify-center overflow-hidden">
              {/* Calligraphy guidelines: horizontal, vertical, diagonals */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full border border-red-200/60" />
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-red-200/70 border-b border-dashed border-red-300" />
                <div className="absolute left-1/2 top-0 h-full w-[1px] bg-red-200/70 border-r border-dashed border-red-300" />
                {/* Diagonal lines */}
                <svg className="absolute inset-0 w-full h-full stroke-red-200/50" strokeDasharray="3 3">
                  <line x1="0" y1="0" x2="144" y2="144" />
                  <line x1="144" y1="0" x2="0" y2="144" />
                </svg>
              </div>

              {/* Large Chinese Character */}
              <span className="relative z-10 text-5xl sm:text-7xl font-serif font-black text-stone-900 select-none">
                {ideogram.char}
              </span>
            </div>

            {/* Character Info & Pronunciation */}
            <div className="flex-1 text-center sm:text-left space-y-1.5 sm:space-y-2 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xl sm:text-2xl font-bold text-red-700 tracking-wide">
                  {ideogram.pinyin}
                </span>
                <button
                  onClick={() => speakChinese(ideogram.char)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-semibold transition active:scale-95"
                  title="Ascolta la pronuncia cinese standard"
                >
                  <Volume2 className="w-3.5 h-3.5 text-red-700" />
                  Ascolta
                </button>
              </div>

              <h2 className="text-xl font-bold text-stone-900 capitalize">
                {ideogram.meaning}
              </h2>

              <p className="text-xs text-stone-500">
                Livello {ideogram.level === 1 ? 'Principiante (Base)' : 'Intermedio'} • Radicale principale: <strong className="text-red-700 font-mono text-sm">{ideogram.radical}</strong>
              </p>

              <button
                onClick={() => {
                  onClose();
                  onPractice(ideogram);
                }}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95"
              >
                <PenTool className="w-3.5 h-3.5" /> Pratica Tratti sul Canvas
              </button>
            </div>
          </div>

          {/* Etymology & Pictographic Origin */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-red-600" />
              Origine ed Etimologia
            </h3>
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 text-sm text-stone-700 leading-relaxed">
              {ideogram.explanation}
            </div>
          </div>

          {/* Mnemonic Tip */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Trucco Mnemonico
            </h3>
            <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-100 text-sm text-red-950 italic flex items-start gap-2.5">
              <span className="text-lg">💡</span>
              <span>{ideogram.mnemonic}</span>
            </div>
          </div>

          {/* Example Compound Words */}
          {ideogram.words && ideogram.words.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Parole Composte ed Esempi
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ideogram.words.map((word, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold font-serif text-stone-900">
                          {word.hanzi}
                        </span>
                        <span className="text-xs font-semibold text-red-600 font-mono">
                          {word.pinyin}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">{word.translation}</p>
                    </div>
                    <button
                      onClick={() => speakChinese(word.hanzi)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-200 rounded-lg transition"
                      title="Ascolta parola"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
