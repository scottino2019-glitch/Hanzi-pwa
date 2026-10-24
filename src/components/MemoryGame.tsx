import React, { useState, useEffect } from 'react';
import { Ideogram } from '../types/ideogram';
import { speakChinese } from '../services/dataService';
import { RotateCcw, Award, Sparkles, Filter, Volume2 } from 'lucide-react';

interface MemoryGameProps {
  ideograms: Ideogram[];
}

interface CardItem {
  id: string; // unique card instance id
  charId: string;
  type: 'char' | 'meaning';
  char: string;
  pinyin: string;
  meaning: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ ideograms }) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<CardItem[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [pairCount, setPairCount] = useState<6 | 8>(6);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter ideograms by category if selected
  const availableIdeograms = React.useMemo(() => {
    if (selectedCategory === 'all') return ideograms;
    return ideograms.filter((i) => i.category === selectedCategory);
  }, [ideograms, selectedCategory]);

  // Initialize or reset game
  const initGame = () => {
    const pool = availableIdeograms.length >= pairCount ? availableIdeograms : ideograms;
    if (pool.length === 0) return;

    // Pick random unique ideograms for pairs
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, pairCount);

    const deck: CardItem[] = [];

    shuffled.forEach((item) => {
      // Card 1: Hanzi Ideogram
      deck.push({
        id: `${item.id}-char`,
        charId: item.id,
        type: 'char',
        char: item.char,
        pinyin: item.pinyin,
        meaning: item.meaning,
        isFlipped: false,
        isMatched: false,
      });

      // Card 2: Meaning & Pinyin
      deck.push({
        id: `${item.id}-meaning`,
        charId: item.id,
        type: 'meaning',
        char: item.char,
        pinyin: item.pinyin,
        meaning: item.meaning,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    setCards(deck.sort(() => 0.5 - Math.random()));
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsLocked(false);
  };

  useEffect(() => {
    initGame();
  }, [availableIdeograms, pairCount]);

  const handleCardClick = (card: CardItem) => {
    if (isLocked || card.isFlipped || card.isMatched) return;

    // Flip the clicked card
    const updatedCards = cards.map((c) =>
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      setIsLocked(true);

      const [first, second] = newFlipped;
      if (first.charId === second.charId) {
        // Matched!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.charId === first.charId ? { ...c, isMatched: true, isFlipped: true } : c
            )
          );
          setMatches((prev) => prev + 1);
          setFlippedCards([]);
          setIsLocked(false);

          // Pronounce character
          speakChinese(first.char);
        }, 500);
      } else {
        // Not matched, flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first.id || c.id === second.id ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
          setIsLocked(false);
        }, 1200);
      }
    }
  };

  const isWon = matches === pairCount && pairCount > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Game status & controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <span>🃏</span> Memory degli Ideogrammi
            </h2>
            <p className="text-xs text-stone-500">
              Abbina l'ideogramma Hanzi alla sua tessera con Pinyin ben visibile e significato
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setPairCount(6)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  pairCount === 6 ? 'bg-red-700 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                6 Coppie
              </button>
              <button
                onClick={() => setPairCount(8)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  pairCount === 8 ? 'bg-red-700 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                8 Coppie
              </button>
            </div>

            <button
              onClick={initGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition"
              title="Ricomincia partita"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>Riavvia</span>
            </button>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-stone-500">Mosse:</span>
            <span className="font-mono text-sm text-stone-900">{moves}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-500">Coppie Trovate:</span>
            <span className="font-mono text-sm text-red-700 font-extrabold">
              {matches} / {pairCount}
            </span>
          </div>

          <div className="text-stone-400 font-normal">
            Clicca per ascoltare la pronuncia!
          </div>
        </div>
      </div>

      {/* Grid of memory cards */}
      <div
        className={`grid gap-3 sm:gap-4 ${
          pairCount === 6
            ? 'grid-cols-3 sm:grid-cols-4'
            : 'grid-cols-4 sm:grid-cols-4'
        }`}
      >
        {cards.map((card) => {
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={card.isMatched || card.isFlipped || isLocked}
              className={`min-h-[120px] sm:min-h-[135px] rounded-2xl p-3 font-bold transition-all transform duration-300 relative select-none flex flex-col items-center justify-center cursor-pointer ${
                card.isMatched
                  ? 'bg-emerald-50/90 border-2 border-emerald-500 shadow-sm cursor-default scale-95'
                  : card.isFlipped
                  ? 'bg-white border-2 border-red-600 shadow-md ring-2 ring-red-100'
                  : 'bg-gradient-to-br from-red-800 via-red-900 to-amber-900 hover:from-red-900 hover:to-amber-950 border-2 border-amber-500/30 text-amber-100 shadow-md hover:-translate-y-1'
              }`}
            >
              {card.isFlipped || card.isMatched ? (
                card.type === 'char' ? (
                  /* Hanzi Character Card */
                  <div className="flex flex-col items-center justify-center space-y-1 w-full text-center">
                    <span className="text-4xl sm:text-5xl font-serif font-black text-stone-900 block">
                      {card.char}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                      Ideogramma
                    </span>
                    {card.isMatched && (
                      <span className="text-xs font-mono font-bold text-emerald-700 mt-0.5">
                        {card.pinyin}
                      </span>
                    )}
                  </div>
                ) : (
                  /* Meaning & High-Visibility Pinyin Card */
                  <div className="flex flex-col items-center justify-center w-full text-center space-y-1.5">
                    {/* High-visibility prominent Pinyin badge */}
                    <div className="px-2.5 py-1 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-lg shadow-sm">
                      <span className="text-sm sm:text-base font-mono font-black tracking-wide leading-none">
                        {card.pinyin}
                      </span>
                    </div>

                    {/* Clear Italian Meaning */}
                    <span className="text-xs sm:text-sm font-extrabold text-stone-900 capitalize block px-1 leading-snug line-clamp-2">
                      {card.meaning}
                    </span>

                    <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">
                      Significato
                    </span>
                  </div>
                )
              ) : (
                /* Card Back */
                <div className="flex flex-col items-center justify-center text-center space-y-1">
                  <span className="text-3xl sm:text-4xl font-serif text-amber-300 opacity-70">
                    字
                  </span>
                  <span className="text-[10px] text-amber-200/90 uppercase tracking-widest font-mono font-bold">
                    Hanzi
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Victory Celebration */}
      {isWon && (
        <div className="bg-emerald-50 border-2 border-emerald-400 p-6 sm:p-8 rounded-3xl text-center space-y-4 animate-fade-in shadow-xl">
          <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Award className="w-9 h-9" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-emerald-950">
              Vittoria! Memoria impeccabile! 🎉
            </h3>
            <p className="text-sm text-emerald-800">
              Hai completato tutte le <strong>{pairCount} coppie</strong> in <strong>{moves} mosse</strong>!
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={initGame}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-95 inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Gioca un'altra partita
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
