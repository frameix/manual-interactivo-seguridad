import React, { useState } from 'react';
import { X, Terminal, Wrench, Shield, Copy, Check, Download, Info, ArrowRight } from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose, darkMode }) => {
  const [activeTab, setActiveTab] = useState<'system' | 'drivers' | 'virtualbox'>('virtualbox');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const systemCommands = [
    {
      title: "Actualizar lista de repositorios",
      command: "sudo apt update",
      desc: "Descarga la lista más reciente de software disponible."
    },
    {
      title: "Instalar actualizaciones del sistema",
      command: "sudo apt upgrade -y",
      desc: "Aplica las actualizaciones de seguridad y mejoras al sistema base de Kali Linux."
    }
  ];

  const driverCommands = [
    {
      title: "1. Actualizar repositorios",
      command: "sudo apt update",
      desc: "Asegura que Kali tenga la lista de paquetes más reciente."
    },
    {
      title: "2. Instalar el driver oficial (DKMS)",
      command: "sudo apt install realtek-rtl8188eus-dkms -y",
      desc: "Instala el módulo oficial empaquetado por Kali. Al usar DKMS, el driver se recompilará automáticamente si el Kernel se actualiza en el futuro."
    },
    {
      title: "3. Bloquear los drivers genéricos",
      command: "echo -e 'blacklist r8188eu\\nblacklist rtl8xxxu' | sudo tee /etc/modprobe.d/realtek.conf",
      desc: "Evita que Kali cargue los drivers de fábrica que interfieren y no soportan inyección de paquetes."
    },
    {
      title: "4. Reiniciar el sistema",
      command: "sudo reboot",
      desc: "Es obligatorio reiniciar la máquina virtual para que el Kernel cargue el nuevo controlador."
    }
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 ${darkMode ? 'dark' : ''}`}>
      <div className="absolute inset-0 bg-neutral-50 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-[#111113] w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-400 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-400 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-[#161618]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg">
              <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white leading-tight">Guía de Preparación</h2>
              <p className="text-xs text-neutral-800 dark:text-neutral-400">Requisitos previos para los laboratorios</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-400 dark:border-neutral-800 bg-neutral-50 dark:bg-[#161618] px-4">
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'system' 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            Sistema Base
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'drivers' 
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Drivers (Antena)
          </button>
          <button
            onClick={() => setActiveTab('virtualbox')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'virtualbox' 
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Máquina Virtual
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#111113]">
          
          {activeTab === 'system' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-wrap items-start gap-3 p-4 bg-blue-50 dark:bg-blue-500/5 rounded-xl border border-blue-400 dark:border-blue-500/10">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  Antes de iniciar cualquier laboratorio de ciberseguridad, es imperativo actualizar la lista de repositorios y los paquetes instalados para mitigar vulnerabilidades y asegurar la compatibilidad de herramientas de auditoría.
                </p>
              </div>

              <div className="space-y-4">
                {systemCommands.map((cmd, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{cmd.title}</h4>
                    <p className="text-xs text-neutral-800 dark:text-neutral-400">{cmd.desc}</p>
                    <div className="group relative bg-slate-100 dark:bg-black rounded-lg border border-slate-400 dark:border-neutral-800 p-3 flex items-center justify-between">
                      <code className="text-xs font-mono text-slate-800 dark:text-emerald-400 break-all">{cmd.command}</code>
                      <button
                        onClick={() => copyToClipboard(cmd.command, idx)}
                        className="ml-4 shrink-0 p-1.5 rounded-md bg-white dark:bg-neutral-900 border border-slate-400 dark:border-neutral-700 text-slate-700 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Copiar comando"
                      >
                        {copiedIndex === idx ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'drivers' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-wrap items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-400 dark:border-emerald-500/10">
                <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
                  Estos comandos son exclusivos para instalar el driver parcheado de la antena <strong>TP-LINK TL-WN722N (Versión 2 y 3)</strong> con chip Realtek RTL8188EUS. Esto habilita el Modo Monitor y la Inyección de Paquetes.
                </p>
              </div>

              <div className="space-y-5">
                {driverCommands.map((cmd, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{cmd.title}</h4>
                    <p className="text-xs text-neutral-800 dark:text-neutral-400 leading-relaxed">{cmd.desc}</p>
                    <div className="group relative bg-slate-100 dark:bg-black rounded-lg border border-slate-400 dark:border-neutral-800 p-3 flex items-center justify-between mt-1">
                      <code className="text-xs font-mono text-slate-800 dark:text-emerald-400 break-all">{cmd.command}</code>
                      <button
                        onClick={() => copyToClipboard(cmd.command, idx + 10)}
                        className="ml-4 shrink-0 p-1.5 rounded-md bg-white dark:bg-neutral-900 border border-slate-400 dark:border-neutral-700 text-slate-700 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Copiar comando"
                      >
                        {copiedIndex === idx + 10 ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'virtualbox' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-sm text-indigo-800 dark:text-indigo-300 space-y-2">
                  <p className="font-bold">Instalación de Kali Linux en VirtualBox</p>
                  <p>Para este laboratorio usaremos una máquina virtual preconstruida (Pre-built VM) de Kali Linux. Es la forma más rápida y segura de empezar, ya que viene con todas las herramientas configuradas.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-[#18181b] p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-colors">
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">1</span>
                    Instalar VirtualBox
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 pl-8">
                    Primero, descarga e instala el motor de virtualización. Ve a la página oficial, selecciona "Windows hosts" (o tu sistema) e instala el programa como cualquier otro.
                  </p>
                  <div className="pl-8">
                    <a href="https://www.virtualbox.org/wiki/Downloads" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-semibold rounded-lg transition-colors border border-indigo-200 dark:border-indigo-500/20">
                      Descargar VirtualBox Oficial <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#18181b] p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-colors">
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">2</span>
                    Descargar Kali Linux (Pre-built VM)
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 pl-8">
                    Ve a la sección "Pre-built Virtual Machines" en la web oficial de Kali. Selecciona la opción de <strong>VirtualBox</strong> y descarga el archivo (usualmente un archivo .7z).
                  </p>
                  <div className="pl-8">
                    <a href="https://www.kali.org/get-kali/#kali-virtual-machines" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-semibold rounded-lg transition-colors border border-indigo-200 dark:border-indigo-500/20">
                      Descargar Imagen de Kali Linux <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#18181b] p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-colors">
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">3</span>
                    Importar la Máquina
                  </h3>
                  <ul className="list-decimal list-inside text-sm text-neutral-600 dark:text-neutral-400 space-y-3 pl-8">
                    <li>Descomprime el archivo descargado de Kali (recomendamos 7-Zip o WinRAR).</li>
                    <li>Abre la carpeta descomprimida y haz doble clic en el archivo azul con extensión <strong>.vbox</strong>.</li>
                    <li>VirtualBox se abrirá automáticamente con la máquina ya configurada.</li>
                    <li>Haz clic en "Iniciar". Las credenciales por defecto son: usuario <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded text-neutral-900 dark:text-white">kali</code> y contraseña <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded text-neutral-900 dark:text-white">kali</code>.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};
