import React, { useState } from 'react';
import { Shield, Lock, User, AlertTriangle, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { motion } from 'motion/react';

export default function LoginScreen({ initialError, onLoginSuccess, onBack, initialMode = 'login' }: { initialError?: string | null, onLoginSuccess?: () => void, onBack?: () => void, initialMode?: 'login' | 'register' }) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      if (mode === 'forgot_password') {
        await sendPasswordResetEmail(auth, email);
        setSuccessMsg('Se ha enviado un enlace a tu correo para restablecer tu contraseña.');
        setMode('login');
      } else if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        if (onLoginSuccess) onLoginSuccess();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await sendEmailVerification(userCredential.user);
        }
        if (onLoginSuccess) onLoginSuccess();
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError(mode === 'login' ? 'Credenciales inválidas o acceso denegado.' : 'Ocurrió un error al crear la cuenta.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 selection:bg-cyan-50 dark:bg-cyan-950/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-50 dark:bg-cyan-950/30 rounded-full blur-[128px] opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-50 dark:bg-indigo-950/30 rounded-full blur-[128px] opacity-50" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          {/* Top Line Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />
          
          {onBack && (
            <button 
              onClick={onBack}
              type="button"
              className="absolute top-6 left-6 text-zinc-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 text-cyan-400 mb-4 border border-cyan-400 dark:border-cyan-900/40 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Portal de Seguridad</h1>
            <p className="text-sm text-zinc-400">Autenticación requerida para acceder al Manual Interactivo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="bg-red-50 dark:bg-red-950/30 border border-red-400 dark:border-red-900/40 rounded-xl p-3 flex flex-wrap items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}
            
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-400 dark:border-emerald-900/40 rounded-xl p-3 flex flex-wrap items-start gap-3"
              >
                <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-300">{successMsg}</p>
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-cyan-400 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all"
                  placeholder="Correo electrónico"
                />
              </div>

              {mode !== 'forgot_password' && (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-cyan-400 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all"
                    placeholder="Contraseña de acceso"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full flex flex-wrap items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-medium rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login' ? 'Ingresar al Sistema' : 
                     mode === 'register' ? 'Crear mi cuenta' : 'Restablecer contraseña'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            <div className="text-center mt-4 flex flex-col gap-2">
              {mode !== 'forgot_password' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot_password');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors bg-transparent border-none"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
              
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' || mode === 'forgot_password' ? 'register' : 'login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors bg-transparent border-none mt-1"
              >
                {mode === 'login' || mode === 'forgot_password'
                  ? '¿No tienes cuenta? Regístrate gratis' 
                  : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-xs text-zinc-500">
              Desarrollado por FRAME.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
