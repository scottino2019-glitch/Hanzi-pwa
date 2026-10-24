import React, { useState, useMemo } from 'react';
import { Ideogram, Category } from '../types/ideogram';
import { searchIdeograms, speakChinese } from '../services/dataService';
import { Search, X, Volume2, Heart, PenTool, Sparkles, Filter, ChevronRight, Layers, Plus } from 'lucide-react';

interface CatalogViewProps {
  ideograms: Ideogram[];
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  favorites: string[];
  onToggleFavorite: (charId: string) => void;
  onOpenDetail: (ideogram: Ideogram) => void;
  onPractice: (ideogram: Ideogram) => void;
  filterFavoritesOnly?: boolean;
  onOpenAddModal?: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  ideograms,
  categories,
  selectedCategory,
  onSelectCategory,
  favorites,
  onToggleFavorite,
  onOpenDetail,
  onPractice,
  filterFavoritesOnly = false,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');

  // Filter ideograms based on search, category, level, and favorites
  const filteredIdeograms = useMemo(() => {
    let list = ideograms;
    if (filterFavoritesOnly) {
      list = list.filter((item) => favorites.includes(item.id));
    }
    return searchIdeograms(list, searchQuery, selectedCategory, levelFilter);
  }, [ideograms, searchQuery, selectedCategory, levelFilter, filterFavoritesOnly, favorites]);

  // Compute category count map
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { tutti: ideograms.length };
    for (const item of ideograms) {
      map[item.category] = (map[item.category] || 0) + 1;
    }
    return map;
  }, [ideograms]);

  return (
    <div className="space-y-6">
      {/* Quick Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ricerca rapida: es. 'tè', 'sole', 'rén', 'montagna', 'pioggia'..."
              className="w-full pl-10 pr-9 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-stone-900 placeholder:text-stone-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                title="Cancella ricerca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Level Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-stone-500 font-medium flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Livello:
              </span>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="py-1.5 px-2.5 rounded-lg border border-stone-300 bg-stone-50 font-medium text-stone-700 focus:ring-2 focus:ring-red-600 focus:outline-none"
              >
                <option value="all">Tutti i Livelli</option>
                <option value="1">Base (Livello 1)</option>
                <option value="2">Intermedio (Livello 2)</option>
              </select>
            </div>

            {/* Add / Guide Button */}
            {onOpenAddModal && !filterFavoritesOnly && (
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs transition active:scale-95"
                title="Aggiungi altri caratteri o categorie"
              >
                <Plus className="w-3.5 h-3.5 text-amber-700" />
                <span>+ Aggiungi Caratteri</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Pills */}
        {!filterFavoritesOnly && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1 scroll-smooth touch-pan-x -mx-1 px-1">
            {categories.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none shrink-0 ${
                    isSelected
                      ? 'bg-red-700 text-white shadow-sm ring-1 ring-red-500/40'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200/80 active:bg-stone-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] shrink-0 ${
                      isSelected ? 'bg-red-800 text-amber-200' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          Visualizzando <strong>{filteredIdeograms.length}</strong> ideogrammi
          {filterFavoritesOnly ? ' tra i preferiti' : ''}
          {searchQuery ? ` per "${searchQuery}"` : ''}
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-red-700 font-semibold hover:underline"
          >
            Azzera ricerca
          </button>
        )}
      </div>

      {/* Grid of Ideograms */}
      {filteredIdeograms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeograms.map((item) => {
            const isFav = favorites.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => onOpenDetail(item)}
                className="group relative bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md hover:border-red-500 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top card row: Category & Favorite toggle */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-stone-100 text-stone-600 rounded-md">
                      {item.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item.id);
                      }}
                      className={`p-1.5 rounded-lg transition ${
                        isFav ? 'text-amber-500 hover:text-amber-600' : 'text-stone-300 hover:text-amber-400'
                      }`}
                      title={isFav ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Character presentation */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center group-hover:border-red-600/50 group-hover:bg-red-50/30 transition-colors shadow-inner flex-shrink-0">
                      <span className="text-4xl font-serif font-black text-stone-900 group-hover:scale-105 transition-transform">
                        {item.char}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-700 font-mono">
                          {item.pinyin}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakChinese(item.char);
                          }}
                          className="p-1 text-stone-400 hover:text-red-700 rounded-md transition"
                          title="Ascolta pronuncia"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-stone-900 capitalize truncate">
                        {item.meaning}
                      </h4>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-400">
                        <span>{item.strokesCount} tratti</span>
                        <span>•</span>
                        <span>Radicale: {item.radical}</span>
                      </div>
                    </div>
                  </div>

                  {/* Short Explanation */}
                  <p className="mt-3 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {item.explanation}
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPractice(item);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-800 p-1 rounded-md"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Disegna</span>
                  </button>

                  <span className="flex items-center text-xs font-semibold text-stone-400 group-hover:text-red-600 transition-colors">
                    Dettagli ed Etimologia
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl p-10 text-center space-y-3 border border-stone-200">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-xl">
            🔍
          </div>
          <h3 className="text-base font-bold text-stone-800">Nessun ideogramma trovato</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Nessun risultato corrisponde ai criteri di ricerca selezionati. Prova a rimuovere i filtri o cercare un altro termine.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              onSelectCategory('tutti');
              setLevelFilter('all');
            }}
            className="px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-semibold hover:bg-red-800 transition"
          >
            Mostra tutti gli ideogrammi
          </button>
        </div>
      )}
    </div>
  );
};
