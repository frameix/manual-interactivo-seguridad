import React, { useState, useEffect } from "react";
import { Terminal, Database, ShieldCheck, AlertCircle, Search, RefreshCw, ChevronLeft, ChevronRight, ShoppingCart, User as UserIcon, ShieldAlert, Info } from "lucide-react";

export default function SqlInjectionSandbox() {
  const [usePreparedStatement, setUsePreparedStatement] = useState(false);
  const [currentView, setCurrentView] = useState<"store" | "login" | "admin" | "error">("store");
  
  // Scenarios State
  const [activeScenario, setActiveScenario] = useState<"none" | "login" | "hidden" | "union" | "drop">("none");
  const [hasExecuted, setHasExecuted] = useState(false);

  // Login form state
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Data State
  const [injectedData, setInjectedData] = useState<any[] | null>(null);

  // Mock Database
  const productsDB = [
    { id: 1, name: "UltraBook Pro 15", category: "Laptops", price: "$1299", image: "💻", isHidden: false },
    { id: 2, name: "Gamer Xtreme RTX", category: "Laptops", price: "$1899", image: "🎮", isHidden: false },
    { id: 3, name: "Phone V20", category: "Phones", price: "$899", image: "📱", isHidden: false },
    { id: 4, name: "Wireless Earbuds", category: "Accessories", price: "$149", image: "🎧", isHidden: false },
    { id: 5, name: "Quantum Laptop (PROTOTYPE)", category: "Laptops", price: "$9999", image: "🔬", isHidden: true },
    { id: 6, name: "HoloPhone (UNRELEASED)", category: "Phones", price: "$2999", image: "🔮", isHidden: true },
  ];

  const usersDB = [
    { id: 1, user: "admin", pass: "CiberseguridadDocente2026", role: "SuperAdmin" },
    { id: 2, user: "j.doe", pass: "Password123!", role: "Customer" }
  ];

  const resetSimulation = () => {
    setCurrentView("store");
    setActiveScenario("none");
    setHasExecuted(false);
    setInjectedData(null);
    setLoginUser("");
    setLoginPass("");
  };

  // --- Scenarios Preparation ---
  const prepareLoginBypass = () => {
    resetSimulation();
    setActiveScenario("login");
    setCurrentView("login");
    setLoginUser("' OR 1=1--");
    setLoginPass("contraseña_inventada");
  };

  const prepareHiddenItems = () => {
    resetSimulation();
    setActiveScenario("hidden");
  };

  const prepareUnion = () => {
    resetSimulation();
    setActiveScenario("union");
  };

  const prepareDrop = () => {
    resetSimulation();
    setActiveScenario("drop");
  };

  // --- Execution Handlers ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasExecuted(true);

    if (usePreparedStatement) {
      setCurrentView("login"); // Fails safely
      setInjectedData([{ loginError: true }]);
    } else {
      if (loginUser.includes("' OR 1=1")) {
        setCurrentView("admin"); // Bypassed!
        setInjectedData(usersDB); // Admin sees all users
      } else {
        setCurrentView("login");
        setInjectedData([{ loginError: true }]);
      }
    }
  };

  const executeUrlInjection = () => {
    setHasExecuted(true);
    if (activeScenario === "hidden") {
      if (usePreparedStatement) {
        setInjectedData([]);
      } else {
        setInjectedData(productsDB); 
      }
    } else if (activeScenario === "union") {
      if (usePreparedStatement) {
        setInjectedData([]);
      } else {
        const laptops = productsDB.filter(p => p.category === "Laptops" && !p.isHidden);
        const leakedUsers = usersDB.map(u => ({
          id: `USR-${u.id}`,
          name: `User: ${u.user}`,
          category: `Pass: ${u.pass}`,
          price: `Role: ${u.role}`,
          image: "👤",
          isHidden: false
        }));
        setInjectedData([...laptops, ...leakedUsers]);
      }
    } else if (activeScenario === "drop") {
      if (usePreparedStatement) {
        setInjectedData([]);
      } else {
        setCurrentView("error");
        setInjectedData(null);
      }
    }
  };

  // --- Dynamic UI Helpers ---
  const renderUrlBar = () => {
    let base = "https://techelectro.shop/";
    let path = "store?category=Laptops";
    let injected = "";

    if (activeScenario === "login") {
      path = "login";
    } else if (activeScenario === "hidden") {
      path = "store?category=";
      injected = "'+OR+1=1--";
    } else if (activeScenario === "union") {
      path = "store?category=";
      injected = "' UNION SELECT id, user, pass, role, '👤', 0 FROM users--";
    } else if (activeScenario === "drop") {
      path = "store?category=";
      injected = "'; DROP TABLE products--";
    }

    return (
      <div className="flex flex-wrap-1 bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-700 rounded-md py-1.5 px-3 flex items-center gap-2 shadow-inner overflow-hidden">
        <Search className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <div className="text-xs font-mono truncate w-full">
          <span className="text-slate-700">{base}</span>
          <span className="text-slate-800 dark:text-zinc-200">{path}</span>
          {injected && <span className="bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-400 font-bold px-0.5 rounded">{injected}</span>}
        </div>
      </div>
    );
  };

  const renderRawQuery = () => {
    if (activeScenario === "login") {
      if (!hasExecuted) return "Esperando envío del formulario de Login...";
      
      if (usePreparedStatement) {
        return (
          <>
            <span className="text-blue-400">PREPARE</span> stmt <span className="text-blue-400">FROM</span> "SELECT * FROM users WHERE user = ? AND pass = ?";{'\n'}
            <span className="text-blue-400">EXECUTE</span> stmt <span className="text-blue-400">USING</span> "<span className="text-emerald-400">{loginUser}</span>", "<span className="text-emerald-400">{loginPass}</span>";
          </>
        );
      } else {
        return (
          <>
            <span className="text-blue-400">SELECT</span> * <span className="text-blue-400">FROM</span> users <span className="text-blue-400">WHERE</span> user = '<span className="text-red-400 font-bold bg-red-50 dark:bg-red-950/30 px-1 rounded">{loginUser}</span>' <span className="text-blue-400">AND</span> pass = '{loginPass}'
          </>
        );
      }
    } else {
      // Store scenarios
      let injected = "";
      if (activeScenario === "hidden") injected = "'+OR+1=1--";
      if (activeScenario === "union") injected = "' UNION SELECT id, user, pass, role, '👤', 0 FROM users--";
      if (activeScenario === "drop") injected = "'; DROP TABLE products--";

      if (!hasExecuted && activeScenario !== "none") {
        return "Haz clic en 'Ejecutar Inyección en URL' en el navegador simulado...";
      }

      if (usePreparedStatement) {
        return (
          <>
            <span className="text-blue-400">PREPARE</span> stmt <span className="text-blue-400">FROM</span> "SELECT * FROM products WHERE category = ? AND isHidden = 0";{'\n'}
            <span className="text-blue-400">EXECUTE</span> stmt <span className="text-blue-400">USING</span> "<span className="text-emerald-400">{injected}</span>";
          </>
        );
      } else {
        return (
          <>
            <span className="text-blue-400">SELECT</span> * <span className="text-blue-400">FROM</span> products <span className="text-blue-400">WHERE</span> category = '<span className="text-red-400 font-bold bg-red-50 dark:bg-red-950/30 px-1 rounded">{injected}</span>' <span className="text-blue-400">AND</span> isHidden = 0
          </>
        );
      }
    }
  };

  const getExplanation = () => {
    if (activeScenario === "none") return "Selecciona un ataque a la izquierda para comenzar la simulación.";
    if (usePreparedStatement) return "DEFENSA ACTIVA: La Defensa Preparada (Prepared Statements) separa la lógica de los datos. La base de datos interpreta tu inyección literalmente como un texto ('+OR+1=1--') en lugar de comandos SQL. El ataque ha sido neutralizado.";
    if (activeScenario === "login" && hasExecuted) return "ATAQUE EXITOSO: Al inyectar ' OR 1=1--, el motor SQL evalúa la condición de usuario como Verdadera para todos los registros. El doble guión (--) ignora la comprobación de contraseña. Has ingresado como Admin.";
    if (activeScenario === "hidden" && hasExecuted) return "ATAQUE EXITOSO: La inyección cerró la comilla de la categoría y añadió OR 1=1, lo que hace que la base de datos devuelva TODOS los productos, ignorando el filtro 'isHidden = 0'.";
    if (activeScenario === "union" && hasExecuted) return "ATAQUE EXITOSO: El comando UNION unió la tabla de productos con la tabla de usuarios. La tienda ahora está filtrando contraseñas confidenciales en la interfaz pública.";
    if (activeScenario === "drop" && hasExecuted) return "ATAQUE EXITOSO: El punto y coma (;) terminó la primera consulta e inició una segunda sentencia destructiva (DROP TABLE). La tabla de productos fue eliminada del servidor.";
    return "Revisa la URL o el formulario modificado y presiona el botón para ejecutar el ataque.";
  };

  // --- Views ---
  const renderStore = () => {
    let displayProducts = productsDB.filter(p => p.category === "Laptops" && !p.isHidden);
    
    if (injectedData && injectedData.length > 0 && !injectedData[0].loginError) {
      displayProducts = injectedData;
    } else if (injectedData && injectedData.length === 0) {
      displayProducts = [];
    }

    return (
      <div className="p-4 sm:p-6 bg-slate-50 dark:bg-zinc-900 min-h-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">TechElectro<span className="text-blue-600">.Shop</span></h1>
          <div className="flex flex-wrap gap-4 text-slate-600 dark:text-zinc-400 font-semibold text-sm">
            <span className="cursor-pointer hover:text-blue-600">Categories</span>
            <span className="cursor-pointer hover:text-blue-600" onClick={prepareLoginBypass}>Login</span>
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        {activeScenario !== "none" && activeScenario !== "login" && !hasExecuted && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-400 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-800 font-medium">La URL maliciosa está lista en la barra del navegador.</span>
            <button onClick={executeUrlInjection} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-700 shadow-sm transition-colors">
              Ejecutar Inyección en URL
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-400 dark:border-zinc-800 pb-2">
          <span className="text-sm font-bold text-blue-600 border-b-2 border-blue-600 px-2 pb-2">Laptops</span>
          <span className="text-sm font-semibold text-slate-700 hover:text-slate-800 dark:hover:text-zinc-300 px-2 pb-2 cursor-pointer">Phones</span>
          <span className="text-sm font-semibold text-slate-700 hover:text-slate-800 dark:hover:text-zinc-300 px-2 pb-2 cursor-pointer">Accessories</span>
        </div>

        {displayProducts.length === 0 ? (
          <div className="text-center py-10 text-slate-700">No products found for this category.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayProducts.map((p, idx) => (
              <div key={idx} className={`p-4 rounded-xl border bg-white dark:bg-zinc-950 shadow-sm flex items-center gap-4 overflow-hidden ${p.isHidden ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20' : 'border-slate-400 dark:border-zinc-800'}`}>
                <div className="text-4xl shrink-0">{p.image}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-800 dark:text-zinc-200 truncate">{p.name}</h3>
                  <div className="flex flex-wrap justify-between items-center mt-1 gap-2">
                    <span className="text-blue-600 font-black truncate">{p.price}</span>
                    <span className="text-xs font-mono text-slate-600 truncate">{p.category}</span>
                  </div>
                  {p.isHidden && <span className="inline-block mt-2 px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 text-[10px] font-bold rounded uppercase">Hidden / Unreleased</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLogin = () => (
    <div className="p-6 bg-slate-50 dark:bg-zinc-900 min-h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-slate-400 dark:border-zinc-850">
        <div className="text-center mb-6">
          <UserIcon className="w-10 h-10 mx-auto text-blue-600 mb-2" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Admin Login</h2>
          <p className="text-xs text-slate-700 mt-1">Simulación de Login Vulnerable</p>
        </div>
        
        {injectedData && injectedData[0]?.loginError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-400 dark:border-red-900/40 text-red-700 text-xs rounded-lg flex flex-wrap items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> Acceso Denegado. Credenciales inválidas.
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Username</label>
            <input 
              type="text" 
              value={loginUser}
              onChange={(e) => setLoginUser(e.target.value)}
              className={`w-full text-sm px-3 py-2 border rounded-lg bg-slate-100 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${activeScenario === 'login' && !hasExecuted ? 'border-red-400 ring-2 ring-red-100 dark:ring-red-900/30 text-red-600 font-bold' : 'border-slate-400 dark:border-zinc-800'}`} 
              placeholder="admin" 
            />
            {activeScenario === 'login' && !hasExecuted && <p className="text-[10px] text-red-500 mt-1 font-semibold">¡Campo autocompletado con inyección! Puedes editarlo.</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Password</label>
            <input 
              type="password" 
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-400 dark:border-zinc-800 rounded-lg bg-slate-100 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="••••••••" 
            />
            {activeScenario === 'login' && !hasExecuted && <p className="text-[10px] text-slate-700 mt-1">Escribe cualquier clave, el motor SQL la ignorará.</p>}
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors cursor-pointer shadow-sm">
            Sign In
          </button>
        </form>
        <button onClick={resetSimulation} className="mt-4 text-xs text-blue-600 font-semibold hover:underline w-full text-center cursor-pointer">Back to Store</button>
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="p-6 bg-slate-50 dark:bg-zinc-900 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-black text-emerald-600 tracking-tight flex flex-wrap items-center gap-2">
          <ShieldCheck className="w-6 h-6" /> Security Dashboard
        </h1>
        <button onClick={resetSimulation} className="text-xs font-bold bg-slate-200 dark:bg-zinc-800 px-3 py-1.5 rounded-lg hover:bg-slate-300 dark:hover:bg-zinc-700 cursor-pointer">Logout</button>
      </div>
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-emerald-400 dark:border-emerald-900 p-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-4 flex flex-wrap items-center gap-2">
          <Database className="w-4 h-4 text-emerald-500" /> Database: Registered Users
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-400 dark:border-zinc-800 text-slate-700">
                <th className="pb-2 px-2">ID</th>
                <th className="pb-2 px-2">Username</th>
                <th className="pb-2 px-2">Plaintext Password</th>
                <th className="pb-2 px-2">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
              {usersDB.map(u => (
                <tr key={u.id} className="text-slate-700 dark:text-zinc-300 bg-emerald-50/50 dark:bg-emerald-900/10">
                  <td className="py-3 px-2">{u.id}</td>
                  <td className="py-3 px-2 font-bold">{u.user}</td>
                  <td className="py-3 px-2 font-mono text-red-500">{u.pass}</td>
                  <td className="py-3 px-2">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="p-6 bg-white dark:bg-black min-h-full flex flex-col items-center justify-center text-center">
      <ShieldAlert className="w-16 h-16 text-red-600 mb-4" />
      <h1 className="text-2xl font-black text-slate-800 dark:text-zinc-100 mb-2">500 Internal Server Error</h1>
      <p className="text-slate-600 dark:text-zinc-400 font-mono text-sm max-w-md">
        java.sql.SQLSyntaxErrorException: Table 'techelectro.products' doesn't exist
      </p>
      <button onClick={resetSimulation} className="mt-8 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 cursor-pointer">Reset Database</button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 items-stretch w-full">
      
      {/* TOP ROW: Controls & Browser */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT: Controls & Explainers */}
        <div className="xl:col-span-4 flex flex-col justify-between space-y-4">
          
          {/* Actions Panel */}
          <div className="bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-850 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-400 dark:border-zinc-850 p-4">
              <h3 className="font-bold text-slate-800 dark:text-zinc-200 flex flex-wrap items-center gap-2 text-sm">
                <Terminal className="w-4 h-4 text-indigo-500" /> Panel de Inyecciones
              </h3>
              <p className="text-xs text-slate-700 mt-1">Selecciona un ataque. El simulador preparará la inyección para que puedas observarla antes de ejecutarla.</p>
            </div>
            <div className="p-4 space-y-3">
              <button onClick={prepareLoginBypass} className={`w-full text-left p-3 rounded-lg border transition-all group cursor-pointer ${activeScenario === 'login' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-400 dark:border-zinc-800 hover:border-indigo-400 dark:border-indigo-900/40'}`}>
                <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-1">1. Bypass de Login</div>
                <div className="text-[10px] font-mono text-slate-700 bg-slate-100 dark:bg-zinc-900 p-1 rounded">' OR 1=1--</div>
              </button>
              <button onClick={prepareHiddenItems} className={`w-full text-left p-3 rounded-lg border transition-all group cursor-pointer ${activeScenario === 'hidden' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-400 dark:border-zinc-800 hover:border-amber-400 dark:border-amber-900/40'}`}>
                <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 mb-1">2. Revelar Datos Ocultos (URL)</div>
                <div className="text-[10px] font-mono text-slate-700 bg-slate-100 dark:bg-zinc-900 p-1 rounded">'+OR+1=1--</div>
              </button>
              <button onClick={prepareUnion} className={`w-full text-left p-3 rounded-lg border transition-all group cursor-pointer ${activeScenario === 'union' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-400 dark:border-zinc-800 hover:border-red-400 dark:border-red-900/40'}`}>
                <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-red-600 dark:group-hover:text-red-400 mb-1">3. Inyección UNION (Exfiltración)</div>
                <div className="text-[10px] font-mono text-slate-700 bg-slate-100 dark:bg-zinc-900 p-1 rounded">' UNION SELECT user, pass FROM users--</div>
              </button>
              <button onClick={prepareDrop} className={`w-full text-left p-3 rounded-lg border transition-all group cursor-pointer ${activeScenario === 'drop' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-400 dark:border-zinc-800 hover:border-purple-400 dark:border-purple-900/40'}`}>
                <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 mb-1">4. Consulta Destructiva (DROP)</div>
                <div className="text-[10px] font-mono text-slate-700 bg-slate-100 dark:bg-zinc-900 p-1 rounded">'; DROP TABLE products--</div>
              </button>
            </div>
          </div>
  
          {/* Defense Toggle */}
          <div className="bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-850 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex flex-wrap items-center gap-2">
                <ShieldCheck className={`w-5 h-5 ${usePreparedStatement ? 'text-emerald-500' : 'text-slate-600'}`} />
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Defensa Preparada</span>
              </div>
              <button
                onClick={() => { setUsePreparedStatement(!usePreparedStatement); resetSimulation(); }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${usePreparedStatement ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${usePreparedStatement ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <p className="text-[10px] text-slate-700">
              <strong>Defensa Activa:</strong> Al encender esto, el código usa parámetros seguros. Evita que la entrada del usuario se evalúe como código SQL. Intenta inyectar con esto encendido para ver cómo falla el ataque.
            </p>
          </div>
  
        </div>
  
        {/* RIGHT: Browser Window */}
        <div className="xl:col-span-8 relative min-h-[500px] xl:min-h-0">
          <div className="xl:absolute xl:inset-0 w-full flex flex-col h-full bg-white dark:bg-zinc-950 rounded-xl border border-slate-500 dark:border-zinc-700 shadow-xl overflow-hidden">
            {/* Browser Top Bar */}
          <div className="bg-slate-100 dark:bg-zinc-900 border-b border-slate-500 dark:border-zinc-800 flex flex-wrap items-center px-3 py-2 gap-3">
            <div className="flex flex-wrap gap-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500"></div>
            </div>
            <div className="flex flex-wrap gap-2 text-slate-600 shrink-0">
              <ChevronLeft className="w-4 h-4 cursor-not-allowed" />
              <ChevronRight className="w-4 h-4 cursor-not-allowed" />
              <RefreshCw className="w-4 h-4 cursor-pointer hover:text-slate-600 dark:hover:text-zinc-200" onClick={resetSimulation} />
            </div>
            {renderUrlBar()}
          </div>
  
          {/* Browser Content */}
            <div className="flex-1 overflow-y-auto">
              {currentView === "store" && renderStore()}
              {currentView === "login" && renderLogin()}
              {currentView === "admin" && renderAdmin()}
              {currentView === "error" && renderError()}
            </div>
          </div>
        </div>
        
      </div> {/* Closes Top Row Grid */}

      {/* BOTTOM ROW: Dynamic Context Panel (Monitor & Explanations) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SQL Query Monitor */}
        <div className="bg-slate-950 dark:bg-black rounded-xl border border-slate-800 overflow-hidden flex flex-col shadow-md min-h-[120px]">
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-900 dark:bg-zinc-950 border-b border-slate-800 flex flex-wrap items-center gap-2">
            <Database className="h-4 w-4 text-emerald-400" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-600 font-bold">Consulta Ejecutada en Backend</span>
          </div>
          <div className="p-4 font-mono text-[11px] text-emerald-300 flex-1 flex items-center bg-slate-50 dark:bg-slate-950/30">
            <pre className="whitespace-pre-wrap leading-relaxed break-all w-full">
              {renderRawQuery()}
            </pre>
          </div>
        </div>
  
        {/* Explanation Box */}
        <div className={`rounded-xl border p-4 shadow-md flex flex-col justify-center gap-2 min-h-[120px] ${usePreparedStatement ? 'bg-emerald-50 border-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900' : 'bg-amber-50 border-amber-400 dark:bg-amber-950/30 dark:border-amber-900'}`}>
          <div className="flex flex-wrap items-center gap-2">
            <Info className={`w-5 h-5 ${usePreparedStatement ? 'text-emerald-500' : 'text-amber-500'}`} />
            <h3 className={`font-bold text-sm ${usePreparedStatement ? 'text-emerald-800 dark:text-emerald-400' : 'text-amber-800 dark:text-amber-400'}`}>Análisis de la Ejecución</h3>
          </div>
          <p className={`text-xs font-medium leading-relaxed ${usePreparedStatement ? 'text-emerald-700 dark:text-emerald-500' : 'text-amber-700 dark:text-amber-500'}`}>
            {getExplanation()}
          </p>
        </div>
        
      </div> {/* Closes Bottom Row Grid */}
      
    </div>
  );
}
