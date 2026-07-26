import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Book, Sparkles, Code, GraduationCap, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

interface GlossaryTerm {
  term: string;
  category: "Redes" | "Criptografía" | "Ataques" | "Defensa" | "Web";
  definition: string;
  example: string;
  relevance: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "Handshake (Apretón de Manos)",
    category: "Redes",
    definition: "Un intercambio automatizado de señales y datos de sincronización entre dos sistemas o dispositivos para acordar de manera segura las reglas, parámetros de comunicación e identidades antes de iniciar una transferencia real de datos.",
    example: "Cuando conectas tu celular al Wi-Fi de tu casa, el router y tu celular se envían 4 mensajes matemáticos ocultos. Si ambos demuestran conocer la clave de tu casa, se conectan. Todo esto pasa en milisegundos sin que la contraseña viaje textualmente por el aire.",
    relevance: "Estudiado a fondo en la Clase 2 con el simulador de Aircrack-ng para auditorías inalámbricas."
  },
  {
    term: "Payload (Carga Útil)",
    category: "Ataques",
    definition: "La parte del mensaje o de los datos transmitidos que transporta la acción destructiva o el comando de control real diseñado por el atacante, separada de las cabeceras o exploits necesarios para romper las defensas del sistema.",
    example: "Imagina un misil: el 'exploit' es el cohete que atraviesa la defensa, pero el 'payload' es la carga explosiva. En ciberseguridad, un payload práctico es enviar un archivo PDF que, al abrirse, instala silenciosamente un programa para que el atacante controle tu cámara.",
    relevance: "Simulado en la Clase 6 al usar Metasploit para tomar control de un sistema vulnerable mediante la carga útil 'meterpreter'."
  },
  {
    term: "IDS (Intrusion Detection System)",
    category: "Defensa",
    definition: "Sistema de Detección de Intrusos. Un dispositivo o aplicación de software que monitorea una red o sistemas en busca de actividades maliciosas, violaciones de políticas de seguridad o comportamientos anómalos, generando alertas.",
    example: "Como una alarma de casa con sensor de movimiento: si alguien (un atacante) intenta escanear qué computadoras están encendidas en tu red de la oficina, el IDS detecta el escaneo inusual y envía un correo al administrador de seguridad advirtiendo de la presencia del intruso.",
    relevance: "Practicado en la Clase 8 mediante el análisis y configuración de alertas de firma con Suricata."
  },
  {
    term: "IPS (Intrusion Prevention System)",
    category: "Defensa",
    definition: "Sistema de Prevención de Intrusos. Una evolución activa del IDS que no solo detecta actividades sospechosas en tiempo real, sino que tiene la facultad y autorización de bloquear de inmediato el tráfico dañino antes de que afecte a la red.",
    example: "Como un guardia de seguridad armado: si el IPS detecta que una IP de Rusia está intentando adivinar la clave del servidor de la empresa 50 veces por segundo, el IPS no solo avisa, sino que automáticamente corta la conexión y bloquea esa IP para que no pueda seguir intentándolo.",
    relevance: "Analizado junto a las defensas perimetrales y firewalls inteligentes en la Clase 8."
  },
  {
    term: "SQL Injection (SQLi)",
    category: "Ataques",
    definition: "Una técnica de inyección de código que inserta sentencias SQL maliciosas y manipuladas en los campos de entrada de una aplicación. Esto engaña a la base de datos para ejecutar comandos no autorizados o revelar datos privados.",
    example: "Si en la pantalla de login de un banco, en vez de poner tu usuario escribes `admin' --`, el sistema podría confundir el texto con una orden de la base de datos, ignorar la contraseña y dejarte entrar directamente a la cuenta del administrador.",
    relevance: "Implementado interactivamente en la Clase 9 con el sandbox de inyección SQL sobre formularios vulnerables."
  },
  {
    term: "Phishing",
    category: "Ataques",
    definition: "Una táctica fraudulenta de ingeniería social donde un atacante imita la identidad visual y comunicativa de una marca, banco o servicio de confianza para inducir a la víctima a revelar contraseñas, tarjetas o descargar archivos infectados.",
    example: "Te llega un correo que parece 100% oficial de Netflix diciendo que tu pago falló y tu cuenta será suspendida. Te dan un botón rojo que te lleva a `netfIix-pagos.com`. Al ingresar tu tarjeta de crédito ahí, se la estás enviando directamente a los estafadores.",
    relevance: "Analizado en la Clase 5 con el laboratorio del creador de plantillas de ingeniería social."
  },
  {
    term: "DNS Sinkhole (Agujero de DNS)",
    category: "Defensa",
    definition: "Una técnica de protección de red que intercepta las solicitudes de resolución de nombres DNS para dominios clasificados como dañinos, publicitarios o maliciosos, y les asigna una IP nula o controlada (como 0.0.0.0).",
    example: "Instalas Pi-Hole en tu casa. Cuando abres una app en tu celular y esta intenta conectarse al dominio `ads.google.com` para mostrarte un anuncio, tu Pi-Hole intercepta la solicitud y la tira a un 'agujero negro'. La app cree que no hay internet para el anuncio y te muestra la pantalla limpia sin publicidad.",
    relevance: "Constituye el núcleo del simulador Pi-hole en la Clase 7 para filtrar contenido malicioso en redes."
  },
  {
    term: "Salting (Añadido de Sal)",
    category: "Criptografía",
    definition: "La práctica de adjuntar datos aleatorios y únicos (la 'sal') a una contraseña antes de pasarla por una función hash. Esto asegura que contraseñas idénticas generen hashes totalmente diferentes, protegiendo el sistema contra ataques de diccionario y tablas arcoíris.",
    example: "Si dos usuarios usan la clave 'password123', sin salting ambos tendrían el hash 'ef92b778...'. Con salting, al Usuario A se le añade la sal 'x89Fq!' (hash '4a7b91e2...'), y al B se le añade '9Zt2@p' (hash 'b3c8f5d1...'). Pese a tener la misma clave, los hashes resultantes son únicos.",
    relevance: "Prueba práctica y simulación de hashing con salting en la Clase 4 utilizando el generador de diccionarios."
  },
  {
    term: "Firma Digital",
    category: "Criptografía",
    definition: "Un mecanismo criptográfico asimétrico que asocia de forma única e inequívoca la identidad de un firmante con un archivo o mensaje, garantizando que el documento no fue alterado y previniendo que el emisor lo niegue (no repudio).",
    example: "Cuando descargas WhatsApp, tu celular verifica su 'Firma Digital'. Es un sello criptográfico que garantiza matemáticamente dos cosas: que la app fue creada por Meta (autenticidad) y que ningún hacker modificó el código en el camino para meterle un virus (integridad).",
    relevance: "Practicado en la Clase 11 mediante el laboratorio interactivo de firmado y verificación de hashes criptográficos."
  },
  {
    term: "Función Hash Criptográfica",
    category: "Criptografía",
    definition: "Un algoritmo matemático unidireccional que toma cualquier volumen de datos de entrada y genera un valor alfanumérico único de longitud fija. Un mínimo cambio en la entrada cambia por completo el hash resultante (efecto avalancha).",
    example: "Descargas un juego de 50GB. Para saber si se descargó bien, la página te da un 'hash' (ej: a1b2c3d4). Tu computadora calcula el hash del archivo descargado. Si ambos hashes son exactamente iguales, el archivo está perfecto; si difieren en un solo número, significa que se corrompió o alguien le inyectó un virus.",
    relevance: "Fundamento estudiado en la Clase 4 (Seguridad de Contraseñas) y la Clase 11 (Autenticación e Integridad)."
  },
  {
    term: "MitM (Man-in-the-Middle)",
    category: "Ataques",
    definition: "Ataque de Intermediario. El atacante intercepta en secreto la comunicación directa entre dos sistemas legítimos, dándole la habilidad de espiar, capturar contraseñas o inyectar datos falsos en el flujo de tráfico.",
    example: "Estás en un Starbucks usando su Wi-Fi. Un hacker en la mesa de al lado engaña a tu celular para que crea que su laptop es el Router. Ahora, cuando entras a Facebook, los mensajes van primero a su laptop, él los lee, y luego los manda al router real. Él está 'en el medio' espiando todo sin que lo notes.",
    relevance: "Sección teórica y de mitigación abordada en los módulos de vulnerabilidades Wi-Fi (Clase 2)."
  },
  {
    term: "Criptografía Simétrica",
    category: "Criptografía",
    definition: "Un enfoque criptográfico donde se utiliza exactamente la misma clave secreta tanto para cifrar la información legible como para descifrar el mensaje cifrado. Requiere un canal seguro alternativo para distribuir la clave.",
    example: "Guardas tus fotos familiares en un disco duro externo y lo bloqueas usando el algoritmo AES con la contraseña 'Gatito123'. Para poder ver las fotos en otra computadora, obligatoriamente tendrás que usar exactamente la misma contraseña 'Gatito123' para desbloquearlo.",
    relevance: "Revisado a detalle en la Clase 10 con el simulador de cifrado y descifrado de textos."
  },
  {
    term: "Criptografía Asimétrica",
    category: "Criptografía",
    definition: "Sistema que utiliza un par de claves distintas y vinculadas matemáticamente: una Clave Pública (se comparte libremente para cifrar) y una Clave Privada (se mantiene en secreto para descifrar o firmar).",
    example: "Tienes un candado abierto (Clave Pública) y te quedas con la única llave (Clave Privada). Le das copias de tu candado abierto a todo el mundo. Cualquiera puede meter un mensaje secreto en una caja y cerrarla con tu candado. Una vez cerrada, ni siquiera ellos pueden abrirla; solo tú, que tienes la llave privada, puedes leer el mensaje.",
    relevance: "Estudiado de forma interactiva en la Clase 10 y Clase 11 del curso."
  },
  {
    term: "Ataque de Fuerza Bruta",
    category: "Ataques",
    definition: "Un método sistemático e incremental donde un software prueba de manera exhaustiva todas las combinaciones posibles de caracteres para descifrar contraseñas, hashes, PINs o llaves criptográficas.",
    example: "Te encuentras un candado de 4 dígitos (0000 a 9999). Un ataque de fuerza bruta es sentarse a probar literalmente 0000, luego 0001, luego 0002, y así sucesivamente sin detenerse, hasta que eventualmente (horas o días después) logras dar con el 7482 que abre el candado.",
    relevance: "Analizado en la Clase 3 con la estimación matemática de tiempos de crackeo según la longitud de caracteres."
  },
  {
    term: "Ataque de Diccionario",
    category: "Ataques",
    definition: "Una técnica optimizada para adivinar credenciales que no prueba caracteres aleatorios, sino una lista seleccionada de palabras frecuentes, contraseñas previamente filtradas, términos comunes y variaciones habituales.",
    example: "En lugar de probar todas las combinaciones letra por letra (Fuerza Bruta), el atacante usa una lista con las 10 millones de contraseñas más usadas en el mundo (ej: 123456, password, qwerty, batman). El programa prueba estas palabras súper rápido; como la gente es predecible, suele funcionar en segundos.",
    relevance: "Implementado en los simuladores de la Clase 2 (crackeo de redes Wi-Fi) y Clase 4 (generación inteligente de contraseñas)."
  },
  {
    term: "CVE (Common Vulnerabilities and Exposures)",
    category: "Defensa",
    definition: "Un diccionario o base de datos internacional y abierta que asigna identificadores únicos estandarizados a vulnerabilidades de seguridad de la información conocidas de forma pública en sistemas informáticos.",
    example: "Es como el número de placa de un criminal. Si se descubre un nuevo fallo de seguridad en Windows que permite robar datos, se le asigna una placa oficial (ej: CVE-2023-1234). Así, todos los profesionales de seguridad del mundo pueden buscar ese código exacto para saber cómo defenderse de ese error en particular.",
    relevance: "Concepto central para la auditoría de sistemas e identificación de exploits usando la consola de Metasploit en la Clase 6."
  },
  {
    term: "Malware",
    category: "Ataques",
    definition: "Software Malicioso. Término sombrilla para describir cualquier programa informático hostil u hostigador desarrollado con el fin de sabotear sistemas, robar información confidencial, espiar o dañar infraestructuras.",
    example: "Un empleado descarga un programa gratuito para 'acelerar la PC'. Aunque la PC parece ir más rápido, el programa en secreto está leyendo todos los correos de la empresa y enviándolos a un servidor en Rusia. Cualquier software con intenciones ocultas de dañar o espiar es un Malware.",
    relevance: "Tratado en los módulos de Ingeniería Social (Clase 5) y defensas corporativas (Clase 8)."
  },
  {
    term: "Ransomware",
    category: "Ataques",
    definition: "Un subtipo de malware extorsivo sumamente destructivo. Una vez que se ejecuta, cifra todos los documentos y bases de datos del sistema anfitrión, bloqueando el acceso y solicitando un pago (rescate) para devolver la clave de descifrado.",
    example: "Llegas al trabajo y el fondo de pantalla de tu computadora es rojo con una calavera. Intentas abrir tus documentos Excel y no abren porque están encriptados. Aparece un mensaje que dice: 'Si quieres volver a ver tus archivos, deposita $500 en esta cuenta de Bitcoin en 24 horas o serán borrados para siempre'.",
    relevance: "Tema estratégico de ciberdefensa de datos que subraya la importancia crítica de la integridad y las copias de seguridad de datos."
  },
  {
    term: "XSS (Cross-Site Scripting)",
    category: "Ataques",
    definition: "Inyección de Scripts en Sitios de Terceros. Un tipo de vulnerabilidad web donde un atacante logra inyectar código de scripting malicioso (generalmente JavaScript) en una página web legítima para que sea ejecutado en el navegador de otros usuarios.",
    example: "Un hacker comenta en un foro público y, en vez de texto, escribe un código oculto. Cuando tú entras a leer los comentarios, tu navegador lee ese código y silenciosamente envía los datos de tu sesión de usuario al hacker. ¡Ahora él está logueado como si fuera tú, y tú solo entraste a leer!",
    relevance: "Estudiado junto con la inyección de consultas SQL dentro del espectro de vulnerabilidades OWASP Top 10 de aplicaciones web."
  },
  {
    term: "Matriz de Riesgo",
    category: "Defensa",
    definition: "Una herramienta visual e interactiva de gestión que permite evaluar la prioridad de las amenazas de seguridad multiplicando la probabilidad de ocurrencia de un incidente de seguridad por su impacto negativo potencial.",
    example: "Imagina una tabla de semáforo. Que caiga un meteorito en el servidor es Rojo en daño, pero Verde en probabilidad (riesgo bajo). Pero que un empleado use '123456' de clave es Rojo en daño y Rojo en probabilidad. La matriz te dice que debes gastar tu presupuesto en arreglar la clave, no en comprar escudos anti-meteoritos.",
    relevance: "Practicado en la Clase 1 para definir políticas sólidas de gobernanza de la seguridad informática."
  },
  {
    term: "Reverse Shell",
    category: "Ataques",
    definition: "Una conexión de red donde la máquina víctima inicia la comunicación de regreso hacia el equipo del atacante. Permite evadir firewalls tradicionales que típicamente bloquean conexiones entrantes.",
    example: "El firewall de la empresa bloquea a cualquiera que intente conectarse desde fuera hacia adentro. Para burlar esto, el hacker engaña al empleado para que abra un PDF falso. Ese PDF hace que la computadora del empleado llame al hacker (desde adentro hacia afuera, lo cual sí está permitido), dándole al hacker control total del equipo.",
    relevance: "Estudiado en la Clase 7 como técnica principal para tomar control de un dispositivo remoto evadiendo defensas perimetrales."
  },
  {
    term: "Bind Shell",
    category: "Ataques",
    definition: "Una técnica en la cual el sistema de la víctima abre un puerto local (se queda a la escucha o 'bind') y espera a que el atacante se conecte activamente a ese puerto desde el exterior. Suele ser bloqueada fácilmente por los firewalls corporativos modernos.",
    example: "Un hacker logra instalar un virus en tu servidor. El virus abre una puerta trasera (por ejemplo, el puerto 4444) y se queda esperando. Luego, el hacker desde su casa se conecta directamente a la IP de tu servidor y entra por esa puerta. Hoy en día es poco efectivo porque los firewalls suelen bloquear estas entradas directas.",
    relevance: "Contrapuesto al Reverse Shell en la Clase 7 para entender la eficacia de las conexiones de retorno."
  },
  {
    term: "Hoaxshell",
    category: "Ataques",
    definition: "Un framework de conexión reversa que genera payloads de PowerShell ofuscados en Base64. Diseñado para burlar firmas antivirus y aprovechar túneles como Ngrok o vulnerabilidades como la de WinRAR (CVE-2023-38831).",
    example: "Un atacante quiere hackear una empresa pero el antivirus (como Windows Defender) bloquea todos los virus conocidos. El atacante usa Hoaxshell para generar un código que parece texto inofensivo pero que engaña a las funciones legítimas de Windows (PowerShell) para que ejecuten órdenes maliciosas sin hacer saltar las alarmas.",
    relevance: "Implementado como caso de estudio avanzado de evasión de antivirus y generación de payloads en la Clase 7."
  },
  {
    term: "Regex (Expresiones Regulares)",
    category: "Defensa",
    definition: "Una secuencia de caracteres que conforma un patrón de búsqueda avanzado. En ciberseguridad, se utiliza intensivamente para analizar registros, filtrar tráfico o bloquear dominios basándose en patrones lógicos en vez de nombres exactos.",
    example: "Tienes que buscar todos los números de teléfono en un libro de 500 páginas. En vez de leer cada línea, usas el patrón Regex '3 números - 3 números - 4 números' (ej: `\\d{3}-\\d{3}-\\d{4}`). La computadora extraerá instantáneamente todos los textos que coincidan con ese formato sin importar cuáles sean los números exactos.",
    relevance: "Utilizado en la Clase 8 para configurar listas negras masivas y dinámicas en el servidor Pi-hole."
  },
  {
    term: "Whaling, Vishing y Smishing",
    category: "Ataques",
    definition: "Variantes especializadas del Phishing. Whaling se dirige exclusivamente a 'peces gordos' (CEO, directivos). Vishing utiliza llamadas de voz (Voice Phishing). Smishing emplea mensajes de texto (SMS Phishing).",
    example: "Si recibes un mensaje de WhatsApp que dice 'Gana dinero viendo videos' con un link fraudulento, es Smishing. Si te llama alguien haciéndose pasar por tu banco pidiendo tu PIN, es Vishing. Y si le mandan un correo falso súper detallado directamente al Gerente General de la empresa para robar su acceso maestro, es Whaling.",
    relevance: "Fundamentos tácticos analizados en la Clase 6 previo a la simulación de ataques web con Zphisher."
  }
];

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlossaryModal({ isOpen, onClose }: GlossaryModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [activeTermIndex, setActiveTermIndex] = useState<number | null>(null);

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

  const categories = useMemo(() => {
    const set = new Set(GLOSSARY_TERMS.map((t) => t.category));
    return ["Todos", ...Array.from(set)];
  }, []);

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((item) => {
      const matchesSearch =
        item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Todos" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Adjust selected term if search/filter leaves current index out of bounds
  React.useEffect(() => {
    if (activeTermIndex !== null && activeTermIndex >= filteredTerms.length) {
      setActiveTermIndex(null);
    }
  }, [filteredTerms, activeTermIndex]);

  const activeTerm = activeTermIndex !== null ? (filteredTerms[activeTermIndex] || null) : null;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay with modern blur */}
        <motion.div
          id="glossary_backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-50 dark:bg-neutral-950/30 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          id="glossary_dialog"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative bg-white dark:bg-[#08080a] border border-neutral-400 dark:border-zinc-850 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden z-10 font-sans"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-neutral-400 dark:border-zinc-900/60 flex items-center justify-between shrink-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-2 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-500 rounded-lg">
                <Book className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif italic font-semibold text-lg lg:text-xl text-neutral-900 dark:text-white flex flex-wrap items-center gap-2">
                  Glosario de Seguridad
                  <span className="inline-flex flex-wrap items-center gap-1 text-[10px] font-sans not-italic font-bold tracking-widest uppercase px-2 py-0.5 bg-amber-50 border border-amber-400 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400 rounded-full">
                    <Sparkles className="h-2.5 w-2.5" /> Conceptos Clave
                  </span>
                </h3>
                <p className="text-xs text-neutral-700 dark:text-zinc-500">Consulta términos técnicos indispensables del curso interactivo</p>
              </div>
            </div>
            <button
              id="btn_close_glossary"
              onClick={onClose}
              className="p-2 text-neutral-700 hover:text-neutral-700 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-full hover:bg-neutral-50 dark:bg-neutral-950/30 dark:hover:bg-zinc-50 dark:bg-zinc-950/30 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Filtering & Search Bar */}
          <div className="p-4 bg-neutral-50/50 dark:bg-[#0c0c0e]/30 border-b border-neutral-400 dark:border-zinc-900/40 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-700" />
              <input
                id="glossary_search"
                type="text"
                placeholder="Buscar término o definición..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setActiveTermIndex(null);
                }}
                className="w-full text-xs pl-9 pr-4 py-2 border border-neutral-400 dark:border-zinc-850 rounded-lg bg-white dark:bg-[#0c0c0e] text-neutral-900 dark:text-zinc-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all placeholder-neutral-400 dark:placeholder-zinc-650"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2.5 p-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-700 hover:text-neutral-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Category Tags scrollable row */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setActiveTermIndex(null);
                    }}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? "bg-neutral-900 border-neutral-900 text-white dark:bg-cyan-950/30 dark:border-cyan-500/30 dark:text-cyan-400 font-bold"
                        : "bg-white border-neutral-400 text-neutral-800 dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-400 hover:text-neutral-850 dark:hover:text-zinc-200 hover:bg-neutral-50 dark:bg-neutral-950/30 dark:hover:bg-zinc-850"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Content Layout Split */}
          <div className="flex-grow flex overflow-hidden min-h-0">
            {/* Left Column: Terms List (Desktop Only) */}
            <div className="hidden md:block md:w-5/12 border-r border-neutral-400 dark:border-zinc-900/60 overflow-y-auto p-3 space-y-1.5 scrollbar-thin bg-neutral-50/20 dark:bg-[#08080a]">
              {filteredTerms.length > 0 ? (
                filteredTerms.map((item, idx) => {
                  const isSelected = activeTerm?.term === item.term;
                  
                  // Style based on category
                  let badgeColor = "bg-neutral-100 dark:bg-zinc-900 text-neutral-800 dark:text-zinc-400 border-neutral-400 dark:border-zinc-800";
                  if (item.category === "Ataques") {
                    badgeColor = "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border-red-400 dark:border-red-900/30";
                  } else if (item.category === "Criptografía") {
                    badgeColor = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-400 dark:border-emerald-900/30";
                  } else if (item.category === "Redes") {
                    badgeColor = "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-400 border-cyan-400 dark:border-cyan-900/30";
                  } else if (item.category === "Defensa") {
                    badgeColor = "bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 border-purple-400 dark:border-purple-900/30";
                  }

                  return (
                    <button
                      key={item.term}
                      id={`btn_glossary_term_${idx}`}
                      onClick={() => setActiveTermIndex(activeTermIndex === idx ? null : idx)}
                      className={`w-full text-left p-3 rounded-xl border transition-all duration-150 flex flex-col gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-neutral-900 border-neutral-950 text-white dark:bg-zinc-900 dark:border-zinc-700 dark:text-cyan-400 shadow-sm"
                          : "bg-white border-neutral-300 dark:bg-[#0a0a0a] dark:border-zinc-800 text-neutral-700 dark:text-zinc-300 hover:bg-neutral-50 hover:border-neutral-400 dark:hover:bg-zinc-900 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 w-full">
                        <span className={`text-xs font-bold leading-tight ${isSelected ? "text-white dark:text-cyan-400" : "text-neutral-900 dark:text-zinc-200"}`}>
                          {item.term}
                        </span>
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${badgeColor}`}>
                          {item.category}
                        </span>
                      </div>
                      <p className={`text-[11px] line-clamp-2 leading-relaxed ${isSelected ? "text-neutral-300 dark:text-zinc-400" : "text-neutral-600 dark:text-zinc-500"}`}>
                        {item.definition}
                      </p>
                    </button>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="p-3 bg-neutral-100 dark:bg-zinc-900/80 text-neutral-700 rounded-full">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-neutral-700 dark:text-zinc-300">No se encontraron términos</h5>
                    <p className="text-[10px] text-neutral-700 dark:text-zinc-500 mt-1">Prueba escribiendo otra palabra o cambia la categoría de búsqueda.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Rich Detail View */}
            <div className="hidden md:flex md:w-7/12 flex-col overflow-y-auto p-6 lg:p-8 bg-white dark:bg-[#08080a] justify-between">
              {activeTerm ? (
                <div className="space-y-6">
                  {/* Title Block */}
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-cyan-50 border border-cyan-400 text-cyan-600 dark:bg-cyan-950/30 dark:border-cyan-900/50 dark:text-cyan-400 rounded-md inline-block">
                      {activeTerm.category}
                    </span>
                    <h4 className="text-2xl lg:text-3xl font-serif italic font-medium text-neutral-900 dark:text-white leading-snug">
                      {activeTerm.term}
                    </h4>
                  </div>

                  {/* Definition Block */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-zinc-500 font-mono flex flex-wrap items-center gap-1.5">
                      <Book className="h-3.5 w-3.5 text-neutral-700" /> Definición Técnica
                    </h5>
                    <p className="text-xs text-neutral-700 dark:text-zinc-300 leading-relaxed bg-neutral-50 dark:bg-[#0c0c0e]/30 border border-neutral-400 dark:border-zinc-900/40 p-4 rounded-xl">
                      {activeTerm.definition}
                    </p>
                  </div>

                  {/* Example Block */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-zinc-500 font-mono flex flex-wrap items-center gap-1.5">
                      <Code className="h-3.5 w-3.5 text-neutral-700" /> Caso de Uso / Ejemplo
                    </h5>
                    <div className="text-xs text-neutral-600 dark:text-zinc-400 bg-neutral-50/50 dark:bg-[#0c0c0e]/20 border border-neutral-400 dark:border-zinc-900/20 p-4 rounded-xl font-medium border-l-2 border-l-cyan-500">
                      {activeTerm.example}
                    </div>
                  </div>

                  {/* Course Connection */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-zinc-500 font-mono flex flex-wrap items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-neutral-700" /> Relación con el Curso
                    </h5>
                    <div className="text-[11px] text-neutral-800 dark:text-zinc-450 italic flex flex-wrap items-start gap-2 bg-amber-50/30 dark:bg-amber-950/10 border border-amber-400 dark:border-amber-950/20 p-3 rounded-lg">
                      <ArrowRight className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                      <span>{activeTerm.relevance}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-neutral-700">
                  <Book className="h-10 w-10 text-neutral-300 mb-3" />
                  <p className="text-xs">Selecciona un término técnico para ver su explicación y relevancia.</p>
                </div>
              )}

              {/* Quick tip footer inside detail pane */}
              <div className="pt-4 border-t border-neutral-400 dark:border-zinc-900/60 text-[10px] text-neutral-700 dark:text-zinc-500 flex flex-wrap items-center gap-1.5 font-medium shrink-0 mt-6">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>La comprensión de la terminología técnica es clave para responder con éxito los cuestionarios evaluativos.</span>
              </div>
            </div>

            {/* Mobile View: Accordion style inside Left list view */}
            <div className="md:hidden w-full overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {filteredTerms.length > 0 ? (
                filteredTerms.map((item, idx) => {
                  const isSelected = activeTerm?.term === item.term;
                  
                  let badgeColor = "bg-neutral-100 dark:bg-zinc-900 text-neutral-800 dark:text-zinc-400 border-neutral-400 dark:border-zinc-800";
                  if (item.category === "Ataques") {
                    badgeColor = "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border-red-400 dark:border-red-900/30";
                  } else if (item.category === "Criptografía") {
                    badgeColor = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-400 dark:border-emerald-900/30";
                  } else if (item.category === "Redes") {
                    badgeColor = "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-400 border-cyan-400 dark:border-cyan-900/30";
                  } else if (item.category === "Defensa") {
                    badgeColor = "bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 border-purple-400 dark:border-purple-900/30";
                  }

                  return (
                    <div
                      key={item.term}
                      className="border border-neutral-400 dark:border-zinc-850 rounded-xl overflow-hidden bg-white dark:bg-[#0c0c0e]/30"
                    >
                      <button
                        onClick={() => setActiveTermIndex(activeTermIndex === idx ? null : idx)}
                        className={`w-full text-left p-4 flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected ? "bg-neutral-50 dark:bg-zinc-900/30" : ""
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-neutral-950 dark:text-white">{item.term}</span>
                          <span className={`w-fit text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${badgeColor}`}>
                            {item.category}
                          </span>
                        </div>
                        <ArrowRight className={`h-4 w-4 text-neutral-700 transition-transform duration-200 ${isSelected ? "rotate-90 text-cyan-500" : ""}`} />
                      </button>

                      {isSelected && (
                        <div className="p-4 border-t border-neutral-400 dark:border-zinc-900/40 bg-neutral-50/30 dark:bg-[#08080a] space-y-4 text-xs">
                          {/* Definition */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-neutral-700 uppercase tracking-widest font-mono">Definición</span>
                            <p className="text-neutral-700 dark:text-zinc-300 leading-relaxed bg-white dark:bg-[#0c0c0e] p-3 rounded-lg border border-neutral-400 dark:border-zinc-850">
                              {item.definition}
                            </p>
                          </div>

                          {/* Example */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-neutral-700 uppercase tracking-widest font-mono">Ejemplo</span>
                            <p className="text-neutral-600 dark:text-zinc-400 leading-relaxed bg-white/40 dark:bg-[#0c0c0e]/50 p-3 rounded-lg border border-neutral-400 dark:border-zinc-850/50 border-l-2 border-l-cyan-500 font-medium">
                              {item.example}
                            </p>
                          </div>

                          {/* Relevance */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-neutral-700 uppercase tracking-widest font-mono">Relación</span>
                            <p className="text-[11px] text-neutral-800 dark:text-zinc-450 italic bg-amber-50/20 dark:bg-amber-950/5 p-2 rounded-md border border-amber-400 dark:border-amber-900/40">
                              {item.relevance}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="p-3 bg-neutral-100 dark:bg-zinc-900/80 text-neutral-700 rounded-full">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-neutral-700 dark:text-zinc-300">No se encontraron términos</h5>
                    <p className="text-[10px] text-neutral-700 dark:text-zinc-500 mt-1">Prueba con otra palabra clave.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
