/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Ideogram, Category, ViewTab } from './types/ideogram';
import { ExternalGame } from './types/externalGame';
import {
  fetchCategories,
  fetchIdeograms,
  fetchExternalGames,
  getFavorites,
  toggleFavorite,
} from './services/dataService';
import { Header } from './components/Header';
import { CatalogView } from './components/CatalogView';
import { DrawingGame } from './components/DrawingGame';
import { QuizGame } from './components/QuizGame';
import { MemoryGame } from './components/MemoryGame';
import { GamesHub } from './components/GamesHub';
import { CharacterModal } from './components/CharacterModal';
import { AddIdeogramModal } from './components/AddIdeogramModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Loader2, BookOpen, PenTool, Brain, Grid, Heart, Sparkles, Gamepad2 } from 'lucide-react';

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [ideograms, setIdeograms] = useState<Ideogram[]>([]);
  const [externalGames, setExternalGames] = useState<ExternalGame[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('tutti');
  const [currentTab, setCurrentTab] = useState<ViewTab>('catalogo');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activePracticeIdeogram, setActivePracticeIdeogram] = useState<Ideogram | undefined>();
  const [modalIdeogram, setModalIdeogram] = useState<Ideogram | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load categories, ideograms, external games and favorites
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cats, chars, games] = await Promise.all([
          fetchCategories(),
          fetchIdeograms(),
          fetchExternalGames(),
        ]);
        setCategories(cats);
        setIdeograms(chars);
        setExternalGames(games);
        setFavorites(getFavorites());
      } catch (err) {
        console.error('Error loading JSON data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleToggleFavorite = (charId: string) => {
    const updated = toggleFavorite(charId);
    setFavorites(updated);
  };

  const handlePracticeCharacter = (item: Ideogram) => {
    setActivePracticeIdeogram(item);
    setCurrentTab('disegno');
  };

  const handleAddNewIdeogram = (newItem: Ideogram, newCat?: Category) => {
    if (newCat) {
      setCategories((prev) => {
        if (prev.some((c) => c.id === newCat.id)) return prev;
        return [...prev, newCat];
      });
    }
    setIdeograms((prev) => [newItem, ...prev]);
    try {
      const currentStored = localStorage.getItem('hanzipwa_ideograms_v1');
      const list = currentStored ? JSON.parse(currentStored) : ideograms;
      localStorage.setItem('hanzipwa_ideograms_v1', JSON.stringify([newItem, ...list]));
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans">
      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Main App Header with PWA install button & navigation */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        totalCount={ideograms.length}
        favoritesCount={favorites.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 overflow-x-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-8 h-8 text-red-700 animate-spin" />
            <p className="text-sm font-semibold text-stone-600">
              Caricamento ideogrammi dai fogli JSON locali...
            </p>
          </div>
        ) : (
          <>
            {/* View Tab: Catalogo & Ricerca Rapida */}
            {currentTab === 'catalogo' && (
              <CatalogView
                ideograms={ideograms}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onOpenDetail={(item) => setModalIdeogram(item)}
                onPractice={handlePracticeCharacter}
                onOpenAddModal={() => setShowAddModal(true)}
              />
            )}

            {/* View Tab: Pratica Disegno Tratti */}
            {currentTab === 'disegno' && (
              <DrawingGame
                ideograms={
                  selectedCategory !== 'tutti'
                    ? ideograms.filter((i) => i.category === selectedCategory)
                    : ideograms
                }
                activeIdeogram={activePracticeIdeogram}
                onSelectIdeogram={setActivePracticeIdeogram}
              />
            )}

            {/* View Tab: Quiz / Indovina */}
            {currentTab === 'quiz' && (
              <QuizGame
                ideograms={
                  selectedCategory !== 'tutti'
                    ? ideograms.filter((i) => i.category === selectedCategory)
                    : ideograms
                }
              />
            )}

            {/* View Tab: Memory Game */}
            {currentTab === 'memory' && (
              <MemoryGame
                ideograms={
                  selectedCategory !== 'tutti'
                    ? ideograms.filter((i) => i.category === selectedCategory)
                    : ideograms
                }
              />
            )}

            {/* View Tab: Sala Giochi (Interni & Moduli Esterni in public/) */}
            {currentTab === 'giochi' && (
              <GamesHub
                externalGames={externalGames}
                onNavigateTab={setCurrentTab}
              />
            )}

            {/* View Tab: Preferiti */}
            {currentTab === 'preferiti' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                      <Heart className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-stone-900">
                        I Tuoi Ideogrammi Preferiti
                      </h2>
                      <p className="text-xs text-stone-500">
                        Salvati localmente per la revisione rapida offline
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full">
                    {favorites.length} salvati
                  </span>
                </div>

                <CatalogView
                  ideograms={ideograms}
                  categories={categories}
                  selectedCategory="tutti"
                  onSelectCategory={() => {}}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenDetail={(item) => setModalIdeogram(item)}
                  onPractice={handlePracticeCharacter}
                  filterFavoritesOnly={true}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Full Etymological Details Modal */}
      <CharacterModal
        ideogram={modalIdeogram}
        onClose={() => setModalIdeogram(null)}
        isFavorite={modalIdeogram ? favorites.includes(modalIdeogram.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onPractice={handlePracticeCharacter}
      />

      {/* Add / Generator Modal */}
      <AddIdeogramModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        categories={categories}
        onAddNewIdeogram={handleAddNewIdeogram}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white/80 py-4 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HanziPWA 中国</span>
          <span className="text-stone-400">汉字专业版</span>
        </div>
      </footer>
    </div>
  );
}
