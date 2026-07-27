import React from 'react';
import { ShieldCheck, TerminalSquare, Cpu, ArrowRight, Lock, Key, Target } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function LandingPage({ onLoginClick, onRegisterClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-slate-200 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-800 dark:text-white">Ciber<span className="text-indigo-600 dark:text-indigo-500">Activa</span></span>
          </div>
          <button 
            onClick={onLoginClick}
            className="text-sm font-bold bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-700 px-6 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md"
          >
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold tracking-widest uppercase mb-8 border border-indigo-200 dark:border-indigo-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            El camino del Pentester Profesional
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1] max-w-4xl text-slate-900 dark:text-white">
            Fórjate como Hacker con <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500 dark:from-indigo-400 dark:to-emerald-400">Práctica Real</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 max-w-2xl mb-12 leading-relaxed">
            Entiende cómo piensan los atacantes para construir defensas impenetrables. Un campo de entrenamiento en <strong>Hacking Ético</strong> y <strong>Auditoría</strong> con simuladores 100% seguros.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              onClick={onRegisterClick}
              className="group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.7)]"
            >
              Crear Cuenta Gratis
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="#features" className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-white px-8 py-4 rounded-full font-bold text-lg border border-slate-200 dark:border-zinc-700 transition-all">
              Ver Características
            </a>
          </div>
          <p className="mt-6 text-sm text-slate-500 dark:text-zinc-500 font-medium">
            ✨ Incluye prueba gratis de las primeras 3 sesiones completas. No requiere tarjeta.
          </p>
        </div>

        {/* Features Section */}
        <div id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-200 dark:border-zinc-800/50 bg-white/30 dark:bg-zinc-900/20 backdrop-blur-sm rounded-3xl mx-4 lg:mx-auto mb-24 shadow-sm">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black mb-4 text-slate-900 dark:text-white">Mucho más que un documento PDF</h2>
            <p className="text-slate-600 dark:text-zinc-400 max-w-xl mx-auto">La plataforma te permite experimentar y ejecutar herramientas de seguridad directamente en tu navegador, sin configuraciones complejas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 dark:bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <TerminalSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Simuladores de Consola</h3>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                Practica escaneos con Nmap, explotación con Metasploit y análisis de vulnerabilidades en entornos seguros y controlados.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-emerald-100 dark:bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Key className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Criptografía Visual</h3>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                Entiende cómo funciona el cifrado simétrico y asimétrico, y genera tus propias Firmas Digitales con tecnología PKCS#7 real.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-orange-100 dark:bg-orange-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Progreso en Tiempo Real</h3>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                Tu progreso se guarda automáticamente. Completa misiones, responde evaluaciones interactivas y mide tu nivel de aprendizaje.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800/50 py-8 relative z-10 text-center text-slate-500 dark:text-zinc-500 text-sm">
        <p>© {new Date().getFullYear()} Creado por FRAME.</p>
      </footer>
    </div>
  );
}
