import React, { useState, useEffect } from 'react';
import { ExternalGame } from '../types/externalGame';
import { ViewTab } from '../types/ideogram';
import {
  Gamepad2,
  Play,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  PlusCircle,
  HelpCircle,
  FolderPlus,
  X,
  Maximize2,
  RefreshCw,
  Sparkles,
  Zap,
  Brain,
  Grid,
  PenTool
} from 'lucide-react';

interface GamesHubProps {
  externalGames: ExternalGame[];
  onNavigateTab: (tab: ViewTab) => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({ externalGames, onNavigateTab }) => {
  const [activeExternalGame, setActiveExternalGame] = useState<ExternalGame | null>(null);
  const [customPath, setCustomPath] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Listen for close message from inside iframe
  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data === 'close_external_game') {
        setActiveExternalGame(null);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  const handleLaunchCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPath.trim()) return;

    let path = customPath.trim();
    if (!path.startsWith('/')) path = '/' + path;

    const customGame: ExternalGame = {
      id: 'custom-' + Date.now(),
      title: customTitle.trim() || 'Mini-Gioco Locale',
      description: `Eseguito dal percorso locale: ${path}`,
      icon: '🎮',
      path,
      type: 'external_html',
      author: 'File Locale',
      tags: ['Personalizzato', 'HTML5']
    };

