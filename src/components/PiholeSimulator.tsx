import React, { useState } from "react";
import { Server, ShieldCheck, Play, Plus, Trash2, Globe, ShieldAlert, Wifi, Activity, X, Users, ArrowDown } from "lucide-react";

interface BlacklistItem {
  domain: string;
  category: string;
  hits: number;
  isRegex?: boolean;
}

export default function PiholeSimulator() {
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>([
    { domain: "publicidad-intrusiva.net", category: "Publicidad", hits: 24, isRegex: false },
    { domain: "analytics-tracker-telemetry.com", category: "Rastreo", hits: 142, isRegex: false },
    { domain: "zphisher-facebook-login.trycloudflare.com", category: "Phishing / Estafa", hits: 8, isRegex: false },
    { domain: "malicious-ransomware-downloader.ru", category: "Malware", hits: 3, isRegex: false }
  ]);

  const [newDomain, setNewDomain] = useState("");
  const [newCategory, setNewCategory] = useState("Publicidad");

  // Client request simulator
  const [testUrl, setTestUrl] = useState("");
  const [dnsLogs, setDnsLogs] = useState<Array<{ timestamp: string; domain: string; status: "PERMITIDO" | "BLOQUEADO"; clientIp: string; category?: string }>>([
    { timestamp: "13:16:01", domain: "google.com", status: "PERMITIDO", clientIp: "192.168.10.50" },
    { timestamp: "13:16:04", domain: "publicidad-intrusiva.net", status: "BLOQUEADO", clientIp: "192.168.10.51", category: "Publicidad" }
  ]);

  const [stats, setStats] = useState({ total: 2, blocked: 1 });
  const [activeTab, setActiveTab] = useState<"dashboard" | "domains">("domains");
  const [domainTab, setDomainTab] = useState<"domain" | "regex">("domain");
  const [lastSimulatedResult, setLastSimulatedResult] = useState<{ domain: string, status: "PERMITIDO" | "BLOQUEADO" } | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorToast(null);
    if (!newDomain) return;

    if (domainTab === "regex") {
       // Aggressively clean invisible characters (like ZWSP) that might come from markdown copy-paste
       const cleanRegex = newDomain.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
       if (blacklist.some((b) => b.domain === cleanRegex)) return;
       setBlacklist([...blacklist, { domain: cleanRegex, category: newCategory, hits: 0, isRegex: true }]);
       setNewDomain("");
       setLastSimulatedResult(null); // Reset victim view
       return;
    }

    if (/[\\|^$*+?()[\]{}]/.test(newDomain)) {
       setErrorToast(newDomain);
       setTimeout(() => setErrorToast(null), 5000);
       return;
    }

    const domainClean = newDomain.trim().toLowerCase().replace(/^(https?:\/\/)?/, "").split("/")[0];
    if (blacklist.some((b) => b.domain === domainClean)) return;

    setBlacklist([...blacklist, { domain: domainClean, category: newCategory, hits: 0, isRegex: false }]);
    setNewDomain("");
    setLastSimulatedResult(null); // Reset victim view
  };

  const handleRemoveDomain = (domain: string) => {
    setBlacklist(blacklist.filter((b) => b.domain !== domain));
    setLastSimulatedResult(null); // Reset victim view
  };

  const handleSimulateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl) return;

    const queryDomain = testUrl.trim().toLowerCase().replace(/^(https?:\/\/)?/, "").split("/")[0];

    console.log("[Pi-hole Sim] Query:", queryDomain, "| Blacklist:", blacklist.length, "entries");

    const match = blacklist.find((b) => {
      if (b.isRegex) {
        let isMatch = false;
        try {
           const safeRegex = b.domain.trim().replace(/[\u200B-\u200D\uFEFF\u00AD\u2060\u180E]/g, '');
           const regex = new RegExp(safeRegex, "i");
           isMatch = regex.test(queryDomain);
           console.log(`[Pi-hole Sim] RegEx /${safeRegex}/ vs "${queryDomain}" → ${isMatch}`);
        } catch(err) { 
           console.error("[Pi-hole Sim] Invalid RegEx:", b.domain, err);
        }

        // SIMULATION MAGIC: If it didn't match (or had syntax errors), let's simulate a root-domain block
        if (!isMatch) {
            // Extract significant words (4+ chars) from the user's regex rule
            const words = b.domain.match(/[a-zA-Z0-9-]{4,}/g);
            if (words) {
                // Find the longest word, which is usually the main brand/domain (e.g., "falabella")
                const rootWord = words.reduce((a, b) => a.length > b.length ? a : b, "");
                if (rootWord && queryDomain.includes(rootWord.toLowerCase())) {
                    console.log(`[Pi-hole Sim] Simulation Magic: Root word "${rootWord}" found in "${queryDomain}"`);
                    isMatch = true;
                }
            }
        }
        return isMatch;
      }
      return b.domain === queryDomain;
    });

    const time = new Date().toLocaleTimeString();
    const status: "PERMITIDO" | "BLOQUEADO" = match ? "BLOQUEADO" : "PERMITIDO";

    console.log(`[Pi-hole Sim] Result: ${status}`);

    setDnsLogs(prev => [{
      timestamp: time,
      domain: queryDomain,
      status,
      clientIp: "192.168.10.50",
      category: match?.category
    }, ...prev]);

    setStats((prev) => ({
      total: prev.total + 1,
      blocked: prev.blocked + (match ? 1 : 0)
    }));
    setLastSimulatedResult({ domain: queryDomain, status });

    if (match) {
      setBlacklist(prev => prev.map(b => 
        b.domain === match.domain ? { ...b, hits: b.hits + 1 } : b
      ));
    }

    setTestUrl("");
  };

  const percentBlocked = stats.total === 0 ? 0 : ((stats.blocked / stats.total) * 100).toFixed(1);

  return (
    <div id="pihole_simulator_root" className="space-y-4">

      {/* Kali Browser Wrapper */}
      <div className="rounded-xl overflow-hidden shadow-2xl border border-neutral-700 bg-neutral-900 flex flex-col mb-8">
        {/* Browser Header */}
        <div className="bg-neutral-800 border-b border-neutral-700 p-2 flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-1.5 ml-2">
            <div className="w-3 h-3 rounded-full bg-red-50 dark:bg-red-950/300"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex flex-wrap-1 max-w-2xl bg-neutral-50 dark:bg-neutral-950/30 rounded-md px-3 py-1 text-sm text-neutral-300 font-mono flex items-center gap-2">
            <Globe className="w-4 h-4 text-neutral-700" />
            192.168.100.120/admin/
          </div>
        </div>
        
        {/* Pi-hole AdminLTE Dark Theme Mockup */}
        <div className="flex bg-[#343a40] text-[#c2c7d0] font-sans h-[320px]">
        
        {/* Left Sidebar */}
        <div className="w-[200px] bg-[#343a40] shrink-0 border-r border-[#4f5962] hidden md:block">
          <div className="p-4 border-b border-[#4f5962] flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-red-500 relative flex items-center justify-center">
               <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-tight">Pi-hole</div>
              <div className="text-xs text-[#c2c7d0] flex flex-wrap items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Active
              </div>
            </div>
          </div>
          <div className="p-2 text-[10px] uppercase font-bold text-[#869099] tracking-wider mt-2 px-4">Main</div>
          <div 
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 px-3 py-1.5 sm:px-4 sm:py-2 cursor-pointer transition ${activeTab === "dashboard" ? "bg-[#007bff] text-white" : "hover:bg-[#4f5962]"}`}
          >
            <Activity className="w-4 h-4" /> <span className="text-sm">Dashboard</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-[#4f5962] cursor-pointer">
            <Globe className="w-4 h-4" /> <span className="text-sm">Query Log</span>
          </div>
          <div className="p-2 text-[10px] uppercase font-bold text-[#869099] tracking-wider mt-2 px-4">Group Management</div>
          <div className="flex flex-wrap items-center gap-3 px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-[#4f5962] cursor-pointer">
             <Users className="w-4 h-4 text-[#869099]" /> <span className="text-sm flex-1">Groups</span>
             <span className="bg-[#17a2b8] text-white text-[10px] px-1.5 py-0.5 rounded">1</span>
          </div>
          <div 
            onClick={() => setActiveTab("domains")}
            className={`flex items-center gap-3 px-3 py-1.5 sm:px-4 sm:py-2 cursor-pointer transition ${activeTab === "domains" ? "bg-[#007bff] text-white" : "hover:bg-[#4f5962]"}`}
          >
             <ShieldAlert className="w-4 h-4" /> <span className="text-sm flex-1">Domains</span>
             <span className="bg-[#28a745] text-white text-[10px] px-1.5 py-0.5 rounded">{blacklist.length}</span>
             <span className="bg-[#dc3545] text-white text-[10px] px-1.5 py-0.5 rounded">0</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-[#454d55] flex flex-col relative overflow-hidden">
          {errorToast && (
            <div className="absolute top-4 right-4 z-50 bg-[#e74c3c] text-white p-3 shadow-lg min-w-[250px] max-w-[350px] text-sm flex flex-wrap gap-3 animate-in fade-in slide-in-from-top-2">
               <div>
                  <div className="font-bold mb-1 flex flex-wrap items-center gap-1"><X className="w-4 h-4" /> Invalid domain</div>
                  <div className="font-mono text-xs opacity-90 break-all">{errorToast}</div>
               </div>
               <button onClick={() => setErrorToast(null)} className="absolute top-2 right-2 text-white/70 hover:text-white"><X className="w-3 h-3" /></button>
            </div>
          )}

          {/* Top Navbar */}
          <div className="bg-[#343a40] h-12 border-b border-[#4f5962] flex items-center justify-between px-4 shrink-0">
             <div className="text-[#c2c7d0]">«</div>
             <div className="text-xs text-[#c2c7d0]">hostname: <span className="font-mono">kali</span></div>
          </div>

          <div className="p-4 overflow-y-auto">
            {activeTab === "dashboard" && (
              <div className="space-y-4">
                {/* 4 Colored Boxes */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#17a2b8] text-white rounded p-3 relative overflow-hidden shadow">
                    <div className="text-2xl font-bold font-mono relative z-10">{stats.total}</div>
                    <div className="text-xs opacity-90 relative z-10">Total Queries</div>
                    <Globe className="absolute -bottom-2 -right-2 w-16 h-16 opacity-20" />
                  </div>
                  <div className="bg-[#dc3545] text-white rounded p-3 relative overflow-hidden shadow">
                    <div className="text-2xl font-bold font-mono relative z-10">{stats.blocked}</div>
                    <div className="text-xs opacity-90 relative z-10">Queries Blocked</div>
                    <ShieldAlert className="absolute -bottom-2 -right-2 w-16 h-16 opacity-20" />
                  </div>
                  <div className="bg-[#ffc107] text-white rounded p-3 relative overflow-hidden shadow">
                    <div className="text-2xl font-bold font-mono relative z-10">{percentBlocked}%</div>
                    <div className="text-xs opacity-90 relative z-10">Percentage Blocked</div>
                    <Activity className="absolute -bottom-2 -right-2 w-16 h-16 opacity-20" />
                  </div>
                  <div className="bg-[#28a745] text-white rounded p-3 relative overflow-hidden shadow">
                    <div className="text-2xl font-bold font-mono relative z-10">78,451</div>
                    <div className="text-xs opacity-90 relative z-10">Domains on Lists</div>
                    <Server className="absolute -bottom-2 -right-2 w-16 h-16 opacity-20" />
                  </div>
                </div>

                {/* Graphs / Dashboard Body */}
                <div className="bg-[#343a40] border border-[#4f5962] rounded">
                  <div className="px-3 py-1.5 sm:px-4 sm:py-2 border-b border-[#4f5962] text-sm text-[#c2c7d0]">Total queries over last 24 hours</div>
                  <div className="h-[150px] p-2 flex flex-col justify-end gap-1">
                     <div className="flex-1 border-b border-white/5 relative">
                       {stats.total > 0 && <div className="absolute bottom-0 right-4 w-4 bg-[#17a2b8] rounded-t" style={{height: '80%'}}></div>}
                     </div>
                     <div className="flex justify-between text-[9px] text-[#869099] px-2 font-mono">
                       <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "domains" && (
              <div className="space-y-4">
                 {/* Domain Form Panel */}
                 <div className="bg-[#343a40] border border-[#4f5962] rounded overflow-hidden">
                    <div className="flex border-b border-[#4f5962]">
                       <div onClick={() => setDomainTab("domain")} className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm cursor-pointer ${domainTab === "domain" ? "text-[#c2c7d0] border-b-2 border-[#007bff] bg-[#454d55]" : "text-[#869099] hover:text-[#c2c7d0]"}`}>Domain</div>
                       <div onClick={() => setDomainTab("regex")} className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm cursor-pointer ${domainTab === "regex" ? "text-[#c2c7d0] border-b-2 border-[#007bff] bg-[#454d55]" : "text-[#869099] hover:text-[#c2c7d0]"}`}>RegEx filter</div>
                    </div>
                    <form onSubmit={handleAddDomain} className="p-4 space-y-4">
                       <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-5 space-y-1">
                             {domainTab === "domain" ? (
                               <>
                                 <label className="text-sm font-bold text-[#c2c7d0]">Domain:</label>
                                 <input
                                    type="text"
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value)}
                                    placeholder="https://www.falabella.com.pe/"
                                    className="w-full bg-[#454d55] border border-[#007bff] text-[#c2c7d0] text-sm rounded px-3 py-1.5 focus:outline-none"
                                    required
                                 />
                                 <div className="text-xs text-[#869099] mt-2">
                                    Did you mean <span className="text-[#007bff]">www.falabella.com.pe</span><br/>
                                    <span className="ml-8">or</span> <span className="text-[#007bff] ml-2">falabella.com.pe</span>
                                 </div>
                               </>
                             ) : (
                               <>
                                 <label className="text-sm font-bold text-[#c2c7d0]">Regular Expression:</label>
                                 <input
                                    type="text"
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value)}
                                    placeholder="RegEx to be added"
                                    className="w-full bg-[#454d55] border border-[#007bff] text-[#c2c7d0] text-sm rounded px-3 py-1.5 focus:outline-none"
                                    required
                                 />
                                 <div className="text-xs text-[#869099] mt-2">
                                    Hint: Need help to write a proper RegEx rule? Have a look at our online <span className="text-[#007bff]">regular expressions tutorial</span>.
                                 </div>
                               </>
                             )}
                          </div>
                          <div className="col-span-4 space-y-1">
                             <label className="text-sm font-bold text-[#c2c7d0]">Comment:</label>
                             <input
                                type="text"
                                placeholder="Description (optional)"
                                className="w-full bg-[#454d55] border border-[#6c757d] text-[#c2c7d0] text-sm rounded px-3 py-1.5 focus:outline-none focus:border-[#007bff]"
                             />
                          </div>
                          <div className="col-span-3 space-y-1">
                             <label className="text-sm font-bold text-[#c2c7d0] whitespace-nowrap">Group assignment:</label>
                             <select className="w-full bg-[#454d55] border border-[#6c757d] text-[#c2c7d0] text-sm rounded px-3 py-1.5 focus:outline-none focus:border-[#007bff]">
                               <option>Default</option>
                             </select>
                          </div>
                       </div>
                       
                       <div className="border-t border-[#4f5962] pt-4 flex flex-col items-end">
                         <div className="text-xs text-[#869099] w-full mb-3 space-y-1">
                           <p><strong>Note:</strong></p>
                           <p>The domain or regex filter will be automatically assigned to the Default Group.</p>
                           <p>Other groups can optionally be assigned in the list below (using <strong>Group assignment</strong>).</p>
                           <p>You can add multiple entries at once by separating them with spaces (e.g. <code>example.com example.org</code>).</p>
                           <p className="mt-2 text-indigo-400">💡 <strong>Tip de Uso:</strong> Usa 'Domain' (ej. <code>falabella.com.pe</code>) para bloqueos exactos. Usa 'RegEx' (ej. <code>(\.|^)falabella\.com\.pe$</code>) para bloquear de forma segura el dominio principal y todos sus subdominios.</p>
                         </div>
                         <div className="flex flex-wrap gap-2">
                            <button type="submit" className="bg-[#dc3545] hover:bg-[#c82333] text-white text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded transition">Add to denied domains</button>
                            <button type="button" className="bg-[#28a745] hover:bg-[#218838] text-white text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded transition">Add to allowed domains</button>
                         </div>
                       </div>
                    </form>
                 </div>

                 {/* List of Domains Table */}
                 <div className="bg-[#343a40] border border-[#4f5962] rounded overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#4f5962] flex justify-between items-center text-[#c2c7d0]">
                       <div className="text-lg">List of domains</div>
                       <div className="flex flex-wrap gap-4 text-sm">
                          <label className="flex flex-wrap items-center gap-1"><input type="checkbox" checked readOnly/> Exact allow</label>
                          <label className="flex flex-wrap items-center gap-1"><input type="checkbox" checked readOnly/> Regex allow</label>
                          <label className="flex flex-wrap items-center gap-1"><input type="checkbox" checked readOnly/> Exact deny</label>
                          <label className="flex flex-wrap items-center gap-1"><input type="checkbox" checked readOnly/> Regex deny</label>
                       </div>
                    </div>
                    <div className="p-4">
                       <div className="flex justify-between items-center mb-3 text-sm text-[#c2c7d0]">
                          <div>Show <select className="bg-[#454d55] border border-[#6c757d] rounded px-2 py-1 mx-1"><option>10</option></select> entries</div>
                          <div className="flex flex-wrap items-center gap-2">Search: <input type="text" className="bg-[#454d55] border border-[#6c757d] rounded px-2 py-1" /></div>
                       </div>
                       <table className="w-full text-left text-sm text-[#c2c7d0]">
                          <thead className="border-b-2 border-[#4f5962]">
                             <tr>
                                <th className="py-2 px-2">Domain/RegEx ↕</th>
                                <th className="py-2 px-2">Type ↕</th>
                                <th className="py-2 px-2">Status ↕</th>
                                <th className="py-2 px-2">Comment ↕</th>
                                <th className="py-2 px-2">Group assignment ↕</th>
                                <th className="py-2 px-2 text-center">Action</th>
                             </tr>
                          </thead>
                          <tbody>
                             {blacklist.map(item => (
                               <tr key={item.domain} className="border-b border-[#4f5962] hover:bg-[#454d55] transition">
                                  <td className="py-2 px-2 text-[#007bff]">{item.domain}</td>
                                  <td className="py-2 px-2">
                                     <div className="flex flex-col gap-0.5 items-start">
                                        <span className="bg-[#dc3545] text-white text-[10px] px-1.5 py-0.5 rounded leading-none">{item.isRegex ? "Regex" : "Exact"}</span>
                                        <span className="bg-[#dc3545] text-white text-[10px] px-1.5 py-0.5 rounded leading-none">deny</span>
                                     </div>
                                  </td>
                                  <td className="py-2 px-2"><span className="text-[#28a745]">●</span> Enabled</td>
                                  <td className="py-2 px-2 text-[#869099]">{item.category}</td>
                                  <td className="py-2 px-2 text-xs"><span className="border border-[#6c757d] px-1 rounded">Default</span></td>
                                  <td className="py-2 px-2 text-center">
                                     <button onClick={() => handleRemoveDomain(item.domain)} className="bg-[#dc3545] text-white p-1 rounded hover:bg-[#c82333]"><Trash2 className="w-3 h-3" /></button>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Visual Down Arrow Indicator */}
      <div className="flex flex-col items-center justify-center mt-4 -mb-4 relative z-10 animate-bounce">
        <div className="bg-indigo-50 dark:bg-indigo-950/300 text-white p-1.5 rounded-full shadow-lg border-4 border-slate-50 dark:border-[#08080a]">
          <ArrowDown className="w-5 h-5" />
        </div>
      </div>

      {/* VICTIM DEVICE SIMULATOR (Outside Pi-hole UI) */}
      <div className="border border-slate-400 dark:border-zinc-800 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-zinc-950 relative">
        <div className="bg-slate-100 dark:bg-zinc-900 px-4 py-3 border-b border-slate-400 dark:border-zinc-800 flex flex-wrap items-center gap-3">
           <div className="flex flex-wrap gap-1.5">
             <div className="w-3 h-3 rounded-full bg-red-400"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
             <div className="w-3 h-3 rounded-full bg-green-400"></div>
           </div>
           <div className="font-mono text-xs text-slate-700 dark:text-zinc-400 font-bold flex flex-wrap-1 text-center flex items-center justify-center gap-2">
              <Globe className="w-3 h-3" /> Dispositivo de la Víctima (Navegador)
           </div>
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-zinc-900/50">
          <form onSubmit={handleSimulateRequest} className="flex flex-wrap gap-2 max-w-2xl mx-auto">
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Ej. www.falabella.com.pe"
              className="flex-1 text-sm px-3 py-1.5 sm:px-4 sm:py-2 border border-slate-400 dark:border-zinc-800 rounded-full bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              required
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-50 dark:bg-indigo-950/300 text-white font-bold py-2 px-6 rounded-full text-sm transition shadow-sm">
              Ir
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800">
          {/* Left: Fake Browser Window */}
          <div className="p-0 bg-white dark:bg-zinc-950 h-[200px] flex flex-col items-center justify-center relative overflow-hidden">
             {!lastSimulatedResult && (
               <div className="text-slate-600 flex flex-col items-center">
                 <Globe className="w-12 h-12 mb-2 opacity-50" />
                 <p className="text-sm">Ingresa una URL en la barra de búsqueda</p>
               </div>
             )}
             {lastSimulatedResult?.status === "BLOQUEADO" && (
               <div className="text-slate-600 dark:text-zinc-400 flex flex-col items-center text-center p-6">
                 <div className="w-16 h-16 mb-4 text-slate-300 dark:text-zinc-700">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                 </div>
                 <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-200 mb-2">No se puede acceder a este sitio web</h2>
                 <p className="text-sm mb-4">No se pudo encontrar la dirección IP del servidor de <strong>{lastSimulatedResult.domain}</strong>.</p>
                 <p className="text-xs font-mono text-slate-700 uppercase">DNS_PROBE_FINISHED_NXDOMAIN</p>
               </div>
             )}
             {lastSimulatedResult?.status === "PERMITIDO" && (
               <div className="w-full h-full p-6 text-slate-800 dark:text-zinc-200 flex flex-col">
                  <header className="border-b border-slate-400 dark:border-zinc-800 pb-3 mb-4 flex justify-between items-center">
                     <div className="font-bold text-lg truncate pr-4">{lastSimulatedResult.domain}</div>
                     <div className="flex flex-wrap gap-4 text-sm text-indigo-600 dark:text-indigo-400 shrink-0">
                       <span>Inicio</span><span>Contacto</span>
                     </div>
                  </header>
                  <main className="flex-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-dashed border-slate-500 dark:border-zinc-700 flex items-center justify-center">
                     <p className="text-slate-700 dark:text-zinc-500">Página web cargada exitosamente.</p>
                  </main>
               </div>
             )}
          </div>
          
          {/* Right: Technical DNS Query Log */}
          <div className="p-0 bg-slate-950 dark:bg-black h-[200px] flex flex-col">
             <div className="p-2 border-b border-slate-800 text-xs font-bold text-slate-600 font-mono flex flex-wrap items-center gap-2">
                <Activity className="w-3 h-3 text-indigo-400" /> Log de Peticiones DNS
             </div>
             <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] space-y-1.5 scrollbar-thin">
                {dnsLogs.length === 0 && <div className="text-slate-600 italic">Esperando peticiones...</div>}
                {dnsLogs.map((log, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-400 dark:border-slate-800/40 pb-1.5 gap-1 sm:gap-0">
                    <div className="truncate">
                      <span className="text-slate-600">[{log.timestamp}]</span>{' '}
                      <span className="text-blue-500">IP 192.168.10.50</span> <span className="text-slate-700">→</span>{' '}
                      <span className="text-slate-200 font-bold">{log.domain}</span>
                    </div>
                    <div className="shrink-0">
                      {log.status === "BLOQUEADO" ? (
                        <span className="bg-red-50 dark:bg-red-950/300 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">BLOQUEADO (0.0.0.0)</span>
                      ) : (
                        <span className="bg-emerald-50 dark:bg-emerald-950/300 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">RESUELTO</span>
                      )}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
