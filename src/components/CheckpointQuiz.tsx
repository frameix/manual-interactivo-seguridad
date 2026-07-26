import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../config/firebase";
import { ref, push, set, onValue, get } from "firebase/database";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  Award,
  ChevronRight,
  ArrowRight,
  Trophy,
  Check,
  X,
  BookOpen,
  Sparkles,
  Lock,
  Loader2
} from "lucide-react";

interface Question {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizProps {
  quizId: 5 | 10;
  onComplete?: () => void;
  isLessonCompleted?: boolean;
  isTeacher?: boolean;
}

export default function CheckpointQuiz({ quizId, onComplete, isLessonCompleted, isTeacher }: QuizProps) {
  const getStorageKey = (id: number) => `quizState_${id}`;

  const loadSavedState = () => {
    try {
      const saved = localStorage.getItem(getStorageKey(quizId));
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return null;
  };

  const savedData = loadSavedState();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(savedData?.currentQuestionIndex ?? 0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(savedData?.selectedAnswer ?? null);
  const [isAnswered, setIsAnswered] = useState<boolean>(savedData?.isAnswered ?? false);
  const [answersHistory, setAnswersHistory] = useState<Record<number, number>>(savedData?.answersHistory ?? {});
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(savedData?.isQuizFinished ?? false);

  // Identity and Submission State
  const [studentName, setStudentName] = useState<string>(savedData?.studentName ?? "");
  const [isNameSet, setIsNameSet] = useState<boolean>(!!savedData?.studentName);
  const [isCheckingDb, setIsCheckingDb] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[][]>(savedData?.shuffledIndices ?? []);

  // Save State whenever it changes
  useEffect(() => {
    const stateToSave = {
      currentQuestionIndex,
      selectedAnswer,
      isAnswered,
      answersHistory,
      isQuizFinished,
      studentName,
      isNameSet,
      shuffledIndices
    };
    localStorage.setItem(getStorageKey(quizId), JSON.stringify(stateToSave));
  }, [currentQuestionIndex, selectedAnswer, isAnswered, answersHistory, isQuizFinished, studentName, isNameSet, shuffledIndices, quizId]);

  const questionsQuiz5: Question[] = [
    {
      q: "¿Cuál de los siguientes principios de la Tríada CID (Confidencialidad, Integridad y Disponibilidad) garantiza que los datos no sean legibles por intrusos no autorizados?",
      options: [
        "A) Integridad",
        "B) Confidencialidad",
        "C) Disponibilidad",
        "D) No repudio"
      ],
      correct: 1, // B
      explanation: "La Confidencialidad consiste en prevenir la divulgación no autorizada de información, haciendo uso de herramientas criptográficas y controles de acceso estrictos."
    },
    {
      q: "¿Cuál es la diferencia entre un Hacker de Sombrero Blanco (White Hat) y un Sombrero Negro (Black Hat)?",
      options: [
        "A) El Sombrero Blanco ataca para robar datos, el Negro para venderlos.",
        "B) El Sombrero Blanco actúa con autorización y ética, el Negro actúa con fines maliciosos e ilegales.",
        "C) El Sombrero Blanco solo usa Kali Linux, el Negro usa Windows.",
        "D) No existe diferencia, ambos son ilegales."
      ],
      correct: 1, // B
      explanation: "El White Hat trabaja reportando vulnerabilidades a las empresas bajo un contrato ético, mientras que el Black Hat busca beneficio propio dañando sistemas."
    },
    {
      q: "¿Cómo se define correctamente una 'Vulnerabilidad' en seguridad de la información?",
      options: [
        "A) Un evento externo que puede causar daño (ej. un desastre natural).",
        "B) Una debilidad en un sistema o proceso que puede ser explotada por una amenaza.",
        "C) La probabilidad de que ocurra un evento adverso.",
        "D) Un software malicioso diseñado para robar contraseñas."
      ],
      correct: 1, // B
      explanation: "Una vulnerabilidad es una falla o debilidad (ej. software desactualizado o mala configuración) que abre la puerta a que una amenaza logre su objetivo."
    },
    {
      q: "¿Cuál es el propósito del ataque de 'desautenticación' (Deauth) con aireplay-ng durante una auditoría Wi-Fi?",
      options: [
        "A) Desactivar permanentemente el router para sabotear su red física.",
        "B) Forzar al cliente a reconectarse temporalmente para interceptar el WPA 4-Way Handshake en el aire.",
        "C) Clonar la dirección MAC del AP para inyectar consultas SQL sobre el router.",
        "D) Cifrar la señal inalámbrica con un hash MD5 local."
      ],
      correct: 1, // B
      explanation: "El ataque de deauth desconecta temporalmente a un dispositivo conectado legítimamente para obligarlo a realizar un nuevo proceso de asociación (re-handshake), permitiendo capturar ese apretón de manos."
    },
    {
      q: "Al evaluar un riesgo en la matriz, ¿cuáles son las dos variables principales que se multiplican para obtener la calificación final?",
      options: [
        "A) Costo y Tiempo.",
        "B) Probabilidad e Impacto.",
        "C) Amenaza y Vulnerabilidad.",
        "D) Confidencialidad y Disponibilidad."
      ],
      correct: 1, // B
      explanation: "La matriz de riesgo clásica se calcula determinando cuán probable es que ocurra un evento (Probabilidad) y qué tan fuerte sería el daño si ocurre (Impacto)."
    },
    {
      q: "Si un activo tiene una Probabilidad de ocurrencia de 4 (Alta) y un Impacto de 5 (Catastrófico), ¿cuál es el Valor de Riesgo y su prioridad?",
      options: [
        "A) Riesgo 9, nivel aceptable con monitoreo periódico.",
        "B) Riesgo 20, nivel Crítico con necesidad de atención y mitigación prioritaria.",
        "C) Riesgo 0.8, requiere ser transferido sin cambios adicionales.",
        "D) Riesgo 1, es insignificante y se puede obviar en el reporte."
      ],
      correct: 1, // B
      explanation: "El valor del riesgo es el producto de la Probabilidad por el Impacto (4 × 5 = 20). Al estar en el rango máximo, se cataloga como riesgo Crítico, requiriendo acción de mitigación inmediata."
    },
    {
      q: "Si una empresa decide contratar un seguro contra ciberataques, ¿qué acción de tratamiento de riesgo está aplicando?",
      options: [
        "A) Mitigación.",
        "B) Aceptación.",
        "C) Evitación.",
        "D) Transferencia."
      ],
      correct: 3, // D
      explanation: "La 'Transferencia' del riesgo ocurre cuando traspasas el impacto financiero o legal a un tercero, como una compañía de seguros o un proveedor de servicios en la nube."
    },
    {
      q: "¿Cuál es la ventaja técnica de CUPP frente a Crunch en la creación de diccionarios?",
      options: [
        "A) CUPP genera combinaciones algorítmicas de caracteres aleatorios de forma matemática.",
        "B) CUPP descifra automáticamente handshakes de WPA2 sin consumir CPU.",
        "C) CUPP diseña wordlists personalizadas a partir de recolección de datos específicos (Ingeniería Social) de la víctima.",
        "D) CUPP instala y repara controladores inyectores de red."
      ],
      correct: 2, // C
      explanation: "CUPP automatiza el perfilado de contraseñas basándose en datos cotidianos (mascotas, cumpleaños), reduciendo el tiempo de crackeo drásticamente frente a ataques ciegos."
    },
    {
      q: "Si ejecutas el comando 'crunch 8 8 -t Admin%%% | aircrack-ng...', ¿qué función cumple el símbolo de tubería (|)?",
      options: [
        "A) Detiene el proceso de Crunch si hay un error de sintaxis.",
        "B) Guarda las contraseñas en un archivo oculto del sistema operativo.",
        "C) Envía las contraseñas directamente a Aircrack-ng en tiempo real sin guardarlas en el disco duro.",
        "D) Comprime el diccionario en formato .zip para ahorrar espacio."
      ],
      correct: 2, // C
      explanation: "Las tuberías o piping (|) permiten conectar la salida de un programa (Crunch) directamente a la entrada de otro (Aircrack-ng), procesando todo en RAM y ahorrando Terabytes de almacenamiento en disco."
    },
    {
      q: "¿Cuál es el error sintáctico en el siguiente comando de Crunch: 'crunch 4 5 -t @@12'?",
      options: [
        "A) El comando está perfecto.",
        "B) Crunch no acepta números dentro de sus patrones.",
        "C) La longitud mínima y máxima indicadas (4 y 5) no coinciden exactamente con la cantidad de caracteres del patrón (4).",
        "D) Faltan las comillas alrededor del patrón."
      ],
      correct: 2, // C
      explanation: "Cuando se usa el parámetro '-t' (patrón), las longitudes iniciales declaradas obligatoriamente deben coincidir de forma exacta con la longitud del patrón proporcionado."
    }
  ];

  const questionsQuiz10: Question[] = [
    {
      q: "¿Cuál es la diferencia técnica fundamental entre un IDS (como Suricata) y un Firewall tradicional?",
      options: [
        "A) El Firewall analiza firmas del contenido de paquetes HTTP complejos y el IDS bloquea puertos lógicos.",
        "B) El Firewall bloquea puertos y protocolos de red en capa física/enlace, mientras que el IDS analiza el contenido (payload) buscando firmas maliciosas.",
        "C) El IDS cambia la dirección IP del servidor para camuflarlo de hackers de forma activa.",
        "D) No existe ninguna diferencia, son términos comerciales idénticos."
      ],
      correct: 1, // B
      explanation: "Los firewalls tradicionales controlan puertos e IPs de origen/destino. Los IDS (Sistemas de Detección de Intrusos) inspeccionan el payload de las conexiones para descubrir firmas de exploits conocidos en tiempo real."
    },
    {
      q: "En el contexto de Metasploit, ¿cuál es la ventaja principal de utilizar un payload de tipo 'Reverse TCP' en lugar de intentar conectarse directamente a la víctima?",
      options: [
        "A) Evita que el atacante revele su dirección IP en los registros del router.",
        "B) Fuerza a la máquina víctima a iniciar la conexión hacia el exterior, lo que permite evadir las reglas restrictivas de los firewalls que bloquean conexiones entrantes.",
        "C) Permite ejecutar comandos de Linux en un sistema Windows.",
        "D) Cifra automáticamente el disco duro de la víctima usando AES-256."
      ],
      correct: 1, // B
      explanation: "Un Reverse Shell hace que el equipo comprometido sea el que llame 'hacia afuera' (al atacante). Dado que los firewalls suelen confiar en el tráfico saliente, esta técnica es altamente efectiva para evadir bloqueos perimetrales."
    },
    {
      q: "¿Cómo mitiga Pi-hole las solicitudes publicitarias y de telemetría antes de que se descarguen sus recursos?",
      options: [
        "A) Modifica el código de renderizado HTML del navegador mediante proxies inversos invasivos.",
        "B) Actúa como un sumidero DNS (DNS Sinkhole) devolviendo una IP nula (0.0.0.0) para las consultas de dominios de su lista negra.",
        "C) Lanza ataques DDoS continuos sobre servidores de marketing para saturar su ancho de banda.",
        "D) Cierra la conexión física del puerto Ethernet del dispositivo."
      ],
      correct: 1, // B
      explanation: "Pi-hole intercepta la solicitud DNS; si pertenece a un dominio de anuncios o malware conocido, resuelve su nombre a 0.0.0.0. De este modo, el navegador nunca puede conectarse al servidor de origen."
    },
    {
      q: "Antes de lanzar herramientas como 'linux-wifi-hotspot' o Aircrack-ng para crear puntos de acceso falsos o auditar redes, ¿en qué modo específico debe configurarse la tarjeta de red inalámbrica (ej. wlan0)?",
      options: [
        "A) Modo Administrado (Managed Mode).",
        "B) Modo Ad-Hoc.",
        "C) Modo Monitor (Monitor Mode).",
        "D) Modo Promiscuo Ethernet."
      ],
      correct: 2, // C
      explanation: "El Modo Monitor permite a la tarjeta de red inalámbrica escuchar y capturar todos los paquetes que viajan por el aire (incluso los que no van dirigidos a ella) y es un requisito estricto para realizar auditorías e inyectar tráfico."
    },
    {
      q: "Al utilizar la herramienta Zphisher (Clase 6), ¿cuál es el propósito fundamental de seleccionar un servicio de túnel como Cloudflared o LocalXpose en lugar de Localhost?",
      options: [
        "A) Cifrar el disco duro de la víctima usando encriptación asimétrica militar.",
        "B) Generar un enlace público accesible a través de Internet para enviarlo a la víctima fuera de nuestra red local.",
        "C) Evadir automáticamente el análisis heurístico del antivirus de Windows Defender.",
        "D) Ejecutar el ataque 100% offline sin necesidad de conexión a internet."
      ],
      correct: 1, // B
      explanation: "Localhost (127.0.0.1) solo funciona dentro de tu propia computadora o red interna. Para campañas reales, se usan túneles de reenvío de puertos como Cloudflared o LocalXpose que exponen tu servidor local a Internet mediante un enlace público."
    },
    {
      q: "Tras establecer exitosamente una sesión de Meterpreter en la máquina víctima, ¿qué comando de post-explotación se utiliza para obtener un resumen rápido del sistema operativo y arquitectura del equipo comprometido?",
      options: [
        "A) keyscan_start",
        "B) screenshot",
        "C) webcam_stream",
        "D) sysinfo"
      ],
      correct: 3, // D
      explanation: "El comando 'sysinfo' dentro de la consola de Meterpreter devuelve información crítica sobre la víctima, como el nombre de la computadora, el sistema operativo (ej. Windows 10) y la arquitectura (x64 o x86), fundamental para los siguientes pasos del ataque."
    },
    {
      q: "Al configurar el módulo 'exploit/multi/handler' en Metasploit para recibir un ataque inverso, ¿qué elementos deben coincidir exactamente con lo configurado en msfvenom?",
      options: [
        "A) El nombre del archivo .exe generado (ej. virus.exe).",
        "B) Solo la IP del host local (LHOST).",
        "C) El Payload exacto (ej. windows/x64/meterpreter/reverse_tcp) y el puerto de escucha (LPORT).",
        "D) La marca y versión del sistema operativo del atacante."
      ],
      correct: 2, // C
      explanation: "Si el payload configurado en el handler es diferente al inyectado en el ejecutable, o si los puertos (LPORT) no son idénticos, la sesión de Meterpreter colapsará y el atacante no podrá recibir la conexión de retorno."
    },
    {
      q: "¿Cuál es la característica principal que hace sigiloso al keylogger de Meterpreter (activado con 'keyscan_start') frente a un análisis forense tradicional?",
      options: [
        "A) Se camufla cambiando el nombre de la computadora víctima cada 5 segundos.",
        "B) Opera exclusivamente en la memoria RAM del proceso comprometido sin escribir archivos temporales en el disco duro.",
        "C) Envía un correo electrónico encriptado a la víctima antes de iniciar.",
        "D) Desinstala físicamente el teclado de la máquina objetivo."
      ],
      correct: 1, // B
      explanation: "Los comandos avanzados de Meterpreter operan in-memory. El sniffer de teclado no crea archivos .txt en el disco duro de la víctima que un antivirus pueda detectar con análisis de firmas, todo queda en memoria hasta que el atacante solicita volcarlo ('keyscan_dump')."
    },
    {
      q: "Si configuras la expresión regular '(\\.|^)banco\\.com$' en el RegEx filter de Pi-hole, ¿qué comportamiento observarás?",
      options: [
        "A) Se bloqueará únicamente el acceso a 'www.banco.com', dejando pasar 'banco.com'.",
        "B) El Pi-hole descargará todo el contenido del banco para almacenarlo localmente en caché.",
        "C) Bloqueará 'banco.com' y cualquier subdominio válido como 'login.banco.com', pero no bloqueará dominios trampa como 'mibanco.com'.",
        "D) Cambiará la contraseña de administrador del router a 'banco.com'."
      ],
      correct: 2, // C
      explanation: "La estructura '(\\.|^)' asegura que la coincidencia empiece al inicio de la cadena o después de un punto literal, y '$' asegura que termine ahí. Esto previene el bloqueo accidental de palabras similares integradas en otros dominios, evitando falsos positivos."
    },
    {
      q: "Al escribir la firma 'alert icmp any any -> any any' en el archivo local.rules de Suricata, ¿qué acción tomará el motor de detección al interceptar el paquete?",
      options: [
        "A) Descartará y bloqueará el paquete instantáneamente (drop) como un IPS.",
        "B) Apagará la interfaz de red para proteger el sistema.",
        "C) Analizará pasivamente el paquete y generará un registro en los logs sin interrumpir la comunicación.",
        "D) Responderá con un ataque de denegación de servicio (DDoS) al origen."
      ],
      correct: 2, // C
      explanation: "Al declarar la acción inicial como 'alert', Suricata funciona en modo pasivo de Detección (IDS). Registra la anomalía en el archivo eve.json para análisis SIEM, pero permite que el tráfico siga fluyendo normalmente hacia su destino."
    }
  ];

  const questions = quizId === 5 ? questionsQuiz5 : questionsQuiz10;
  const currentQ = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  useEffect(() => {
    if (shuffledIndices.length === 0) {
      const indicesArray = questions.map(q => {
        const idxs = [0, 1, 2, 3];
        for (let i = idxs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
        }
        return idxs;
      });
      setShuffledIndices(indicesArray);
    }
  }, [quizId, questions, shuffledIndices.length]);

  // Listener para el Reintento Remoto del Profesor
  useEffect(() => {
    if (!db || !isNameSet || isTeacher || !isQuizFinished) return;

    const safeNameId = studentName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const deterministicId = `${safeNameId}_clase${quizId}`;
    const retryRef = ref(db, `reintentos/${deterministicId}`);
    
    console.log("Alumno escuchando reintentos en:", `reintentos/${deterministicId}`);
    
    const unsubscribe = onValue(retryRef, (snapshot) => {
      const val = snapshot.val();
      if (val && typeof val === 'number') {
        const lastRetry = localStorage.getItem(`last_retry_clase${quizId}`);
        if (lastRetry !== val.toString()) {
          // Es una orden de reintento nueva
          localStorage.setItem(`last_retry_clase${quizId}`, val.toString());
          handleResetQuiz();
        }
      }
    });

    return () => unsubscribe();
  }, [db, isNameSet, isTeacher, isQuizFinished, studentName, quizId]);

  // Listener para eliminación del registro (Reseteo Forzoso si el profe borra la nota)
  useEffect(() => {
    if (!db || !isNameSet || isTeacher || !isQuizFinished) return;

    const safeNameId = studentName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const deterministicId = `${safeNameId}_clase${quizId}`;
    const gradeRef = ref(db, `calificaciones/${deterministicId}`);
    
    // Solo reaccionamos si sabemos que el examen ya se entregó
    const unsubscribe = onValue(gradeRef, (snapshot) => {
      if (!snapshot.exists()) {
        console.log("El registro fue eliminado de la base de datos. Reseteando localmente...");
        handleResetQuiz();
      }
    });

    return () => unsubscribe();
  }, [db, isNameSet, isTeacher, isQuizFinished, studentName, quizId]);

  const progressPercentage = ((currentQuestionIndex + (isAnswered ? 1 : 0)) / totalQuestions) * 100;

  const handleSelectOption = (originalIndex: number) => {
    if (isQuizFinished) return;
    if (isTeacher && isAnswered) return;
    
    setSelectedAnswer(originalIndex);
    if (!isTeacher) {
      setAnswersHistory((prev) => ({
        ...prev,
        [currentQuestionIndex]: originalIndex
      }));
    }
  };

  const handleConfirmAnswer = () => { // Solo usado por el Profesor
    if (selectedAnswer === null || isAnswered) return;
    setIsAnswered(true);
    setAnswersHistory((prev) => ({
      ...prev,
      [currentQuestionIndex]: selectedAnswer
    }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answersHistory[idx] === q.correct) {
        correctCount++;
      }
    });
    // Cálculo sobre 20 puntos
    return Math.round((correctCount / totalQuestions) * 20);
  };

  const submitToFirebase = async (score: number) => {
    if (!db) {
      console.warn("Base de datos no disponible.");
      return;
    }
    try {
      setIsSubmitting(true);
      // Crear un ID único determinístico basado en el nombre del estudiante y el ID de la clase
      const safeNameId = studentName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      const deterministicId = `${safeNameId}_clase${quizId}`;
      const nuevaCalificacionRef = ref(db, `calificaciones/${deterministicId}`);
      
      // Obtener registro anterior si existe para mantener la nota máxima y el historial
      let historial: any[] = [];
      let maxScore = score;
      let existingEditCount = 0;
      
      try {
        const snapshot = await get(nuevaCalificacionRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          historial = data.historial || [];
          // Si el profe ya lo había editado, mantenemos esa edición o consideramos que si saca más nota, sube?
          // El user dijo "siempre se queda la mayor nota"
          maxScore = Math.max(data.nota || 0, score);
          existingEditCount = data.editCount || 0;
        }
      } catch (e) {
        console.warn("No se pudo obtener el historial previo:", e);
      }

      historial.push({
        nota: score,
        fecha: new Date().toLocaleString("es-PE", { timeZone: "America/Lima" }),
        timestamp: Date.now()
      });

      await set(nuevaCalificacionRef, {
        estudiante: studentName,
        nota: maxScore,
        notaMaxima: 20,
        clase: quizId,
        fecha: new Date().toLocaleString("es-PE", { timeZone: "America/Lima" }),
        timestamp: Date.now(),
        historial,
        respuestas: answersHistory,
        editCount: existingEditCount
      });
      console.log("Nota guardada en Firebase Realtime Database exitosamente.");
    } catch (e: any) {
      console.error("Error al guardar la nota en Firebase:", e);
      alert("Error de conexión al enviar la nota: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // En modo profesor se resetea isAnswered y selectedAnswer al avanzar
      if (isTeacher) {
        setIsAnswered(false);
        setSelectedAnswer(null);
      } else {
        // En modo alumno, cargamos la respuesta previa si existe en el historial
        setSelectedAnswer(answersHistory[currentQuestionIndex + 1] ?? null);
      }
    } else {
      if (isTeacher) {
        setIsQuizFinished(true);
      }
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answersHistory[currentQuestionIndex - 1] ?? null);
    }
  };

  const handleSubmitExam = async () => {
    if (isTeacher) {
      setIsQuizFinished(true);
      return;
    }

    const finalScore = calculateScore();
    setIsQuizFinished(true);
    
    // Guardado automático y silencioso en Firebase
    await submitToFirebase(finalScore);

    // Aprobar si la nota es mayor o igual a 11/20
    if (finalScore >= 11 && onComplete) {
      onComplete();
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setAnswersHistory({});
    setIsQuizFinished(false);
    // Nota: no reseteamos el nombre, asumiendo que es el mismo alumno reintentando.
  };

  if (!isNameSet && !isTeacher) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#08080a] border border-neutral-400 dark:border-zinc-800 p-8 rounded-2xl max-w-md w-full shadow-2xl text-center space-y-6"
        >
          <div className="w-16 h-16 bg-cyan-50 dark:bg-cyan-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-cyan-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Identificación de Estudiante</h2>
          <p className="text-sm text-zinc-400 mb-6">Por favor ingresa tu nombre y apellido para poder registrar oficialmente tu calificación en el sistema.</p>
          
          <input 
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Ej. Pedro Pérez"
            className="w-full bg-[#0c0c0e] border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          
          <button 
            onClick={async () => {
              const nameTrimmed = studentName.trim();
              if (nameTrimmed.length >= 3) {
                if (isTeacher) {
                  setIsNameSet(true);
                  return;
                }
                
                setIsCheckingDb(true);
                try {
                  const safeNameId = nameTrimmed.toLowerCase().replace(/[^a-z0-9]/g, '_');
                  const deterministicId = `${safeNameId}_clase${quizId}`;
                  const gradeRef = ref(db, `calificaciones/${deterministicId}`);
                  const snapshot = await get(gradeRef);
                  
                  if (snapshot.exists()) {
                    const data = snapshot.val();
                    if (data.respuestas) setAnswersHistory(data.respuestas);
                    setIsQuizFinished(true);
                  }
                  setIsNameSet(true);
                } catch (e) {
                  console.error("Error comprobando BD:", e);
                  setIsNameSet(true); // Fallback
                } finally {
                  setIsCheckingDb(false);
                }
              }
            }}
            disabled={studentName.trim().length < 3 || isCheckingDb}
            className="w-full bg-cyan-600 hover:bg-cyan-50 dark:bg-cyan-950/300 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl uppercase tracking-wider text-xs transition-colors flex flex-wrap items-center justify-center gap-2"
          >
            {isCheckingDb ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando Sistema...</span>
              </>
            ) : (
              <span>Comenzar Evaluación</span>
            )}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div id={`quiz_${quizId}_main_container`} className="bg-white dark:bg-[#08080a] border border-neutral-400 dark:border-zinc-900 rounded-2xl p-6 lg:p-8 shadow-xl max-w-4xl mx-auto space-y-6 font-sans relative overflow-hidden">
      
      {/* Decorative cyber grid accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 dark:bg-cyan-950/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-600/5 blur-3xl pointer-events-none rounded-full" />

      <AnimatePresence mode="wait">
        {!isQuizFinished ? (
          <motion.div
            key="quiz_question_flow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Header with Title and Global Progress Bar */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-400 dark:border-zinc-900 pb-4">
                <div className="flex flex-wrap items-start sm:items-center gap-3">
                  <div className="p-2 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-500 rounded-xl shrink-0">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-neutral-900 dark:text-zinc-100">
                        Evaluación de Conocimiento - Clase {quizId === 5 ? "5" : "10"}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-500 border border-amber-400 dark:border-amber-900/40 uppercase tracking-wider shrink-0 whitespace-nowrap">
                        EXAMEN DE CONTROL
                      </span>
                    </div>
                    <p className="text-xs text-neutral-800 dark:text-zinc-400">
                      Responde las preguntas teóricas para certificar tus competencias y marcar la clase como completada.
                    </p>
                  </div>
                </div>

                {/* Score Status */}
                <div className="shrink-0 text-xs font-mono font-semibold bg-neutral-50 dark:bg-[#0c0c0e] px-3 py-1.5 rounded-lg border border-neutral-400 dark:border-zinc-850 self-start sm:self-center flex items-center whitespace-nowrap">
                  Pregunta <span className="text-cyan-500 mx-1">{currentQuestionIndex + 1}</span> de {totalQuestions}
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-zinc-500">
                  <span>Progreso de evaluación</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Question Card Box */}
            <div className="space-y-4">
              <div className="text-sm md:text-base font-medium text-neutral-900 dark:text-zinc-100 bg-neutral-50/50 dark:bg-[#0c0c0e]/30 p-5 rounded-2xl border border-neutral-400 dark:border-zinc-900/60 leading-relaxed relative">
                <div className="absolute -top-3 left-4 px-2.5 py-0.5 bg-neutral-900 text-white dark:bg-zinc-800 dark:text-cyan-400 text-[10px] font-bold tracking-widest uppercase rounded-md border border-neutral-800">
                  Enunciado
                </div>
                <p className="pt-1.5 font-serif italic text-neutral-850 dark:text-zinc-200">{currentQ.q}</p>
              </div>

              {/* Options Grid Layout - Responsive, modern columns */}
              <div className="grid grid-cols-1 gap-3">
                {(shuffledIndices[currentQuestionIndex] || [0, 1, 2, 3]).map((originalIndex, renderIndex) => {
                  const opt = currentQ.options[originalIndex];
                  const isSelected = selectedAnswer === originalIndex;
                  const isCorrect = currentQ.correct === originalIndex;
                  
                  let optionStyle = "border-neutral-400 dark:border-zinc-900 bg-white dark:bg-[#0c0c0e]/20 text-neutral-700 dark:text-zinc-350 hover:bg-neutral-50 dark:bg-neutral-950/30 dark:hover:bg-zinc-50 dark:bg-zinc-950/30 hover:border-neutral-500 dark:hover:border-zinc-800";
                  let leftIndicator = "bg-neutral-100 dark:bg-zinc-900 text-neutral-800 dark:text-zinc-400 group-hover:bg-neutral-200 dark:group-hover:bg-zinc-850";

                  if (isSelected) {
                    optionStyle = "border-cyan-500 bg-cyan-50/20 dark:bg-cyan-950/25 text-cyan-600 dark:text-cyan-400 font-bold shadow-sm shadow-cyan-500/5";
                    leftIndicator = "bg-cyan-50 dark:bg-cyan-950/300 text-white";
                  }

                  if (isTeacher && isAnswered) {
                    if (isCorrect) {
                      optionStyle = "border-green-500 bg-green-50/30 dark:bg-green-950/20 text-green-700 dark:text-green-400 font-bold shadow-sm shadow-green-500/5";
                      leftIndicator = "bg-green-500 text-white";
                    } else if (isSelected) {
                      optionStyle = "border-red-500 bg-red-50/30 dark:bg-red-950/20 text-red-700 dark:text-red-400 shadow-sm shadow-red-500/5";
                      leftIndicator = "bg-red-50 dark:bg-red-950/300 text-white";
                    } else {
                      optionStyle = "border-neutral-400 dark:border-zinc-900/50 bg-white/40 dark:bg-[#08080a]/40 text-neutral-700 dark:text-zinc-500 opacity-60 pointer-events-none";
                    }
                  }

                  return (
                    <button
                      key={originalIndex}
                      onClick={() => handleSelectOption(originalIndex)}
                      disabled={isTeacher && isAnswered}
                      className={`w-full text-left p-4 rounded-xl border text-xs leading-relaxed transition-all duration-150 flex items-center gap-4 cursor-pointer group ${optionStyle}`}
                    >
                      {/* Round Letter Indicator */}
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold uppercase transition-colors ${leftIndicator}`}>
                        {isTeacher && isAnswered && isCorrect ? <Check className="h-3 w-3" /> : isTeacher && isAnswered && isSelected && !isCorrect ? <X className="h-3 w-3" /> : ['A', 'B', 'C', 'D'][renderIndex]}
                      </span>
                      <span className="flex-1">{opt.substring(3)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions / Answers explanations */}
            <div className="space-y-4">
              {isTeacher ? (
                /* Modo Profesor */
                <>
                  {!isAnswered ? (
                    <button
                      onClick={handleConfirmAnswer}
                      disabled={selectedAnswer === null}
                      className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:from-neutral-100 disabled:to-neutral-100 dark:disabled:from-zinc-900 dark:disabled:to-zinc-900 disabled:text-neutral-700 dark:disabled:text-zinc-650 text-white rounded-xl text-xs font-bold tracking-wider uppercase cursor-pointer shadow-md shadow-indigo-500/10 transition-all flex flex-wrap items-center justify-center gap-2"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Confirmar e Inyectar Respuesta</span>
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {/* Detailed explanation card */}
                      <div className={`p-4 rounded-xl border text-xs leading-relaxed ${answersHistory[currentQuestionIndex] === currentQ.correct ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-400 dark:border-emerald-950/20 text-emerald-900 dark:text-emerald-300" : "bg-red-50/50 dark:bg-red-950/10 border-red-400 dark:border-red-950/20 text-red-900 dark:text-red-300"}`}>
                        <div className="flex flex-wrap items-center gap-1.5 font-bold mb-2 uppercase tracking-wide">
                          {answersHistory[currentQuestionIndex] === currentQ.correct ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>Análisis Técnico - ¡Respuesta Correcta!</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <span>Análisis Técnico - Fallo Detectado</span>
                            </>
                          )}
                        </div>
                        <p className="font-sans text-neutral-700 dark:text-zinc-400 leading-relaxed">{currentQ.explanation}</p>
                      </div>

                      <button
                        onClick={handleNextQuestion}
                        className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-white rounded-xl text-xs font-bold tracking-wider uppercase cursor-pointer transition-colors flex flex-wrap items-center justify-center gap-2"
                      >
                        <span>{currentQuestionIndex + 1 === totalQuestions ? "Finalizar Evaluación" : "Siguiente Pregunta"}</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </motion.div>
                  )}
                </>
              ) : (
                /* Modo Alumno */
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex-1 py-3.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 text-neutral-600 dark:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold tracking-wider uppercase transition-colors"
                  >
                    Anterior
                  </button>

                  {currentQuestionIndex + 1 === totalQuestions ? (
                    <button
                      onClick={handleSubmitExam}
                      disabled={Object.keys(answersHistory).length < totalQuestions}
                      className="flex flex-wrap-[2] py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold tracking-wider uppercase shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Entregar Examen</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="flex flex-wrap-[2] py-3.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-white rounded-xl text-xs font-bold tracking-wider uppercase cursor-pointer transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* High Fidelity, gorgeous certificate/results summary card! */
          <motion.div
            key="quiz_finished_view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 max-w-2xl mx-auto space-y-6"
          >
            <div className="relative inline-block">
              <div className={`absolute inset-0 blur-2xl opacity-40 rounded-full ${
                calculateScore() >= 11 ? "bg-cyan-50 dark:bg-cyan-950/300" : "bg-red-50 dark:bg-red-950/300"
              }`} />
              <motion.div 
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className={`relative w-24 h-24 rounded-3xl flex items-center justify-center border-4 shadow-xl ${
                  calculateScore() >= 11 
                    ? "bg-[#0c0c0e] border-cyan-400 dark:border-cyan-900/40 text-cyan-500" 
                    : "bg-[#0c0c0e] border-red-400 dark:border-red-900/40 text-red-500"
                }`}
              >
                {calculateScore() >= 11 ? <Trophy className="h-10 w-10" /> : <AlertTriangle className="h-10 w-10" />}
              </motion.div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-serif italic font-semibold text-neutral-900 dark:text-white">
                {calculateScore() >= 20
                  ? "¡Evaluación Aprobada con Honores!"
                  : calculateScore() >= 11
                  ? "¡Evaluación Aprobada Exitosamente!"
                  : "Calificación Insuficiente"}
              </h3>
              <p className="text-neutral-800 dark:text-zinc-400 text-sm max-w-md mx-auto">
                {calculateScore() >= 11
                  ? `Felicidades ${studentName}, has demostrado un dominio sólido de los conceptos de seguridad evaluados en esta fase.`
                  : `Lo sentimos ${studentName}, no has alcanzado el puntaje mínimo requerido (11/20). Te recomendamos repasar los apuntes e intentarlo nuevamente.`}
              </p>
            </div>
            {/* Score Big Display */}
            <div className="py-8 px-6 bg-white dark:bg-[#08080a] border border-neutral-400 dark:border-zinc-800 rounded-3xl shadow-lg inline-block min-w-[280px]">
              <div className="text-[10px] font-bold text-neutral-700 dark:text-zinc-500 uppercase tracking-[0.2em] mb-2">
                Calificación Final
              </div>
              <div className="flex flex-wrap items-baseline justify-center gap-2">
                <span className={`text-6xl font-bold tracking-tighter ${
                  calculateScore() >= 20 ? "text-amber-500" :
                  calculateScore() >= 11 ? "text-cyan-500" : "text-red-500"
                }`}>
                  {calculateScore()}
                </span>
                <span className="text-3xl font-medium text-neutral-300 dark:text-zinc-700">/ 20</span>
              </div>
              {isSubmitting && (
                <div className="mt-4 text-xs text-cyan-500 animate-pulse font-mono flex flex-wrap items-center justify-center gap-2">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Guardando calificación en Firestore...
                </div>
              )}
            </div>

            {/* Questions list Summary review */}
            {!isTeacher && (
              <div className="text-left space-y-4 mt-8 w-full border-t border-neutral-400 dark:border-zinc-800/50 pt-8">
                <h4 className="text-[10px] font-bold text-neutral-700 dark:text-zinc-500 uppercase tracking-widest font-mono text-center mb-6">
                  Revisión Detallada del Examen
                </h4>
                <div className="space-y-4">
                  {questions.map((q, idx) => {
                    const isUserCorrect = answersHistory[idx] === q.correct;
                    const studentAnswer = q.options[answersHistory[idx]];
                    const correctAnswer = q.options[q.correct];

                    return (
                      <div
                        key={idx}
                        className={`p-5 bg-neutral-50/50 dark:bg-[#0c0c0e]/30 border rounded-2xl flex flex-col gap-3 text-sm ${
                          isUserCorrect ? "border-emerald-400 dark:border-emerald-900/40" : "border-red-400 dark:border-red-900/40"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <span className="text-neutral-800 dark:text-zinc-200 font-medium">
                            <span className="text-cyan-500 font-bold font-mono text-xs mr-2">{idx + 1}.</span> 
                            {q.q}
                          </span>
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 border ${
                            isUserCorrect
                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 border-emerald-400 dark:border-emerald-900/40"
                              : "bg-red-50 dark:bg-red-950/30 text-red-500 border-red-400 dark:border-red-900/40"
                          }`}>
                            {isUserCorrect ? "Correcto" : "Incorrecto"}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2 mt-2 pl-6">
                          {!isUserCorrect && (
                            <div className="flex flex-wrap items-start gap-2 text-xs text-neutral-800 dark:text-zinc-500">
                              <X className="w-4 h-4 text-red-400 shrink-0" />
                              <span>Tu respuesta: <strong className="font-normal text-red-700 dark:text-red-400">{studentAnswer?.substring(3)}</strong></span>
                            </div>
                          )}
                          <div className="flex flex-wrap items-start gap-2 text-xs text-neutral-600 dark:text-zinc-400">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>Respuesta correcta: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">{correctAnswer?.substring(3)}</strong></span>
                          </div>
                        </div>

                        <div className={`mt-3 p-3 rounded-lg text-xs leading-relaxed border ${
                          isUserCorrect 
                            ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-400 dark:border-emerald-900/20 text-emerald-900 dark:text-emerald-300" 
                            : "bg-red-50/50 dark:bg-red-950/10 border-red-400 dark:border-red-900/20 text-red-900 dark:text-red-300"
                        }`}>
                          <strong className="block mb-1 uppercase tracking-wider text-[10px] opacity-80">Por qué:</strong>
                          {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reset buttons */}
            <div className="pt-2">
              {isTeacher && (
                <button
                  onClick={handleResetQuiz}
                  className="inline-flex flex-wrap items-center gap-2 py-3 px-6 bg-neutral-900 hover:bg-neutral-850 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reintentar Evaluación</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
