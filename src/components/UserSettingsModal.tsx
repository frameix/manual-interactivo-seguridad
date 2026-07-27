import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Loader2, LogOut, Key } from 'lucide-react';
import { User, deleteUser, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { ref, set, get } from 'firebase/database';
import { detectMaliciousPayload, logSecurityEvent } from '../utils/security';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  darkMode: boolean;
  userRole?: string | null;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose, user, darkMode, userRole }) => {
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  if (!isOpen || !user) return null;

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'deseo eliminar mi cuenta') return;
    
    setIsDeleting(true);
    setError(null);
    try {
      // 1. Delete user data from Realtime Database
      await set(ref(db, `users/${user.uid}`), null);
      await set(ref(db, `activeSessions/${user.uid}`), null);

      // 2. Delete user from Firebase Auth
      await deleteUser(user);

      // 3. User is automatically logged out by Firebase when deleted
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setError('Por seguridad, debes cerrar sesión y volver a ingresar antes de eliminar tu cuenta.');
      } else {
        setError('Ocurrió un error al intentar eliminar la cuenta. ' + err.message);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogoutAndReauth = async () => {
    await signOut(auth);
    onClose();
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsResetting(true);
    setResetMessage(null);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetMessage("Se ha enviado un enlace a tu correo para restablecer la contraseña. Revisa tu bandeja de entrada o spam.");
    } catch (err: any) {
      console.error(err);
      setError("Error al enviar el correo de restablecimiento: " + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleJoinClass = async () => {
    const code = classCode.trim().toUpperCase();
    if (!code) return;
    setIsJoining(true);
    setJoinMessage(null);
    
    // HONEYPOT
    const codeAttack = detectMaliciousPayload(code);
    if (codeAttack) {
      await logSecurityEvent(
        user?.email || null,
        `Class Code: ${code}`,
        codeAttack,
        'UserSettingsModal (Join Class)'
      );
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setJoinMessage({ type: 'error', text: 'Error de conexión. Inténtalo más tarde.' });
      setIsJoining(false);
      return;
    }

    try {
      // Primero verificamos si el código existe y está activo
      const codeRef = ref(db, `classCodes/${code}`);
      const codeSnap = await get(codeRef);
      
      if (!codeSnap.exists()) {
        setJoinMessage({ type: 'error', text: 'El código no existe. Verifica con tu profesor.' });
        return;
      }

      const codeData = codeSnap.val();
      if (codeData.isActive === false) {
        setJoinMessage({ type: 'error', text: 'Este código de clase está cerrado para nuevas inscripciones.' });
        return;
      }

      // Intentamos escribir el classId. Firebase Security Rules también lo validará.
      await set(ref(db, `users/${user.uid}/classId`), code);
      setJoinMessage({ type: 'success', text: '¡Te has unido a la clase exitosamente!' });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setJoinMessage({ type: 'error', text: 'Error al unirse. Verifica tu conexión.' });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 ${darkMode ? 'dark' : ''}`}>
      <div className="absolute inset-0 bg-neutral-50 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-[#111113] w-full max-w-lg rounded-2xl shadow-2xl border border-neutral-400 dark:border-neutral-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-400 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-[#161618]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white leading-tight">Configuración de Cuenta</h2>
              <p className="text-xs text-neutral-800 dark:text-neutral-400">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">

          {userRole === 'freemium' && (
            <div className="space-y-4 pb-6 border-b border-neutral-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Unirse a una Clase
              </h3>
              
              <p className="text-sm text-neutral-700 dark:text-zinc-400 leading-relaxed">
                Si tu profesor te dio un código de clase, ingrésalo aquí para desbloquear el contenido del laboratorio.
              </p>

              {joinMessage && (
                <div className={`p-3 rounded-lg text-sm font-medium ${joinMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {joinMessage.text}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="Ej. CIBER2026"
                  className="flex-1 bg-neutral-100 dark:bg-zinc-800 border border-neutral-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-indigo-500 font-mono uppercase transition-colors"
                />
                <button
                  onClick={handleJoinClass}
                  disabled={isJoining || !classCode.trim()}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unirse"}
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-4 pb-6 border-b border-neutral-200 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4" />
              Seguridad de la Cuenta
            </h3>
            
            <p className="text-sm text-neutral-700 dark:text-zinc-400 leading-relaxed">
              Puedes cambiar tu contraseña en cualquier momento. Al solicitar el cambio, te enviaremos un enlace seguro a tu correo electrónico registrado.
            </p>

            {resetMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                {resetMessage}
              </div>
            )}

            <button
              onClick={handlePasswordReset}
              disabled={isResetting}
              className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-900 dark:text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm border border-neutral-300 dark:border-zinc-600"
            >
              {isResetting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando enlace...
                </>
              ) : (
                "Enviar enlace para cambiar contraseña"
              )}
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Zona de Peligro: Eliminar Cuenta
            </h3>
            
            <p className="text-sm text-neutral-700 dark:text-zinc-400 leading-relaxed">
              Al eliminar tu cuenta, perderás acceso a todo el contenido del Manual Interactivo. Tus datos, progreso y acceso serán borrados permanentemente y <strong>esta acción no se puede deshacer</strong>.
            </p>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                <p className="mb-2">{error}</p>
                {error.includes('cerrar sesión') && (
                  <button
                    onClick={handleLogoutAndReauth}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 rounded font-bold transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Cerrar Sesión Ahora
                  </button>
                )}
              </div>
            )}

            <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-zinc-800">
              <label className="block text-sm font-medium text-neutral-800 dark:text-zinc-300">
                Para confirmar, escribe: <span className="font-mono bg-neutral-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-red-600 dark:text-red-400 select-all">deseo eliminar mi cuenta</span>
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="deseo eliminar mi cuenta"
                className="w-full bg-white dark:bg-[#0c0c0e] border border-neutral-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>

            <button
              onClick={handleDeleteAccount}
              disabled={deleteInput !== 'deseo eliminar mi cuenta' || isDeleting}
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                deleteInput === 'deseo eliminar mi cuenta' && !isDeleting
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                  : 'bg-neutral-200 dark:bg-zinc-800 text-neutral-500 dark:text-zinc-500 cursor-not-allowed'
              }`}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Eliminar mi cuenta definitivamente
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
