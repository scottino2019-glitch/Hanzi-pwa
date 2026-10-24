import React, { useState } from 'react';
import { Category, Ideogram } from '../types/ideogram';
import { X, Plus, Copy, Check, Sparkles, BookOpen, FileCode, CheckCircle2 } from 'lucide-react';

interface AddIdeogramModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddNewIdeogram: (newItem: Ideogram, newCat?: Category) => void;
}

export const AddIdeogramModal: React.FC<AddIdeogramModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddNewIdeogram,
}) => {
  const [char, setChar] = useState('');
  const [pinyin, setPinyin] = useState('');
  const [meaning, setMeaning] = useState('');
  const [category, setCategory] = useState(categories[1]?.id || 'natura');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('🔖');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [radical, setRadical] = useState('');
  const [strokesCount, setStrokesCount] = useState<number>(3);
  const [copied, setCopied] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!isOpen) return null;

  const effectiveCategoryId = isCustomCategory
    ? newCategoryName.toLowerCase().replace(/\s+/g, '_')
    : category;

  const generatedId = pinyin
    ? pinyin.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
    : 'char_' + Date.now();

  const generatedJson = {
    id: generatedId || 'nuovo_carattere',
    char: char || '字',
    pinyin: pinyin || 'pīnyīn',
    meaning: meaning || 'significato in italiano',
    category: effectiveCategoryId,
    explanation: explanation || 'Spiegazione etimologica e pittografica dell\'ideogramma.',
    mnemonic: mnemonic || 'Suggerimento mnemonico per memorizzarlo facilmente.',
    radical: radical || char || 'Radicale',
    strokesCount: Number(strokesCount) || 3,
    level: 1,
    strokes: [
      'M60 100 L240 100',
      'M150 50 L150 250'
    ],
    words: [
      {
        hanzi: char ? char + char : '字词',
        pinyin: pinyin ? `${pinyin}${pinyin}` : 'zìcí',
        translation: 'esempio parola composta'
      }
    ]
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddToSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!char.trim() || !pinyin.trim() || !meaning.trim()) return;

    let newCatObj: Category | undefined = undefined;
    if (isCustomCategory && newCategoryName.trim()) {
      newCatObj = {
        id: effectiveCategoryId,
        name: newCategoryName.trim(),
        icon: newCategoryIcon || '🔖',
        description: `Categoria personalizzata: ${newCategoryName}`,
        color: 'from-amber-600 to-red-600'
      };
    }

    onAddNewIdeogram(generatedJson, newCatObj);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-800 to-amber-700 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg font-bold">
              ➕
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Come Aggiungere Altri Ideogrammi & Categorie
              </h3>
              <p className="text-xs text-amber-200">
                Guida rapida e generatore di codice JSON pronto all'uso
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Quick Explanation Banner */}
          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl text-xs sm:text-sm text-stone-700 space-y-2">
            <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-amber-600" />
              Dove risiedono i dati:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-stone-600">
              <li>
                <strong>Per aggiungere o modificare caratteri:</strong> modifica il file <code className="bg-amber-200/60 px-1.5 py-0.5 rounded text-red-900 font-mono font-bold">public/data/ideograms.json</code>.
              </li>
              <li>
                <strong>Per aggiungere nuove categorie:</strong> aggiungi un nuovo oggetto con <code className="font-mono">id</code>, <code className="font-mono">name</code> e <code className="font-mono">icon</code> in <code className="bg-amber-200/60 px-1.5 py-0.5 rounded text-red-900 font-mono font-bold">public/data/categories.json</code>.
              </li>
              <li>
                <strong>Integrazione immediata:</strong> L'app ricalcola automaticamente i filtri, i conteggi, le barre di ricerca e i giochi senza bisogno di ricompilare!
              </li>
            </ul>
          </div>

          {/* Interactive Form */}
          <form onSubmit={handleAddToSession} className="space-y-4">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Compila il nuovo ideogramma per generare il JSON:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Ideogramma (Hanzi) *
                </label>
                <input
                  type="text"
                  value={char}
                  onChange={(e) => setChar(e.target.value)}
                  placeholder="es. 金"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-lg font-serif font-bold text-center text-red-700 focus:ring-2 focus:ring-red-600 focus:outline-none bg-stone-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Pinyin con toni *
                </label>
                <input
                  type="text"
                  value={pinyin}
                  onChange={(e) => setPinyin(e.target.value)}
                  placeholder="es. jīn"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm font-mono font-bold text-amber-700 focus:ring-2 focus:ring-red-600 focus:outline-none bg-stone-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Significato in Italiano *
                </label>
                <input
                  type="text"
                  value={meaning}
                  onChange={(e) => setMeaning(e.target.value)}
                  placeholder="es. oro / metallo"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm font-bold text-stone-800 focus:ring-2 focus:ring-red-600 focus:outline-none bg-stone-50"
                  required
                />
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700">
                  Categoria di Appartenenza
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="text-xs text-red-700 hover:text-red-800 font-semibold underline"
                >
                  {isCustomCategory ? 'Scegli categoria esistente' : '+ Crea nuova categoria'}
                </button>
              </div>

              {!isCustomCategory ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 bg-stone-50 focus:ring-2 focus:ring-red-600 focus:outline-none"
                >
                  {categories.filter((c) => c.id !== 'tutti').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name} ({c.id})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                    placeholder="Emoji (es. 🏆)"
                    className="px-3 py-2 border border-stone-300 rounded-xl text-center text-sm font-bold bg-stone-50"
                  />
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nome nuova categoria (es. Metalli)"
                    className="col-span-2 px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold bg-stone-50"
                    required
                  />
                </div>
              )}
            </div>

            {/* Explanation & Mnemonic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Spiegazione & Origine etimologica
                </label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Rappresenta pepite d'oro scoperte sotto la superficie della terra..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-800 bg-stone-50 focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Trucco mnemonico
                </label>
                <textarea
                  rows={2}
                  value={mnemonic}
                  onChange={(e) => setMnemonic(e.target.value)}
                  placeholder="Immagina le pepite scintillanti racchiuse sotto un tetto protettivo."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-800 bg-stone-50 focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Radicale principale
                </label>
                <input
                  type="text"
                  value={radical}
                  onChange={(e) => setRadical(e.target.value)}
                  placeholder="es. 金"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Numero di Tratti
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={strokesCount}
                  onChange={(e) => setStrokesCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 bg-stone-50"
                />
              </div>
            </div>

            {/* Generated JSON Output Box */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-stone-500" />
                  Snippet JSON generato per <code className="text-red-700 font-mono">public/data/ideograms.json</code>:
                </span>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiato!' : 'Copia Codice'}</span>
                </button>
              </div>

              <pre className="p-3 bg-stone-900 text-amber-300 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40 leading-relaxed border border-stone-800">
                {JSON.stringify(generatedJson, null, 2)}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-200">
              <span className="text-[11px] text-stone-500">
                Puoi copiare il codice sopra oppure aggiungerlo subito alla sessione attuale.
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                {addedSuccess ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4" />}
                <span>{addedSuccess ? 'Aggiunto con successo!' : 'Aggiungi alla Sessione'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
