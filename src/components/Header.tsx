import React from 'react';
import { ViewTab } from '../types/ideogram';
import { PWAInstallButton } from './PWAInstallButton';
import { BookOpen, PenTool, Brain, Grid, Heart, Sparkles, Gamepad2 } from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  totalCount: number;
  favoritesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  totalCount,
  favoritesCount,
}) => {
  const tabs = [
    { id: 'catalogo', label: 'Dizionario', icon: BookOpen },
    { id: 'disegno', label: 'Pratica Tratti', icon: PenTool },
    { id: 'quiz', label: 'Indovina', icon: Brain },
    { id: 'memory', label: 'Memory', icon: Grid },
    { id: 'giochi', label: 'Sala Giochi', icon: Gamepad2 },
    {
      id: 'preferiti',
      label: `Preferiti (${favoritesCount})`,
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
    },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md text-stone-100 border-b border-stone-800 shadow-lg">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        {/* Top bar with branding, stats & install button */}
        <div className="flex items-center justify-between gap-2 pb-2 sm:pb-3 border-b border-stone-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white font-serif font-black text-lg sm:text-xl shadow-md shadow-red-950/50 border border-red-500/30 shrink-0">
              漢
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-1 truncate">
                  Hanzi<span className="text-amber-400">PWA</span>
                </h1>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold bg-red-900/60 text-red-300 rounded border border-red-700/50 shrink-0">
                  Offline
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400 truncate hidden xs:block">
                {totalCount} ideogrammi cinesi • Classificati & Ricercabili
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />
          </div>
        </div>

        {/* Tab navigation with horizontal scroll and shrink-0 items */}
        <div className="relative">
          <nav className="flex items-center justify-start sm:justify-center gap-1.5 pt-2 sm:pt-2.5 overflow-x-auto no-scrollbar scroll-smooth px-1 py-0.5 -mx-2 sm:mx-0 touch-pan-x">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as ViewTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap select-none shrink-0 ${
                    isActive
                      ? 'bg-red-700 text-white shadow-md shadow-red-900/40 font-semibold ring-1 ring-red-500/40'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/80 active:bg-stone-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-stone-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
