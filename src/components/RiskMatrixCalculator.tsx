import React, { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Shield, Info, HelpCircle } from "lucide-react";

interface RiskItem {
  id: string;
  asset: string;
  threat: string;
  probability: number; // 1 to 5
  impact: number;      // 1 to 5
  treatment: string;
}

export default function RiskMatrixCalculator() {
  const [risks, setRisks] = useState<RiskItem[]>([
    {
      id: "risk-1",
      asset: "Servidor Web Principal",
      threat: "Ataque DDoS / Caída de servicio",
      probability: 3,
      impact: 5,
      treatment: "Mitigar: Instalar firewall Cloudflare y balanceador de carga redundante."
    },
    {
      id: "risk-2",
      asset: "Base de Datos de Alumnos",
      threat: "Inyección SQL / Fuga de Datos",
      probability: 2,
      impact: 5,
      treatment: "Mitigar: Implementar consultas preparadas (Prepared Statements) y auditorías quincenales."
    },
    {
      id: "risk-3",
      asset: "Computadora de Oficina de Matrícula",
      threat: "Infección de Ransomware mediante Phishing",
      probability: 4,
      impact: 3,
      treatment: "Transferir: Comprar seguro de ciberriesgo y capacitar al personal."
    },
    {
      id: "risk-4",
      asset: "Impresora de Red",
      threat: "Acceso no autorizado a documentos impresos",
      probability: 2,
      impact: 1,
      treatment: "Aceptar: Monitorear logs periódicamente. El impacto operacional es insignificante."
    }
  ]);

  const [newAsset, setNewAsset] = useState("");
  const [newThreat, setNewThreat] = useState("");
  const [newProb, setNewProb] = useState(3);
  const [newImp, setNewImp] = useState(3);
  const [newTreatment, setNewTreatment] = useState("");

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when a new risk is added
  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({
        top: tableContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [risks.length]);

  const getRiskLevel = (score: number) => {
    if (score >= 15) return { label: "Crítico", bg: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-500 dark:border-red-800", rawBg: "bg-red-50 dark:bg-red-950/300" };
    if (score >= 10) return { label: "Alto", bg: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-500 dark:border-amber-800", rawBg: "bg-amber-50 dark:bg-amber-950/300" };
    if (score >= 5) return { label: "Tolerable", bg: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500 dark:border-yellow-800", rawBg: "bg-yellow-500" };
    return { label: "Aceptable", bg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-500 dark:border-emerald-800", rawBg: "bg-emerald-50 dark:bg-emerald-950/300" };
  };

  const handleAddRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset || !newThreat) return;

    const score = newProb * newImp;
    let autoTreatment = "";
    if (score >= 15) {
      autoTreatment = "Mitigar / Evitar: Rediseñar la arquitectura inmediatamente, aislar el activo y aplicar MFA estricto.";
    } else if (score >= 10) {
      autoTreatment = "Mitigar: Implementar parches semanales y monitoreo IDS de intrusiones.";
    } else if (score >= 5) {
      autoTreatment = "Transferir / Mitigar: Configurar copias de seguridad diarias y contratar un seguro.";
    } else {
      autoTreatment = "Aceptar: Monitoreo rutinario sin requerir inversión presupuestaria mayor.";
    }

    const item: RiskItem = {
      id: "risk-" + Date.now(),
      asset: newAsset,
      threat: newThreat,
      probability: newProb,
      impact: newImp,
      treatment: newTreatment || autoTreatment
    };

    setRisks([...risks, item]);
    setNewAsset("");
    setNewThreat("");
    setNewProb(3);
    setNewImp(3);
    setNewTreatment("");
  };

  const handleDeleteRisk = (id: string) => {
    setRisks(risks.filter(r => r.id !== id));
  };

  return (
    <div id="risk_matrix_root" className="space-y-6">
      <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-400 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-zinc-100 flex flex-wrap items-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-indigo-500" /> Calculadora Interactiva de Matriz de Riesgo
          </h3>
          <p className="text-sm text-slate-700 dark:text-zinc-400">
            La matriz de riesgos se rige por la ecuación matemática fundamental: <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded font-mono">Riesgo = Probabilidad (1-5) × Impacto (1-5)</code>. Agrega los activos tecnológicos de tu entorno y evalúa la severidad para formular estrategias de mitigación.
          </p>
        </div>
        <div className="flex-shrink-0">
          <a
            href="/matriz-de-riesgo.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Abrir Matriz Original (UNSM)
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Risk Form */}
        <div className="xl:col-span-4 bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-850 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-zinc-200 mb-4 flex flex-wrap items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-500" /> Registrar Activo y Amenaza
          </h4>
          <form onSubmit={handleAddRisk} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Nombre del Activo</label>
              <input
                type="text"
                value={newAsset}
                onChange={(e) => setNewAsset(e.target.value)}
                placeholder="Ej. Base de datos MySQL"
                className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Amenaza Latente</label>
              <input
                type="text"
                value={newThreat}
                onChange={(e) => setNewThreat(e.target.value)}
                placeholder="Ej. Acceso no autorizado de ex-empleados"
                className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Probabilidad (1-5)</label>
                <select
                  value={newProb}
                  onChange={(e) => setNewProb(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value={1}>1 - Muy baja (Inusual)</option>
                  <option value={2}>2 - Baja (Poco común)</option>
                  <option value={3}>3 - Media (Ocurrencia ocasional)</option>
                  <option value={4}>4 - Alta (Ocurre frecuentemente)</option>
                  <option value={5}>5 - Muy alta (Casi seguro)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Impacto (1-5)</label>
                <select
                  value={newImp}
                  onChange={(e) => setNewImp(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value={1}>1 - Insignificante (Sin impacto real)</option>
                  <option value={2}>2 - Menor (Baja interrupción)</option>
                  <option value={3}>3 - Moderado (Pérdidas recuperables)</option>
                  <option value={4}>4 - Mayor (Pérdidas operacionales)</option>
                  <option value={5}>5 - Catastrófico (Quiebra / Fuga masiva)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Plan de Tratamiento (Opcional)</label>
              <textarea
                value={newTreatment}
                onChange={(e) => setNewTreatment(e.target.value)}
                placeholder="Deja en blanco para autogenerar sugerencia técnica..."
                className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 h-16 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-400 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Agregar Activo a la Matriz
            </button>
          </form>
        </div>

        {/* Risk Grid list */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-850 rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-400 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 font-mono">Tabla de Activos de Información Evaluados</h4>
              <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-semibold font-mono">{risks.length} Activos</span>
            </div>
            <div ref={tableContainerRef} className="divide-y divide-slate-100 dark:divide-zinc-900 overflow-x-auto overflow-y-auto max-h-[450px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-700">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="sticky top-0 z-10">
                  <tr className="text-[10px] uppercase font-mono text-slate-600 bg-slate-100 dark:bg-[#18181b] shadow-sm">
                    <th className="py-2.5 px-4">Activo / Amenaza</th>
                    <th className="py-2.5 px-3 text-center">Prob (P)</th>
                    <th className="py-2.5 px-3 text-center">Imp (I)</th>
                    <th className="py-2.5 px-3 text-center">Severidad (P×I)</th>
                    <th className="py-2.5 px-4">Nivel</th>
                    <th className="py-2.5 px-4">Estrategia sugerida</th>
                    <th className="py-2.5 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 text-xs">
                  {risks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-600 dark:text-zinc-600 italic">No hay activos registrados en la matriz. Agrega uno a la izquierda.</td>
                    </tr>
                  ) : (
                    risks.map((item) => {
                      const score = item.probability * item.impact;
                      const lvl = getRiskLevel(score);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 dark:bg-slate-950/30/50 dark:hover:bg-zinc-50 dark:bg-zinc-950/30 transition-colors">
                          <td className="py-3 px-4 max-w-[180px]">
                            <div className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{item.asset}</div>
                            <div className="text-[10px] text-slate-600 truncate">{item.threat}</div>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-600 dark:text-zinc-400">{item.probability}</td>
                          <td className="py-3 px-3 text-center font-mono text-slate-600 dark:text-zinc-400">{item.impact}</td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-800 dark:text-zinc-200">
                            <span className="px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-zinc-900">{score}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${lvl.bg}`}>
                              {lvl.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[11px] text-slate-700 dark:text-zinc-400 max-w-[200px] leading-snug">
                            {item.treatment}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDeleteRisk(item.id)}
                              className="p-1 text-slate-600 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors cursor-pointer"
                              title="Eliminar activo de la matriz"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Theoretical explanation on Risk levels */}
          <div className="p-4 bg-indigo-50/30 dark:bg-zinc-900/50 border border-indigo-400 dark:border-zinc-800 rounded-xl flex flex-wrap gap-3.5">
            <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1.5">
              <h5 className="font-semibold text-indigo-900 dark:text-indigo-300">¿Cómo se interpretan los rangos de riesgo?</h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mt-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-50 dark:bg-emerald-950/300"></span>
                  <span className="text-slate-600 dark:text-zinc-400"><b className="text-slate-800 dark:text-zinc-300">1 - 4</b>: Aceptable</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-yellow-500"></span>
                  <span className="text-slate-600 dark:text-zinc-400"><b className="text-slate-800 dark:text-zinc-300">5 - 9</b>: Tolerable</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-50 dark:bg-amber-950/300"></span>
                  <span className="text-slate-600 dark:text-zinc-400"><b className="text-slate-800 dark:text-zinc-300">10 - 14</b>: Alto</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-red-50 dark:bg-red-950/300"></span>
                  <span className="text-slate-600 dark:text-zinc-400"><b className="text-slate-800 dark:text-zinc-300">15 - 25</b>: Crítico</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
