import React, { useState } from 'react';
import { Wifi, X, Minus, Square, ChevronRight } from 'lucide-react';

interface Props {
  onRunningChange?: (isRunning: boolean) => void;
}

export default function WifiHotspotSimulator({ onRunningChange }: Props = {}) {
  const [ssid, setSsid] = useState('MyAccessPoint');
  const [password, setPassword] = useState('12345678');
  const [isOpen, setIsOpen] = useState(false);
  const [wifiInterface, setWifiInterface] = useState('wlan0');
  const [internetInterface, setInternetInterface] = useState('eth0');
  const [status, setStatus] = useState('Not running');
  const [isRunning, setIsRunning] = useState(false);

  const handleCreate = () => {
    setStatus('Starting AP...');
    setTimeout(() => {
      setStatus('Running as PID: 375380');
      setIsRunning(true);
      if (onRunningChange) onRunningChange(true);
    }, 1500);
  };

  const handleStop = () => {
    setStatus('Stopping AP...');
    setTimeout(() => {
      setStatus('Not running');
      setIsRunning(false);
      if (onRunningChange) onRunningChange(false);
    }, 1000);
  };

  return (
    <div className="space-y-4 relative w-full max-w-2xl mx-auto">
      {/* Background Terminal Window (Moved Above) */}
      <div className="bg-[#1e1e1e] rounded-lg border border-slate-700 overflow-hidden w-full font-mono text-[11px] sm:text-xs shadow-xl opacity-90 z-0">
        <div className="bg-[#2d2d2d] px-3 py-1.5 flex flex-wrap items-center gap-2 border-b border-slate-700">
          <div className="w-2.5 h-2.5 rounded-full bg-red-50 dark:bg-red-950/30"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          <span className="text-slate-600 ml-2 font-sans font-medium text-[11px]">kali@kali: ~/linux-wifi-hotspot</span>
        </div>
        <div className="p-4 text-slate-300 space-y-1 h-[160px] sm:h-[130px] overflow-hidden">
          <div>
            <span className="text-green-400 font-bold">┌──(kali㉿kali)-[~/linux-wifi-hotspot]</span><br/>
            <span className="text-green-400 font-bold">└─$</span> wihotspot
          </div>
          {isRunning && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-500 mt-2">
              pkexec --user root create_ap {wifiInterface} {internetInterface} '{ssid}' '{password}' --mkconfig /etc/create_ap.conf --freq-band 2.4<br/>
              Config options written to '/etc/create_ap.conf'<br/>
              WARN: Your adapter does not fully support AP virtual interface, enabling --no-virt
            </div>
          )}
        </div>
      </div>

      {/* GUI Window */}
      <div className="bg-[#1e1e2e] text-slate-300 font-sans rounded-lg shadow-2xl w-full border border-slate-700 overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-500 z-10">
        
        {/* Window Header */}
        <div className="bg-[#181825] px-3 py-2 flex items-center justify-between border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
              <Wifi className="w-3 h-3 text-cyan-400" />
            </div>
          </div>
          <div className="text-sm font-semibold text-slate-600 absolute left-1/2 transform -translate-x-1/2">
            Wi Hotspot
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button className="w-4 h-4 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-transparent hover:text-slate-300 transition-colors">
              <Minus className="w-3 h-3" />
            </button>
            <button className="w-4 h-4 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-transparent hover:text-slate-300 transition-colors">
              <Square className="w-2.5 h-2.5" />
            </button>
            <button className="w-4 h-4 rounded-full bg-blue-600/80 hover:bg-blue-500 flex items-center justify-center text-white transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          
          {/* Row 1: SSID & Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <label className="w-24 text-sm font-medium">SSID</label>
              <input 
                type="text" 
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                disabled={isRunning}
                className="flex-1 bg-[#11111b] border border-blue-500 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="w-20 text-sm font-medium">Password</label>
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <label className="flex flex-wrap items-center gap-1.5 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isOpen}
                    onChange={(e) => setIsOpen(e.target.checked)}
                    disabled={isRunning}
                    className="bg-[#11111b] border-slate-600 rounded text-blue-500 focus:ring-blue-500 focus:ring-offset-[#1e1e2e]"
                  />
                  Open
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isRunning || isOpen}
                  className="flex-1 bg-[#11111b] border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-slate-500 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Interfaces */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <label className="w-24 text-sm font-medium">Wifi interface</label>
              <select 
                value={wifiInterface}
                onChange={(e) => setWifiInterface(e.target.value)}
                disabled={isRunning}
                className="flex-1 bg-[#11111b] border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-slate-500 appearance-none disabled:opacity-50"
              >
                <option value="wlan0">wlan0</option>
                <option value="wlan1">wlan1</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="w-32 text-sm font-medium">Internet interface</label>
              <select 
                value={internetInterface}
                onChange={(e) => setInternetInterface(e.target.value)}
                disabled={isRunning}
                className="flex-1 bg-[#11111b] border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-slate-500 appearance-none disabled:opacity-50"
              >
                <option value="eth0">eth0</option>
                <option value="wlan0">wlan0</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          {/* Collapsible Sections */}
          <div className="space-y-2 pt-2">
            <div className="flex flex-wrap items-center gap-1 text-sm text-slate-300 cursor-pointer hover:text-white w-max">
              <ChevronRight className="w-4 h-4" /> Advanced
            </div>
            <div className="flex flex-wrap items-center gap-1 text-sm text-slate-300 cursor-pointer hover:text-white w-max">
              <ChevronRight className="w-4 h-4" /> Connected devices
            </div>
          </div>

        </div>

        {/* Footer / Action Bar */}
        <div className="p-4 flex items-center justify-between mt-4 border-t border-slate-800">
          <div className="text-sm font-medium flex flex-wrap items-center gap-2">
            {isRunning && <span className="w-2 h-2 rounded-full bg-emerald-50 dark:bg-emerald-950/300 animate-pulse"></span>}
            {status}
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button className="px-3 py-1 sm:px-4 sm:py-1.5 bg-[#2a2a3c] hover:bg-[#35354a] border border-slate-700 rounded text-sm font-medium transition-colors">
              About
            </button>
            <button className="px-3 py-1 sm:px-4 sm:py-1.5 bg-[#2a2a3c] hover:bg-[#35354a] border border-slate-700 rounded text-sm font-medium transition-colors">
              Open QR
            </button>
            <button 
              onClick={handleStop}
              disabled={!isRunning}
              className="px-3 py-1 sm:px-4 sm:py-1.5 bg-[#2a2a3c] hover:bg-[#35354a] border border-slate-700 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Stop
            </button>
            <button 
              onClick={handleCreate}
              disabled={isRunning}
              className="px-3 py-1 sm:px-4 sm:py-1.5 bg-[#2a2a3c] hover:bg-[#35354a] border border-slate-700 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create hotspot
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
