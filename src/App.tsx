import React, { useState, useEffect } from "react";
import { lessonsData } from "./data/lessons";
import { ClassId, LessonContent } from "./types";

// Import custom interactive simulators
import AircrackSimulator from "./components/AircrackSimulator";
import RiskMatrixCalculator from "./components/RiskMatrixCalculator";
import DictionaryGenerator from "./components/DictionaryGenerator";
import PhishingSimulator from "./components/PhishingSimulator";
import MetasploitSimulator from "./components/MetasploitSimulator";
import NetworkSecurityLab from "./components/NetworkSecurityLab";
import SuricataSimulator from "./components/SuricataSimulator";
import SqlInjectionSandbox from "./components/SqlInjectionSandbox";
import CryptoSimulator from "./components/CryptoSimulator";
import DigitalSignatureLab from "./components/DigitalSignatureLab";
import CheckpointQuiz from "./components/CheckpointQuiz";
import GlossaryModal from "./components/GlossaryModal";
import { SetupGuideModal } from "./components/SetupGuideModal";
import LoginScreen from "./components/LoginScreen";
import LandingPage from "./components/LandingPage";
import TeacherAdminPanel from "./components/TeacherAdminPanel";
import WelcomeScreen from "./components/WelcomeScreen";
import FrameWatermark from "./components/FrameWatermark";
import { auth, db } from "./config/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { ref, set, onValue, off, DatabaseReference } from "firebase/database";

import {
  BookOpen,
  Search,
  Sun,
  Moon,
  CheckCircle,
  Code,
  Sparkles,
  Award,
  ChevronRight,
  AlertCircle,
  ShieldAlert,
  Copy,
  Check,
  Map,
  BookMarked,
  Info,
  Menu,
  X,
  Target,
  Book,
  LogOut,
  Loader2,
  Settings,
  EyeOff,
  Wrench
} from "lucide-react";

