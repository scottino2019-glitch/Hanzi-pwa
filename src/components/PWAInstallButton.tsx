import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running as an installed PWA, hide the button or show a subtle badge
  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-800 bg-emerald-100 rounded-full border border-emerald-200">
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        PWA Attiva
      </span>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <>
        <button
          onClick={async () => {
            const ok = await install();
            if (ok) setInstallSuccess(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:from-red-700 hover:to-amber-700 transition active:scale-95"
          title="Installa Hanzi come applicazione sul tuo dispositivo"
        >
          <Download className="w-4 h-4" />
          <span>Installa App</span>
        </button>
        {installSuccess && (
          <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 text-sm">
            <Check className="w-4 h-4" /> Installazione completata!
          </div>
        )}
      </>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/80 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100 transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-red-600" />
          <span>Installa su iPhone/iPad</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    字
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900">Installa Hanzi su iOS</h3>
                    <p className="text-xs text-stone-500">Per usarla a schermo intero offline</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-stone-400 hover:text-stone-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-stone-600 bg-stone-50 p-4 rounded-xl border border-stone-100">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs">1</span>
                  <span>Premi il pulsante <strong>Condividi</strong> <span className="inline-block px-1.5 py-0.5 bg-stone-200 rounded text-stone-800 text-xs">⎋</span> nella barra inferiore di Safari.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs">2</span>
                  <span>Scorri verso il basso nel menu e tocca <strong>"Aggiungi alla schermata Home"</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs">3</span>
                  <span>Tocca <strong>Aggiungi</strong> in alto a destra. L'icona apparirà sulla schermata iniziale.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-red-700 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition"
              >
                Ho Capito
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
