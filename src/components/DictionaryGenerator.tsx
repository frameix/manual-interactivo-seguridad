import React, { useState } from "react";
import { Terminal, Settings, User, FileText, Check, Download, Play } from "lucide-react";

export default function DictionaryGenerator() {
  const [activeTab, setActiveTab] = useState<"crunch" | "cupp">("crunch");

  // Crunch parameters
  const [crunchMin, setCrunchMin] = useState(4);
  const [crunchMax, setCrunchMax] = useState(4);
  const [crunchChars, setCrunchChars] = useState("abc1");
  const [crunchPattern, setCrunchPattern] = useState("");
  const [usePiping, setUsePiping] = useState(false);
  const [crunchOutput, setCrunchOutput] = useState<string[]>([]);
  const [crunchCommandRun, setCrunchCommandRun] = useState("");

  // CUPP parameters
  const [cuppName, setCuppName] = useState("");
  const [cuppSurname, setCuppSurname] = useState("");
  const [cuppNickname, setCuppNickname] = useState("");
  const [cuppBirthYear, setCuppBirthYear] = useState("");
  const [cuppPet, setCuppPet] = useState("");
  const [cuppCity, setCuppCity] = useState("");
  const [cuppOutput, setCuppOutput] = useState<string[]>([]);

  // Feedback states
  const [copied, setCopied] = useState(false);
  const [crunchGenerated, setCrunchGenerated] = useState(false);
  const [cuppGenerated, setCuppGenerated] = useState(false);

  // Crunch logic simulation
  const handleGenerateCrunch = () => {
    let results: string[] = [];
    
    // Si hay un patrón, simularlo
    if (crunchPattern) {
      // Reemplazos simples ilustrativos (espacio limitado para evitar bloqueos)
      const charsMap: Record<string, string> = {
        '%': '012', // números
        '@': 'abc', // minúsculas
        ',': 'ABC', // mayúsculas
        '^': '!*'  // símbolos
      };
      
      const generatePattern = (current: string, index: number) => {
        if (results.length >= 60) return;
        if (index === crunchPattern.length) {
          results.push(current);
          return;
        }
        
        const char = crunchPattern[index];
        if (charsMap[char]) {
          const mapStr = charsMap[char];
          for (let i = 0; i < mapStr.length; i++) {
            generatePattern(current + mapStr[i], index + 1);
          }
        } else {
          generatePattern(current + char, index + 1);
        }
      };
      
      generatePattern("", 0);
    } else {
      let charset = crunchChars || "abc1";
      // Simple combinatorics generator (capped at 50 for display safety)
      const generateCombinations = (current: string) => {
        if (results.length >= 60) return;
        if (current.length >= crunchMin && current.length <= crunchMax) {
          results.push(current);
        }
        if (current.length === crunchMax) return;

        for (let i = 0; i < charset.length; i++) {
          generateCombinations(current + charset[i]);
        }
      };
      generateCombinations("");
    }

    setCrunchOutput(results);
    
    const outputFlag = usePiping ? "| aircrack-ng -w - captura.cap -e RedWiFi" : "-o diccionario.txt";
    const patternFlag = crunchPattern ? `-t ${crunchPattern}` : "";
    
    // En crunch real, si usas -t, min y max deben coincidir con la longitud del patrón
    const lenMin = crunchPattern ? crunchPattern.length : crunchMin;
    const lenMax = crunchPattern ? crunchPattern.length : crunchMax;
    
    setCrunchCommandRun(`crunch ${lenMin} ${lenMax} ${crunchPattern ? "" : crunchChars} ${patternFlag} ${outputFlag}`.replace(/\s+/g, " ").trim());
    
    setCrunchGenerated(true);
    setTimeout(() => setCrunchGenerated(false), 2000);
  };

  // CUPP logic simulation
  const handleGenerateCupp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuppName && !cuppPet && !cuppBirthYear) return;

    // Simulate standard CUPP variations combining input fields
    const baseWords = [
      cuppName.toLowerCase(),
      cuppSurname.toLowerCase(),
      cuppNickname.toLowerCase(),
      cuppPet.toLowerCase(),
      cuppCity.toLowerCase()
    ].filter(Boolean);

    const currentYear = new Date().getFullYear();
    const suffixNumbers = [
      cuppBirthYear,
      cuppBirthYear ? cuppBirthYear.substring(2) : "",
      "123", currentYear.toString(), (currentYear - 1).toString(), "1", "12"
    ].filter(Boolean);

    const specialChars = ["", "!", "@", "#", "$", "*"];
    const resultsSet = new Set<string>();

    // Generate smart combinations
    baseWords.forEach((word) => {
      // Rule 1: capitalize
      const capWord = word.charAt(0).toUpperCase() + word.slice(1);
      resultsSet.add(word);
      resultsSet.add(capWord);

      // Rule 2: Word + Number
      suffixNumbers.forEach((num) => {
        resultsSet.add(`${word}${num}`);
        resultsSet.add(`${capWord}${num}`);
        
        // Rule 3: Word + Number + Special
        specialChars.forEach((spec) => {
          resultsSet.add(`${word}${num}${spec}`);
          resultsSet.add(`${capWord}${num}${spec}`);
          if (spec) {
            resultsSet.add(`${word}${spec}${num}`);
          }
        });
      });
    });

    // Also add specialized patterns (e.g. Pet + Year)
    if (cuppPet && cuppBirthYear) {
      const capPet = cuppPet.charAt(0).toUpperCase() + cuppPet.slice(1);
      resultsSet.add(`${cuppPet.toLowerCase()}${cuppBirthYear}`);
      resultsSet.add(`${capPet}${cuppBirthYear}`);
      resultsSet.add(`${capPet}${cuppBirthYear.substring(2)}`);
    }

    const outputList = Array.from(resultsSet).slice(0, 100); // cap output size
    setCuppOutput(outputList);
    
    setCuppGenerated(true);
    setTimeout(() => setCuppGenerated(false), 2000);
  };

  const copyToClipboard = (textList: string[]) => {
    if (textList.length === 0) return;
    navigator.clipboard.writeText(textList.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="dictionary_generator_root" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Parameters Panel */}
      <div className="lg:col-span-6 space-y-4">
        {/* Tab Header */}
        <div className="bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-xl border border-slate-400 dark:border-zinc-800 grid grid-cols-2 gap-1.5">
          <button
            id="tab_crunch"
            onClick={() => setActiveTab("crunch")}
            className={`py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 ${activeTab === "crunch" ? "bg-white dark:bg-zinc-800 text-slate-950 dark:text-zinc-100 shadow-xs" : "text-slate-700 hover:text-slate-700 dark:hover:text-zinc-300"}`}
          >
            <Settings className="h-4 w-4 text-indigo-500" /> Crunch (Algorítmico)
          </button>
          <button
            id="tab_cupp"
            onClick={() => setActiveTab("cupp")}
            className={`py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 ${activeTab === "cupp" ? "bg-white dark:bg-zinc-800 text-slate-950 dark:text-zinc-100 shadow-xs" : "text-slate-700 hover:text-slate-700 dark:hover:text-zinc-300"}`}
          >
            <User className="h-4 w-4 text-indigo-500" /> CUPP (Perfilador)
          </button>
        </div>

        {/* Tab Contents: Crunch */}
        {activeTab === "crunch" && (
          <div className="bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-850 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-1">Crunch Wordlist Builder</h3>
              <p className="text-xs text-slate-600">Genera diccionarios estandarizados especificando límites de caracteres y conjuntos lógicos.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Longitud Mínima</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={crunchPattern ? crunchPattern.length : crunchMin}
                  onChange={(e) => setCrunchMin(Math.min(12, Math.max(1, Number(e.target.value))))}
                  disabled={!!crunchPattern}
                  className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Longitud Máxima</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={crunchPattern ? crunchPattern.length : crunchMax}
                  onChange={(e) => setCrunchMax(Math.min(12, Math.max(crunchMin, Number(e.target.value))))}
                  disabled={!!crunchPattern}
                  className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Conjunto de Caracteres (Charset)</label>
              <input
                type="text"
                value={crunchChars}
                onChange={(e) => setCrunchChars(e.target.value.replace(/\s+/g, ""))}
                placeholder="Ej. abc12 (Dejar vacío si usas patrón)"
                disabled={!!crunchPattern}
                className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-600 mt-1 block">Cada combinación probará estas letras o números consecutivamente.</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Patrón Avanzado (-t)</label>
              <input
                type="text"
                value={crunchPattern}
                onChange={(e) => setCrunchPattern(e.target.value.replace(/\s+/g, ""))}
                placeholder="Ej. Admin%%%"
                className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <span className="text-[10px] text-slate-600 mt-1 block">Símbolos: <code className="bg-slate-200 dark:bg-zinc-800 px-1 rounded">@</code> (minúsculas), <code className="bg-slate-200 dark:bg-zinc-800 px-1 rounded">,</code> (mayúsculas), <code className="bg-slate-200 dark:bg-zinc-800 px-1 rounded">%</code> (números), <code className="bg-slate-200 dark:bg-zinc-800 px-1 rounded">^</code> (símbolos). Si usas esto, anula min/max y charset simple.</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
              <input 
                type="checkbox" 
                id="pipingCheck" 
                checked={usePiping}
                onChange={(e) => setUsePiping(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-500 text-indigo-600 focus:ring-indigo-500" 
              />
              <label htmlFor="pipingCheck" className="text-xs text-slate-600 dark:text-zinc-300 font-medium cursor-pointer">
                Usar Tubería (Piping) a Aircrack-ng (No guarda archivo)
              </label>
            </div>

            <button
              id="btn_generate_crunch"
              onClick={handleGenerateCrunch}
              className={`w-full py-2.5 px-4 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                crunchGenerated 
                  ? "bg-emerald-50 dark:bg-emerald-950/300 hover:bg-emerald-600" 
                  : "bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-400"
              }`}
            >
              {crunchGenerated ? (
                <>
                  <Check className="h-4 w-4" /> ¡Diccionario Generado!
                </>
              ) : (
                "Generar Diccionario con Crunch"
              )}
            </button>
          </div>
        )}

        {/* Tab Contents: CUPP */}
        {activeTab === "cupp" && (
          <form onSubmit={handleGenerateCupp} className="bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-850 rounded-xl p-5 space-y-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-1">Perfilador de Contraseñas CUPP</h3>
              <p className="text-xs text-slate-600">Introduce datos clave sobre la víctima (Ingeniería Social) para generar contraseñas factibles basadas en su entorno familiar.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Nombre</label>
                <input
                  type="text"
                  value={cuppName}
                  onChange={(e) => setCuppName(e.target.value)}
                  placeholder="Ej. Pedro"
                  className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Apellido</label>
                <input
                  type="text"
                  value={cuppSurname}
                  onChange={(e) => setCuppSurname(e.target.value)}
                  placeholder="Ej. Gomez"
                  className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Apodo / Nickname</label>
                <input
                  type="text"
                  value={cuppNickname}
                  onChange={(e) => setCuppNickname(e.target.value)}
                  placeholder="Ej. Pepito"
                  className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Año de Nacimiento</label>
                <input
                  type="text"
                  value={cuppBirthYear}
                  onChange={(e) => setCuppBirthYear(e.target.value.replace(/\D/g, ""))}
                  placeholder="Ej. 1995"
                  maxLength={4}
                  className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Mascota (Nombre)</label>
                <input
                  type="text"
                  value={cuppPet}
                  onChange={(e) => setCuppPet(e.target.value)}
                  placeholder="Ej. Firulais"
                  className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Ciudad natal</label>
                <input
                  type="text"
                  value={cuppCity}
                  onChange={(e) => setCuppCity(e.target.value)}
                  placeholder="Ej. Lima"
                  className="w-full text-xs px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn_generate_cupp"
              className={`w-full py-2.5 px-4 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                cuppGenerated 
                  ? "bg-emerald-50 dark:bg-emerald-950/300 hover:bg-emerald-600" 
                  : "bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-400"
              }`}
            >
              {cuppGenerated ? (
                <>
                  <Check className="h-4 w-4" /> ¡Wordlist Generado!
                </>
              ) : (
                "Generar Wordlist con CUPP"
              )}
            </button>

            <p className="text-[10px] text-slate-600 dark:text-zinc-500 leading-tight mt-3">
              <strong className="text-slate-700 dark:text-zinc-400">Nota:</strong> CUPP inyecta inteligentemente el año actual, anterior y sufijos comunes (como 123 o !) a los datos base que ingresaste. Por motivos de rendimiento del simulador, sólo se muestran las primeras 100 combinaciones generadas (es normal si algunos datos ingresados no se ven en la muestra inicial).
            </p>
          </form>
        )}
      </div>

      {/* Output Panel / Simulator */}
      <div className="lg:col-span-6 relative min-h-[400px]">
        <div className="lg:absolute lg:inset-0 w-full h-full bg-slate-950 dark:bg-black border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 dark:bg-zinc-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              <span className="font-mono text-xs text-slate-300 font-semibold">
                {activeTab === "crunch" ? "crunch_output.txt" : "gomez_pedro.txt"}
              </span>
            </div>
            {(crunchOutput.length > 0 || cuppOutput.length > 0) && (
              <button
                onClick={() => copyToClipboard(activeTab === "crunch" ? crunchOutput : cuppOutput)}
                className="flex flex-wrap items-center gap-1 px-2.5 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold cursor-pointer transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Download className="h-3 w-3" />}
                {copied ? "¡Copiado!" : "Copiar todo"}
              </button>
            )}
          </div>

          {/* Terminal / Code Content */}
          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {activeTab === "crunch" ? (
              crunchOutput.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-700 dark:text-zinc-600 italic py-16">
                  <Terminal className="h-8 w-8 mb-2 text-slate-700 stroke-1" />
                  Configura los parámetros de Crunch y presiona el botón para compilar la simulación combinatoria.
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-slate-700 select-none pb-2 border-b border-slate-900 mb-2">
                    # Comando de Kali Linux simulado:<br />
                    <span className="text-sky-400 font-bold">{crunchCommandRun}</span><br />
                    # Cantidad generada: {crunchOutput.length} líneas.<br />
                    # Archivo de salida de ejemplo:
                  </div>
                  {crunchOutput.map((val, i) => (
                    <div key={i} className="text-emerald-400/90 leading-none py-0.5">{val}</div>
                  ))}
                  {crunchOutput.length >= 60 && (
                    <div className="text-slate-700 pt-2 border-t border-slate-900 italic text-[10px]">
                      [... Truncado en 60 registros por motivos didácticos de velocidad de visualización ...]
                    </div>
                  )}
                </div>
              )
            ) : (
              cuppOutput.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-700 dark:text-zinc-600 italic py-16">
                  <Terminal className="h-8 w-8 mb-2 text-slate-700 stroke-1" />
                  Ingresa los metadatos de tu objetivo de ingeniería social para simular el generador inteligente de CUPP.
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-slate-700 select-none pb-2 border-b border-slate-900 mb-2">
                    # Comando ejecutado: <span className="text-sky-400 font-bold">python3 cupp.py -i</span><br />
                    # Perfilado interactivo completado para: {cuppName} {cuppSurname}.<br />
                    # Total contraseñas deducidas: {cuppOutput.length} variantes.<br />
                    # Candidatas con mayor tasa de éxito:
                  </div>
                  {cuppOutput.map((val, i) => (
                    <div key={i} className="text-emerald-400/90 leading-none py-0.5">{val}</div>
                  ))}
                  {cuppOutput.length >= 100 && (
                    <div className="text-slate-700 pt-2 border-t border-slate-900 italic text-[10px]">
                      [... Lista completa guardada con éxito en el directorio de Kali ...]
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
