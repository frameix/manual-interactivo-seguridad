import React, { useState, useEffect } from 'react';
import { X, Loader2, DollarSign, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../config/firebase';
import { ref, onValue, set, update } from 'firebase/database';

interface SuperAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuperAdminPanel({ isOpen, onClose }: SuperAdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'saas' | 'roles'>('saas');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'danger' | 'info';
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Prevenir scroll del fondo cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Payment Requests State
  interface PaymentRequest {
    uid: string;
    email: string;
    transactionId: string;
    message: string;
    method: string;
    status: string;
    timestamp: number;
  }
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Fetch Payment Requests
  useEffect(() => {
    if (!isOpen) return;
    
    setPaymentsLoading(true);
    const paymentsRef = ref(db, 'paymentRequests');
    const unsubscribe = onValue(paymentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const requestsArray: PaymentRequest[] = Object.keys(data).map(key => ({
        uid: key,
        ...data[key]
      })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      
      setPaymentRequests(requestsArray);
      setPaymentsLoading(false);
    }, (error) => {
      console.error("Firebase onValue error payments:", error);
      setPaymentsLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  // Roles Management State
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [newRoleEmail, setNewRoleEmail] = useState('');
  const [newRoleType, setNewRoleType] = useState('teacher');

  // Fetch Roles
  useEffect(() => {
    if (!isOpen) return;
    const rolesRef = ref(db, 'roles');
    const unsubscribe = onValue(rolesRef, (snapshot) => {
      setUserRoles(snapshot.val() || {});
    });
    return () => unsubscribe();
  }, [isOpen]);

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleEmail) return;
    const encodedEmail = newRoleEmail.replace(/\./g, ',');
    try {
      await set(ref(db, `roles/${encodedEmail}`), newRoleType);
      setNewRoleEmail('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveRole = async (encodedEmail: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Revocar Rol',
      message: '¿Estás seguro de eliminar este rol?',
      onConfirm: async () => {
        try {
          await set(ref(db, `roles/${encodedEmail}`), null);
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  const handleApprovePayment = async (uid: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'info',
      title: 'Aprobar Pago',
      message: `¿Confirmas que el pago es válido? Esto otorgará acceso Premium inmediatamente al usuario.`,
      onConfirm: async () => {
        try {
          await update(ref(db), {
            [`users/${uid}/isPremium`]: true,
            [`paymentRequests/${uid}/status`]: 'approved',
          });
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  const handleRejectPayment = async (uid: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Rechazar Pago',
      message: `¿Estás seguro de rechazar este pago? El usuario verá que su número de operación fue rechazado.`,
      onConfirm: async () => {
        try {
          await set(ref(db, `paymentRequests/${uid}/status`), 'rejected');
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-900/60 dark:bg-[#0a0a0a]/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-white dark:bg-[#121214] border border-amber-300 dark:border-amber-900/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header & Tabs */}
          <div className="border-b border-neutral-300 dark:border-neutral-800/40 bg-amber-50 dark:bg-[#18120c] z-10 flex flex-col">
            <div className="p-5 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-900/40">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-amber-900 dark:text-amber-500 leading-tight">Panel de SuperAdmin</h2>
                  <p className="text-[11px] text-amber-700/70 dark:text-amber-500/50 font-mono tracking-wider uppercase">Finanzas y Pagos</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-amber-700/50 hover:text-amber-900 dark:text-amber-500/50 dark:hover:text-amber-400 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/10 dark:hover:bg-amber-900/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Tabs */}
            <div className="flex flex-wrap px-5 gap-6 border-t border-amber-200 dark:border-amber-900/30">
              <button
                onClick={() => setActiveTab('saas')}
                className={`py-3 text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === 'saas' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-zinc-500 dark:hover:text-zinc-300'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                SaaS & Pagos
              </button>
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-3 text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === 'roles' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-zinc-500 dark:hover:text-zinc-300'
                }`}
              >
                <Info className="w-4 h-4" />
                Gestión de Roles
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 scrollbar-thin bg-neutral-50 dark:bg-[#0c0c0e]">
            {activeTab === 'saas' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-400 dark:border-amber-900/40 rounded-xl p-4 flex gap-3">
                  <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    Aquí aparecerán las solicitudes de pago de los usuarios Freemium. Revisa tu Yape, Plin o PayPal usando el <strong>Número de Operación</strong>. Al darle Aprobar, el sistema les dará acceso inmediato a todas las clases y simuladores.
                  </p>
                </div>

                {paymentsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-500 dark:text-zinc-500">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    <p className="text-sm font-medium">Cargando pagos...</p>
                  </div>
                ) : paymentRequests.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl bg-neutral-100/50 dark:bg-[#121214]/50">
                    <p className="text-sm text-neutral-500 dark:text-zinc-500 font-medium">No hay pagos registrados.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentRequests.map((req) => (
                      <div key={req.uid} className={`bg-white dark:bg-[#18181b] border rounded-xl p-5 overflow-hidden relative shadow-sm ${
                        req.status === 'pending' ? 'border-amber-300 dark:border-amber-500/30' :
                        req.status === 'approved' ? 'border-emerald-300 dark:border-emerald-500/30' :
                        'border-red-300 dark:border-red-500/30'
                      }`}>
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                          req.status === 'pending' ? 'bg-amber-400 dark:bg-amber-500' :
                          req.status === 'approved' ? 'bg-emerald-400 dark:bg-emerald-500' :
                          'bg-red-400 dark:bg-red-500'
                        }`} />

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                {req.email}
                              </span>
                              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                                req.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                                req.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                                'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                              }`}>
                                {req.status === 'pending' ? 'PENDIENTE' : req.status === 'approved' ? 'APROBADO' : 'RECHAZADO'}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-x-6 gap-y-1 mt-2 text-xs text-neutral-600 dark:text-zinc-400 font-mono">
                              <div>
                                <span className="font-bold text-neutral-500">Operación:</span> <span className="text-neutral-900 dark:text-white font-bold">{req.transactionId}</span>
                              </div>
                              <div>
                                <span className="font-bold text-neutral-500">Método:</span> {req.method.toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-neutral-500">Fecha:</span> {new Date(req.timestamp).toLocaleString()}
                              </div>
                            </div>
                            {req.message && (
                              <p className="mt-3 text-xs text-neutral-500 dark:text-zinc-400 bg-neutral-50 dark:bg-[#0c0c0e] p-2 rounded border border-neutral-200 dark:border-zinc-800 italic">
                                "{req.message}"
                              </p>
                            )}
                          </div>
                          
                          {req.status === 'pending' && (
                            <div className="flex gap-2 self-start md:self-center">
                              <button
                                onClick={() => handleApprovePayment(req.uid)}
                                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Aprobar
                              </button>
                              <button
                                onClick={() => handleRejectPayment(req.uid)}
                                className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest rounded-lg border border-red-200 dark:border-red-800 transition-colors flex items-center gap-1.5"
                              >
                                <X className="w-4 h-4" />
                                Rechazar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'roles' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-400 dark:border-amber-900/40 rounded-xl p-4 flex gap-3">
                  <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    Aquí puedes asignar roles especiales a cualquier correo. Los profesores podrán ver las estadísticas y administrar visibilidad de clases, mientras que los SuperAdmins tendrán acceso total incluyendo este panel.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">Añadir Nuevo Rol</h3>
                  <form onSubmit={handleAddRole} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={newRoleEmail}
                      onChange={(e) => setNewRoleEmail(e.target.value)}
                      required
                      className="flex-1 px-4 py-2 bg-neutral-50 dark:bg-[#0c0c0e] border border-neutral-300 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm dark:text-white"
                    />
                    <select
                      value={newRoleType}
                      onChange={(e) => setNewRoleType(e.target.value)}
                      className="px-4 py-2 bg-neutral-50 dark:bg-[#0c0c0e] border border-neutral-300 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm dark:text-white"
                    >
                      <option value="teacher">Profesor</option>
                      <option value="superadmin">SuperAdmin</option>
                      <option value="guest">Invitado</option>
                      <option value="alumno">Alumno (UNSM)</option>
                      <option value="premium">Premium (SaaS)</option>
                    </select>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors text-sm"
                    >
                      Asignar Rol
                    </button>
                  </form>
                </div>

                <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-100 dark:bg-[#0c0c0e] border-b border-neutral-200 dark:border-neutral-800">
                        <th className="px-5 py-3 text-xs font-bold text-neutral-500 dark:text-zinc-500 uppercase tracking-widest">Correo (ID)</th>
                        <th className="px-5 py-3 text-xs font-bold text-neutral-500 dark:text-zinc-500 uppercase tracking-widest">Rol Asignado</th>
                        <th className="px-5 py-3 text-xs font-bold text-neutral-500 dark:text-zinc-500 uppercase tracking-widest text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(userRoles).length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-5 py-8 text-center text-sm text-neutral-500 dark:text-zinc-500 italic">
                            No hay roles dinámicos asignados.
                          </td>
                        </tr>
                      ) : (
                        Object.entries(userRoles).map(([encodedEmail, role]) => (
                          <tr key={encodedEmail} className="border-b border-neutral-100 dark:border-neutral-800/50 last:border-0 hover:bg-neutral-50 dark:hover:bg-[#121214] transition-colors">
                            <td className="px-5 py-3 text-sm font-medium text-neutral-900 dark:text-zinc-200">
                              {encodedEmail.replace(/,/g, '.')}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                                role === 'teacher' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' :
                                role === 'superadmin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                                role === 'guest' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                                role === 'alumno' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                                role === 'premium' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-400'
                              }`}>
                                {role === 'teacher' ? 'Profesor' : 
                                 role === 'superadmin' ? 'SuperAdmin' : 
                                 role === 'guest' ? 'Invitado' :
                                 role === 'alumno' ? 'Alumno (UNSM)' :
                                 role === 'premium' ? 'Premium (SaaS)' : 'Desconocido'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <button
                                onClick={() => handleRemoveRole(encodedEmail)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Revocar Rol"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Custom Confirm Dialog Overlay */}
        <AnimatePresence>
          {confirmDialog && confirmDialog.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="bg-white dark:bg-[#121214] border border-neutral-300 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm p-6"
              >
                <div className="flex flex-wrap items-start gap-4 mb-6">
                  <div className={`p-3 rounded-full shrink-0 ${confirmDialog.type === 'danger' ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-500' : 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-500'}`}>
                    {confirmDialog.type === 'danger' ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-neutral-900 dark:text-white font-bold mb-1">{confirmDialog.title}</h3>
                    <p className="text-sm text-neutral-600 dark:text-zinc-400 leading-relaxed">{confirmDialog.message}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <button
                    onClick={() => setConfirmDialog(null)}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-sm font-medium text-neutral-600 dark:text-zinc-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      confirmDialog.onConfirm();
                      setConfirmDialog(null);
                    }}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-sm font-bold text-white transition-colors ${
                      confirmDialog.type === 'danger' 
                        ? 'bg-red-600 hover:bg-red-50 dark:bg-red-950/300' 
                        : 'bg-cyan-600 hover:bg-cyan-50 dark:bg-cyan-950/300'
                    }`}
                  >
                    Aceptar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
