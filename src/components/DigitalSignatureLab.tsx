import React, { useState, useEffect, useRef } from "react";
import { FileText, Check, AlertTriangle, Key, ShieldCheck, RefreshCw, Layers, Lock, Unlock, FileSignature, FileSearch, Eye, EyeOff, UploadCloud, Download, Wrench, ToggleLeft, ToggleRight, Loader2, ChevronRight } from "lucide-react";
import { db } from '../config/firebase';
import { ref, onValue, set } from 'firebase/database';
import { createDemoAndSign, signExistingPdf } from '../utils/pdfSigner';

interface SignedDocument {
  title: string;
  content: string;
  signerName: string;
  hash: string;
  signature: string;
}

export default function DigitalSignatureLab({ isTeacher, isGuest }: { isTeacher?: boolean; isGuest?: boolean }) {
  // Existing states...
  const [docTitle, setDocTitle] = useState("Informe_Seguridad_Financiera.pdf");
  const [docContent, setDocContent] = useState("Este documento certifica que los servidores de contabilidad de la facultad han sido auditados contra exploits Nmap y se encuentran libres de inyecciones SQL hasta la fecha de hoy.");
  const [signer, setSigner] = useState("Ing. Pedro Gomez");
  const [passphrase, setPassphrase] = useState("clave_docente_2026");
  const [showPassphrase, setShowPassphrase] = useState(false);
  
  const [signedDoc, setSignedDoc] = useState<SignedDocument | null>(null);

  const [verifyTitle, setVerifyTitle] = useState("");
  const [verifyContent, setVerifyContent] = useState("");
  const [verifySignature, setVerifySignature] = useState("");
  const [verifyResult, setVerifyResult] = useState<{ isValid: boolean; originalHash: string; currentHash: string; message: string } | null>(null);

  // --- NEW STATES FOR TEACHER PANEL ---
  const [isPublic, setIsPublic] = useState(false);
  const [isSigningDemo, setIsSigningDemo] = useState(false);
  const [isSigningUpload, setIsSigningUpload] = useState(false);
  
  const [realSignerName, setRealSignerName] = useState("Ing. Carlos Ruiz");
  const [realLocation, setRealLocation] = useState("Tarapoto, Perú");
  const [realReason, setRealReason] = useState("Aprobación de Documento");
  const [realDemoTitle, setRealDemoTitle] = useState("Auditoría_Infraestructura_2026.pdf");
  const [realDemoContent, setRealDemoContent] = useState("INFORME DE CIBERSEGURIDAD:\n\nSe ha completado la auditoría perimetral de la infraestructura de red. Los escaneos con Nmap revelaron que los puertos de la base de datos interna se encuentran correctamente protegidos por el firewall. Además, las pruebas de inyección SQL en el portal de alumnos fueron mitigadas con éxito por el WAF (Web Application Firewall). El nivel de riesgo actual es BAJO. Este reporte ha sido sellado y firmado criptográficamente para garantizar su inmutabilidad.");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stampPosition, setStampPosition] = useState<'top' | 'bottom'>('top');
  const [activeTab, setActiveTab] = useState<'simulator' | 'tool' | 'onpe'>('simulator');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const visibilityRef = ref(db, 'config/signatureLabPublic');
    const unsubscribe = onValue(visibilityRef, (snapshot) => {
      setIsPublic(snapshot.val() || false);
    });
    return () => unsubscribe();
  }, []);

  const togglePublic = async () => {
    if (!isTeacher) return;
    await set(ref(db, 'config/signatureLabPublic'), !isPublic);
  };

  // Simplified custom hash simulator (SHA-256 mock)
  const calculateSimulatedHash = (text: string) => {
    const dataToHash = text;
    let hash = 0;
    for (let i = 0; i < dataToHash.length; i++) {
      const char = dataToHash.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const hex = Math.abs(hash).toString(16).toUpperCase();
    return "SHA256-" + hex.padStart(8, "0") + "E9F4754FE86";
  };

  const handleSignDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docContent || !signer) return;

    const hashVal = calculateSimulatedHash(docContent);
    const signVal = "SIG_RSA_2048_" + btoa(hashVal + ":::" + signer).substring(0, 48);

    setSignedDoc({
      title: docTitle,
      content: docContent,
      signerName: signer,
      hash: hashVal,
      signature: signVal
    });

    setVerifyTitle(docTitle);
    setVerifyContent(docContent);
    setVerifySignature(signVal);
    setVerifyResult(null);
  };

  const handleVerifySignature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signedDoc || !verifyContent || !verifyTitle) return;

    const currentCalculatedHash = calculateSimulatedHash(verifyContent);
    const expectedHash = signedDoc.hash;

    if (currentCalculatedHash === expectedHash && verifySignature === signedDoc.signature) {
      setVerifyResult({
        isValid: true,
        originalHash: expectedHash,
        currentHash: currentCalculatedHash,
        message: "La integridad está intacta y la firma pertenece legalmente a " + signedDoc.signerName + "."
      });
    } else {
      setVerifyResult({
        isValid: false,
        originalHash: expectedHash,
        currentHash: currentCalculatedHash,
        message: "El archivo ha sido modificado o la firma ha sido falsificada."
      });
    }
  };

  const handleTamper = () => {
    setVerifyContent(verifyContent + " (MODIFICADO)");
    setVerifyResult(null);
  };

  const handleReset = () => {
    setDocTitle("Informe_Seguridad_Financiera.pdf");
    setDocContent("Este documento certifica que los servidores de contabilidad de la facultad han sido auditados contra exploits Nmap y se encuentran libres de inyecciones SQL hasta la fecha de hoy.");
    setSigner("Ing. Pedro Gomez");
    setPassphrase("clave_docente_2026");
    setShowPassphrase(false);
    setSignedDoc(null);
    setVerifyTitle("");
    setVerifyContent("");
    setVerifySignature("");
    setVerifyResult(null);
  };

  // --- TEACHER PDF FUNCTIONS ---
  const downloadBytes = (bytes: Uint8Array, fileName: string) => {
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateDemoPDF = async () => {
    setIsSigningDemo(true);
    try {
      const signedBytes = await createDemoAndSign(realDemoTitle, realDemoContent, realSignerName, realLocation, realReason);
      downloadBytes(signedBytes, realDemoTitle || "Demo_Firmado.pdf");
    } catch (e: any) {
      console.error(e);
      alert("Error al firmar: " + (e?.message || e?.toString() || JSON.stringify(e)));
    } finally {
      setIsSigningDemo(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleSignUploadedFile = async () => {
    if (!selectedFile) return;
    setIsSigningUpload(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const signedBytes = await signExistingPdf(arrayBuffer, realSignerName, realLocation, realReason, stampPosition);
      downloadBytes(signedBytes, `Firmado_${selectedFile.name}`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      alert("Error al firmar el archivo PDF subido.");
    } finally {
      setIsSigningUpload(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* TABS NAVIGATION & ACTIONS */}
      {(isTeacher || isGuest || isPublic) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full p-2 bg-white dark:bg-zinc-900/50 border border-slate-400 dark:border-zinc-800/80 rounded-xl shadow-sm gap-2 overflow-hidden">
          <div className="relative w-full sm:w-auto overflow-hidden">
            <div 
              className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none no-scrollbar pb-1 sm:pb-0 w-full pr-12"
              style={{ maskImage: 'linear-gradient(to right, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent 100%)' }}
            >
              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs font-bold transition-all shrink-0 ${
                  activeTab === 'simulator'
                    ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-700 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-zinc-50 dark:bg-zinc-950/30'
                }`}
              >
                <FileSignature className="h-4 w-4" /> Simulador Interactivo
              </button>
              <button
                onClick={() => setActiveTab('tool')}
                className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs font-bold transition-all shrink-0 ${
                  activeTab === 'tool'
                    ? 'bg-amber-50 dark:bg-zinc-800 text-amber-600 dark:text-amber-500'
                    : 'text-slate-700 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-zinc-50 dark:bg-zinc-950/30'
                }`}
              >
                <Wrench className="h-4 w-4" /> Firmador Avanzado (PKCS#7)
              </button>
              <button
                onClick={() => setActiveTab('onpe')}
                className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs font-bold transition-all shrink-0 ${
                  activeTab === 'onpe'
                    ? 'bg-orange-50 dark:bg-zinc-800 text-orange-600 dark:text-orange-400'
                    : 'text-slate-700 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-zinc-50 dark:bg-zinc-950/30'
                }`}
              >
                <FileSearch className="h-4 w-4" /> Archivo ONPE
              </button>
            </div>
            {/* Right arrow indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none sm:hidden flex items-center justify-end pr-1">
              <ChevronRight className="w-5 h-5 text-neutral-600 dark:text-white animate-pulse drop-shadow-lg" />
            </div>
          </div>
          
          {activeTab === 'simulator' && (
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4" /> Reiniciar Simulación
            </button>
          )}
        </div>
      )}

      {/* SECTION 1: Standard Simulator */}
      {activeTab === 'simulator' && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
            {/* LEFT COLUMN: SIGNATURE GENERATOR */}
            <div className="bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-850 rounded-xl p-4 shadow-sm flex flex-col h-full">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <FileSignature className="h-4 w-4 text-indigo-500" />
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-zinc-100">1. Generador de Firmas Digitales</h3>
              <p className="text-[10px] text-slate-700">El Emisor cifra el HASH del documento con su Llave Privada.</p>
            </div>
          </div>

          <form onSubmit={handleSignDocument} className="space-y-3 flex-1">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Nombre del Archivo (Metadato)</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full text-[11px] px-2.5 py-1.5 border border-slate-500 dark:border-zinc-700 rounded-md bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Contenido Original del Documento</label>
              <textarea
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                className="w-full text-[11px] px-2.5 py-1.5 border border-slate-500 dark:border-zinc-700 rounded-md bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 h-16 resize-none leading-snug transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Nombre del Firmante</label>
                <input
                  type="text"
                  value={signer}
                  onChange={(e) => setSigner(e.target.value)}
                  className="w-full text-[11px] px-2.5 py-1.5 border border-slate-500 dark:border-zinc-700 rounded-md bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Llave Privada (Passphrase)</label>
                <div className="relative">
                  <input
                    type={showPassphrase ? "text" : "password"}
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="w-full text-[11px] px-2.5 py-1.5 pr-8 border border-slate-500 dark:border-zinc-700 rounded-md bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors font-mono tracking-widest"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
                  >
                    {showPassphrase ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                id="btn_sign_doc"
                className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-bold cursor-pointer shadow-sm transition-colors"
              >
                Generar Firma Digital (Firmar Documento)
              </button>
            </div>
          </form>

          {/* OUTPUT BOX */}
          <div className="mt-4 pt-4 border-t border-slate-400 dark:border-zinc-800">
            {!signedDoc ? (
              <div className="h-20 border border-dashed border-slate-500 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900/50 rounded-lg flex flex-col items-center justify-center text-center p-3 text-slate-600 dark:text-zinc-500">
                <span className="text-[10px] font-medium">El documento aún no ha sido firmado.</span>
              </div>
            ) : (
              <div className="h-20 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-400 dark:border-emerald-800/50 rounded-lg p-3 flex flex-col justify-center relative overflow-hidden transition-all duration-500 animate-in fade-in zoom-in-95">
                <div className="flex flex-wrap items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] mb-1.5">
                  <ShieldCheck className="h-4 w-4" /> Documento Firmado y Sellado
                </div>
                <div className="grid grid-cols-1 gap-0.5 text-[9px] font-mono leading-tight">
                  <div className="text-slate-600 dark:text-slate-600 flex items-center justify-between">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate pr-2" title={signedDoc.title}>{signedDoc.title}</span> 
                    <span>{signedDoc.hash}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-600 flex items-center justify-between">
                    <span className="text-amber-600 dark:text-amber-500 font-bold">FIRMA (RSA):</span> 
                    <span className="truncate ml-2">{signedDoc.signature}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SIGNATURE VERIFIER */}
        <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-400 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col h-full relative">
          
          {/* Overlay to block access until signed */}
          {!signedDoc && (
            <div className="absolute inset-0 z-10 bg-slate-50/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-500 dark:border-zinc-700">
              <FileSearch className="h-8 w-8 text-slate-600 dark:text-zinc-600 mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">Esperando Documento</p>
              <p className="text-[10px] text-slate-700 dark:text-zinc-500 mt-1 max-w-[200px]">Firma el documento a la izquierda para cargarlo aquí.</p>
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <FileSearch className="h-4 w-4 text-emerald-500" />
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-zinc-100">2. Validador de Integridad</h3>
              <p className="text-[10px] text-slate-700 mt-0.5">Compara el HASH actual (Título + Contenido) con la firma.</p>
            </div>
          </div>

          <form onSubmit={handleVerifySignature} className="space-y-3 flex-1">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Nombre del Archivo Recibido</label>
              <input
                type="text"
                value={verifyTitle}
                readOnly
                className="w-full text-[11px] px-2.5 py-1.5 border border-slate-400 dark:border-zinc-800 rounded-md bg-slate-100 dark:bg-zinc-900/50 text-slate-700 dark:text-zinc-500 cursor-not-allowed transition-colors"
                title="El nombre del archivo es un metadato del sistema operativo, no altera la integridad criptográfica interna."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-0.5">
                <label className="block text-[10px] font-bold text-slate-700">Texto Recibido (Por la Red)</label>
                <button
                  type="button"
                  onClick={handleTamper}
                  className="text-[9px] font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 cursor-pointer flex flex-wrap items-center gap-1 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded border border-red-400 dark:border-red-900/50 transition-colors"
                  disabled={!signedDoc}
                >
                  <AlertTriangle className="h-2.5 w-2.5" /> Hackear Contenido
                </button>
              </div>
              <textarea
                value={verifyContent}
                onChange={(e) => {
                  setVerifyContent(e.target.value);
                  setVerifyResult(null);
                }}
                className="w-full text-[11px] px-2.5 py-1.5 border border-slate-500 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 h-16 resize-none leading-snug font-mono transition-colors"
                required
                disabled={!signedDoc}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Firma Digital Adjunta (Hex RSA)</label>
              <input
                type="text"
                value={verifySignature}
                onChange={(e) => {
                  setVerifySignature(e.target.value);
                  setVerifyResult(null);
                }}
                className="w-full text-[11px] px-2.5 py-1.5 border border-slate-500 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                required
                disabled={!signedDoc}
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                id="btn_verify_signature"
                className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold cursor-pointer shadow-sm transition-colors"
                disabled={!signedDoc}
              >
                Ejecutar Verificación (Descifrar Firma)
              </button>
            </div>
          </form>

          {/* OUTPUT BOX */}
          <div className="mt-4 pt-4 border-t border-slate-400 dark:border-zinc-800">
            {!verifyResult ? (
               <div className="h-20 border border-dashed border-slate-500 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800/50 rounded-lg flex flex-col items-center justify-center text-center p-3 text-slate-600 dark:text-zinc-500">
                 <span className="text-[10px] font-medium">Ejecuta la validación para ver el resultado.</span>
               </div>
            ) : (
              <div className={`h-20 rounded-lg p-3 flex flex-col justify-center border transition-all duration-500 animate-in fade-in zoom-in-95 ${verifyResult.isValid ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-400 dark:border-emerald-800/50" : "bg-red-50 dark:bg-red-900/10 border-red-400 dark:border-red-800/50"}`}>
                <div className={`flex items-center gap-1.5 font-bold text-[11px] mb-1 ${verifyResult.isValid ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                  {verifyResult.isValid ? <ShieldCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  {verifyResult.isValid ? "FIRMA VÁLIDA" : "FIRMA INVÁLIDA (ALTERADO)"}
                </div>
                <p className={`text-[9px] leading-tight font-medium mb-1.5 ${verifyResult.isValid ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"}`}>
                  {verifyResult.message}
                </p>
                <div className="grid grid-cols-1 gap-0.5 text-[8.5px] font-mono leading-none">
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-bold">HASH FIRMADO:</span> 
                    <span className="text-slate-700 dark:text-slate-300">{verifyResult.originalHash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-bold">HASH TEXTO ACTUAL:</span> 
                    <span className={verifyResult.originalHash === verifyResult.currentHash ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-red-600 dark:text-red-400 font-bold"}>{verifyResult.currentHash}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>


      </>
      )}

      {/* SECTION 3: ONPE TSL CACHE DOWNLOAD TAB */}
      {activeTab === 'onpe' && (
        <div className="bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-850 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-full">
              <FileSearch className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100">Archivo TSL para Firma ONPE</h3>
              <p className="text-xs text-slate-700 mt-1">Descarga el caché necesario para validar certificados de prueba locales.</p>
            </div>
          </div>
          <div className="w-full space-y-5 text-left">
            <p className="text-xs text-slate-600 dark:text-slate-600 leading-relaxed">
              Para que el software <strong>Firma ONPE</strong> reconozca las firmas generadas con certificados locales (como los creados con <code>SELFCERT.EXE</code> de Office), necesitas colocar este archivo TSL en la carpeta caché del programa en tu sistema.
            </p>
            <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-400 dark:border-orange-900/30">
              <h4 className="text-xs font-bold text-orange-700 dark:text-orange-400 mb-2 flex flex-wrap items-center gap-2">
                <Check className="h-3.5 w-3.5" /> Ruta de Instalación:
              </h4>
              <code className="text-[11px] bg-white dark:bg-zinc-900 px-3 py-2 rounded-md block text-slate-700 dark:text-slate-300 border border-slate-400 dark:border-zinc-800 font-mono select-all break-all">
                C:\Users\(TU_USUARIO)\.firmaONPE\cache
              </code>
            </div>
            <div className="pt-2">
              <a
                href="/iofe.indecopi.gob.pe_TSL_tsl-pe.xml"
                download
                className="w-full py-3 bg-orange-50 dark:bg-orange-950/300 hover:bg-orange-600 text-white rounded-lg text-xs font-bold flex flex-wrap items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              >
                <Download className="h-5 w-5" />
                Descargar archivo TSL (XML)
              </a>
              <p className="text-[10px] text-center text-slate-600 mt-3 font-medium">
                Una vez pegado el archivo, abre tu PDF firmado en el software Firma ONPE y haz clic en <strong>Verificar</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Teacher PDF Signer Tool */}
      {activeTab === 'tool' && (
        <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-400 dark:border-amber-900/50 rounded-2xl p-6 shadow-sm overflow-hidden relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-black text-amber-900 dark:text-amber-500">Herramienta Avanzada: Firmador Real de Archivos PDF (PKCS#7)</h3>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-500/70">
                  Genera una firma criptográfica inyectada en los metadatos del PDF. Puede ser validada en Adobe Acrobat.
                </p>
              </div>
            </div>
            {isTeacher && (
              <button
                onClick={togglePublic}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                  isPublic 
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-400 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                    : "bg-neutral-100 text-neutral-800 border border-neutral-400 hover:bg-neutral-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                }`}
              >
                {isPublic ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                {isPublic ? "Público para Alumnos" : "Oculto para Alumnos"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-zinc-950 border border-amber-400 dark:border-amber-900/30 rounded-xl p-5">
            {/* Form Settings */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase text-slate-600 dark:text-zinc-500 font-mono tracking-widest border-b border-slate-400 dark:border-zinc-800 pb-2">
                Datos de la Firma Digital
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Nombre del Firmante</label>
                  <input
                    type="text"
                    value={realSignerName}
                    onChange={(e) => setRealSignerName(e.target.value)}
                    maxLength={40}
                    className="w-full text-[11px] px-2.5 py-1.5 border border-slate-500 dark:border-zinc-700 rounded-md bg-slate-50 dark:bg-zinc-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Ubicación</label>
                    <input
                      type="text"
                      value={realLocation}
                      onChange={(e) => setRealLocation(e.target.value)}
                      maxLength={40}
                      className="w-full text-[11px] px-2.5 py-1.5 border border-slate-500 dark:border-zinc-700 rounded-md bg-slate-50 dark:bg-zinc-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Razón de Firma</label>
                    <input
                      type="text"
                      value={realReason}
                      onChange={(e) => setRealReason(e.target.value)}
                      maxLength={50}
                      className="w-full text-[11px] px-2.5 py-1.5 border border-slate-500 dark:border-zinc-700 rounded-md bg-slate-50 dark:bg-zinc-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
               <h4 className="text-[11px] font-bold uppercase text-slate-600 dark:text-zinc-500 font-mono tracking-widest border-b border-slate-400 dark:border-zinc-800 pb-2">
                Operaciones PDF
              </h4>
              <div className="space-y-3">
                {/* Demo PDF Gen */}
                <div className="p-3 bg-slate-50 dark:bg-zinc-900/50 border border-slate-400 dark:border-zinc-800 rounded-lg space-y-2">
                  <p className="text-[10px] text-slate-700 font-bold mb-1">1. Generar PDF Demostrativo (Al Vuelo)</p>
                  <input
                    type="text"
                    value={realDemoTitle}
                    onChange={(e) => setRealDemoTitle(e.target.value)}
                    placeholder="Título del PDF..."
                    maxLength={60}
                    className="w-full text-[11px] px-2 py-1.5 border border-slate-500 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 focus:border-amber-500 focus:outline-none mb-1"
                  />
                  <button
                    onClick={handleGenerateDemoPDF}
                    disabled={isSigningDemo || isSigningUpload}
                    className="w-full py-1.5 bg-amber-50 dark:bg-amber-950/300 hover:bg-amber-600 text-white rounded text-[11px] font-bold flex flex-wrap items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isSigningDemo ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                    Generar y Descargar PDF Demo Firmado
                  </button>
                </div>

                {/* Custom PDF Upload */}
                <div className="p-3 bg-slate-50 dark:bg-zinc-900/50 border border-slate-400 dark:border-zinc-800 rounded-lg space-y-2">
                  <p className="text-[10px] text-slate-700 font-bold mb-1">2. Subir tu propio PDF y Firmarlo</p>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <label className="text-[10px] font-bold text-slate-700">Posición del Sello:</label>
                    <select
                      value={stampPosition}
                      onChange={(e) => setStampPosition(e.target.value as 'top' | 'bottom')}
                      className="text-[11px] px-2 py-1 border border-slate-500 dark:border-zinc-700 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:border-amber-500"
                    >
                      <option value="top">Esquina Superior</option>
                      <option value="bottom">Esquina Inferior</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      accept=".pdf"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      disabled={isSigningDemo || isSigningUpload}
                      className="hidden"
                    />
                    
                    {!selectedFile ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSigningDemo || isSigningUpload}
                        className="w-full py-2 border-2 border-dashed border-amber-500 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 text-amber-700 dark:text-amber-500 rounded text-[11px] font-bold flex flex-wrap items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <UploadCloud className="h-4 w-4" />
                        Seleccionar Archivo PDF
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-800 p-2 rounded">
                          <span className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 truncate max-w-[180px]">
                            {selectedFile.name}
                          </span>
                          <button onClick={() => setSelectedFile(null)} className="text-[10px] text-red-500 hover:underline">Cambiar</button>
                        </div>
                        <button
                          onClick={handleSignUploadedFile}
                          disabled={isSigningDemo || isSigningUpload}
                          className="w-full py-1.5 bg-amber-50 dark:bg-amber-950/300 hover:bg-amber-600 text-white rounded text-[11px] font-bold flex flex-wrap items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          {isSigningUpload ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileSignature className="h-3 w-3" />}
                          Firmar y Descargar Archivo
                        </button>
                      </div>
                    )}
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
