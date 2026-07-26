import React, { useState } from 'react';
import { Wifi, ShieldAlert, ArrowRight } from 'lucide-react';
import WifiHotspotSimulator from './WifiHotspotSimulator';
import PiholeSimulator from './PiholeSimulator';

export default function NetworkSecurityLab() {
  const [activeTab, setActiveTab] = useState<'hotspot' | 'pihole'>('hotspot');
  const [isHotspotRunning, setIsHotspotRunning] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* TABS NAVIGATION & ACTIONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full p-2 bg-white dark:bg-zinc-900/50 border border-slate-400 dark:border-zinc-800/80 rounded-xl shadow-sm gap-4 sm:gap-0">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('hotspot')}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs font-bold transition-all ${
              activeTab === 'hotspot'
                ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-700 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-zinc-50 dark:bg-zinc-950/30'
            }`}
          >
            <Wifi className="h-4 w-4" /> 1. Wi Hotspot (Crear AP)
          </button>
          
          <button
            onClick={() => setActiveTab('pihole')}
            disabled={!isHotspotRunning && activeTab !== 'pihole'}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs font-bold transition-all ${
              activeTab === 'pihole'
                ? 'bg-emerald-50 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400'
                : !isHotspotRunning
                ? 'opacity-50 cursor-not-allowed text-slate-600 dark:text-zinc-600'
                : 'text-slate-700 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-zinc-50 dark:bg-zinc-950/30'
            }`}
          >
            <ShieldAlert className="h-4 w-4" /> 2. Servidor DNS Sinkhole (Pi-hole)
          </button>
        </div>
        
        {/* Sequential Next Step Button */}
        {activeTab === 'hotspot' && isHotspotRunning && (
          <button
            onClick={() => setActiveTab('pihole')}
            className="flex flex-wrap items-center gap-2 px-5 py-2 rounded-md text-xs font-black bg-emerald-50 dark:bg-emerald-950/300 hover:bg-emerald-600 text-white transition-all shadow-md animate-in slide-in-from-right-4 fade-in duration-300"
          >
            Continuar al Paso 2 <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div className="mt-6">
        {activeTab === 'hotspot' && (
          <WifiHotspotSimulator onRunningChange={setIsHotspotRunning} />
        )}
        {activeTab === 'pihole' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PiholeSimulator />
          </div>
        )}
      </div>
    </div>
  );
}
