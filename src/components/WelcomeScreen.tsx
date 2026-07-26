import React, { useEffect, useState } from 'react';
import { Shield, Lock, Terminal, Radio, ShieldCheck, ChevronRight, Play } from 'lucide-react';

import FrameWatermark from './FrameWatermark';

export default function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-50 dark:bg-cyan-950/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-50 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-slate-400 dark:border-zinc-800/50 rounded-full opacity-20" style={{ animation: 'spin 60s linear infinite' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-slate-400 dark:border-zinc-800/50 rounded-full opacity-20 border-dashed" style={{ animation: 'spin 40s linear infinite reverse' }}></div>
      </div>

      <div className={`relative z-10 max-w-3xl w-full text-center space-y-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Shield Icon */}
        <div className="flex justify-center relative">
          <div className="absolute inset-0 bg-cyan-50 dark:bg-cyan-950/30 blur-xl rounded-full w-24 h-24 mx-auto animate-pulse"></div>
          <div className="bg-gradient-to-br from-cyan-500 to-indigo-600 p-4 rounded-2xl shadow-xl shadow-cyan-500/20 dark:shadow-cyan-500/10 relative ring-1 ring-white/20">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Titles */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-bold tracking-[0.3em] text-cyan-600 dark:text-cyan-400 uppercase">
            Editorial Edition
          </h2>
          <h1 className="text-4xl md:text-5xl font-serif italic font-semibold text-slate-900 dark:text-white leading-tight">
            Manual Interactivo de <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-400">
              Seguridad de la Información
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-700 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Explora vulnerabilidades, comprende los vectores de ataque modernos y aprende a proteger infraestructuras mediante laboratorios tácticos simulados en tiempo real.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 max-w-2xl mx-auto text-left">
          <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-slate-400 dark:border-zinc-800 rounded-xl p-3 flex flex-wrap items-start gap-3 hover:border-cyan-400 dark:border-cyan-900/40 transition-colors">
            <Terminal className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Consolas Simuladas</h3>
              <p className="text-[10px] text-slate-700 dark:text-zinc-400 mt-1">Kali Linux, msfconsole, bash y cmd en entornos seguros.</p>
            </div>
          </div>
          <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-slate-400 dark:border-zinc-800 rounded-xl p-3 flex flex-wrap items-start gap-3 hover:border-cyan-400 dark:border-cyan-900/40 transition-colors">
            <Radio className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Ataques de Red</h3>
              <p className="text-[10px] text-slate-700 dark:text-zinc-400 mt-1">Simulación de Phishing, DNS Spoofing e intercepción.</p>
            </div>
          </div>
          <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-slate-400 dark:border-zinc-800 rounded-xl p-3 flex flex-wrap items-start gap-3 hover:border-cyan-400 dark:border-cyan-900/40 transition-colors">
            <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Criptografía</h3>
              <p className="text-[10px] text-slate-700 dark:text-zinc-400 mt-1">Firmas digitales, Hashes y análisis de matrices de riesgo.</p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-4">
          <button
            onClick={onStart}
            className="group relative inline-flex flex-wrap items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-7 py-3.5 rounded-full font-bold text-sm tracking-wide overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Play className="w-4 h-4 relative z-10 fill-current" />
            <span className="relative z-10 group-hover:text-white transition-colors">Iniciar Laboratorios</span>
          </button>
        </div>

        {/* FRAME Branding */}
        <div className="pt-4 opacity-25">
          <FrameWatermark variant="footer" />
        </div>

      </div>
    </div>
  );
}
