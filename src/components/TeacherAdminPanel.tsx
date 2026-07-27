import React, { useState, useEffect } from 'react';
import { Shield, X, Eye, EyeOff, Loader2, BookMarked, Edit2, Save, Lock, Layout, Search, Check, RefreshCw, Pencil, Trash, AlertTriangle, Info, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../config/firebase';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { lessonsData } from '../data/lessons';

interface TeacherAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TeacherAdminPanel({ isOpen, onClose }: TeacherAdminPanelProps) {
  const [visibilityData, setVisibilityData] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'visibility' | 'grades' | 'codes'>('visibility');

  // Gradebook State
  interface Calificacion {
    id: string;
    estudiante: string;
    nota: number;
    notaMaxima: number;
    clase: number;
    fecha: string;
    editCount?: number;
    historial?: { nota: number; fecha: string; timestamp: number }[];
  }
  const [grades, setGrades] = useState<Calificacion[]>([]);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [editNotaValue, setEditNotaValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Class Codes State
  const [classCodes, setClassCodes] = useState<{code: string, teacherEmail: string}[]>([]);
  const [codesLoading, setCodesLoading] = useState(false);
  const [newCodeInput, setNewCodeInput] = useState('');
  const [codeMessage, setCodeMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
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

  // Listen to visibility data in real-time
  useEffect(() => {
    if (!isOpen) return;
    
    const visibilityRef = ref(db, 'config/classVisibility');
    const unsubscribe = onValue(visibilityRef, (snapshot) => {
      const data = snapshot.val() || {};
      setVisibilityData(data);
      setLoading(false);
    }, (error) => {
      console.error("Firebase onValue error:", error);
      setLoading(false);
    });

    // Failsafe: Si Firebase no responde en 2 segundos, quitar el loader de todas formas
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [isOpen]);

  const toggleClassVisibility = async (classId: number) => {
    const currentValue = visibilityData[classId] ?? false;
    const newValue = !currentValue;
    
    try {
      await set(ref(db, `config/classVisibility/${classId}`), newValue);
    } catch (error) {
      console.error("Error al actualizar visibilidad:", error);
      setConfirmDialog({
        isOpen: true,
        type: 'danger',
        title: 'Error de Red',
        message: 'Hubo un error al guardar. Verifica tu conexión.',
        onConfirm: () => {}
      });
    }
  };

  const setAllVisibility = async (value: boolean) => {
    try {
      const updates: Record<number, boolean> = {};
      lessonsData.forEach(lesson => {
        updates[lesson.id] = value;
      });
      await set(ref(db, 'config/classVisibility'), updates);
    } catch (error) {
      console.error("Error al actualizar toda la visibilidad:", error);
      setConfirmDialog({
        isOpen: true,
        type: 'danger',
        title: 'Error de Red',
        message: 'Hubo un error al guardar. Verifica tu conexión.',
        onConfirm: () => {}
      });
    }
  };

  // Fetch Grades when activeTab is 'grades'
  useEffect(() => {
    if (!isOpen || activeTab !== 'grades') return;
    
    setGradesLoading(true);
    const gradesRef = ref(db, 'calificaciones');
    const unsubscribe = onValue(gradesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const gradesArray: Calificacion[] = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)); // Sort by timestamp, fallback to 0
      
      setGrades(gradesArray);
      setGradesLoading(false);
    }, (error) => {
      console.error("Firebase onValue error grades:", error);
      setGradesLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, activeTab]);

  // Fetch Class Codes when activeTab is 'codes'
  useEffect(() => {
    if (!isOpen || activeTab !== 'codes') return;
    
    setCodesLoading(true);
    const codesRef = ref(db, 'classCodes');
    const unsubscribe = onValue(codesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const codesArray = Object.keys(data).map(key => ({
        code: key,
        teacherEmail: data[key].teacherEmail || 'Desconocido'
      }));
      setClassCodes(codesArray);
      setCodesLoading(false);
    }, (error) => {
      console.error("Firebase onValue error codes:", error);
      setCodesLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, activeTab]);

  const handleCreateCode = async () => {
    const code = newCodeInput.trim().toUpperCase();
    if (!code) return;
    
    // Validación de longitud mínima (6 caracteres) y que sea alfanumérico
    if (code.length < 6) {
      setCodeMessage({ type: 'error', text: 'El código debe tener al menos 6 caracteres por seguridad.' });
      return;
    }
    if (!/^[A-Z0-9]+$/.test(code)) {
      setCodeMessage({ type: 'error', text: 'El código solo puede contener letras y números.' });
      return;
    }

    if (!auth.currentUser?.email) return;

    try {
      await set(ref(db, `classCodes/${code}`), {
        teacherEmail: auth.currentUser.email,
        createdAt: Date.now()
      });
      setNewCodeInput('');
      setCodeMessage({ type: 'success', text: 'Código de clase creado exitosamente.' });
      setTimeout(() => setCodeMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setCodeMessage({ type: 'error', text: 'Error al crear el código. Verifica tus permisos.' });
    }
  };

  const handleDeleteCode = async (code: string) => {
    try {
      await remove(ref(db, `classCodes/${code}`));
    } catch (e) {
      console.error(e);
      setConfirmDialog({
        isOpen: true,
        type: 'danger',
        title: 'Error',
        message: 'No se pudo eliminar el código. Verifica tus permisos.',
        onConfirm: () => {}
      });
    }
  };

  const handleSaveGrade = async (gradeId: string, currentEditCount: number = 0) => {
    const numValue = parseInt(editNotaValue, 10);
    if (isNaN(numValue) || numValue < 0 || numValue > 20) {
      setConfirmDialog({
        isOpen: true,
        type: 'danger',
        title: 'Valor Inválido',
        message: 'La nota debe ser un número válido entre 0 y 20.',
        onConfirm: () => {}
      });
      return;
    }

    try {
      const gradeRef = ref(db, `calificaciones/${gradeId}`);
      await update(gradeRef, {
        nota: numValue,
        editCount: currentEditCount + 1
      });
      setEditingGradeId(null);
    } catch (e) {
      console.error(e);
      setConfirmDialog({
        isOpen: true,
        type: 'danger',
        title: 'Error de Red',
        message: 'Ocurrió un error al intentar guardar la nota.',
        onConfirm: () => {}
      });
    }
  };

  const handleGrantRetry = async (gradeId: string, studentName: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'info',
      title: 'Habilitar Nuevo Intento',
      message: `¿Estás seguro que deseas autorizar un nuevo intento para ${studentName}? Esto reiniciará su examen remotamente.`,
      onConfirm: async () => {
        try {
          const retryRef = ref(db, `reintentos/${gradeId}`);
          await set(retryRef, Date.now()); // Guardamos un timestamp para que el alumno sepa que es una nueva orden
        } catch (e) {
          console.error(e);
          setConfirmDialog({
            isOpen: true,
            type: 'danger',
            title: 'Error de Red',
            message: 'No se pudo autorizar el reintento.',
            onConfirm: () => {}
          });
        }
      }
    });
  };

  const handleDeleteGrade = async (gradeId: string, studentName: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Eliminar Registro',
      message: `¿Estás 100% seguro de que deseas eliminar permanentemente el registro de ${studentName}? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          const gradeRef = ref(db, `calificaciones/${gradeId}`);
          await set(gradeRef, null);
        } catch (e) {
          console.error(e);
          setConfirmDialog({
            isOpen: true,
            type: 'danger',
            title: 'Error de Red',
            message: 'No se pudo eliminar el registro.',
            onConfirm: () => {}
          });
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
          className="relative w-full max-w-2xl bg-white dark:bg-[#121214] border border-neutral-300 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header & Tabs */}
          <div className="border-b border-neutral-300 dark:border-neutral-800/40 bg-white dark:bg-[#121214] z-10 flex flex-col">
            <div className="p-5 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-900/40">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">Panel del Profesor</h2>
                  <p className="text-[11px] text-neutral-500 dark:text-zinc-400 font-mono tracking-wider uppercase">Centro de Administración</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-zinc-400 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Tabs */}
            <div className="flex flex-wrap px-5 gap-6 border-t border-neutral-300 dark:border-neutral-800/40">
                <button
                  onClick={() => setActiveTab('visibility')}
                  className={`flex items-center gap-2 px-1 py-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'visibility'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Módulos
                </button>
                <button
                  onClick={() => setActiveTab('grades')}
                  className={`flex items-center gap-2 px-1 py-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'grades'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <BookMarked className="w-4 h-4" />
                  Calificaciones
                </button>
                <button
                  onClick={() => setActiveTab('codes')}
                  className={`flex items-center gap-2 px-1 py-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'codes'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  Códigos de Clase
                </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 scrollbar-thin bg-neutral-50 dark:bg-[#0c0c0e]">
            {activeTab === 'visibility' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-400 dark:border-cyan-900/40 rounded-xl p-4">
                  <p className="text-xs text-cyan-800 dark:text-cyan-300 leading-relaxed">
                    Selecciona qué clases pueden ver los alumnos en este momento. Las clases apagadas desaparecerán instantáneamente de las pantallas de los estudiantes. <strong>(Por seguridad, todas las clases están ocultas por defecto).</strong>
                  </p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button 
                      onClick={() => setAllVisibility(true)}
                      className="px-3 py-1.5 text-[11px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-400 dark:border-emerald-900/40 rounded hover:bg-emerald-100 dark:bg-emerald-950/30 transition-colors uppercase font-bold tracking-widest"
                    >
                      Desbloquear Todo
                    </button>
                    <button 
                      onClick={() => setAllVisibility(false)}
                      className="px-3 py-1.5 text-[11px] bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-400 dark:border-red-900/40 rounded hover:bg-red-100 dark:bg-red-950/30 transition-colors uppercase font-bold tracking-widest"
                    >
                      Ocultar Todo
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-500 dark:text-zinc-500">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm font-medium">Sincronizando con Firebase...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lessonsData.map((lesson) => {
                      const isVisible = visibilityData[lesson.id] ?? false;

                      return (
                        <div 
                          key={lesson.id}
                          className={`p-3 sm:p-4 rounded-xl border flex items-center justify-between transition-colors gap-3 ${
                            isVisible 
                              ? 'bg-white dark:bg-[#18181b] border-indigo-400 dark:border-indigo-900/40' 
                              : 'bg-neutral-50 dark:bg-[#0a0a0a] border-neutral-300 dark:border-neutral-800 shadow-sm dark:shadow-none'
                          }`}
                        >
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-mono font-bold text-xs sm:text-sm border ${
                              isVisible
                                ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-900/40'
                                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-zinc-500 border-neutral-300 dark:border-neutral-800'
                            }`}>
                              {String(lesson.id).padStart(2, '0')}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className={`text-xs sm:text-sm font-bold truncate pr-2 ${isVisible ? 'text-neutral-900 dark:text-zinc-100' : 'text-neutral-500 dark:text-zinc-500'}`}>
                                {lesson.title.includes(": ") ? lesson.title.split(": ")[1] : lesson.title}
                              </h3>
                              <p className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-zinc-500 font-mono tracking-widest uppercase mt-0.5 truncate pr-2">
                                {isVisible ? 'Disponible para alumnos' : 'Oculto (Solo Profesor)'}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleClassVisibility(lesson.id)}
                            className={`relative flex-shrink-0 inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#121214] ${
                              isVisible ? 'bg-indigo-500 dark:bg-indigo-500' : 'bg-neutral-300 dark:bg-neutral-700'
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                                isVisible ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'grades' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex flex-col gap-3 mb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Registro de Calificaciones</h3>
                    <div className="text-xs text-neutral-600 dark:text-zinc-500 bg-white dark:bg-zinc-900 px-3 py-1 rounded-full border border-neutral-300 dark:border-zinc-800 shadow-sm dark:shadow-none">
                      Total: {grades.length} evaluaciones
                    </div>
                  </div>
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 dark:text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Buscar alumno por nombre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white dark:bg-[#18181b] border border-neutral-300 dark:border-neutral-800 rounded-xl py-2 pl-10 pr-4 shadow-sm dark:shadow-none text-sm text-neutral-900 dark:text-zinc-200 outline-none focus:border-indigo-400 dark:border-indigo-900/40 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-400 dark:placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {gradesLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-500 dark:text-zinc-500">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    <p className="text-sm font-medium">Cargando libreta de notas...</p>
                  </div>
                ) : grades.length === 0 ? (
                  <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-950/30 rounded-2xl border border-neutral-300 dark:border-neutral-800 border-dashed">
                    <BookMarked className="w-10 h-10 text-neutral-400 dark:text-zinc-600 mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-neutral-500 dark:text-zinc-500">Aún no hay calificaciones registradas.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {grades.filter(g => (g.estudiante || '').toLowerCase().includes(searchQuery.toLowerCase())).map((grade) => {
                      const editCount = grade.editCount || 0;
                      const isEditing = editingGradeId === grade.id;
                      const canEdit = editCount < 2;
                      const historialCount = grade.historial ? grade.historial.length : 1;
                      const canRetry = historialCount < 5;

                      return (
                        <div key={grade.id} className="p-3 sm:p-4 bg-white dark:bg-[#121214] border border-neutral-300 dark:border-neutral-800 rounded-xl hover:border-neutral-400 shadow-sm dark:shadow-none dark:hover:border-neutral-700 transition-colors flex flex-col gap-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="flex flex-col gap-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-neutral-900 dark:text-zinc-200 text-xs sm:text-sm truncate">{grade.estudiante}</span>
                                <span className="text-[9px] sm:text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-zinc-400 px-2 py-0.5 rounded font-mono border border-neutral-300 dark:border-transparent whitespace-nowrap">
                                  Clase {grade.clase}
                                </span>
                              </div>
                              <span className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-zinc-500 font-mono truncate">{grade.fecha}</span>
                            </div>

                          <div className="flex flex-wrap items-center gap-4">
                            {isEditing ? (
                              <div className="flex flex-wrap items-center gap-1">
                                <input 
                                  type="number" 
                                  min="0" 
                                  max="20"
                                  value={editNotaValue}
                                  onChange={(e) => setEditNotaValue(e.target.value)}
                                  className="w-16 bg-neutral-50 dark:bg-[#0a0a0a] border border-emerald-400 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-bold text-center rounded px-2 py-1 text-sm outline-none focus:border-emerald-500"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveGrade(grade.id, editCount)}
                                  className="p-1.5 hover:bg-emerald-50 dark:bg-emerald-950/30 rounded-md text-emerald-500 transition-colors"
                                  title="Guardar Nota"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingGradeId(null)}
                                  className="p-1.5 hover:bg-red-50 dark:bg-red-950/30 rounded-md text-red-500 transition-colors"
                                  title="Cancelar"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              ) : (
                                <div className="flex flex-wrap items-center gap-4">
                                  <div className={`text-xl font-bold font-mono tracking-tighter ${grade.nota >= 11 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {String(grade.nota).padStart(2, '0')}<span className="text-xs text-neutral-400 dark:text-zinc-600">/20</span>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <button
                                      onClick={() => handleGrantRetry(grade.id, grade.estudiante)}
                                      disabled={!canRetry}
                                      className={`p-2 rounded-lg transition-colors border ${
                                        canRetry 
                                          ? "hover:bg-cyan-50 dark:hover:bg-cyan-950/30 text-cyan-600 border-transparent hover:border-cyan-400 dark:hover:border-cyan-900/40" 
                                          : "text-neutral-400 dark:text-zinc-700 cursor-not-allowed border-transparent"
                                      }`}
                                      title={canRetry ? "Habilitar Reintento de Examen (Remoto)" : "Límite de 5 intentos alcanzado"}
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingGradeId(grade.id);
                                        setEditNotaValue(String(grade.nota));
                                      }}
                                      disabled={!canEdit}
                                      className={`p-2 rounded-lg transition-colors border ${
                                        canEdit 
                                          ? "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-200 border-transparent hover:border-neutral-300 dark:hover:border-neutral-700" 
                                          : "text-neutral-400 dark:text-zinc-700 cursor-not-allowed border-transparent"
                                      }`}
                                      title={canEdit ? "Editar Nota Manualmente" : "Límite de ediciones alcanzado"}
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteGrade(grade.id, grade.estudiante)}
                                      className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-red-600 dark:text-red-500 transition-colors border border-transparent hover:border-red-400 dark:hover:border-red-900/40 ml-1"
                                      title="Eliminar Registro Permanentemente"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <span className={`text-[9px] font-mono uppercase tracking-widest ${canEdit ? 'text-neutral-500 dark:text-zinc-500' : 'text-red-600 dark:text-red-900'}`}>
                                    {2 - editCount} Ediciones
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                          
                          {/* Mini Historial */}
                          {grade.historial && grade.historial.length > 1 && (
                            <div className="mt-1 pt-3 border-t border-neutral-300 dark:border-neutral-800/40">
                              <h5 className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-zinc-500 mb-2 font-semibold">Historial de Intentos ({grade.historial.length})</h5>
                              <div className="flex flex-wrap gap-2">
                                {grade.historial.map((h, i) => (
                                  <div key={i} className={`text-[10px] font-mono px-2 py-1 rounded border ${h.nota >= 11 ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-400 dark:border-emerald-900/40' : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-400 dark:border-red-900/40'}`}>
                                    Intento {i + 1}: {String(h.nota).padStart(2, '0')}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'codes' && (
              <div className="p-6">
                <div className="mb-6 flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Generar Código de Invitación</h3>
                  <p className="text-sm text-neutral-600 dark:text-zinc-400">Los alumnos ingresarán este código en su panel de configuración para ser vinculados automáticamente a tu clase con rol de "Alumno". Mínimo 6 caracteres.</p>
                </div>

                {codeMessage && (
                  <div className={`mb-6 p-3 rounded-lg text-sm font-medium ${codeMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-red-50 text-red-700 border border-red-200 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400'}`}>
                    {codeMessage.text}
                  </div>
                )}

                <div className="flex gap-3 mb-8">
                  <input
                    type="text"
                    value={newCodeInput}
                    onChange={(e) => {
                      setNewCodeInput(e.target.value.toUpperCase());
                      setCodeMessage(null); // Limpiar mensaje al escribir
                    }}
                    placeholder="Ej. CIBER2026"
                    className="flex-1 px-4 py-2 bg-neutral-100 dark:bg-[#0a0a0a] border border-neutral-300 dark:border-neutral-800 rounded-lg focus:outline-none focus:border-indigo-500 text-neutral-900 dark:text-white font-mono uppercase"
                  />
                  <button
                    onClick={handleCreateCode}
                    disabled={!newCodeInput.trim()}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" /> Crear Código
                  </button>
                  <button
                    onClick={() => {
                      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                      setNewCodeInput(randomCode);
                    }}
                    className="px-4 py-2 bg-neutral-200 dark:bg-zinc-800 hover:bg-neutral-300 dark:hover:bg-zinc-700 text-neutral-700 dark:text-zinc-300 font-bold rounded-lg transition-colors flex items-center gap-2"
                    title="Generar código aleatorio"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-neutral-700 dark:text-zinc-300">Códigos Activos</h4>
                  {codesLoading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                  ) : classCodes.length === 0 ? (
                    <div className="text-center py-8 bg-neutral-50 dark:bg-neutral-950/30 rounded-xl border border-neutral-200 dark:border-neutral-800 border-dashed">
                      <p className="text-sm text-neutral-500">No hay códigos activos.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {classCodes.map((codeObj) => (
                        <div key={codeObj.code} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-xl">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400">{codeObj.code}</span>
                            <span className="text-xs text-neutral-500">Creado por: {codeObj.teacherEmail}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteCode(codeObj.code)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Eliminar código"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-cyan-600 hover:bg-cyan-700'
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
