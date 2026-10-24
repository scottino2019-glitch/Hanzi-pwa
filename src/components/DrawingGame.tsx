import React, { useRef, useState, useEffect } from 'react';
import { Ideogram } from '../types/ideogram';
import { speakChinese, getUserStats, saveUserStats } from '../services/dataService';
import {
  RotateCcw,
  Eye,
  ArrowRight,
  ArrowLeft,
  Volume2,
  CheckCircle2,
  Award,
  Sparkles,
  Palette,
  Undo2
} from 'lucide-react';

interface DrawingGameProps {
  ideograms: Ideogram[];
  activeIdeogram?: Ideogram;
  onSelectIdeogram?: (ideogram: Ideogram) => void;
}

export const DrawingGame: React.FC<DrawingGameProps> = ({
  ideograms,
  activeIdeogram,
  onSelectIdeogram,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const [brushColor, setBrushColor] = useState<'#dc2626' | '#1c1917'>('#dc2626'); // Red or Chinese ink black
  const [lineWidth, setLineWidth] = useState(8);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const [strokesCount, setStrokesCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; isSuccess: boolean } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync index when activeIdeogram prop changes
  useEffect(() => {
    if (activeIdeogram && ideograms.length > 0) {
      const idx = ideograms.findIndex((item) => item.id === activeIdeogram.id);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [activeIdeogram, ideograms]);

  const currentChar = ideograms[currentIndex] || ideograms[0];

  // Redraw canvas guidelines & ghost when character or guide toggle changes
  useEffect(() => {
    resetCanvas();
  }, [currentIndex, showGuide]);

  // Load stats on mount
  useEffect(() => {
    const stats = getUserStats();
    setCompletedCount(stats.completedDrawings || 0);
    if (stats.accuracyCount > 0) {
      setAccuracy(Math.round(stats.accuracySum / stats.accuracyCount));
    }
  }, []);

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  const drawBackgroundGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    // Calligraphy rice grid (米字格)
    ctx.save();
    ctx.strokeStyle = '#fee2e2'; // Light red/pink grid
    ctx.lineWidth = 1;

    // Outer border
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // Dashed center lines
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#fca5a5';

    // Horizontal center
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Vertical center
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Diagonals
    ctx.strokeStyle = '#fee2e2';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width, 0);
    ctx.lineTo(0, height);
    ctx.stroke();

    ctx.restore();

    // Transparent guide character if enabled
    if (showGuide && currentChar) {
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.font = '220px "Noto Serif SC", "STKaiti", "KaiTi", serif';
      ctx.fillStyle = '#44403c';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentChar.char, width / 2, height / 2 + 15);
      ctx.restore();
    }
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawBackgroundGrid(ctx, canvas.width, canvas.height);
    setStrokesCount(0);
    setStrokeHistory([]);
  };

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (!canvas || !ctx) return;

    // Save state before this stroke for undo
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory((prev) => [...prev.slice(-10), snapshot]);

    isDrawingRef.current = true;
    lastPosRef.current = getCanvasPos(e);
    setStrokesCount((prev) => prev + 1);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();

    const ctx = getCanvasContext();
    if (!ctx) return;

    const currentPos = getCanvasPos(e);

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    lastPosRef.current = currentPos;
  };

  const handleEnd = () => {
    isDrawingRef.current = false;
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (!canvas || !ctx || strokeHistory.length === 0) return;

    const previous = strokeHistory[strokeHistory.length - 1];
    ctx.putImageData(previous, 0, 0);
    setStrokeHistory((prev) => prev.slice(0, -1));
    setStrokesCount((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (!currentChar) return;

    // Calculate score based on expected strokes
    const expected = currentChar.strokesCount || 3;
    const strokeDiff = Math.abs(strokesCount - expected);
    const strokeAccuracy = Math.max(40, 100 - strokeDiff * 15);
    const hasDrawn = strokesCount > 0;
    const currentAcc = hasDrawn ? Math.min(100, strokeAccuracy) : 50;

    const newCompleted = completedCount + 1;
    setCompletedCount(newCompleted);

    // Save to local storage stats
    const stats = getUserStats();
    stats.completedDrawings = (stats.completedDrawings || 0) + 1;
    stats.accuracySum = (stats.accuracySum || 0) + currentAcc;
    stats.accuracyCount = (stats.accuracyCount || 0) + 1;
    if (!stats.learnedChars.includes(currentChar.char)) {
      stats.learnedChars.push(currentChar.char);
    }
    saveUserStats(stats);
    setAccuracy(Math.round(stats.accuracySum / stats.accuracyCount));

    // Show temporary feedback toast
    setFeedback({
      message: `Carattere ${currentChar.char} completato! Precisione: ${currentAcc}%`,
      isSuccess: currentAcc >= 70,
    });
    setTimeout(() => setFeedback(null), 3000);

    // Advance to next character
    const nextIdx = (currentIndex + 1) % ideograms.length;
    setCurrentIndex(nextIdx);
    if (onSelectIdeogram) {
      onSelectIdeogram(ideograms[nextIdx]);
    }
  };

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + ideograms.length) % ideograms.length;
    setCurrentIndex(prevIdx);
    if (onSelectIdeogram) {
      onSelectIdeogram(ideograms[prevIdx]);
    }
  };

  if (!currentChar) {
    return <div className="p-8 text-center text-stone-500">Nessun ideogramma disponibile per la pratica.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
        <div>
          <span className="text-xl sm:text-2xl font-black text-red-700 block">
            {completedCount}
          </span>
          <span className="text-[10px] sm:text-xs font-semibold uppercase text-stone-500 tracking-wider">
            Completati
          </span>
        </div>
        <div className="border-x border-stone-200">
          <span className="text-xl sm:text-2xl font-black text-amber-600 block">
            {accuracy}%
          </span>
          <span className="text-[10px] sm:text-xs font-semibold uppercase text-stone-500 tracking-wider">
            Precisione
          </span>
        </div>
        <div>
          <span className="text-xl sm:text-2xl font-black text-stone-800 block">
            {strokesCount} <span className="text-xs font-normal text-stone-400">/ {currentChar.strokesCount}</span>
          </span>
          <span className="text-[10px] sm:text-xs font-semibold uppercase text-stone-500 tracking-wider">
            Tratti Disegnati
          </span>
        </div>
      </div>

      {/* Main Practice Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-stone-200 shadow-xl flex flex-col items-center space-y-5 sm:space-y-6 max-w-full overflow-hidden">
        {/* Character selector dropdown & navigation */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition shrink-0"
              title="Ideogramma precedente"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <select
              value={currentIndex}
              onChange={(e) => {
                const idx = Number(e.target.value);
                setCurrentIndex(idx);
                if (onSelectIdeogram) onSelectIdeogram(ideograms[idx]);
              }}
              className="flex-1 sm:flex-initial max-w-[210px] sm:max-w-xs truncate px-2.5 sm:px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-semibold text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
            >
              {ideograms.map((item, idx) => (
                <option key={item.id} value={idx}>
                  {item.char} • {item.pinyin} ({item.meaning})
                </option>
              ))}
            </select>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition shrink-0"
              title="Ideogramma successivo"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => speakChinese(currentChar.char)}
            className="w-full sm:w-auto justify-center flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 font-semibold text-xs transition"
          >
            <Volume2 className="w-4 h-4 text-red-600 shrink-0" />
            <span>Pronuncia ({currentChar.pinyin})</span>
          </button>
        </div>

        {/* Character Title & Explanatory Banner */}
        <div className="text-center space-y-1 w-full px-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-red-700 font-serif">
              {currentChar.char}
            </span>
            <span className="text-lg sm:text-xl font-bold text-stone-700">
              = {currentChar.meaning}
            </span>
            <span className="text-sm sm:text-base font-semibold text-amber-600 font-mono">
              ({currentChar.pinyin})
            </span>
          </div>
          <p className="text-xs text-stone-500 max-w-md mx-auto line-clamp-3 sm:line-clamp-none">
            {currentChar.explanation}
          </p>
        </div>

        {/* The Interactive Calligraphy Canvas */}
        <div className="relative max-w-full flex justify-center overflow-hidden p-1">
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            className="touch-none rounded-2xl bg-white shadow-inner cursor-crosshair border-2 border-red-800/40 w-[260px] h-[260px] xs:w-[280px] xs:h-[280px] sm:w-[320px] sm:h-[320px] max-w-[calc(100vw-3.5rem)] max-h-[calc(100vw-3.5rem)]"
          />

          {/* Quick Floating Guide Badge */}
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-stone-900/60 backdrop-blur-sm text-[10px] text-white font-mono pointer-events-none">
            {currentChar.strokesCount} Tratti attesi
          </div>
        </div>

        {/* Canvas Toolbar & Options */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full">
          {/* Guide toggle button */}
          <button
            onClick={() => setShowGuide(!showGuide)}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition ${
              showGuide
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span>{showGuide ? 'Nascondi' : 'Mostra Guida'}</span>
          </button>

          {/* Undo button */}
          <button
            onClick={handleUndo}
            disabled={strokeHistory.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="Annulla ultimo tratto"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Annulla</span>
          </button>

          {/* Clear canvas button */}
          <button
            onClick={resetCanvas}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>Pulisci</span>
          </button>

          {/* Brush color selector */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200">
            <button
              onClick={() => setBrushColor('#dc2626')}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-red-600 transition ${
                brushColor === '#dc2626' ? 'ring-2 ring-red-800 scale-110 shadow-sm' : 'opacity-60'
              }`}
              title="Inchiostro cinabro rosso"
            />
            <button
              onClick={() => setBrushColor('#1c1917')}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-stone-900 transition ${
                brushColor === '#1c1917' ? 'ring-2 ring-stone-950 scale-110 shadow-sm' : 'opacity-60'
              }`}
              title="Inchiostro nero tradizionale"
            />
          </div>

          {/* Complete & Next Button */}
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95"
          >
            <span>Verifica & Prossimo</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Etymological context card */}
        <div className="w-full bg-stone-50 border border-stone-200 p-4 rounded-2xl text-xs text-stone-600 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-stone-800">Radicale e composizione: </strong>
            Radicale: <span className="font-mono text-red-700 font-bold">{currentChar.radical}</span> • Categoria: <span className="capitalize">{currentChar.category}</span>.
            <div className="mt-1 text-stone-500">
              {currentChar.mnemonic}
            </div>
          </div>
        </div>
      </div>

      {/* Floating feedback message */}
      {feedback && (
        <div
          className={`fixed bottom-8 right-8 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white transition-all transform animate-bounce ${
            feedback.isSuccess ? 'bg-emerald-600' : 'bg-amber-600'
          }`}
        >
          <Award className="w-5 h-5" />
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
};
