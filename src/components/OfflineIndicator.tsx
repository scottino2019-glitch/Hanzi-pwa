import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-stone-900/95 backdrop-blur-md px-3.5 py-2 text-xs font-medium text-amber-300 shadow-xl border border-amber-500/30 animate-pulse"
    >
      <WifiOff className="w-4 h-4 text-amber-400" />
      <div className="flex flex-col">
        <span className="font-semibold text-white">Modalità Offline Attiva</span>
        <span className="text-[11px] text-stone-300 flex items-center gap-1">
          <Database className="w-3 h-3 text-amber-400 inline" /> Fogli JSON e dati locali operativi al 100%
        </span>
      </div>
    </div>
  );
};
