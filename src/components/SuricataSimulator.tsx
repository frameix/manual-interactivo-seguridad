import React, { useState, useEffect, useRef } from "react";
import { Shield, Play, Plus, Server, Activity, Terminal, AlertTriangle, ShieldAlert } from "lucide-react";

interface AlertLog {
  id: string;
  timestamp: string;
  source: string;
  destination: string;
  msg: string;
  severity: "Alto" | "Medio" | "Bajo";
  signatureId: number;
}

export default function SuricataSimulator() {
  const [activeRuleTab, setActiveRuleTab] = useState<"ping" | "portscan" | "sqli">("ping");
  const [alerts, setAlerts] = useState<AlertLog[]>([
    {
      id: "alert-1",
      timestamp: "13:16:01",
      source: "192.168.1.155",
      destination: "192.168.1.1",
      msg: "SURICATA IDS: Intento de escaneo de puertos Nmap detectado (TCP SYN)",
      severity: "Medio",
      signatureId: 2000045
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const alertsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (alertsContainerRef.current) {
      alertsContainerRef.current.scrollTop = alertsContainerRef.current.scrollHeight;
    }
  }, [alerts]);

  // Hardcoded simulated rules
  const rules = {
    ping: 'alert icmp any any -> any any (msg:"ALERTA IDS: Ping de Diagnóstico Detectado"; sid:1000001; rev:1;)',
    portscan: 'alert tcp any any -> $HOME_NET any (msg:"ALERTA IDS: Escaneo de Puertos SYN detectado"; flags:S; threshold:type threshold, track by_src, count 10, seconds 2; sid:1000002;)',
    sqli: 'alert tcp any any -> $HTTP_SERVERS any (msg:"ALERTA IDS: Intento de Inyección SQL detectado en URI"; content:"OR"; nocase; content:"1=1"; sid:1000003;)'
  };

  const handleTriggerAttack = (attackType: "ping" | "portscan" | "sqli") => {
    setIsProcessing(true);
    setTimeout(() => {
      let newAlert: AlertLog;
      const time = new Date().toLocaleTimeString();

      switch (attackType) {
        case "ping":
          newAlert = {
            id: `alert-${Date.now()}`,
            timestamp: time,
            source: "192.168.1.80",
            destination: "192.168.1.1",
            msg: "SURICATA IDS: Ping de Diagnóstico Detectado (ICMP Echo Request)",
            severity: "Bajo",
            signatureId: 1000001
          };
          break;
        case "portscan":
          newAlert = {
            id: `alert-${Date.now()}`,
            timestamp: time,
            source: "192.168.1.120",
            destination: "192.168.1.10",
            msg: "SURICATA IDS: Escaneo masivo de puertos TCP SYN rápido detectado",
            severity: "Medio",
            signatureId: 1000002
          };
          break;
        case "sqli":
          newAlert = {
            id: `alert-${Date.now()}`,
            timestamp: time,
            source: "190.235.12.87",
            destination: "192.168.1.5",
            msg: "SURICATA IDS: Intento de Inyección SQL detectado en parámetro HTTP GET",
            severity: "Alto",
            signatureId: 1000003
          };
          break;
      }

      setAlerts((prev) => [newAlert, ...prev]);
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <div id="suricata_simulator_root" className="space-y-6">
      <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-400 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
        <h3 className="text-lg font-medium text-slate-900 dark:text-zinc-100 flex flex-wrap items-center gap-2 mb-3">
          <ShieldAlert className="h-5 w-5 text-indigo-500 animate-pulse" /> Auditoría IDS con Suricata y Alertas SIEM
        </h3>
        <p className="text-sm text-slate-700 dark:text-zinc-400">
          Un firewall tradicional bloquea puertos, pero un IDS analiza el contenido de los paquetes. Suricata evalúa las firmas en tiempo real para alertar al administrador sobre posibles brechas. Prueba disparando ataques simulados para ver la captura.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Side: Rule Selector and Attack simulator triggers */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-850 rounded-xl p-5 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-zinc-200 mb-1 flex flex-wrap items-center gap-1.5">
                <Terminal className="h-4 w-4 text-indigo-500" /> Archivo de Reglas de Suricata
              </h4>
              <p className="text-xs text-slate-600">Estructura de firmas en el archivo local de reglas de Suricata (<code className="px-1 py-0.5 bg-slate-100 dark:bg-zinc-900 font-mono text-[10px]">/etc/suricata/rules/local.rules</code>).</p>
            </div>

            {/* Rule Selector Tabs */}
            <div className="grid grid-cols-3 gap-2.5 bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg border border-slate-400 dark:border-zinc-850">
              <button
                onClick={() => setActiveRuleTab("ping")}
                className={`py-1.5 px-2 text-[10px] rounded font-semibold cursor-pointer text-center transition-all ${activeRuleTab === "ping" ? "bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-xs" : "text-slate-700 hover:text-slate-700 dark:hover:text-zinc-300"}`}
              >
                Regla Ping
              </button>
              <button
                onClick={() => setActiveRuleTab("portscan")}
                className={`py-1.5 px-2 text-[10px] rounded font-semibold cursor-pointer text-center transition-all ${activeRuleTab === "portscan" ? "bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-xs" : "text-slate-700 hover:text-slate-700 dark:hover:text-zinc-300"}`}
              >
                Regla Portscan
              </button>
              <button
                onClick={() => setActiveRuleTab("sqli")}
                className={`py-1.5 px-2 text-[10px] rounded font-semibold cursor-pointer text-center transition-all ${activeRuleTab === "sqli" ? "bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-xs" : "text-slate-700 hover:text-slate-700 dark:hover:text-zinc-300"}`}
              >
                Regla SQLi
              </button>
            </div>

            {/* Active Rule display block */}
            <div className="bg-slate-950 dark:bg-black rounded-lg p-3.5 border border-slate-800">
              <div className="text-[10px] text-slate-700 font-mono select-none mb-1"># FIRMA ACTIVA DETECTOR:</div>
              <code className="text-indigo-400 font-mono text-[10.5px] leading-relaxed break-all block">
                {rules[activeRuleTab]}
              </code>
            </div>

            {/* Attack Buttons Trigger */}
            <div className="space-y-2 pt-2 border-t border-slate-400 dark:border-zinc-900">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-400">Simulador de Inyección de Tráfico Malicioso</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  id="btn_trigger_ping"
                  onClick={() => handleTriggerAttack("ping")}
                  disabled={isProcessing}
                  className="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 rounded-lg border border-slate-400 dark:border-zinc-800 text-xs flex justify-between items-center cursor-pointer font-semibold"
                >
                  <span className="text-slate-700 dark:text-zinc-300 flex flex-wrap items-center gap-1.5">
                    <Activity className="h-4 w-4 text-blue-500" /> Disparar ICMP Ping Flood
                  </span>
                  <span className="text-[10px] text-slate-600 italic">Prueba diagnóstica</span>
                </button>
                <button
                  id="btn_trigger_portscan"
                  onClick={() => handleTriggerAttack("portscan")}
                  disabled={isProcessing}
                  className="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 rounded-lg border border-slate-400 dark:border-zinc-800 text-xs flex justify-between items-center cursor-pointer font-semibold"
                >
                  <span className="text-slate-700 dark:text-zinc-300 flex flex-wrap items-center gap-1.5">
                    <Server className="h-4 w-4 text-amber-500" /> Lanzar Escaneo de Puertos Nmap
                  </span>
                  <span className="text-[10px] text-slate-600 italic">Mapeo pasivo</span>
                </button>
                <button
                  id="btn_trigger_sqli"
                  onClick={() => handleTriggerAttack("sqli")}
                  disabled={isProcessing}
                  className="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 rounded-lg border border-slate-400 dark:border-zinc-800 text-xs flex justify-between items-center cursor-pointer font-semibold"
                >
                  <span className="text-slate-700 dark:text-zinc-300 flex flex-wrap items-center gap-1.5">
                    <Shield className="h-4 w-4 text-red-500 animate-pulse" /> Simular Inyección SQL (SQLi)
                  </span>
                  <span className="text-[10px] text-slate-600 italic">Ataque de aplicación</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: SIEM Logs Stream Monitor Dashboard */}
        <div className="xl:col-span-7 flex flex-col xl:sticky xl:top-24 xl:self-start h-[400px]">
          <div className="bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-850 rounded-xl overflow-hidden flex-1 flex flex-col shadow-xs">
            <div className="px-5 py-3 border-b border-slate-400 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 font-mono">Consola Centralizada SIEM (Security Alert Logs)</h4>
              {isProcessing ? (
                <span className="flex flex-wrap items-center gap-1.5 text-xs text-indigo-500 font-semibold font-mono animate-pulse">
                  <Activity className="h-3.5 w-3.5 animate-spin" /> Analizando tráfico...
                </span>
              ) : (
                <span className="text-[10px] bg-slate-100 dark:bg-zinc-900 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">Wazuh / OSSEC Listener Active</span>
              )}
            </div>

            <div ref={alertsContainerRef} className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-900 scrollbar-thin">
              {alerts.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 dark:text-zinc-600 italic">
                  Ningún incidente registrado aún. Dispara un ataque simulado.
                </div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="p-3.5 flex flex-wrap gap-3 hover:bg-slate-50 dark:bg-slate-950/30/50 dark:hover:bg-zinc-50 dark:bg-zinc-950/30 transition-colors">
                    <div className="shrink-0">
                      {alert.severity === "Alto" ? (
                        <div className="p-2 bg-red-100 dark:bg-red-950/40 border border-red-500 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg animate-bounce">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                      ) : alert.severity === "Medio" ? (
                        <div className="p-2 bg-amber-100 dark:bg-amber-950/40 border border-amber-500 dark:border-amber-900 text-amber-600 dark:text-amber-400 rounded-lg">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="p-2 bg-blue-100 dark:bg-blue-950/40 border border-blue-500 dark:border-blue-900 text-blue-600 dark:text-blue-400 rounded-lg">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-600 font-semibold font-mono">[{alert.timestamp}] IDS ALERT - GOLPE REGISTRO</span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-sm border uppercase ${alert.severity === "Alto" ? "bg-red-50 dark:bg-red-950/30 text-red-600 border-red-400 dark:border-red-900/40" : alert.severity === "Medio" ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-400 dark:border-amber-900/40" : "bg-blue-50 text-blue-600 border-blue-400"}`}>
                          Severidad: {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-snug">
                        {alert.msg}
                      </p>
                      <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                        <div>
                          Origen: <span className="text-slate-600 dark:text-zinc-300 font-semibold">{alert.source}</span> → Destino: <span className="text-slate-600 dark:text-zinc-300 font-semibold">{alert.destination}</span>
                        </div>
                        <div>
                          Signature ID: {alert.signatureId}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
