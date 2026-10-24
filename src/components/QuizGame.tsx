import React, { useState, useEffect } from 'react';
import { Ideogram } from '../types/ideogram';
import { speakChinese, getUserStats, saveUserStats } from '../services/dataService';
import { Brain, Trophy, Flame, Volume2, ArrowRight, RotateCcw, Check, X } from 'lucide-react';

interface QuizGameProps {
  ideograms: Ideogram[];
}

export const QuizGame: React.FC<QuizGameProps> = ({ ideograms }) => {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [options, setOptions] = useState<Ideogram[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [mode, setMode] = useState<'char_from_meaning' | 'meaning_from_char'>('char_from_meaning');

  // Load saved streak
  useEffect(() => {
    const stats = getUserStats();
    setBestStreak(stats.bestStreak || 0);
  }, []);

  // Prepare a new question
  const prepareQuestion = (idx: number) => {
    if (ideograms.length === 0) return;
    const target = ideograms[idx % ideograms.length];

    // Pick 3 random distractors
    const others = ideograms.filter((item) => item.id !== target.id);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 3);

    // Shuffle target + distractors
    const roundOptions = [target, ...distractors].sort(() => 0.5 - Math.random());

    setOptions(roundOptions);
    setSelectedOptionId(null);
    setAnswered(false);
  };

  useEffect(() => {
    if (ideograms.length > 0) {
      prepareQuestion(currentQuestionIdx);
    }
  }, [currentQuestionIdx, ideograms, mode]);

  const targetChar = ideograms[currentQuestionIdx % ideograms.length];

  const handleSelect = (option: Ideogram) => {
    if (answered || !targetChar) return;

    setSelectedOptionId(option.id);
    setAnswered(true);

    const isCorrect = option.id === targetChar.id;

    if (isCorrect) {
      speakChinese(targetChar.char);
      const newScore = score + 10 + streak * 2;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);

      const stats = getUserStats();
      stats.quizScore = Math.max(stats.quizScore, newScore);
      if (newStreak > (stats.bestStreak || 0)) {
        stats.bestStreak = newStreak;
        setBestStreak(newStreak);
      }
      saveUserStats(stats);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setCurrentQuestionIdx((prev) => prev + 1);
  };

  const handleRestart = () => {
    setScore(0);
    setStreak(0);
    setCurrentQuestionIdx(0);
  };

  if (!targetChar || options.length === 0) {
    return <div className="p-8 text-center text-stone-500">Nessun ideogramma disponibile per il quiz.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quiz Header & Stats */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-700">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900">Indovina l'Ideogramma</h2>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <button
                onClick={() => setMode(mode === 'char_from_meaning' ? 'meaning_from_char' : 'char_from_meaning')}
                className="text-red-700 underline font-semibold hover:text-red-800"
              >
                {mode === 'char_from_meaning' ? 'Modalità: Significato ➔ Carattere' : 'Modalità: Carattere ➔ Significato'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div>
            <span className="text-xs font-semibold text-stone-400 block uppercase">Punteggio</span>
            <span className="text-lg font-black text-red-700">{score}</span>
          </div>
          <div className="border-l border-stone-200 pl-4 flex items-center gap-1.5">
            <Flame className={`w-5 h-5 ${streak > 0 ? 'text-amber-500 animate-pulse' : 'text-stone-300'}`} />
            <div>
              <span className="text-xs font-semibold text-stone-400 block uppercase">Serie</span>
              <span className="text-lg font-black text-amber-600">{streak}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl space-y-6 text-center">
        {mode === 'char_from_meaning' ? (
          /* Question: Meaning -> choose Character */
          <div className="space-y-3">
            <span className="px-3 py-1 bg-amber-100 text-amber-900 font-semibold rounded-full text-xs uppercase tracking-wider">
              {targetChar.category}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 capitalize">
              {targetChar.meaning}
            </h3>
            <div className="flex items-center justify-center gap-2">
              <span className="text-base font-medium text-stone-500 italic">
                Pinyin: <strong className="text-red-700 font-mono">{targetChar.pinyin}</strong>
              </span>
              <button
                onClick={() => speakChinese(targetChar.char)}
                className="p-1 text-stone-400 hover:text-red-700 rounded-lg transition"
                title="Ascolta pronuncia"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-stone-500 max-w-md mx-auto bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              💡 {targetChar.mnemonic}
            </p>
          </div>
        ) : (
          /* Question: Character -> choose Meaning */
          <div className="space-y-3">
            <span className="px-3 py-1 bg-red-100 text-red-800 font-semibold rounded-full text-xs uppercase tracking-wider">
              Qual è il significato?
            </span>
            <div className="w-28 h-28 mx-auto bg-stone-50 rounded-2xl border-2 border-red-800/40 flex items-center justify-center shadow-inner">
              <span className="text-6xl font-serif font-black text-stone-900">
                {targetChar.char}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-base font-semibold text-red-700 font-mono">
                {targetChar.pinyin}
              </span>
              <button
                onClick={() => speakChinese(targetChar.char)}
                className="p-1 text-stone-400 hover:text-red-700 rounded-lg transition"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 4 Options Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {options.map((option) => {
            const isCorrect = option.id === targetChar.id;
            const isSelected = selectedOptionId === option.id;

            let cardStyle = 'border-stone-200 bg-stone-50 hover:border-red-600 hover:bg-red-50/40 hover:-translate-y-0.5';

            if (answered) {
              if (isCorrect) {
                cardStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500 scale-[1.02] shadow-md';
              } else if (isSelected && !isCorrect) {
                cardStyle = 'border-red-500 bg-red-50 text-red-950 ring-2 ring-red-400 animate-shake';
              } else {
                cardStyle = 'border-stone-200 bg-stone-50/60 opacity-50';
              }
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                disabled={answered}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${cardStyle}`}
              >
                {mode === 'char_from_meaning' ? (
                  <>
                    <span className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 mb-1">
                      {option.char}
                    </span>
                    {answered && (
                      <span className="text-xs text-stone-500 font-medium">
                        {option.meaning}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-sm sm:text-base font-bold text-stone-900 capitalize">
                      {option.meaning}
                    </span>
                    <span className="text-xs text-red-700 font-mono mt-0.5">
                      {option.pinyin}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Post-answer feedback banner and Next Button */}
        {answered && (
          <div className="pt-4 space-y-4 animate-fade-in border-t border-stone-100">
            <div
              className={`p-4 rounded-2xl text-sm font-semibold flex items-center justify-between ${
                selectedOptionId === targetChar.id
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-red-100 text-red-900 border border-red-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {selectedOptionId === targetChar.id ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-700" />
                    <span>Esatto! Ottima risposta! (+{10 + (streak - 1) * 2} pt)</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-red-700" />
                    <span>
                      Non proprio! La risposta corretta era <strong>{targetChar.char}</strong> ({targetChar.meaning}).
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg transition active:scale-95 inline-flex items-center justify-center gap-2"
            >
              <span>Prossima Domanda</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