    setActiveExternalGame(customGame);
  };

  // If an external game is running, render it INLINE directly under the main header menu!
  if (activeExternalGame) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 animate-fade-in">
        {/* In-page Game Control Bar */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setActiveExternalGame(null)}
              className="flex items-center gap-2 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-stone-600" />
              <span>Torna alla Sala Giochi</span>
            </button>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900 flex items-center gap-2 truncate">
                <span className="text-xl shrink-0">{activeExternalGame.icon}</span>
                <span className="truncate">{activeExternalGame.title}</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition"
              title="Ricomincia o ricarica il gioco"
            >
              <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
              <span>Riavvia</span>
            </button>
            <a
              href={activeExternalGame.path}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition"
              title="Apri a schermo intero in una nuova finestra"
            >
              <Maximize2 className="w-3.5 h-3.5 text-stone-500" />
              <span>Nuova Scheda</span>
            </a>
          </div>
        </div>

        {/* Embedded Game Frame - Warm white/stone matching app, generous height */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-md overflow-hidden w-full min-h-[720px] sm:min-h-[780px] h-[82vh]">
          <iframe
            key={iframeKey}
            src={activeExternalGame.path}
            className="w-full h-full border-none block bg-stone-50"
            title={activeExternalGame.title}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-red-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-700/60 rounded-full text-xs font-semibold text-amber-300 border border-red-500/40">
            <Gamepad2 className="w-4 h-4" /> Sala Giochi & Moduli Esterni
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Impara Giocando con Hanzi
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
            Scegli tra i giochi integrati o sperimenta mini-giochi HTML5 caricati direttamente dalla cartella <code className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300 font-mono text-xs">public/</code>.
          </p>
        </div>

        <button
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600 text-xs font-semibold transition"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Come aggiungere giochi</span>
        </button>
      </div>

      {/* Guide Section (collapsible) */}
      {showGuide && (
        <div className="bg-amber-50 border-2 border-amber-300/80 p-5 sm:p-6 rounded-2xl text-stone-800 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-amber-950 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-amber-700" />
              Guida: Come aggiungere nuovi giochi esterni nella cartella <code className="bg-amber-200/80 px-2 py-0.5 rounded text-xs font-mono">public/</code>
            </h3>
            <button
              onClick={() => setShowGuide(false)}
              className="text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-stone-700 pt-1">
            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs space-y-1.5">
              <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs">
                1
              </div>
              <strong className="block text-stone-900 text-sm">Copia i file del gioco</strong>
              <p>
                Crea una cartella dentro <code className="text-red-700 font-mono font-bold">public/games/tuo-gioco/</code> e inserisci il file HTML5 (es. <code className="text-stone-900 font-mono">index.html</code>) con immagini, CSS e JS.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs space-y-1.5">
              <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs">
                2
              </div>
              <strong className="block text-stone-900 text-sm">Registra nel file JSON</strong>
              <p>
                Apri <code className="text-red-700 font-mono font-bold">public/data/external-games.json</code> e aggiungi il titolo, l'icona e il percorso <code className="text-stone-900 font-mono">/games/tuo-gioco/index.html</code>.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs space-y-1.5">
              <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs">
                3
              </div>
              <strong className="block text-stone-900 text-sm">Offline automatico!</strong>
              <p>
                Il Service Worker della PWA mette automaticamente in cache i file JSON e gli asset in <code className="font-mono">public/</code>, permettendo al tuo gioco di funzionare anche senza internet!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Games Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider">
          Tutti i Giochi Disponibili
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card: Quiz Indovina (Built-in) */}
          <div
            onClick={() => onNavigateTab('quiz')}
            className="group bg-white p-6 rounded-2xl border border-stone-200 hover:border-red-600 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-700">
                  <Brain className="w-6 h-6" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                  Integrato
                </span>
              </div>
              <h4 className="text-lg font-bold text-stone-900 group-hover:text-red-700 transition">
                Indovina l'Ideogramma
              </h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Quiz a scelta multipla con serie di risposte consecutive e pronuncia vocale per testare la tua memoria.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-red-700">
              <span>Gioca adesso</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card: Memory Game (Built-in with enhanced Pinyin) */}
          <div
            onClick={() => onNavigateTab('memory')}
            className="group bg-white p-6 rounded-2xl border border-stone-200 hover:border-red-600 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <Grid className="w-6 h-6" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  Pinyin Rinnovato
                </span>
              </div>
              <h4 className="text-lg font-bold text-stone-900 group-hover:text-red-700 transition">
                Memory degli Ideogrammi
              </h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Tessere 3D con Pinyin ingrandito ad alto contrasto per abbinare caratteri e traduzioni con conteggio mosse.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-red-700">
              <span>Gioca adesso</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card: Pratica Calligrafica Canvas (Built-in) */}
          <div
            onClick={() => onNavigateTab('disegno')}
            className="group bg-white p-6 rounded-2xl border border-stone-200 hover:border-red-600 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
                  <PenTool className="w-6 h-6" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                  Canvas
                </span>
              </div>
              <h4 className="text-lg font-bold text-stone-900 group-hover:text-red-700 transition">
                Pratica Tratti (Mi Zi Ge)
              </h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Scrivi gli ideogrammi sul quaderno a stella di riso con guida semitrasparente, inchiostri e calcolo precisione.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-red-700">
              <span>Apri Lavagna</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* External HTML5 Games from public/ */}
          {externalGames.map((game) => (
            <div
              key={game.id}
              onClick={() => setActiveExternalGame(game)}
              className="group bg-white p-6 rounded-2xl border border-stone-200 hover:border-red-600 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-2xl shadow-inner">
                    {game.icon}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                    File in public/
                  </span>
                </div>
                <h4 className="text-lg font-bold text-stone-900 group-hover:text-red-700 transition flex items-center gap-1.5">
                  <span>{game.title}</span>
                </h4>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  {game.description}
                </p>

                {game.tags && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {game.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-purple-700">
                <span className="flex items-center gap-1">
                  <Play className="w-3.5 h-3.5 fill-current" /> Avvia Gioco Esterno
                </span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Launch Custom Local Game Tool */}
      <div className="bg-stone-50 border border-stone-200 p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <h4 className="text-sm font-bold text-stone-900">
            Avvia un gioco personalizzato presente in <code className="font-mono text-red-700">public/</code>
          </h4>
        </div>
        <p className="text-xs text-stone-500">
          Hai inserito un nuovo file HTML o un gioco nella cartella <code className="font-mono text-stone-800">public/</code>? Inserisci il percorso qui sotto per provarlo subito senza riavviare!
        </p>

        <form onSubmit={handleLaunchCustom} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Nome gioco (opzionale)"
            className="sm:w-1/3 px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none"
          />
          <input
            type="text"
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            placeholder="Percorso (es. /games/speed-reflex/index.html o /assets/aistudio/...)"
            className="flex-1 px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none font-mono"
            required
          />
          <button
            type="submit"
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Avvia</span>
          </button>
        </form>
      </div>
    </div>
  );
};
