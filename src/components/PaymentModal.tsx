import React, { useState } from 'react';
import { X, Smartphone, CreditCard, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { ref, set } from 'firebase/database';
import { db } from '../config/firebase';

interface PaymentModalProps {
  onClose: () => void;
  uid: string;
  email: string | null;
}

export default function PaymentModal({ onClose, uid, email }: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<'yape' | 'paypal'>('yape');
  const [transactionId, setTransactionId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setError('Por favor, ingresa el número de operación.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestRef = ref(db, `paymentRequests/${uid}`);
      await set(requestRef, {
        email: email || 'Desconocido',
        transactionId: transactionId.trim(),
        message: message.trim(),
        method: activeTab,
        status: 'pending',
        timestamp: Date.now()
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setError('Ocurrió un error al enviar la solicitud. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-[#121214] rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-zinc-800">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-neutral-200 dark:border-zinc-800">
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Adquirir Versión Premium</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-neutral-900 dark:text-white">¡Solicitud Enviada!</h4>
            <p className="text-sm text-neutral-600 dark:text-zinc-400">
              Hemos recibido tu número de operación. Validaremos el pago en breve y tu cuenta se activará automáticamente.
            </p>
          </div>
        ) : (
          <div className="p-5">
            {/* Tabs */}
            <div className="flex p-1 bg-neutral-100 dark:bg-zinc-900 rounded-xl mb-6">
              <button
                onClick={() => setActiveTab('yape')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  activeTab === 'yape' 
                    ? 'bg-white dark:bg-[#1e1e24] text-neutral-900 dark:text-white shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-zinc-300'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Perú (Yape/Plin)
              </button>
              <button
                onClick={() => setActiveTab('paypal')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  activeTab === 'paypal' 
                    ? 'bg-white dark:bg-[#1e1e24] text-neutral-900 dark:text-white shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-zinc-300'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Internacional
              </button>
            </div>

            <div className="space-y-6">
              {/* Info section */}
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-xl">
                <p className="text-xs uppercase tracking-widest text-indigo-500 font-bold mb-1">Costo de Acceso Completo</p>
                <p className="text-3xl font-black text-indigo-700 dark:text-indigo-400">
                  {activeTab === 'yape' ? 'S/ 5.00' : '$ 1.50'}
                </p>
                <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-1">Pago único, acceso de por vida.</p>
              </div>

              {/* Payment details */}
              <div className="space-y-3">
                <p className="text-sm font-bold text-neutral-800 dark:text-zinc-200">1. Realiza el pago a:</p>
                
                {activeTab === 'yape' ? (
                  <div className="flex flex-col gap-3 p-4 bg-neutral-50 dark:bg-zinc-800/50 rounded-lg border border-neutral-200 dark:border-zinc-700/50">
                    <div className="flex flex-col items-center justify-center pb-3 border-b border-neutral-200 dark:border-zinc-700/50">
                      {/* Espacio para el QR - El usuario subirá su imagen */}
                      <div className="w-32 h-32 bg-white rounded-xl border-2 border-dashed border-neutral-300 dark:border-zinc-600 flex items-center justify-center mb-2 overflow-hidden">
                        <span className="text-xs text-neutral-400 text-center px-2">Tu código QR irá aquí</span>
                        {/* <img src="/tu-qr.png" alt="QR Yape" className="w-full h-full object-cover" /> */}
                      </div>
                      <span className="text-xs font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider">Escanea para pagar con Yape o Plin</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-neutral-500 dark:text-zinc-400">Titular</span>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">Marco P.</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 p-3 bg-neutral-50 dark:bg-zinc-800/50 rounded-lg border border-neutral-200 dark:border-zinc-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-500 dark:text-zinc-400">Correo PayPal</span>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">tu-correo@paypal.com</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-neutral-200 dark:border-zinc-800">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-neutral-800 dark:text-zinc-200">2. Valida tu pago:</p>
                  <label className="block text-xs text-neutral-500 dark:text-zinc-400 mb-1">
                    Número de Operación / ID de Transacción
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Ej. 12345678"
                    className="w-full bg-neutral-50 dark:bg-[#08080a] border border-neutral-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-neutral-500 dark:text-zinc-400 mb-1">
                    Mensaje (Opcional)
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Nombre o alias"
                    className="w-full bg-neutral-50 dark:bg-[#08080a] border border-neutral-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-2 text-red-600 dark:text-red-400 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Validación'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
