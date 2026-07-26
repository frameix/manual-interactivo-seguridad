import React, { useState, useEffect, useRef } from "react";
import { Terminal, Shield, Eye, AlertTriangle, Play, RefreshCw, Layers, CheckCircle2 } from "lucide-react";

type PlatformType = "google" | "facebook" | "netflix" | "instagram";

export default function PhishingSimulator() {
  const [platform, setPlatform] = useState<PlatformType>("google");
  const [tunnel, setTunnel] = useState<string>("Cloudflared");
  const [isDeployed, setIsDeployed] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [victimUser, setVictimUser] = useState("");
  const [victimPass, setVictimPass] = useState("");
  const [successCaptured, setSuccessCaptured] = useState(false);
  
  // Terminal Simulation State
  const [terminalStep, setTerminalStep] = useState<number>(0);

  const logsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Initial Zphisher Graphic
  const showInitialGraphic = () => {
    setLogs([
      "      ______      __    _      __             ",
      "     / _/ _ \\___ / /_  (_)__  / /_ ___  ____  ",
      "    / // ___/ -_) __/ / / _ \\/ __/ -_)/ __/ ",
      "   /___/_/   \\__/\\__/ /_/_//_/\\__/\\__/_/   ",
      "                                            ",
      "       Version : 2.3.5",
      "[-] Tool Created by htr-tech (tahmid.rayat)",
      "",
      "[::] Select An Attack For Your Victim [::]",
      "",
      "[01] Facebook      [11] Twitch",
      "[02] Instagram     [12] Pinterest",
      "[03] Google        [13] Snapchat",
      "[04] Microsoft     [14] Linkedin",
      "[05] Netflix       [15] Ebay",
      "",
      "[-] Select an option : "
    ]);
    setTerminalStep(1);
  };

  const handleStart = () => {
    showInitialGraphic();
  };

  const handleTerminalInput = (input: string) => {
    if (terminalStep === 1) {
      // User selected platform
      let selectedPlatform = "Google";
      if (input === "01") { selectedPlatform = "Facebook"; setPlatform("facebook"); }
      else if (input === "02") { selectedPlatform = "Instagram"; setPlatform("instagram"); }
      else if (input === "03") { selectedPlatform = "Google"; setPlatform("google"); }
      else if (input === "05") { selectedPlatform = "Netflix"; setPlatform("netflix"); }
      
      setLogs(prev => [
        ...prev.slice(0, -1),
        `[-] Select an option : ${input}`,
        "",
        `[+] Attack Selected : ${selectedPlatform}`,
        "",
        "[01] Traditional Login Page",
        "[02] Advanced Voting Poll Login Page",
        "[03] Fake Security Login Page",
        "",
        "[-] Select an option : "
      ]);
      setTerminalStep(2);
    } else if (terminalStep === 2) {
      // User selected page type
      setLogs(prev => [
        ...prev.slice(0, -1),
        `[-] Select an option : ${input}`,
        "",
        "[01] Localhost",
        "[02] Cloudflared    [Auto Detects]",
        "[03] LocalXpose     [NEW! Max 15Min]",
        "",
        "[-] Select a port forwarding service : "
      ]);
      setTerminalStep(3);
    } else if (terminalStep === 3) {
      // User selected tunnel
      let selectedTunnel = "Cloudflared";
      if (input === "01") { selectedTunnel = "Localhost"; setTunnel("Localhost"); }
      else if (input === "02") { selectedTunnel = "Cloudflared"; setTunnel("Cloudflared"); }
      else if (input === "03") { selectedTunnel = "LocalXpose"; setTunnel("LocalXpose"); }

      setLogs(prev => [
        ...prev.slice(0, -1),
        `[-] Select a port forwarding service : ${input}`,
        "",
        "[?] Do You Want A Custom Port [y/N]: "
      ]);
      setTerminalStep(4);
    } else if (terminalStep === 4) {
      const localhostUrl = "http://localhost:8080";
      const cloudflareUrl = `https://login-${platform}-secure-verification.trycloudflare.com`;

      setLogs(prev => {
        const newLogs = [
          ...prev.slice(0, -1),
          `[?] Do You Want A Custom Port [y/N]: ${input}`,
          "",
          "[*] Starting PHP Server on Localhost:8080...",
          "[*] Loading HTML templates..."
        ];

        if (tunnel === "Localhost") {
          newLogs.push(
            "[*] Initiating Localhost server connection...",
            "[*] Server established successfully!",
            "=====================================================",
            ` [URL 1] ${localhostUrl}`,
            "=====================================================",
            "[-] Waiting for Login Info, Ctrl + C to exit... "
          );
        } else {
          newLogs.push(
            `[*] Initiating ${tunnel} tunnel server connection...`,
            "[*] Tunnel established successfully!",
            "=====================================================",
            ` [URL 1] ${localhostUrl}`,
            ` [URL 2] ${cloudflareUrl}`,
            "=====================================================",
            "[-] Waiting for Login Info, Ctrl + C to exit... "
          );
        }
        return newLogs;
      });
      setTerminalStep(5);
      setIsDeployed(true);
    }
  };

  const handleVictimType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!victimUser || !victimPass) return;

    // Simulate logs capturing credentials in real time
    setLogs((prev) => [
      ...prev,
      `[+] Victim connected! IP: 190.235.12.87 - User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0`,
      `[!] CAPTURED LOGIN DATA:`,
      `    -> Platform : ${platform.toUpperCase()}`,
      `    -> Username : ${victimUser}`,
      `    -> Password : ${victimPass}`,
      `[*] Saving credentials to zphisher/creds.txt... [DONE]`,
      `[*] Redirecting victim to the legitimate ${platform}.com login screen...`
    ]);
    setSuccessCaptured(true);
  };

  const handleReset = () => {
    setIsDeployed(false);
    setLogs([]);
    setVictimUser("");
    setVictimPass("");
    setSuccessCaptured(false);
    setTerminalStep(0);
  };

  return (
    <div id="phishing_simulator_root" className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Parameter Settings & Console Panel */}
      <div className="xl:col-span-6 flex flex-col justify-between space-y-4">
        <div className="bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-850 rounded-xl p-5 space-y-4 flex flex-col h-[260px] shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-1">Configuración del Servidor Zphisher</h3>
            <p className="text-xs text-slate-600">Interactúa con la consola enviando los comandos simulados paso a paso para configurar el servidor de phishing.</p>
          </div>

          {/* Dynamic Action Buttons Based on Terminal Step */}
          <div className="flex-1 flex flex-col justify-center">
          {terminalStep === 0 && (
            <button
              onClick={handleStart}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors flex flex-wrap items-center justify-center gap-2"
            >
              <Terminal className="h-4 w-4 text-emerald-400" /> Iniciar <code className="bg-white/20 px-1.5 py-0.5 rounded ml-1">bash zphisher.sh</code>
            </button>
          )}

          {terminalStep === 1 && (
            <div className="space-y-2 border border-slate-400 dark:border-zinc-800 rounded-lg p-3 bg-slate-50 dark:bg-zinc-900">
              <p className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-2">Selecciona la Plataforma (Plantilla):</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleTerminalInput("01")} className="py-2 px-3 bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-800 hover:border-cyan-500 rounded text-xs font-mono text-left transition-colors text-slate-700 dark:text-zinc-300"><span className="text-cyan-600 dark:text-cyan-400 font-bold mr-2">01</span>Facebook</button>
                <button onClick={() => handleTerminalInput("02")} className="py-2 px-3 bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-800 hover:border-cyan-500 rounded text-xs font-mono text-left transition-colors text-slate-700 dark:text-zinc-300"><span className="text-cyan-600 dark:text-cyan-400 font-bold mr-2">02</span>Instagram</button>
                <button onClick={() => handleTerminalInput("03")} className="py-2 px-3 bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-800 hover:border-cyan-500 rounded text-xs font-mono text-left transition-colors text-slate-700 dark:text-zinc-300"><span className="text-cyan-600 dark:text-cyan-400 font-bold mr-2">03</span>Google</button>
                <button onClick={() => handleTerminalInput("05")} className="py-2 px-3 bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-800 hover:border-cyan-500 rounded text-xs font-mono text-left transition-colors text-slate-700 dark:text-zinc-300"><span className="text-cyan-600 dark:text-cyan-400 font-bold mr-2">05</span>Netflix</button>
              </div>
            </div>
          )}

          {terminalStep === 2 && (
            <div className="space-y-2 border border-slate-400 dark:border-zinc-800 rounded-lg p-3 bg-slate-50 dark:bg-zinc-900">
              <p className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-2">Selecciona el Tipo de Página:</p>
              <button onClick={() => handleTerminalInput("01")} className="w-full py-2 px-3 bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-800 hover:border-cyan-500 rounded text-xs font-mono text-left transition-colors text-slate-700 dark:text-zinc-300"><span className="text-cyan-600 dark:text-cyan-400 font-bold mr-2">01</span>Traditional Login Page</button>
            </div>
          )}

          {terminalStep === 3 && (
            <div className="space-y-2 border border-slate-400 dark:border-zinc-800 rounded-lg p-3 bg-slate-50 dark:bg-zinc-900">
              <p className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-2">Selecciona el Servicio de Túnel:</p>
              <div className="space-y-2">
                <button onClick={() => handleTerminalInput("01")} className="w-full py-2 px-3 bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-800 hover:border-cyan-500 rounded text-xs font-mono text-left transition-colors text-slate-700 dark:text-zinc-300"><span className="text-cyan-600 dark:text-cyan-400 font-bold mr-2">01</span>Localhost <span className="text-[10px] text-slate-600 ml-2">(Red Local)</span></button>
                <button onClick={() => handleTerminalInput("02")} className="w-full py-2 px-3 bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-800 hover:border-cyan-500 rounded text-xs font-mono text-left transition-colors text-slate-700 dark:text-zinc-300"><span className="text-cyan-600 dark:text-cyan-400 font-bold mr-2">02</span>Cloudflared <span className="text-[10px] text-slate-600 ml-2">(Recomendado)</span></button>
              </div>
            </div>
          )}

          {terminalStep === 4 && (
            <div className="space-y-2 border border-slate-400 dark:border-zinc-800 rounded-lg p-3 bg-slate-50 dark:bg-zinc-900 flex flex-col items-center">
              <p className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-2 text-center">¿Usar puerto personalizado?</p>
              <button onClick={() => handleTerminalInput("N")} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-50 dark:bg-indigo-950/300 text-white rounded text-xs font-bold cursor-pointer transition-colors shadow-md">
                No, iniciar con defecto (N)
              </button>
            </div>
          )}

          {terminalStep === 5 && (
            <div className="flex flex-col items-center justify-center space-y-2 pt-1">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-400 dark:border-emerald-900/40 rounded-full p-1.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">¡Servidor Desplegado!</p>
                <p className="text-[11px] text-slate-700 dark:text-zinc-400 mt-0.5 max-w-[250px] leading-snug">
                  El servidor de phishing está activo. Observa la terminal y el navegador.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="w-full py-2 px-4 mt-2 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex flex-wrap items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" /> Desmantelar Servidor
              </button>
            </div>
          )}
          </div>
        </div>

        {/* Zphisher Kali Output Terminal */}
        <div className="bg-slate-950 dark:bg-black rounded-xl border border-slate-800 overflow-hidden flex flex-col h-[280px]">
          <div className="bg-slate-900 dark:bg-zinc-950 border-b border-slate-800 px-3 py-1.5 sm:px-4 sm:py-2.5 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-500" />
              <span className="font-mono text-xs text-slate-300 font-semibold">Consola Zphisher - Kali Linux</span>
            </div>
            <span className="text-[10px] bg-red-50 dark:bg-red-950/30 border border-red-400 dark:border-red-900/40 text-red-400 px-2 py-0.5 rounded font-mono">
              {isDeployed ? "LISTENING" : "OFFLINE"}
            </span>
          </div>
          <div ref={logsContainerRef} className="flex-1 p-4 font-mono text-xs text-emerald-400 overflow-y-auto space-y-1 select-text scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {terminalStep === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 text-center gap-2">
                <Terminal className="h-8 w-8 text-slate-600/50" />
                <p className="italic">Presiona "Iniciar bash zphisher.sh" para comenzar la simulación.</p>
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="leading-snug">
                  {log.startsWith("[+]") || log.includes("CAPTURED") ? (
                    <span className="text-green-300 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-1 rounded">{log}</span>
                  ) : log.startsWith("[!") ? (
                    <span className="text-yellow-300 font-bold">{log}</span>
                  ) : log.includes("trycloudflare") || log.includes("http://localhost") ? (
                    <span className="text-sky-400 underline font-semibold">{log}</span>
                  ) : log.startsWith("[-]") || log.startsWith("[?]") ? (
                    <span className="text-cyan-400">{log}</span>
                  ) : log.startsWith("[0") || log.startsWith("[1") || log.startsWith("[2") || log.startsWith("[3") || log.startsWith("[9") ? (
                    <span className="text-red-400">{log}</span>
                  ) : log.includes("ZPHISHER") || log.startsWith(" ") ? (
                    <span className="text-blue-400 font-bold whitespace-pre">{log}</span>
                  ) : (
                    <span>{log}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Victim Web Browser Simulation */}
      <div className="xl:col-span-6 flex flex-col xl:sticky xl:top-24 xl:self-start h-full min-h-[420px]">
        <div className="bg-slate-100 dark:bg-zinc-900 border border-slate-500 dark:border-zinc-800 rounded-xl overflow-hidden flex-1 flex flex-col shadow-xs">
          {/* Browser Header */}
          <div className="bg-slate-200 dark:bg-zinc-950 border-b border-slate-500 dark:border-zinc-800 p-3 flex flex-wrap items-center gap-2.5">
            <div className="flex flex-wrap gap-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-slate-400 dark:bg-zinc-850"></div>
              <div className="w-3 h-3 rounded-full bg-slate-400 dark:bg-zinc-850"></div>
              <div className="w-3 h-3 rounded-full bg-slate-400 dark:bg-zinc-850"></div>
            </div>

            {/* Address Bar */}
            <div className="flex-1 bg-white dark:bg-zinc-900 rounded-lg px-3 py-1.5 flex items-center justify-between text-xs border border-slate-500 dark:border-zinc-800 overflow-hidden font-mono text-slate-700">
              <div className="flex flex-wrap items-center gap-1.5 truncate">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-slate-700 dark:text-zinc-300 truncate">
                  {isDeployed 
                    ? (tunnel === "Localhost" ? `http://127.0.0.1:8080/login.html` : `https://login-${platform}-secure-verification.trycloudflare.com`)
                    : `https://www.legitimate-${platform}.com/auth`}
                </span>
              </div>
              <span className="text-[9px] uppercase px-1 bg-amber-100 dark:bg-amber-950/55 text-amber-700 dark:text-amber-400 rounded font-sans shrink-0 font-bold">Inseguro</span>
            </div>
          </div>

          {/* Browser Document Content */}
          <div className="flex-1 bg-slate-50 dark:bg-zinc-950 p-6 flex items-center justify-center">
            {!isDeployed ? (
              <div className="text-center text-slate-600 max-w-xs space-y-2.5">
                <Shield className="h-10 w-10 text-slate-300 mx-auto stroke-1" />
                <h4 className="font-semibold text-xs text-slate-700 dark:text-zinc-300">Navegador del Alumno / Víctima</h4>
                <p className="text-[11px] leading-relaxed">
                  Cuando levantes el servidor Zphisher, aquí aparecerá el portal falso de inicio de sesión que simula la estafa cibernética.
                </p>
              </div>
            ) : successCaptured ? (
              <div className="text-center space-y-3 p-5 max-w-sm border border-emerald-400 dark:border-emerald-950 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-xl">
                <Eye className="h-8 w-8 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-xs text-slate-800 dark:text-zinc-200">¡DATOS DE ACCESO ENVIADOS!</h4>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  El portal de phishing simulado acaba de capturar las credenciales y las ha enviado a tu consola Zphisher de Kali Linux a la izquierda.
                </p>
                <div className="text-[10px] text-slate-600 italic">Redireccionando a la URL oficial...</div>
              </div>
            ) : (
              <div className="w-full max-w-xs bg-white dark:bg-zinc-900 border border-slate-400 dark:border-zinc-800 rounded-xl p-5 shadow-lg">
                {/* Specific UI Platform render */}
                {platform === "google" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-lg font-bold tracking-tight text-slate-800 dark:text-zinc-200 font-sans">
                        <span className="text-blue-500">G</span>
                        <span className="text-red-500">o</span>
                        <span className="text-yellow-500">o</span>
                        <span className="text-blue-500">g</span>
                        <span className="text-green-500">l</span>
                        <span className="text-red-500">e</span>
                      </div>
                      <h5 className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mt-1">Iniciar sesión con tu cuenta</h5>
                      <p className="text-[10px] text-slate-600">Ir a Gmail o Classroom</p>
                    </div>

                    <form onSubmit={handleVictimType} className="space-y-3">
                      <input
                        type="email"
                        value={victimUser}
                        onChange={(e) => setVictimUser(e.target.value)}
                        placeholder="Correo electrónico o teléfono"
                        className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                        required
                      />
                      <input
                        type="password"
                        value={victimPass}
                        onChange={(e) => setVictimPass(e.target.value)}
                        placeholder="Introduce tu contraseña"
                        className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                        required
                      />
                      <button
                        type="submit"
                        id="btn_victim_google_login"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-xs cursor-pointer"
                      >
                        Siguiente
                      </button>
                    </form>
                  </div>
                )}

                {platform === "facebook" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold tracking-tight text-blue-600 font-sans">facebook</div>
                      <p className="text-[10px] text-slate-600">Inicia sesión en tu cuenta para ver noticias.</p>
                    </div>

                    <form onSubmit={handleVictimType} className="space-y-2.5">
                      <input
                        type="text"
                        value={victimUser}
                        onChange={(e) => setVictimUser(e.target.value)}
                        placeholder="Correo electrónico o número de teléfono"
                        className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                        required
                      />
                      <input
                        type="password"
                        value={victimPass}
                        onChange={(e) => setVictimPass(e.target.value)}
                        placeholder="Contraseña"
                        className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                        required
                      />
                      <button
                        type="submit"
                        id="btn_victim_fb_login"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs cursor-pointer"
                      >
                        Iniciar sesión
                      </button>
                    </form>
                  </div>
                )}

                {platform === "netflix" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-xl font-black text-red-600 tracking-wider">NETFLIX</div>
                      <h5 className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mt-1">Confirmación de Membresía</h5>
                    </div>

                    <form onSubmit={handleVictimType} className="space-y-3">
                      <input
                        type="text"
                        value={victimUser}
                        onChange={(e) => setVictimUser(e.target.value)}
                        placeholder="Email o número de teléfono"
                        className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-red-500"
                        required
                      />
                      <input
                        type="password"
                        value={victimPass}
                        onChange={(e) => setVictimPass(e.target.value)}
                        placeholder="Contraseña"
                        className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-red-500"
                        required
                      />
                      <button
                        type="submit"
                        id="btn_victim_netflix_login"
                        className="w-full py-2 bg-red-600 hover:bg-red-50 dark:bg-red-950/300 text-white rounded font-bold text-xs cursor-pointer"
                      >
                        Iniciar sesión
                      </button>
                    </form>
                  </div>
                )}

                {platform === "instagram" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-xl font-bold tracking-wide italic text-slate-800 dark:text-zinc-200">Instagram</div>
                      <p className="text-[10px] text-slate-600">Regístrate o inicia sesión con tus credenciales.</p>
                    </div>

                    <form onSubmit={handleVictimType} className="space-y-2.5">
                      <input
                        type="text"
                        value={victimUser}
                        onChange={(e) => setVictimUser(e.target.value)}
                        placeholder="Teléfono, usuario o correo electrónico"
                        className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none"
                        required
                      />
                      <input
                        type="password"
                        value={victimPass}
                        onChange={(e) => setVictimPass(e.target.value)}
                        placeholder="Contraseña"
                        className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none"
                        required
                      />
                      <button
                        type="submit"
                        id="btn_victim_ig_login"
                        className="w-full py-2 bg-blue-500 hover:bg-blue-400 text-white rounded font-bold text-xs cursor-pointer"
                      >
                        Iniciar sesión
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
