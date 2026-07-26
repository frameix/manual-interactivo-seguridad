import React, { useState } from "react";
import { Key, Unlock, Lock, Shield, RefreshCw, Box, Package, User, VenetianMask, LockOpen, Server, AlertTriangle } from "lucide-react";

export default function CryptoSimulator() {
  const [cryptoMode, setCryptoMode] = useState<"symmetric" | "asymmetric">("symmetric");

  // Symmetric State
  const [symMsg, setSymMsg] = useState("Hola Mundo Criptográfico");
  const [symKey, setSymKey] = useState("LLAVE_SECRETA_AULA");
  const [symEncrypted, setSymEncrypted] = useState("");
  const [symDecrypted, setSymDecrypted] = useState("");
  const [symDecKey, setSymDecKey] = useState("");

  // Asymmetric State
  const [asymMsg, setAsymMsg] = useState("Mensaje para el Servidor");
  const [asymEncrypted, setAsymEncrypted] = useState("");
  const [asymDecrypted, setAsymDecrypted] = useState("");

  // Simulated keys
  const rsaKeys = {
    public: "RSA_PUB_KEY_ALICIA_2048:e=65537...",
    private: "RSA_PRIV_KEY_ALICIA_2048:d=0x1E53..."
  };

  const handleSymmetricEncrypt = () => {
    if (!symMsg || !symKey) return;
    const textBytes = new TextEncoder().encode(symMsg + ":::" + symKey);
    let binary = "";
    textBytes.forEach((b) => binary += String.fromCharCode(b));
    setSymEncrypted(btoa(binary).substring(0, 32) + "==");
    setSymDecrypted("");
  };

  const handleSymmetricDecrypt = () => {
    if (!symEncrypted) return;
    if (symDecKey === symKey) {
      setSymDecrypted(symMsg);
    } else {
      setSymDecrypted("Ķ  [ERROR: LLAVE COMPARTIDA ERRÓNEA]");
    }
  };

  const handleAsymmetricEncrypt = () => {
    if (!asymMsg) return;
    const base64 = btoa(asymMsg + ":::RSA_PUB");
    setAsymEncrypted("CIPHER_RSA_" + base64.substring(0, 24) + "...");
    setAsymDecrypted("");
  };

  const handleAsymmetricDecrypt = () => {
    if (!asymEncrypted) return;
    setAsymDecrypted(asymMsg);
  };

  const resetSymmetric = () => {
    setSymMsg("Hola Mundo Criptográfico");
    setSymKey("LLAVE_SECRETA_AULA");
    setSymEncrypted("");
    setSymDecrypted("");
    setSymDecKey("");
  };

  const resetAsymmetric = () => {
    setAsymMsg("Mensaje para el Servidor");
    setAsymEncrypted("");
    setAsymDecrypted("");
  };

  const getSymStep = () => {
    if (symDecrypted) return 3;
    if (symEncrypted) return 2;
    return 1;
  };

  const getAsymStep = () => {
    if (asymDecrypted) return 3;
    if (asymEncrypted) return 2;
    return 1;
  };

  return (
    <div className="space-y-6">
      {/* HEADER: Mode selectors and Reset Button */}
      <div className="flex flex-wrap justify-between items-center bg-slate-100 dark:bg-zinc-900 p-2 rounded-xl border border-slate-400 dark:border-zinc-800 w-full">
        <div className="flex flex-wrap gap-1.5 flex-1 max-w-md">
          <button
            onClick={() => setCryptoMode("symmetric")}
            className={`py-2 px-3 flex-1 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 ${cryptoMode === "symmetric" ? "bg-white dark:bg-zinc-800 text-slate-950 dark:text-zinc-100 shadow-sm border border-slate-400 dark:border-zinc-700" : "text-slate-700 hover:text-slate-700 dark:hover:text-zinc-300 border border-transparent"}`}
          >
            <Key className="h-4 w-4 text-indigo-500" /> Cifrado Simétrico (AES)
          </button>
          <button
            onClick={() => setCryptoMode("asymmetric")}
            className={`py-2 px-3 flex-1 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 ${cryptoMode === "asymmetric" ? "bg-white dark:bg-zinc-800 text-slate-950 dark:text-zinc-100 shadow-sm border border-slate-400 dark:border-zinc-700" : "text-slate-700 hover:text-slate-700 dark:hover:text-zinc-300 border border-transparent"}`}
          >
            <Lock className="h-4 w-4 text-indigo-500" /> Cifrado Asimétrico (RSA)
          </button>
        </div>
        <button
          onClick={cryptoMode === "symmetric" ? resetSymmetric : resetAsymmetric}
          className="ml-4 py-2 px-4 bg-slate-800 hover:bg-slate-700 dark:bg-indigo-600 dark:hover:bg-indigo-50 dark:bg-indigo-950/300 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm flex flex-wrap items-center gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reiniciar Simulación
        </button>
      </div>

      {cryptoMode === "symmetric" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT: STORYBOARD SIMETRICO */}
          <div className="xl:col-span-5 bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-850 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100 flex flex-wrap items-center gap-2">
                <Package className="w-5 h-5 text-indigo-500" /> Analogía: El Cofre y la Llave
              </h3>
              <p className="text-xs text-slate-700 mt-1">Bob y Alicia tienen una copia idéntica de la misma llave amarilla.</p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Step 1 */}
              <div className={`p-3 rounded-xl border-2 transition-all flex items-center gap-4 ${getSymStep() === 1 ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-400 dark:border-zinc-800 opacity-60'}`}>
                <div className="flex justify-center shrink-0 w-16 relative">
                  <User className="w-10 h-10 text-blue-500" />
                  <Key className="w-5 h-5 text-yellow-500 absolute -right-2 top-0" />
                  <Box className="w-6 h-6 text-slate-600 absolute -bottom-1 -right-2" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">1</span>
                    <h4 className="font-bold text-slate-700 dark:text-zinc-200 text-xs">Bob (Emisor)</h4>
                  </div>
                  <p className="text-[11px] leading-tight text-slate-600 dark:text-zinc-400">Bob guarda el mensaje en el cofre y lo cierra con su <span className="font-bold text-yellow-600 dark:text-yellow-500">Llave Amarilla</span>.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`p-3 rounded-xl border-2 transition-all flex items-center gap-4 ${getSymStep() === 2 ? 'border-red-400 bg-red-50/50 dark:bg-red-900/10' : 'border-slate-400 dark:border-zinc-800 opacity-60'}`}>
                <div className="flex justify-center shrink-0 w-16 relative">
                  <VenetianMask className="w-10 h-10 text-red-500" />
                  <Lock className="w-5 h-5 text-slate-600 dark:text-slate-600 absolute -right-2 top-0" />
                  <Package className="w-6 h-6 text-slate-700 dark:text-slate-300 absolute -bottom-1 -right-2" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 text-[10px] font-bold">2</span>
                    <h4 className="font-bold text-slate-700 dark:text-zinc-200 text-xs">Red (Hacker)</h4>
                  </div>
                  <p className="text-[11px] leading-tight text-slate-600 dark:text-zinc-400">El cofre viaja cerrado. Eve lo intercepta, pero sin la llave amarilla, no puede abrirlo.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`p-3 rounded-xl border-2 transition-all flex items-center gap-4 ${getSymStep() === 3 ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-400 dark:border-zinc-800 opacity-60'}`}>
                <div className="flex justify-center shrink-0 w-16 relative">
                  <User className="w-10 h-10 text-emerald-500" />
                  <Key className="w-5 h-5 text-yellow-500 absolute -right-2 top-0" />
                  <Unlock className="w-6 h-6 text-emerald-600 absolute -bottom-1 -right-2" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">3</span>
                    <h4 className="font-bold text-slate-700 dark:text-zinc-200 text-xs">Alicia (Receptor)</h4>
                  </div>
                  <p className="text-[11px] leading-tight text-slate-600 dark:text-zinc-400">Alicia recibe el cofre y usa su copia exacta de la <span className="font-bold text-yellow-600 dark:text-yellow-500">Llave Amarilla</span> para abrirlo.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-400 dark:border-amber-900/50 rounded-lg flex flex-wrap items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-snug text-amber-800 dark:text-amber-400 font-medium">
                <strong>Debilidad:</strong> ¿Cómo le mandó Bob la llave amarilla a Alicia la primera vez sin que Eve la interceptara? Este es el fallo de distribución de llaves.
              </p>
            </div>
          </div>

          {/* RIGHT: LABORATORIO TECNICO SIMETRICO */}
          <div className="xl:col-span-7 bg-slate-50 dark:bg-zinc-900 border border-slate-400 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-center">
            <h3 className="text-sm font-black text-slate-700 dark:text-zinc-300 mb-6 flex flex-wrap items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" /> Implementación Técnica Real (AES)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Encrypt Side */}
              <div className="space-y-4 border-r-0 md:border-r border-slate-400 dark:border-zinc-800 md:pr-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">1. Mensaje en Claro (Cofre Abierto)</label>
                  <input type="text" value={symMsg} onChange={(e) => setSymMsg(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-500 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">2. Llave Compartida</label>
                  <input type="text" value={symKey} onChange={(e) => setSymKey(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-500 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 font-mono text-indigo-600 dark:text-indigo-400" />
                </div>
                <button onClick={handleSymmetricEncrypt} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer">
                  Cifrar Mensaje
                </button>

                <div className={`transition-opacity ${!symEncrypted ? 'opacity-0' : 'opacity-100'}`}>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Cofre Cifrado en la Red</label>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-emerald-400 break-all">{symEncrypted || "-"}</div>
                </div>
              </div>

              {/* Decrypt Side */}
              <div className={`space-y-4 transition-opacity ${!symEncrypted ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">3. Recibir Cofre Cifrado</label>
                  <div className="w-full text-xs px-3 py-2 border border-slate-500 dark:border-zinc-700 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-700 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                    {symEncrypted || "Esperando paquete..."}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">4. Probar una Llave</label>
                  <input type="text" value={symDecKey} onChange={(e) => setSymDecKey(e.target.value)} placeholder="Ej. LLAVE_SECRETA_AULA" className="w-full text-xs px-3 py-2 border border-slate-500 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 font-mono" />
                </div>
                <button onClick={handleSymmetricDecrypt} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer">
                  Intentar Abrir Cofre
                </button>

                <div className={`transition-opacity ${!symDecrypted ? 'opacity-0' : 'opacity-100'}`}>
                  <label className="block text-[10px] font-bold mb-1 uppercase opacity-70">Resultado</label>
                  <div className={`p-2 rounded-lg border text-xs font-bold ${symDecrypted.includes("ERROR") ? "bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-800 text-red-600 dark:text-red-400" : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"}`}>
                    {symDecrypted || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {cryptoMode === "asymmetric" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT: STORYBOARD ASIMETRICO */}
          <div className="xl:col-span-5 bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-850 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100 flex flex-wrap items-center gap-2">
                <LockOpen className="w-5 h-5 text-indigo-500" /> Analogía: El Candado Abierto
              </h3>
              <p className="text-xs text-slate-700 mt-1">Alicia reparte Candados Abiertos (Llave Pública), pero solo ella tiene la Llave Maestra (Privada).</p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Step 1 */}
              <div className={`p-3 rounded-xl border-2 transition-all flex items-center gap-4 ${getAsymStep() === 1 ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-400 dark:border-zinc-800 opacity-60'}`}>
                <div className="flex justify-center shrink-0 w-16 relative">
                  <User className="w-10 h-10 text-blue-500" />
                  <LockOpen className="w-5 h-5 text-indigo-500 absolute -right-2 top-0" />
                  <Box className="w-6 h-6 text-slate-600 absolute -bottom-1 -right-2" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">1</span>
                    <h4 className="font-bold text-slate-700 dark:text-zinc-200 text-xs">Bob (Emisor)</h4>
                  </div>
                  <p className="text-[11px] leading-tight text-slate-600 dark:text-zinc-400">Bob recibe el <span className="font-bold text-indigo-600 dark:text-indigo-400">Candado Abierto</span> de Alicia. Mete el mensaje y cierra el candado.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`p-3 rounded-xl border-2 transition-all flex items-center gap-4 ${getAsymStep() === 2 ? 'border-red-400 bg-red-50/50 dark:bg-red-900/10' : 'border-slate-400 dark:border-zinc-800 opacity-60'}`}>
                <div className="flex justify-center shrink-0 w-16 relative">
                  <VenetianMask className="w-10 h-10 text-red-500" />
                  <Lock className="w-5 h-5 text-indigo-600 absolute -right-2 top-0" />
                  <Package className="w-6 h-6 text-slate-700 dark:text-slate-300 absolute -bottom-1 -right-2" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 text-[10px] font-bold">2</span>
                    <h4 className="font-bold text-slate-700 dark:text-zinc-200 text-xs">Red (Hacker)</h4>
                  </div>
                  <p className="text-[11px] leading-tight text-slate-600 dark:text-zinc-400">La caja viaja cerrada. <strong className="text-red-500">Ni siquiera Bob</strong> puede abrirla ya. Eve tampoco.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`p-3 rounded-xl border-2 transition-all flex items-center gap-4 ${getAsymStep() === 3 ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-400 dark:border-zinc-800 opacity-60'}`}>
                <div className="flex justify-center shrink-0 w-16 relative">
                  <User className="w-10 h-10 text-emerald-500" />
                  <Key className="w-5 h-5 text-red-500 absolute -right-2 top-0" />
                  <Unlock className="w-6 h-6 text-indigo-600 absolute -bottom-1 -right-2" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">3</span>
                    <h4 className="font-bold text-slate-700 dark:text-zinc-200 text-xs">Alicia (Receptor)</h4>
                  </div>
                  <p className="text-[11px] leading-tight text-slate-600 dark:text-zinc-400">Alicia usa su <span className="font-bold text-red-600 dark:text-red-500">Llave Privada</span> (que jamás viajó) para abrir su candado y leer.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-400 dark:border-indigo-900/50 rounded-lg flex flex-wrap items-start gap-2">
              <Shield className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-snug text-indigo-800 dark:text-indigo-400 font-medium">
                <strong>Fortaleza Principal:</strong> Resuelve el problema de distribución. Alicia puede repartir Candados Abiertos públicamente sin riesgo. Sin embargo, este cálculo matemático es muy lento.
              </p>
            </div>
          </div>

          {/* RIGHT: LABORATORIO TECNICO ASIMETRICO */}
          <div className="xl:col-span-7 bg-slate-50 dark:bg-zinc-900 border border-slate-400 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-center">
            <h3 className="text-sm font-black text-slate-700 dark:text-zinc-300 mb-4 flex flex-wrap items-center gap-2">
              <Server className="w-4 h-4 text-indigo-500" /> Implementación Técnica Real (RSA)
            </h3>
            
            <div className="mb-6 p-3 border border-slate-400 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950">
              <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Infraestructura de Llaves de Alicia</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded border border-indigo-400 dark:border-indigo-900 text-[9px] font-mono text-indigo-700 dark:text-indigo-300 break-all leading-tight">
                  <strong>LLAVE PÚBLICA (El Candado Abierto):</strong><br/>
                  {rsaKeys.public}
                </div>
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-400 dark:border-red-900 text-[9px] font-mono text-red-700 dark:text-red-300 break-all leading-tight">
                  <strong>LLAVE PRIVADA (La Llave Maestra):</strong><br/>
                  {rsaKeys.private}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Encrypt Side */}
              <div className="space-y-4 border-r-0 md:border-r border-slate-400 dark:border-zinc-800 md:pr-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">1. Mensaje de Bob a Alicia</label>
                  <input type="text" value={asymMsg} onChange={(e) => setAsymMsg(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-500 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-100" />
                </div>
                
                <button onClick={handleAsymmetricEncrypt} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer">
                  Cifrar con Llave PÚBLICA de Alicia
                </button>

                <div className={`transition-opacity ${!asymEncrypted ? 'opacity-0' : 'opacity-100'}`}>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Caja Cerrada en la Red</label>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-indigo-400 break-all">{asymEncrypted || "-"}</div>
                </div>
              </div>

              {/* Decrypt Side */}
              <div className={`space-y-4 transition-opacity ${!asymEncrypted ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">2. Alicia recibe el mensaje cifrado</label>
                  <div className="w-full text-xs px-3 py-2 border border-slate-500 dark:border-zinc-700 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-700 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                    {asymEncrypted || "Esperando paquete..."}
                  </div>
                </div>
                
                <button onClick={handleAsymmetricDecrypt} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer">
                  Descifrar con Llave PRIVADA de Alicia
                </button>

                <div className={`transition-opacity ${!asymDecrypted ? 'opacity-0' : 'opacity-100'}`}>
                  <label className="block text-[10px] font-bold mb-1 uppercase opacity-70">Mensaje Extraído</label>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-400 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {asymDecrypted || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