export default function App() {
  // Easter Egg: Hidden Console Signature for Ownership Verification
  useEffect(() => {
    console.log("%cAula Virtual | Sistema de Laboratorios", "font-size: 14px; color: #a1a1aa; font-style: italic; padding-left: 10px;");
    console.log("%cEl código fuente, arquitectura y diseño de este software (Manual Interactivo de Seguridad) han sido desarrollados íntegramente por Marco A. Pacheco A. (FRAME).", "font-size: 12px; color: #71717a; padding-left: 10px;");
  }, []);

  const [showLanding, setShowLanding] = useState(true);

  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [selectedClassId, setSelectedClassId] = useState<number>(() => {
    const saved = localStorage.getItem("manual_selectedClassId");
    return saved ? parseInt(saved) : 0;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("manual_darkMode");
    if (saved !== null) {
      return saved === "true";
    }
    // Si no hay preferencia guardada, leemos el tema del navegador/sistema
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // Fallback a oscuro por si acaso
  });
  const [activeTab, setActiveTab] = useState<"theory" | "lab" | "commands" | "faqs">(() => {
    const saved = localStorage.getItem("manual_activeTab");
    return (saved as "theory" | "lab" | "commands" | "faqs") || "lab";
  });

  useEffect(() => {
    localStorage.setItem("manual_selectedClassId", selectedClassId.toString());
  }, [selectedClassId]);

  // Auto-scroll a la clase activa, pero SOLO cuando carga por primera vez
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
  useEffect(() => {
    if (authLoading || hasInitialScrolled) return;

    const timer = setTimeout(() => {
      const activeDesktop = document.getElementById(`btn_select_class_${selectedClassId}`);
      if (activeDesktop) {
        activeDesktop.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setHasInitialScrolled(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedClassId, authLoading, hasInitialScrolled]);



  useEffect(() => {
    localStorage.setItem("manual_activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("manual_darkMode", darkMode.toString());
  }, [darkMode]);

  const [completedLessons, setCompletedLessons] = useState<Record<number, boolean>>({});
  const [copiedCommandIndex, setCopiedCommandIndex] = useState<number | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [classVisibility, setClassVisibility] = useState<Record<number, boolean>>({});
  const [isVisibilityLoaded, setIsVisibilityLoaded] = useState(false);

  // Prevent body scroll when any modal/floating window is open
  useEffect(() => {
    if (isGlossaryOpen || isGuideOpen || isAdminPanelOpen || isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isGlossaryOpen, isGuideOpen, isAdminPanelOpen, isMobileSidebarOpen]);

  // Auto-scroll exclusivo para la barra móvil (solo existe en el DOM cuando se abre)
  useEffect(() => {
    if (isMobileSidebarOpen) {
      const timer = setTimeout(() => {
        const activeMobile = document.getElementById(`btn_mobile_select_class_${selectedClassId}`);
        if (activeMobile) {
          activeMobile.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50); // Pequeño retraso para que React dibuje el menú modal
      return () => clearTimeout(timer);
    }
  }, [isMobileSidebarOpen, selectedClassId]);

  // Listen to Auth State and Enforce Single Session for Teacher
  useEffect(() => {
    let sessionRef: DatabaseReference | null = null;
    let unsubscribeDb: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser?.email === 'profesor@unsm.edu.pe') {
        try {
          const sessionId = crypto.randomUUID();
          sessionRef = ref(db, 'sessions/teacher');

          // Guardamos la sesión y SÓLO escuchamos después de confirmar que se guardó.
          // Así evitamos el 'suicidio' de sesión si leemos el ID viejo antes de escribir el nuestro.
          set(sessionRef, sessionId).then(() => {
            unsubscribeDb = onValue(sessionRef, (snapshot) => {
              const val = snapshot.val();
              if (val && val !== sessionId) {
                signOut(auth);
                setSessionError("Sesión maestra finalizada: Alguien más ha iniciado sesión con esta cuenta en otro dispositivo.");
              }
            }, (error) => {
              console.error("Error al escuchar sesión:", error);
            });
          }).catch((dbError) => {
            console.error("Error silencioso de base de datos al registrar sesión:", dbError);
          });
        } catch (dbError) {
          console.error("Error al registrar la sesión en la base de datos:", dbError);
          // Aún así permitimos que cargue la app si la base de datos falla
        }
      } else {
        if (sessionRef) off(sessionRef);
      }

      setAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (sessionRef) off(sessionRef);
    };
  }, []);

  // Load initial completion state from local storage (Alumnos) or Firebase (Profesor)
  useEffect(() => {
    if (authLoading) return;

    if (user?.email === 'profesor@unsm.edu.pe') {
      const progressRef = ref(db, 'teacherProgress/completedLessons');
      const unsubscribe = onValue(progressRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setCompletedLessons(data);
        } else {
          // Si el profe entra por primera vez, heredar lo que tenía en local y subirlo a la nube
          const saved = localStorage.getItem("completedLessons");
          if (saved) {
            const parsed = JSON.parse(saved);
            setCompletedLessons(parsed);
            set(progressRef, parsed).catch(console.error);
          }
        }
      });
      return () => unsubscribe();
    } else {
      const saved = localStorage.getItem("completedLessons");
      if (saved) {
        try {
          setCompletedLessons(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [authLoading, user]);

  // Listen to global class visibility settings
  useEffect(() => {
    const visibilityRef = ref(db, 'config/classVisibility');
    const unsubscribe = onValue(visibilityRef, (snapshot) => {
      const data = snapshot.val() || {};
      setClassVisibility(data);
      setIsVisibilityLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // Synchronize dark class to documentElement for global styles (like scrollbars, body background, etc.)
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Scroll to top of the page when selected class changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedClassId]);

  const toggleLessonCompletion = (id: number) => {
    const newCompleted = {
      ...completedLessons,
      [id]: !completedLessons[id]
    };

    // Update local state immediately for fast UI
    setCompletedLessons(newCompleted);

    if (isTeacher) {
      // Guardar en la nube para el profesor (sincronización multidispositivo)
      set(ref(db, 'teacherProgress/completedLessons'), newCompleted).catch(console.error);
    } else {
      // Guardar en local para los alumnos (evita conflictos entre estudiantes)
      localStorage.setItem("completedLessons", JSON.stringify(newCompleted));
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCommandIndex(index);
    setTimeout(() => setCopiedCommandIndex(null), 1500);
  };

  const activeLesson = lessonsData.find((l) => l.id === selectedClassId) || lessonsData[1];

  const isTeacher = user?.email === 'profesor@unsm.edu.pe';
  const isGuest = user?.email === 'invitado@unsm.edu.pe';

  // Filter lessons based on visibility for students
  const visibleLessons = lessonsData.filter(l => {
    if (isTeacher || isGuest) return true;
    return classVisibility[l.id] === true;
  });

  // Search filtered lessons
  const filteredLessons = visibleLessons.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Kick student out of hidden class
  useEffect(() => {
    if (!isTeacher && !isGuest && Object.keys(classVisibility).length > 0) {
      if (classVisibility[selectedClassId] !== true && selectedClassId !== 0) {
        const firstVisible = lessonsData.find(l => classVisibility[l.id] === true);
        if (firstVisible) {
          setSelectedClassId(firstVisible.id);
        }
      }
    }
  }, [classVisibility, isTeacher, isGuest, selectedClassId]);

  // Completion percentage
  const totalActives = visibleLessons.length;
  const totalCompleted = Object.values(completedLessons).filter(Boolean).length;
  const progressPercent = Math.round((totalCompleted / totalActives) * 100) || 0;

  // Helper to render FAQ answers with highlighted commands enclosed in single quotes
  const renderFAQAnswer = (text: string) => {
    // Split on backtick-wrapped segments first, then handle single quotes
    const segments = text.split(/(`[^`]+`)/g);
    return segments.map((seg, i) => {
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 mx-0.5 bg-neutral-200 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold rounded break-words">
            {seg.slice(1, -1)}
          </code>
        );
      }
      // Within non-backtick segments, highlight single-quoted text
      const parts = seg.split("'");
      if (parts.length === 1) return <span key={i}>{seg}</span>;
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1
              ? <code key={j} className="px-1.5 py-0.5 mx-0.5 bg-neutral-200 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-mono text-[11px] font-bold rounded break-words">{part}</code>
              : <span key={j}>{part}</span>
          )}
        </span>
      );
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!user) {
    if (showLanding) {
      return <LandingPage onLoginClick={() => setShowLanding(false)} />;
    }

    return (
      <LoginScreen
        initialError={sessionError}
        onBack={() => setShowLanding(true)}
        onLoginSuccess={() => {
          setSelectedClassId(0);
          localStorage.setItem("manual_selectedClassId", "0");
        }}
      />
    );
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-neutral-50 dark:bg-[#0c0c0e] text-neutral-900 dark:text-zinc-200 font-sans transition-colors duration-200">

        {selectedClassId === 0 ? (
          <WelcomeScreen onStart={() => {
            setSelectedClassId(-1);
            localStorage.setItem("manual_selectedClassId", "-1");
          }} />
        ) : (
          <>
            {/* Core Layout Split: Left Sticky Sidebar + Right Main Content Area */}
            <div className="flex flex-col lg:flex-row min-h-screen relative">

              {/* Sidebar Left Navigation (Desktop) */}
              <aside className="hidden lg:flex lg:flex-col lg:w-80 lg:shrink-0 bg-neutral-50 dark:bg-[#0c0c0e] sticky top-0 h-screen border-r border-neutral-400 dark:border-zinc-800/60 overflow-hidden z-30">
                {/* Logo and Brand Title inside Sidebar */}
                <button 
                  onClick={() => setSelectedClassId(-1)}
                  className="p-5 flex flex-wrap items-center gap-3 text-left w-full hover:bg-neutral-100 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                >
                  <BookOpen className="h-5 w-5 text-cyan-500 shrink-0" />
                  <div>
                    <h1 className="font-serif italic font-semibold text-sm tracking-wide text-neutral-950 dark:text-white">Manual de Ciberseguridad</h1>
                    <p className="text-[9px] text-neutral-700 dark:text-zinc-500 font-bold tracking-[0.15em] uppercase">Curso Interactivo Demostrativo</p>
                  </div>
                </button>

                {/* Search Box inside Sidebar */}
                <div className="px-4 pb-4 space-y-3">
                  <button
                    onClick={() => setSelectedClassId(0)}
                    className={`w-full text-left py-2 px-3 rounded-lg border transition-all flex items-center gap-3 cursor-pointer ${selectedClassId === 0
                        ? "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-400 dark:border-cyan-900/50 text-cyan-700 dark:text-cyan-400 font-bold"
                        : "bg-transparent border-transparent text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-50 dark:bg-zinc-950/30"
                      }`}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-semibold">Pantalla de Inicio</span>
                  </button>

                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-700" />
                    <input
                      type="text"
                      placeholder="Buscar clases..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-[11px] pl-8.5 pr-4 py-2 border border-neutral-400 dark:border-zinc-850 rounded-lg bg-neutral-50 dark:bg-[#0c0c0e] text-neutral-900 dark:text-zinc-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                    />
                  </div>
                </div>

                {/* Class list inside Sidebar */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
                  <div className="px-2 pb-1.5">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-700 dark:text-zinc-500 font-mono">Sesiones del Curso</h3>
                  </div>
                  {filteredLessons.map((item) => {
                    const isSelected = item.id === selectedClassId;
                    const isDone = completedLessons[item.id];
                    const paddedIndex = String(item.id).padStart(2, '0');

                    // Determine badge type matching the user's requirements and uploaded image
                    let badgeLabel = "LABORATORIO";
                    let badgeStyle = "bg-emerald-50 border-emerald-400 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400";

                    if (item.id === 5 || item.id === 10) {
                      badgeLabel = "EVALUACIÓN";
                      badgeStyle = "bg-amber-50 border-amber-400 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400";
                    } else if (item.isIgnored) {
                      badgeLabel = "TEÓRICO";
                      badgeStyle = "bg-slate-50 border-slate-400 text-slate-700 dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-400";
                    }

                    return (
                      <button
                        key={item.id}
                        id={`btn_select_class_${item.id}`}
                        onClick={() => {
                          setSelectedClassId(item.id);
                          setActiveTab(item.isIgnored ? "theory" : "lab");
                        }}
                        className={`w-full text-left p-3.5 rounded-lg border flex items-start gap-3 cursor-pointer transition-colors ${isSelected
                            ? "bg-cyan-50 border-cyan-400 text-cyan-950 dark:bg-zinc-900 dark:border-zinc-700 dark:text-cyan-400 font-bold shadow-sm"
                            : "bg-transparent border-transparent text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800"
                          }`}
                      >
                        <span className={`text-[11px] font-bold font-mono mt-0.5 ${isSelected ? "text-cyan-500" : "text-neutral-700 dark:text-zinc-650"}`}>
                          {paddedIndex}
                        </span>
                        <div className="truncate flex-1 min-w-0">
                          <div className={`text-[12px] leading-snug truncate ${isSelected ? "text-neutral-950 dark:text-white font-bold" : "text-neutral-700 dark:text-zinc-300 font-medium"}`}>
                            {item.title.includes(": ") ? item.title.split(": ")[1] : item.title}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${badgeStyle}`}>
                              {badgeLabel}
                            </span>
                            {isDone && (
                              <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-wider">
                                ✓ Listo
                              </span>
                            )}
                            {isTeacher && isVisibilityLoaded && classVisibility[item.id] !== true && (
                              <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider flex flex-wrap items-center gap-0.5 ml-1" title="Oculto a los alumnos">
                                <EyeOff className="w-2.5 h-2.5" /> Oculto
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Utilities in Sidebar */}
                <div className="p-4 border-t border-neutral-400 dark:border-zinc-800/60 bg-neutral-50 dark:bg-[#0c0c0e]/80 space-y-2">
                  <button
                    id="btn_open_setup_guide"
                    onClick={() => setIsGuideOpen(true)}
                    className="w-full p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-400 dark:border-emerald-900/40 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-50 dark:bg-emerald-950/30 cursor-pointer transition-colors text-[10px] font-bold tracking-widest uppercase flex flex-wrap items-center gap-2 justify-center"
                  >
                    <Wrench className="h-4 w-4" />
                    <span>Entorno de Laboratorio</span>
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="btn_open_glossary"
                      onClick={() => setIsGlossaryOpen(true)}
                      className="w-full p-2.5 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-400 dark:border-cyan-900/40 rounded-lg text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-50 dark:bg-cyan-950/30 cursor-pointer transition-colors text-[10px] font-bold tracking-widest uppercase flex flex-wrap items-center justify-center gap-1.5"
                    >
                      <Book className="h-4 w-4" />
                      <span>Glosario</span>
                    </button>
                    <button
                      id="btn_toggle_dark_mode"
                      onClick={() => setDarkMode(!darkMode)}
                      className="w-full p-2.5 bg-neutral-200 dark:bg-zinc-800/80 border border-neutral-500 dark:border-zinc-700/80 rounded-lg text-neutral-700 dark:text-zinc-300 hover:text-neutral-950 dark:hover:text-zinc-100 cursor-pointer transition-colors text-[10px] font-bold tracking-widest uppercase flex flex-wrap items-center justify-center gap-1.5"
                    >
                      {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      <span>{darkMode ? "Claro" : "Oscuro"}</span>
                    </button>
                  </div>
                </div>
                <div className="px-5 pb-3 flex justify-center">
                  <FrameWatermark variant="inline" />
                </div>
              </aside>

              {/* Main Content Column */}
              <div className="flex-grow flex flex-col min-w-0 bg-neutral-50 dark:bg-[#0c0c0e] transition-colors duration-200">
                {/* Global Header (Top of main area) */}
                <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-md border-b border-neutral-400 dark:border-zinc-800/60 px-6 py-4 flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      id="btn_open_mobile_sidebar"
                      onClick={() => setIsMobileSidebarOpen(true)}
                      className="lg:hidden p-2 text-neutral-800 hover:text-neutral-700 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-lg cursor-pointer transition-colors"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                    <div className="hidden lg:flex flex-wrap items-center gap-2 text-xs text-neutral-800 dark:text-zinc-450 font-medium">
                      {selectedClassId <= 0 ? (
                        <span className="text-neutral-850 dark:text-zinc-200 font-bold tracking-widest uppercase">Bienvenido</span>
                      ) : (
                        <>
                          <span>Temario</span>
                          <ChevronRight className="h-3 w-3" />
                          <span className="text-neutral-850 dark:text-zinc-200 font-bold">{activeLesson.title.includes(": ") ? activeLesson.title.split(": ")[1] : activeLesson.title}</span>
                        </>
                      )}
                    </div>
                    <div className="lg:hidden flex flex-wrap items-center gap-2">
                      <BookOpen className="h-4 w-4 text-cyan-500" />
                      <span className="font-serif italic text-xs tracking-wide text-neutral-950 dark:text-white">Manual de Ciberseguridad</span>
                    </div>
                  </div>

                  {/* Center Progress bar */}
                  <div className="hidden md:flex flex-wrap items-center gap-3 bg-neutral-100 dark:bg-zinc-900/30 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-neutral-400 dark:border-zinc-850">
                    <span className="text-[9px] font-bold uppercase text-neutral-800 dark:text-zinc-500 tracking-wider">Progreso:</span>
                    <div className="w-24 bg-neutral-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 dark:bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] h-1 rounded-full transition-all duration-500" style={{ width: `${progressPercent || 0}%` }}></div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400">{progressPercent || 0}%</span>
                  </div>

                  {/* Right Header Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {isTeacher && (
                      <button
                        onClick={() => setIsAdminPanelOpen(true)}
                        className="hidden md:flex flex-wrap p-2 px-3.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-400 dark:border-indigo-900/40 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-50 dark:bg-indigo-950/30 cursor-pointer transition-colors text-[10px] font-bold tracking-widest uppercase items-center gap-1.5"
                        title="Panel de Control (Profesor)"
                      >
                        <Settings className="h-3.5 w-3.5" />
                        <span>Control</span>
                      </button>
                    )}
                    <button
                      onClick={() => signOut(auth)}
                      className="hidden md:flex flex-wrap p-2 px-3.5 bg-red-50 dark:bg-red-950/20 border border-red-400 dark:border-red-900/40 rounded-full text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-50 dark:bg-red-950/30 cursor-pointer transition-colors text-[10px] font-bold tracking-widest uppercase items-center gap-1.5"
                      title="Cerrar Sesión"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Salir</span>
                    </button>
                  </div>
                </header>

                {/* Active Lesson details main board */}
                {selectedClassId === -1 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-20">
                    <div className="w-24 h-24 bg-cyan-50 dark:bg-cyan-950/30 rounded-full flex items-center justify-center mb-6 border border-cyan-400 dark:border-cyan-900/40 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                      <BookOpen className="w-10 h-10 text-cyan-600 dark:text-cyan-500" />
                    </div>
                    <h2 className="text-3xl font-serif italic text-slate-800 dark:text-zinc-200 mb-4 tracking-wide">
                      Bienvenido al Entorno de Laboratorio
                    </h2>
                    <p className="text-[13px] text-slate-700 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                      A tu izquierda encontrarás todos los módulos teóricos y laboratorios interactivos disponibles.<br /><br />
                      Selecciona una sesión en el panel lateral para comenzar.
                    </p>

                  </div>
                ) : (
                  <div className="flex-1 p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
                    {/* Class Hero Info Header */}
                    <div className="bg-white dark:bg-[#08080a] border border-neutral-400 dark:border-zinc-900/60 rounded-2xl p-6 lg:p-8 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 rounded text-[9px] font-bold tracking-[0.1em] uppercase">
                              {activeLesson.category}
                            </span>
                            <span className="px-2 py-0.5 bg-neutral-100 dark:bg-[#0c0c0e] text-neutral-800 dark:text-zinc-400 rounded text-[9px] font-bold tracking-wider uppercase font-mono">
                              {activeLesson.duration}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase font-mono ${activeLesson.difficulty === "Avanzado"
                                ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                                : activeLesson.difficulty === "Intermedio"
                                  ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                              }`}>
                              {activeLesson.difficulty}
                            </span>
                          </div>
                          <h2 className="text-4xl lg:text-5xl font-serif italic text-neutral-900 dark:text-white leading-tight font-medium">
                            {activeLesson.title.includes(": ") ? activeLesson.title.split(": ")[1] : activeLesson.title}
                          </h2>
                          <p className="text-xs uppercase tracking-[0.2em] text-neutral-700 dark:text-zinc-500 font-bold font-sans">
                            {activeLesson.subtitle}
                          </p>
                        </div>

                        {/* Checklist toggle button */}
                        <button
                          id={`btn_toggle_complete_${activeLesson.id}`}
                          onClick={() => toggleLessonCompletion(activeLesson.id)}
                          className={`w-full sm:w-auto py-2.5 sm:py-2 px-4 border rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer shrink-0 transition-all flex flex-wrap items-center justify-center gap-2 ${completedLessons[activeLesson.id]
                              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                              : "bg-neutral-900 hover:bg-neutral-850 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-transparent text-white dark:text-zinc-100"
                            }`}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>{completedLessons[activeLesson.id] ? "Lección Completada" : "Marcar Completada"}</span>
                        </button>
                      </div>

                      {/* Class Summary Box */}
                      <div className="p-5 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-400 dark:border-cyan-900/40 rounded-2xl text-[13px] text-neutral-600 dark:text-zinc-300 leading-relaxed flex flex-wrap items-start gap-3.5">
                        <BookMarked className="h-5 w-5 text-cyan-500 shrink-0 mt-0.5" />
                        <p>{activeLesson.summary}</p>
                      </div>
                    </div>

                    {/* Content Tabs headers */}
                    <div className="relative">
                      <div
                        className="border-b border-slate-400 dark:border-zinc-850 flex gap-6 overflow-x-auto pb-px whitespace-nowrap scrollbar-none no-scrollbar pr-12"
                        style={{ maskImage: 'linear-gradient(to right, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}
                      >
                        {!activeLesson.isIgnored && (
                          <button
                            id="tab_active_lab"
                            onClick={() => setActiveTab("lab")}
                            className={`py-3 px-1 text-[11px] font-bold uppercase tracking-[0.15em] border-b-2 cursor-pointer transition-all shrink-0 ${activeTab === "lab"
                                ? "border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold"
                                : "border-transparent text-neutral-700 hover:text-neutral-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                              }`}
                          >
                            🛠 Laboratorio Táctico
                          </button>
                        )}
                        <button
                          id="tab_active_theory"
                          onClick={() => setActiveTab("theory")}
                          className={`py-3 px-1 text-[11px] font-bold uppercase tracking-[0.15em] border-b-2 cursor-pointer transition-all shrink-0 ${activeTab === "theory"
                              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                              : "border-transparent text-neutral-700 hover:text-neutral-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                            }`}
                        >
                          📖 Apuntes y Teoría
                        </button>
                        <button
                          id="tab_active_commands"
                          onClick={() => setActiveTab("commands")}
                          className={`py-3 px-1 text-[11px] font-bold uppercase tracking-[0.15em] border-b-2 cursor-pointer transition-all shrink-0 ${activeTab === "commands"
                              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                              : "border-transparent text-neutral-700 hover:text-neutral-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                            }`}
                        >
                          💻 Prontuario
                        </button>
                        {activeLesson.faqs && (
                          <button
                            id="tab_active_faqs"
                            onClick={() => setActiveTab("faqs")}
                            className={`py-3 px-1 text-[11px] font-bold uppercase tracking-[0.15em] border-b-2 cursor-pointer transition-all shrink-0 ${activeTab === "faqs"
                                ? "border-red-500 text-red-600 dark:text-red-400 font-bold"
                                : "border-transparent text-neutral-700 hover:text-neutral-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                              }`}
                          >
                            ❓ Preguntas Frecuentes
                          </button>
                        )}
                      </div>
                      <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none sm:hidden flex items-center justify-end pr-1">
                        <ChevronRight className="w-5 h-5 text-neutral-600 dark:text-white animate-pulse drop-shadow-lg" />
                      </div>
                    </div>

                    {/* Dynamic rendering depending on selected Tab */}
                    <div className="space-y-6">

                      {/* Tab Case 1: Interactive Laboratorio/Simulador */}
                      {activeTab === "lab" && !activeLesson.isIgnored && (
                        <div className="space-y-6">
                          {activeLesson.id === 2 && <AircrackSimulator />}
                          {activeLesson.id === 3 && <RiskMatrixCalculator />}
                          {activeLesson.id === 4 && <DictionaryGenerator />}
                          {activeLesson.id === 6 && <PhishingSimulator />}
                          {activeLesson.id === 7 && <MetasploitSimulator />}
                          {activeLesson.id === 8 && <NetworkSecurityLab />}
                          {activeLesson.id === 9 && <SuricataSimulator />}
                          {activeLesson.id === 11 && <SqlInjectionSandbox />}
                          {activeLesson.id === 12 && <CryptoSimulator />}
                          {activeLesson.id === 13 && <DigitalSignatureLab isTeacher={isTeacher} isGuest={isGuest} />}
                        </div>
                      )}

                      {/* Tab Case 2: Apuntes y Teoría */}
                      {activeTab === "theory" && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

                          {/* Left sub-column: Objectives and intro, or main Quiz for evaluation classes */}
                          <div className="md:col-span-8 space-y-6">
                            {(activeLesson.id === 5 || activeLesson.id === 10) ? (
                              <CheckpointQuiz
                                quizId={activeLesson.id as 5 | 10}
                                isTeacher={isTeacher}
                                onComplete={() => {
                                  if (!completedLessons[activeLesson.id]) {
                                    toggleLessonCompletion(activeLesson.id);
                                  }
                                }}
                                isLessonCompleted={!!completedLessons[activeLesson.id]}
                              />
                            ) : (
                              <>
                                <div className="bg-white dark:bg-[#08080a] border border-neutral-400 dark:border-zinc-900/60 rounded-2xl p-6 space-y-4">
                                  <h3 className="text-[10px] font-bold text-neutral-700 dark:text-zinc-500 uppercase tracking-[0.2em] font-mono">Resumen de Contenido</h3>
                                  <p className="text-[13px] text-neutral-600 dark:text-zinc-300 leading-relaxed font-sans">
                                    {activeLesson.theory.introduction}
                                  </p>

                                  {/* Display warning or PortSwigger recomendation for Clase 11 */}
                                  {activeLesson.additionalInfo && (
                                    <div className="p-4 bg-amber-50 dark:bg-amber-50 dark:bg-amber-950/300/5 border border-amber-400 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-400 flex flex-wrap items-start gap-2.5">
                                      <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-amber-500" />
                                      <p className="leading-relaxed">{activeLesson.additionalInfo}</p>
                                    </div>
                                  )}
                                </div>

                                {/* Key concepts bento cards */}
                                <div className="space-y-3">
                                  <h4 className="text-[10px] font-bold uppercase text-neutral-700 dark:text-zinc-500 font-mono tracking-[0.2em]">Conceptos Técnicos Clave</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {activeLesson.theory.keyConcepts.map((concept, idx) => (
                                      <div key={idx} className="p-5 bg-white dark:bg-[#08080a] border border-neutral-400 dark:border-zinc-900/60 rounded-xl space-y-2 hover:border-neutral-500 dark:hover:border-zinc-800 transition-colors">
                                        <h5 className="font-bold text-[13px] text-neutral-800 dark:text-zinc-200 flex flex-wrap items-center gap-2">
                                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/300 shrink-0"></span> {concept.title}
                                        </h5>
                                        <p className="text-[11px] text-neutral-800 dark:text-zinc-400 leading-relaxed">{concept.description}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Right sub-column: Objectives list & extra information */}
                          <div className="md:col-span-4 space-y-4">
                            {(activeLesson.id === 5 || activeLesson.id === 10) && (
                              <div className="bg-white dark:bg-[#08080a] border border-neutral-400 dark:border-zinc-900/60 rounded-2xl p-5 space-y-3">
                                <h3 className="text-[10px] font-bold text-neutral-700 dark:text-zinc-500 uppercase tracking-[0.2em] font-mono">Guía de Evaluación</h3>
                                <p className="text-[12px] text-neutral-600 dark:text-zinc-400 leading-relaxed font-sans">
                                  {activeLesson.theory.introduction}
                                </p>
                              </div>
                            )}

                            <div className="bg-neutral-100 dark:bg-zinc-900/20 border border-neutral-400 dark:border-zinc-900/60 rounded-2xl p-5 space-y-4">
                              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-700 dark:text-zinc-500 font-mono">Objetivos de la Clase</h4>
                              <ul className="space-y-3 text-[11px] text-neutral-600 dark:text-zinc-400">
                                {activeLesson.theory.objectives.map((obj, i) => (
                                  <li key={i} className="flex flex-wrap items-start gap-2.5">
                                    <Target className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                                    <span>{obj}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {(activeLesson.id === 5 || activeLesson.id === 10) && (
                              <div className="space-y-3">
                                <h4 className="text-[10px] font-bold uppercase text-neutral-700 dark:text-zinc-500 font-mono tracking-[0.2em]">Temario Evaluado</h4>
                                <div className="space-y-2">
                                  {activeLesson.theory.keyConcepts.map((concept, idx) => (
                                    <div key={idx} className="p-4 bg-white dark:bg-[#08080a] border border-neutral-400 dark:border-zinc-900/60 rounded-xl space-y-1">
                                      <h5 className="font-bold text-[12px] text-neutral-800 dark:text-zinc-200 flex flex-wrap items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/300 shrink-0"></span> {concept.title}
                                      </h5>
                                      <p className="text-[10px] text-neutral-800 dark:text-zinc-400 leading-relaxed">{concept.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tab Case 3: Command List Cheat Sheet */}
                      {activeTab === "commands" && activeLesson.commands && (
                        <div className="bg-white dark:bg-[#08080a] border border-neutral-400 dark:border-zinc-900/60 rounded-2xl p-6 space-y-4">
                          <div className="space-y-1">
                            <h3 className="text-[10px] font-bold text-neutral-700 dark:text-zinc-500 uppercase tracking-[0.2em] font-mono">Prontuario de Comandos de Kali Linux</h3>
                            <p className="text-[11px] text-neutral-800 dark:text-zinc-400">Copia los comandos haciendo clic y practícalos en tu máquina virtual de clase.</p>
                          </div>

                          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-400 dark:border-amber-900/50 rounded-xl flex flex-wrap gap-3">
                            <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
                            <div className="space-y-1">
                              <p className="text-[12px] font-bold text-amber-800 dark:text-amber-300">¡Aviso Importante!</p>
                              <p className="text-[11px] text-amber-700 dark:text-amber-400/80 leading-relaxed">
                                Los textos entre corchetes <code className="bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded font-mono text-amber-900 dark:text-amber-200">[COMO_ESTE]</code> son marcadores de posición.
                                Debes borrar los corchetes e insertar tu propio dato antes de ejecutar el comando.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4 mt-4">
                            {/* Helper: renders backtick-wrapped text as inline code */}
                            {(() => {
                              const renderInlineCode = (text: string, baseColor: string) =>
                                text.split(/(`[^`]+`)/g).map((part, i) =>
                                  part.startsWith('`') && part.endsWith('`')
                                    ? <code key={i} className={`${baseColor} px-1.5 py-0.5 rounded font-mono text-[11px] mx-0.5`}>{part.slice(1, -1)}</code>
                                    : <span key={i}>{part}</span>
                                );
                              return null;
                            })()}
                            {activeLesson.commands.map((step, idx) => {
                              const prevGroup = idx > 0 ? activeLesson.commands![idx - 1].group : undefined;
                              const showGroupHeader = step.group && step.group !== prevGroup;

                              // Check for specific instruction types
                              const isUrl = step.description.startsWith("(URL)");
                              const isKeyboard = step.description.startsWith("(TECLADO)");
                              const isNota = step.description.startsWith("(NOTA)");
                              const isPostExploitation = step.description.includes("(Post-explotación)");
                              const cleanDescription = step.description.replace(/^\(URL\)\s*|^\(TECLADO\)\s*|^\(NOTA\)\s*/, '');

                              // Render inline backtick code segments
                              const inlineCodeColor = isUrl
                                ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200'
                                : isKeyboard
                                  ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200'
                                  : isNota
                                    ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200'
                                    : 'bg-neutral-100 dark:bg-zinc-800 text-neutral-800 dark:text-zinc-200';

                              const renderInlineCode = (text: string) =>
                                text.split(/(`[^`]+`)/g).map((part, i) =>
                                  part.startsWith('`') && part.endsWith('`')
                                    ? <code key={i} className={`${inlineCodeColor} px-1.5 py-0.5 rounded font-mono text-[11px] mx-0.5`}>{part.slice(1, -1)}</code>
                                    : <span key={i}>{part}</span>
                                );

                              return (
                                <React.Fragment key={idx}>
                                  {showGroupHeader && (
                                    <div className="mt-8 mb-4 first:mt-4">
                                      <h4 className="text-[11px] font-bold text-neutral-800 dark:text-zinc-200 uppercase tracking-widest flex flex-wrap items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-cyan-50 dark:bg-cyan-950/300"></span> Herramienta: {step.group}
                                      </h4>
                                    </div>
                                  )}
                                  <div className={`group relative border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-sm ${isUrl ? 'bg-sky-50 dark:bg-[#0a0f14] border-sky-400 dark:border-sky-900/40 hover:border-sky-400 dark:border-sky-900/40' :
                                      isKeyboard ? 'bg-purple-50 dark:bg-[#0f0a14] border-purple-400 dark:border-purple-900/40 hover:border-purple-400 dark:border-purple-900/40' :
                                        isNota ? 'bg-amber-50 dark:bg-[#13110a] border-amber-400 dark:border-amber-900/40 hover:border-amber-400 dark:border-amber-900/40' :
                                          'bg-white dark:bg-[#0a0a0c] border-neutral-400 dark:border-zinc-800/60 hover:border-cyan-400 dark:border-cyan-900/40 dark:hover:border-cyan-400 dark:border-cyan-900/40'
                                    }`}>

                                    {/* Header/Description */}
                                    <div className={`px-5 py-4 border-b flex flex-col gap-2 ${isUrl ? 'border-sky-400 dark:border-sky-900/30 bg-sky-50 dark:bg-sky-900/10' :
                                        isKeyboard ? 'border-purple-400 dark:border-purple-900/30 bg-purple-50 dark:bg-purple-900/10' :
                                          isNota ? 'border-amber-400 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10' :
                                            'border-neutral-400 dark:border-zinc-900/50 bg-neutral-50/50 dark:bg-zinc-900/20'
                                      }`}>
                                      {/* Badges for URL/Teclado/Nota */}
                                      {(isUrl || isKeyboard || isNota) && (
                                        <div className="flex">
                                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isUrl ? 'bg-sky-200 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300' :
                                              isNota ? 'bg-amber-200 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300' :
                                                'bg-purple-200 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                                            }`}>
                                            {isUrl ? 'Navegador Web' : isNota ? '📋 Instrucción Manual' : 'Atajo de Teclado'}
                                          </span>
                                        </div>
                                      )}

                                      <div className="flex flex-wrap items-start gap-3">
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5 ${isUrl ? 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400' :
                                            isKeyboard ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400' :
                                              isNota ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' :
                                                'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400'
                                          }`}>
                                          {idx + 1}
                                        </div>
                                        <p className="text-[13px] text-neutral-700 dark:text-zinc-300 leading-relaxed font-sans pr-4">
                                          {renderInlineCode(cleanDescription)}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Code Section - hidden for Nota/Instrucción steps */}
                                    {!isNota && (
                                      <div className="relative bg-[#1e1e1e] p-4 group-hover:bg-[#1a1a1a] transition-colors">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                          <code className={`flex-1 text-[12px] font-mono break-all whitespace-pre-wrap select-all ${isUrl ? 'text-sky-300' :
                                              isKeyboard ? 'text-purple-300' :
                                                'text-emerald-400'
                                            }`}>
                                            {!isUrl && !isKeyboard && (
                                              <span className="text-zinc-500 select-none mr-2">
                                                {isPostExploitation ? "meterpreter >" : "$"}
                                              </span>
                                            )}
                                            {step.command}
                                          </code>
                                          <button
                                            id={`btn_copy_command_${idx}`}
                                            onClick={() => copyToClipboard(step.command, idx)}
                                            className="flex-shrink-0 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-700 hover:text-white transition-all active:scale-95"
                                            title="Copiar comando"
                                          >
                                            {copiedCommandIndex === idx ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                  </div>
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Tab Case 4: FAQs */}
                      {activeTab === "faqs" && activeLesson.faqs && (
                        <div className="bg-white dark:bg-[#08080a] border border-neutral-400 dark:border-zinc-900/60 rounded-2xl p-6 space-y-6">
                          <div className="space-y-1">
                            <h3 className="text-[10px] font-bold text-neutral-700 dark:text-zinc-500 uppercase tracking-[0.2em] font-mono">Preguntas Frecuentes y Solución de Errores</h3>
                            <p className="text-[11px] text-neutral-800 dark:text-zinc-400">Si te estancas en el laboratorio, revisa estas soluciones comunes antes de llamar al profesor.</p>
                          </div>

                          <div className="space-y-4">
                            {activeLesson.faqs.map((faq, idx) => (
                              <div key={idx} className="p-5 bg-neutral-50/50 dark:bg-[#0c0c0e] border border-neutral-400 dark:border-zinc-800/60 rounded-xl space-y-3">
                                <div className="flex flex-wrap items-start gap-3">
                                  <div className="flex-shrink-0 mt-0.5 text-cyan-600 dark:text-cyan-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                  </div>
                                  <h4 className="font-bold text-[14px] text-neutral-800 dark:text-zinc-200 leading-snug">
                                    {faq.question}
                                  </h4>
                                </div>
                                <div className="pl-7 text-[13px] text-neutral-600 dark:text-zinc-400 leading-relaxed font-sans whitespace-pre-wrap">
                                  {renderFAQAnswer(faq.answer)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Global Footer (Nested inside the Main Content Area to scroll naturally) */}
                <footer className="border-t border-neutral-400 dark:border-zinc-900/80 py-10 px-6 lg:px-8 text-center bg-white dark:bg-[#08080a] text-xs text-neutral-700 dark:text-zinc-500 font-medium mt-auto">
                  <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      © 2026 Manual Interactivo de Ciberseguridad. Todos los derechos reservados.
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 justify-center">
                      <span className="px-3 py-1 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-full border border-indigo-400 dark:border-indigo-800/50 text-[10px] uppercase font-mono tracking-wider">Marco A. Pacheco A.</span>
                      <span className="px-3 py-1 bg-neutral-100 dark:bg-zinc-900/50 rounded-full border border-neutral-400 dark:border-zinc-800 text-[10px] uppercase font-mono tracking-wider">Aula Virtual</span>
                      <FrameWatermark variant="footer" />
                    </div>
                  </div>
                </footer>

              </div> {/* Close Main Content Column */}
            </div> {/* Close Core Layout Split wrapper */}

            {/* Slide-over Mobile Drawer for navigation (Mobile Only) */}
            {isMobileSidebarOpen && (
              <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
                <div className="absolute inset-0 overflow-hidden">
                  {/* Overlay background */}
                  <div
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="absolute inset-0 bg-[#0c0c0e]/80 backdrop-blur-xs transition-opacity"
                  ></div>

                  <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
                    <div className="pointer-events-auto w-screen max-w-xs h-full">
                      <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#08080a] p-5 shadow-xl border-r border-neutral-400 dark:border-zinc-900">
                        <div className="flex items-center justify-between pb-4 border-b border-neutral-400 dark:border-zinc-900">
                          <button 
                            onClick={() => {
                              setSelectedClassId(-1);
                              setIsMobileSidebarOpen(false);
                            }}
                            className="flex flex-wrap items-center gap-2 text-left cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <BookOpen className="h-5 w-5 text-cyan-500" />
                            <span className="font-serif italic text-sm text-neutral-950 dark:text-white">Manual de Ciberseguridad</span>
                          </button>
                          <button
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="p-1.5 text-neutral-800 hover:text-neutral-800 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-lg cursor-pointer transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Progress tracking on mobile */}
                        <div className="py-4 border-b border-neutral-400 dark:border-zinc-900 space-y-1.5">
                          <div className="flex justify-between text-[11px] font-bold text-neutral-800 font-mono">
                            <span>Progreso:</span>
                            <span>{progressPercent}%</span>
                          </div>
                          <div className="w-full bg-neutral-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                          </div>
                        </div>

                        {/* Navigation Items (Mobile) */}
                        <div className="flex-1 py-4 space-y-1.5 overflow-y-auto scrollbar-thin">
                          {lessonsData.map((item) => {
                            const isSelected = item.id === selectedClassId;
                            const isDone = completedLessons[item.id];
                            const paddedIndex = String(item.id).padStart(2, '0');

                            // Determine badge type matching the user's requirements and uploaded image
                            let badgeLabel = "LABORATORIO";
                            let badgeStyle = "bg-emerald-50 border-emerald-400 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400";

                            if (item.id === 5 || item.id === 10) {
                              badgeLabel = "EVALUACIÓN";
                              badgeStyle = "bg-amber-50 border-amber-400 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400";
                            } else if (item.isIgnored) {
                              badgeLabel = "TEÓRICO";
                              badgeStyle = "bg-slate-50 border-slate-400 text-slate-700 dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-400";
                            }

                            return (
                              <button
                                key={item.id}
                                id={`btn_mobile_select_class_${item.id}`}
                                onClick={() => {
                                  setSelectedClassId(item.id);
                                  setActiveTab(item.isIgnored ? "theory" : "lab");
                                  setIsMobileSidebarOpen(false);
                                }}
                                className={`w-full text-left p-3.5 rounded-lg border flex items-start gap-3 cursor-pointer transition-colors ${isSelected
                                    ? "bg-cyan-50 border-cyan-400 text-cyan-950 dark:bg-zinc-900 dark:border-zinc-700 dark:text-cyan-400 font-bold shadow-sm"
                                    : "bg-transparent border-transparent text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800"
                                  }`}
                              >
                                <span className="text-[10px] font-mono mr-1 text-cyan-500">{paddedIndex}</span>
                                <div className="truncate flex-1 min-w-0 text-xs">
                                  <div className={`font-semibold leading-tight truncate ${isSelected ? "text-neutral-950 dark:text-white font-bold" : "text-neutral-800 dark:text-zinc-300 font-medium"}`}>
                                    {item.title.includes(": ") ? item.title.split(": ")[1] : item.title}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${badgeStyle}`}>
                                      {badgeLabel}
                                    </span>
                                    {isDone && <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-wider">✓ Listo</span>}
                                    {isTeacher && isVisibilityLoaded && classVisibility[item.id] !== true && (
                                      <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider flex flex-wrap items-center gap-0.5 ml-1">
                                        <EyeOff className="w-2.5 h-2.5" />
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                      {/* Bottom Utilities in Mobile Sidebar */}
                      <div className="p-4 border-t border-neutral-400 dark:border-zinc-800/60 bg-neutral-50 dark:bg-[#0c0c0e]/80 space-y-2">
                        {isTeacher && (
                          <button
                            onClick={() => { setIsAdminPanelOpen(true); setIsMobileSidebarOpen(false); }}
                            className="w-full p-2.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-400 dark:border-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-50 dark:bg-indigo-950/30 cursor-pointer transition-colors text-[10px] font-bold tracking-widest uppercase flex flex-wrap items-center gap-2 justify-center"
                          >
                            <Settings className="h-4 w-4" />
                            <span>Panel de Control</span>
                          </button>
                        )}
                        <button
                          id="btn_mobile_open_setup_guide"
                          onClick={() => { setIsGuideOpen(true); setIsMobileSidebarOpen(false); }}
                          className="w-full p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-400 dark:border-emerald-900/40 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-50 dark:bg-emerald-950/30 cursor-pointer transition-colors text-[10px] font-bold tracking-widest uppercase flex flex-wrap items-center gap-2 justify-center"
                        >
                          <Wrench className="h-4 w-4" />
                          <span>Entorno de Laboratorio</span>
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            id="btn_mobile_open_glossary"
                            onClick={() => { setIsGlossaryOpen(true); setIsMobileSidebarOpen(false); }}
                            className="w-full p-2.5 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-400 dark:border-cyan-900/40 rounded-lg text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-50 dark:bg-cyan-950/30 cursor-pointer transition-colors text-[10px] font-bold tracking-widest uppercase flex flex-wrap items-center justify-center gap-1.5"
                          >
                            <Book className="h-4 w-4" />
                            <span>Glosario</span>
                          </button>
                          <button
                            id="btn_mobile_toggle_dark_mode"
                            onClick={() => setDarkMode(!darkMode)}
                            className="w-full p-2.5 bg-neutral-200 dark:bg-zinc-800/80 border border-neutral-500 dark:border-zinc-700/80 rounded-lg text-neutral-700 dark:text-zinc-300 hover:text-neutral-950 dark:hover:text-zinc-100 cursor-pointer transition-colors text-[10px] font-bold tracking-widest uppercase flex flex-wrap items-center justify-center gap-1.5"
                          >
                            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            <span>{darkMode ? "Claro" : "Oscuro"}</span>
                          </button>
                        </div>
                        <button
                          onClick={() => { signOut(auth); setIsMobileSidebarOpen(false); }}
                          className="w-full p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-400 dark:border-red-900/40 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-50 dark:bg-red-950/30 cursor-pointer transition-colors text-[10px] font-bold tracking-widest uppercase flex flex-wrap items-center gap-2 justify-center"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                      <div className="px-5 pb-3 flex justify-center bg-[#fafafa] dark:bg-[#08080a]">
                        <FrameWatermark variant="inline" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}
          </>
        )}
      </div>
      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
      <SetupGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} darkMode={darkMode} />
      <TeacherAdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} />
    </div>
  );
}
