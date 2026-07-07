"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  Terminal as TerminalIcon, 
  Shield, 
  Sparkles, 
  ArrowRight, 
  Globe, 
  Cpu, 
  Settings, 
  Download, 
  Key,
  Moon,
  Sun,
  Search,
  Volume2,
  Mic,
  Trash2,
  Send,
  Loader2,
  User,
  Monitor
} from "lucide-react";

// Types
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Scheme {
  id: string;
  name: string;
  ministry: string;
  description: string;
  eligibility: string;
  documents: string[];
  subsidy: string;
  approvalTime: string;
  category: string;
}

const SCHEMES_DATABASE: Scheme[] = [
  {
    id: "pm-kisan",
    name: "PM-Kisan Samman Nidhi",
    ministry: "Ministry of Agriculture",
    description: "Financial assistance to all landholding farmer families across the country.",
    eligibility: "Small and marginal farmers holding cultivable land up to 2 hectares.",
    documents: ["Aadhaar Card", "Land Khatauni Copy", "Bank Account Details"],
    subsidy: "₹6,000 per year (3 installments of ₹2,000)",
    approvalTime: "15-30 Days",
    category: "Agriculture"
  },
  {
    id: "ayushman-bharat",
    name: "Ayushman Bharat (PM-JAY)",
    ministry: "Ministry of Health",
    description: "National health insurance scheme targeting low-income families.",
    eligibility: "Listed in SECC-2011 database or holding priority ration card.",
    documents: ["Aadhaar Card", "Ration Card", "Income Certificate"],
    subsidy: "Cashless health cover up to ₹5 Lakh/family/year",
    approvalTime: "7-10 Days",
    category: "Healthcare"
  },
  {
    id: "pm-awas",
    name: "PM Awas Yojana (PMAY-G)",
    ministry: "Ministry of Rural Development",
    description: "Housing scheme providing subsidies to build pucca houses with basic amenities.",
    eligibility: "Families living in kutcha houses or homeless citizens in rural areas.",
    documents: ["Aadhaar Card", "MGNREGA Job Card", "Swachh Bharat Mission ID"],
    subsidy: "Up to ₹1.2 Lakh (Plains) / ₹1.3 Lakh (Hills)",
    approvalTime: "45-60 Days",
    category: "Housing"
  },
  {
    id: "atal-pension",
    name: "Atal Pension Yojana (APY)",
    ministry: "Ministry of Finance",
    description: "Pension scheme for citizens in the unorganised sector.",
    eligibility: "Indian citizens aged between 18 and 40 years holding a savings account.",
    documents: ["Aadhaar Card", "Savings Bank Account info", "Mobile Number"],
    subsidy: "Guaranteed minimum pension of ₹1,000 to ₹5,000/month",
    approvalTime: "Instantly via bank",
    category: "Pension"
  }
];

const TERMINAL_PRESETS = [
  {
    label: "Check PM-Kisan Eligibility",
    query: "Am I eligible for PM-Kisan? I own 1.5 hectares of agricultural land and my Aadhaar is linked.",
    response: `### PM-Kisan Samman Nidhi Eligibility Verified ✔️
  
* **Status**: **ELIGIBLE** (Landholding is 1.5 hectares, below the 2.0-hectare ceiling).
* **Direct Benefit Transfer (DBT)**: Ready. Aadhaar is successfully linked to your bank account.
* **Immediate Benefits**: ₹6,000 / year (₹2,000 every 4 months).

**Next Steps**:
1. Scan QR to open PM-Kisan official application.
2. Verify bank e-KYC status. (I can auto-fill this form for you)`
  },
  {
    label: "Report Road Pothole",
    query: "Report a dangerous pothole near Dwarka Sector 10 metro station causing traffic jams.",
    response: `### Civic Grievance Draft Formed ⚠️
  
* **Grievance Type**: Road Infrastructure Hazard
* **Location**: Sector-10 Metro Road, Dwarka, New Delhi (Coords: 28.5812, 77.0591)
* **Suggested Agency**: Delhi Development Authority / Municipal Corporation
* **Urgency**: Critical (High traffic zone)

**Drafting Grievance**:
"Sir/Madam, multiple major potholes near Sector 10 Metro entrance pose a risk to commuters. Requesting urgent repair."
*Status: Ready to submit to CPGRAMS Portal.*`
  }
];

export default function Home() {
  // Session / Name Login States
  const [userName, setUserName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState("Browser Client");

  // Theme & Accessibility Settings
  const [theme, setTheme] = useState<"dark" | "light" | "contrast">("dark");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<"home" | "assistant" | "schemes" | "admin">("home");

  // Global search / Command Palette search
  const [searchQuery, setSearchQuery] = useState("");

  // Speech assistant mocks
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // API State
  const [apiKey, setApiKey] = useState("");

  // AI Assistant States
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  // Scheme Finder States
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [eligibilityAge, setEligibilityAge] = useState("30");
  const [eligibilityIncome, setEligibilityIncome] = useState("150000");
  const [eligibilityState, setEligibilityState] = useState("Delhi");
  const [compareSchemeA, setCompareSchemeA] = useState("pm-kisan");
  const [compareSchemeB, setCompareSchemeB] = useState("ayushman-bharat");

  // Admin Panel states
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPasswordError, setAdminPasswordError] = useState("");
  const [adminLogs, setAdminLogs] = useState<string[]>([
    "System Initialized successfully.",
    "Gemini Model 3.5 API Handshake established.",
    "Database index loaded: 5,420 welfare policies.",
    "Security check: JWT Token validation OK."
  ]);

  // Terminal Typing Animation Effect
  const [activePreset, setActivePreset] = useState(0);
  const [terminalText, setTerminalText] = useState("");
  const [terminalResponse, setTerminalResponse] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    setIsTyping(true);
    setTerminalText("");
    setTerminalResponse("");
    
    const targetQuery = TERMINAL_PRESETS[activePreset].query;
    let index = 0;
    
    const type = () => {
      if (index < targetQuery.length) {
        setTerminalText((prev) => prev + targetQuery.charAt(index));
        index++;
        timer = setTimeout(type, 30);
      } else {
        setIsTyping(false);
        setTimeout(() => {
          setTerminalResponse(TERMINAL_PRESETS[activePreset].response);
        }, 600);
      }
    };
    
    type();
    
    return () => clearTimeout(timer);
  }, [activePreset]);

  // Load configuration settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("gemini_api_key");
      if (savedKey) setApiKey(savedKey);
      const savedTheme = localStorage.getItem("smart_theme");
      if (savedTheme) setTheme(savedTheme as any);
      const savedName = localStorage.getItem("smart_user_name");
      if (savedName) {
        setUserName(savedName);
        setIsSessionStarted(true);
      }
      // Simple UserAgent Parser for client machine detection
      const ua = navigator.userAgent;
      if (ua.includes("Windows")) setDeviceInfo("Windows PC (Local Client)");
      else if (ua.includes("Macintosh")) setDeviceInfo("macOS Client");
      else if (ua.includes("iPhone")) setDeviceInfo("iPhone Mobile Client");
      else if (ua.includes("Android")) setDeviceInfo("Android Mobile Client");
      else setDeviceInfo("Browser Agent");
    }
    setChatHistory([
      { role: "assistant", content: "Namaste! I am Smart Bharat AI. You can test civic queries here. Enter your Gemini API key in the connection console above to query live Gemini 3.5 Flash!" }
    ]);
  }, []);

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setUserName(nameInput);
    setIsSessionStarted(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("smart_user_name", nameInput);
    }
  };

  const handleLogout = () => {
    setUserName("");
    setNameInput("");
    setIsSessionStarted(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("smart_user_name");
    }
  };

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("gemini_api_key", val);
    }
  };

  const handleThemeChange = (mode: "dark" | "light" | "contrast") => {
    setTheme(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("smart_theme", mode);
    }
  };

  // Keyboard shortcut listener for Command Palette (Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Text to Speech Simulator
  const triggerTextToSpeech = (text: string) => {
    if (isSpeaking) {
      setIsSpeaking(false);
      window.speechSynthesis.cancel();
      return;
    }
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Speech to Text Simulator
  const triggerSpeechToText = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setChatInput("Check eligibility documents for PM-Kisan.");
    }, 2000);
  };

  // AI Chat query submit
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: Message = { role: "user", content: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatHistory, userMsg],
          queryType: "general",
          userApiKey: apiKey
        })
      });
      const data = await response.json();
      setChatHistory(prev => [...prev, { role: "assistant", content: data.content }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: "assistant", content: "AI link error. Using default local response module." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Admin authenticate action
  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "1234") {
      setIsAdminUnlocked(true);
      setAdminPasswordError("");
      setAdminLogs(prev => [`Admin authenticated: ${userName} via ${deviceInfo}`, ...prev]);
    } else {
      setAdminPasswordError("Invalid Password. Hint: 1234");
    }
  };

  const getFontSizeClass = () => {
    if (fontSize === "sm") return "text-sm";
    if (fontSize === "lg") return "text-xl";
    return "text-base";
  };

  // ==================== WELCOME SPLASH GATE ====================
  if (!isSessionStarted) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        theme === "dark" ? "bg-[#050816] text-slate-100" :
        theme === "contrast" ? "bg-black text-white" :
        "bg-slate-50 text-slate-900"
      }`}>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl space-y-6 ${
            theme === "dark" ? "bg-slate-900/60 border-white/10" :
            theme === "contrast" ? "bg-black border-white border-2" :
            "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3 justify-center mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-white to-green-500">
                Smart Bharat
              </span>
              <span className="block text-[10px] text-brand-accent tracking-wider font-semibold uppercase">AI Civic Companion</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-white">Start Your Session</h3>
            <p className="text-xs text-slate-400">Welcome to PromptWars 2026. Please share your name to personalize your citizen workspace.</p>
          </div>

          <form onSubmit={handleStartSession} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold block uppercase">Tell us your name</label>
              <input 
                type="text" 
                placeholder="e.g. Rajesh Kumar" 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-center font-semibold text-white focus:outline-none focus:border-brand-primary"
                required
              />
            </div>
            <button type="submit" className="w-full py-3 bg-brand-primary hover:bg-brand-primary/95 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">
              Enter Workspace <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getFontSizeClass()} ${dyslexicFont ? "font-serif tracking-wide" : "font-sans"} ${
      theme === "dark" ? "bg-[#050816] text-slate-100" :
      theme === "contrast" ? "bg-black text-white" :
      "bg-slate-50 text-slate-900"
    }`}>
      
      {theme === "dark" && (
        <>
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[160px] pointer-events-none" />
        </>
      )}

      {/* HEADER / NAVIGATION */}
      <header className={`sticky top-0 z-40 w-full backdrop-blur-md border-b ${
        theme === "dark" ? "bg-[#050816]/80 border-white/10" :
        theme === "contrast" ? "bg-black border-white border-2" :
        "bg-white/80 border-slate-200"
      }`}>
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("home")}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-white to-green-500">
                Smart Bharat
              </span>
              <span className="block text-[9px] text-brand-accent tracking-wider font-semibold uppercase">AI Civic Platform</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1.5 font-medium text-xs">
            {[
              { id: "home", label: "Home" },
              { id: "assistant", label: "AI Companion" },
              { id: "schemes", label: "Scheme Finder" },
              { id: "admin", label: "Admin Panel" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg transition-all ${
                  activeTab === tab.id 
                    ? "bg-brand-primary text-white font-semibold shadow-md" 
                    : theme === "dark" 
                      ? "text-slate-400 hover:text-white hover:bg-white/5" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            
            {/* User Session menu */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs">
              <User className="w-3.5 h-3.5 text-brand-accent" />
              <span className="font-semibold text-slate-300 truncate max-w-24">{userName}</span>
              <button onClick={handleLogout} className="text-[10px] text-slate-500 hover:text-red-400 font-bold ml-1">Exit</button>
            </div>

            <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
              <button onClick={() => setFontSize("sm")} className="px-2 py-1 text-xs hover:bg-white/10">A-</button>
              <button onClick={() => setFontSize("base")} className="px-2 py-1 text-xs hover:bg-white/10 border-x border-white/10">A</button>
              <button onClick={() => setFontSize("lg")} className="px-2 py-1 text-xs hover:bg-white/10">A+</button>
            </div>

            <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
              <button onClick={() => handleThemeChange("dark")} className={`p-1.5 ${theme === "dark" ? "bg-brand-primary text-white" : "hover:bg-white/10"}`}><Moon className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleThemeChange("light")} className={`p-1.5 border-x border-white/10 ${theme === "light" ? "bg-brand-primary text-white" : "hover:bg-white/10"}`}><Sun className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleThemeChange("contrast")} className={`p-1.5 text-xs font-bold ${theme === "contrast" ? "bg-yellow-500 text-black" : "hover:bg-white/10 text-brand-accent"}`}>HC</button>
            </div>
          </div>
        </div>
      </header>

      {/* COMMAND PALETTE */}
      <AnimatePresence>
        {showCommandPalette && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg rounded-2xl border p-5 shadow-2xl ${
                theme === "dark" ? "bg-slate-900 border-white/15 text-slate-100" :
                theme === "contrast" ? "bg-black border-white text-white" :
                "bg-white border-slate-300 text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-4">
                <Search className="w-5 h-5 text-brand-accent" />
                <input 
                  type="text" 
                  placeholder="Type a feature name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm focus:outline-none focus:ring-0 placeholder:text-slate-500"
                  autoFocus
                />
                <button onClick={() => setShowCommandPalette(false)} className="text-xs text-slate-400 hover:text-white">Close</button>
              </div>

              <div className="space-y-1 text-xs">
                {[
                  { id: "assistant", label: "Smart AI Chat Companion" },
                  { id: "schemes", label: "Scheme Finder & Eligibility" },
                  { id: "admin", label: "Admin Analytics Panel" }
                ].filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
                 .map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setShowCommandPalette(false);
                      setSearchQuery("");
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-brand-primary hover:text-white transition-all flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* API KEY SETTINGS */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-8 mt-4">
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          theme === "dark" ? "bg-slate-900/60 border-white/5" :
          theme === "contrast" ? "bg-black border-white" :
          "bg-white border-slate-200"
        }`}>
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-brand-primary" />
            <div>
              <p className="font-semibold text-xs text-white">Live AI Settings Console</p>
              <p className="text-[11px] text-slate-400">Add your Gemini API Key below to run queries on live models.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="password"
              placeholder="Paste GEMINI_API_KEY..."
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              className="bg-slate-950 border border-white/10 text-xs px-3 py-1.5 rounded-lg font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-brand-primary w-64"
            />
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER CONTENT */}
      <main className="max-w-[1400px] mx-auto px-5 md:px-8 py-6">
        
        {/* ==================== TAB 1: HOME ==================== */}
        {activeTab === "home" && (
          <div className="space-y-24">
            
            {/* HERO SECTION */}
            <section className="py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 text-left">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs font-semibold text-brand-accent">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Namaste, {userName}!
                </span>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
                  Bridging Citizens and Public Governance with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-accent to-emerald-400">Generative AI</span>
                </h1>

                <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl">
                  Explore eligibility for central/state schemes, receive personalized assistance, and simplify access to key public welfare options.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button onClick={() => setActiveTab("assistant")} className="px-6 py-3 rounded-xl font-semibold bg-brand-primary hover:bg-brand-primary/95 text-white flex items-center gap-2 text-xs transition-all hover:scale-[1.02]">
                    Chat with AI Companion <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => setActiveTab("schemes")} className="px-6 py-3 rounded-xl font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs transition-all">
                    Check Scheme Eligibility
                  </button>
                </div>
              </div>

              {/* HERO RIGHT TERMINAL WIDGET */}
              <div className="lg:col-span-5 flex flex-col items-stretch">
                <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col h-[400px]">
                  
                  {/* Top bar */}
                  <div className="bg-slate-900/80 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                      <TerminalIcon className="w-3.5 h-3.5 text-brand-accent" />
                      smartbharat-terminal.sh
                    </div>
                    <div className="w-8" />
                  </div>

                  {/* Preset buttons */}
                  <div className="bg-slate-950/60 px-4 py-2 border-b border-white/5 flex gap-2 overflow-x-auto">
                    {TERMINAL_PRESETS.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => setActivePreset(index)}
                        className={`px-3 py-1 rounded text-xs font-mono transition-all whitespace-nowrap ${
                          activePreset === index 
                            ? "bg-brand-primary/20 text-brand-accent border border-brand-primary/30" 
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        Preset {index + 1}
                      </button>
                    ))}
                  </div>

                  {/* Typing Screen */}
                  <div className="p-5 font-mono text-xs overflow-y-auto flex-1 bg-slate-950/90 text-left space-y-4">
                    <div>
                      <span className="text-brand-accent">{userName.toLowerCase().replace(/\s+/g, "")}@smartbharat:~$</span>{" "}
                      <span className="text-slate-100">{terminalText}</span>
                      {isTyping && <span className="inline-block w-2 h-4 bg-brand-accent animate-pulse ml-0.5" />}
                    </div>

                    {terminalResponse && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-slate-300 border-t border-white/5 pt-3 text-xs whitespace-pre-wrap leading-relaxed"
                      >
                        {terminalResponse}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* ==================== TAB 2: AI COMPANION ==================== */}
        {activeTab === "assistant" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-[600px]">
            
            {/* Sidebar Controls */}
            <div className="lg:col-span-3 glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div className="space-y-6 text-left">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">AI Chat Controls</h3>
                  <p className="text-[11px] text-slate-400">Enhance your civic conversation details.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold block uppercase">Select Dialect</label>
                  <select 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-slate-950 text-xs p-2 rounded-lg border border-white/10 text-slate-300 focus:outline-none"
                  >
                    <option>English</option>
                    <option>Hindi (हिन्दी)</option>
                    <option>Tamil (தமிழ்)</option>
                    <option>Telugu (తెలుగు)</option>
                    <option>Bengali (বাংলা)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold block uppercase">Quick Queries</label>
                  {[
                    "Am I eligible for PM-Kisan?",
                    "Check documents for Ayushman Bharat",
                    "How do I file a roadside grievance?"
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setChatInput(preset)}
                      className="w-full text-left p-2 rounded bg-white/5 border border-white/5 hover:bg-brand-primary/15 hover:border-brand-primary/30 text-[11px] text-slate-300 transition-all truncate"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setChatHistory([{ role: "assistant", content: "Namaste! Chat history cleared." }])}
                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear History
              </button>
            </div>

            {/* Chat Box */}
            <div className="lg:col-span-9 glass-panel rounded-2xl border border-white/10 flex flex-col justify-between overflow-hidden bg-slate-900/10">
              
              <div className="bg-slate-900/80 px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5 text-brand-primary" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Smart Bharat AI Companion</h4>
                    <p className="text-[10px] text-emerald-400 font-semibold">Active & Connective</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={triggerSpeechToText}
                    className={`p-2 rounded-lg border transition-all ${
                      isListening ? "bg-red-500 border-red-600 text-white animate-pulse" : "border-white/10 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                  
                  <button 
                    onClick={() => {
                      const text = chatHistory.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join("\n\n");
                      const blob = new Blob([text], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "smart-bharat-chat.txt";
                      a.click();
                    }}
                    className="p-2 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Chat history */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 text-left">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-brand-primary text-white" 
                        : "bg-slate-900 border border-white/5 text-slate-300 font-mono whitespace-pre-wrap"
                    }`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] opacity-75 font-bold uppercase">
                          {msg.role === "user" ? userName : "Smart Bharat AI"}
                        </span>
                        {msg.role === "assistant" && (
                          <button 
                            onClick={() => triggerTextToSpeech(msg.content)}
                            className="text-slate-500 hover:text-slate-300 ml-4"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-xs flex items-center gap-2 text-slate-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-accent" />
                      Gemini is generating response...
                    </div>
                  </div>
                )}
              </div>

              {/* Inputs */}
              <form onSubmit={handleSendChat} className="p-4 border-t border-white/5 bg-slate-950/70 flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ask anything about Indian government welfare, policies or criteria..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-primary"
                />
                <button type="submit" disabled={isAiLoading} className="px-5 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-xs font-semibold flex items-center">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: SCHEME FINDER ==================== */}
        {activeTab === "schemes" && (
          <div className="space-y-12">
            
            {/* Eligibility controls */}
            <div className={`p-6 rounded-2xl border text-left ${
              theme === "dark" ? "bg-slate-900/60 border-white/5" :
              theme === "contrast" ? "bg-black border-white" :
              "bg-white border-slate-200"
            }`}>
              <h3 className="text-lg font-bold text-white mb-4">Welfare Policy Filter & Calculator</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold block uppercase">Policy Category</label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-white/10 text-slate-300"
                  >
                    <option>All</option>
                    <option>Agriculture</option>
                    <option>Healthcare</option>
                    <option>Housing</option>
                    <option>Pension</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold block uppercase">Citizen Age</label>
                  <input 
                    type="number"
                    value={eligibilityAge}
                    onChange={(e) => setEligibilityAge(e.target.value)}
                    className="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-white/10 text-slate-300 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold block uppercase">Annual Income (INR)</label>
                  <input 
                    type="number"
                    value={eligibilityIncome}
                    onChange={(e) => setEligibilityIncome(e.target.value)}
                    className="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-white/10 text-slate-300 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold block uppercase">State Residency</label>
                  <select 
                    value={eligibilityState}
                    onChange={(e) => setEligibilityState(e.target.value)}
                    className="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-white/10 text-slate-300"
                  >
                    <option>Delhi</option>
                    <option>Uttar Pradesh</option>
                    <option>Maharashtra</option>
                    <option>Tamil Nadu</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scheme Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {SCHEMES_DATABASE
                .filter(s => selectedCategory === "All" || s.category === selectedCategory)
                .map(scheme => {
                  const isEligible = parseInt(eligibilityIncome) <= 250000;

                  return (
                    <div 
                      key={scheme.id}
                      className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between bg-slate-900/10 hover:border-brand-primary/30 transition-all duration-300"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-[10px] text-brand-accent font-bold uppercase tracking-wider">{scheme.ministry}</span>
                            <h4 className="text-xl font-bold text-white mt-1">{scheme.name}</h4>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded ${
                            isEligible ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                          }`}>
                            {isEligible ? "ELIGIBLE" : "INCOME CEILING REACHED"}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed mb-4">{scheme.description}</p>
                        
                        <div className="space-y-2 border-t border-white/5 pt-4">
                          <p className="text-xs text-slate-300 font-semibold">Eligibility Constraints:</p>
                          <p className="text-[11px] text-slate-400">{scheme.eligibility}</p>
                          
                          <p className="text-xs text-slate-300 font-semibold pt-2">Verification Checklist:</p>
                          <div className="flex flex-wrap gap-2">
                            {scheme.documents.map((doc, idx) => (
                              <span key={idx} className="text-[9px] bg-white/5 border border-white/10 rounded text-slate-400 font-mono">
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-white/5 mt-6 pt-4 text-xs font-mono">
                        <div>
                          <span className="block text-[10px] text-slate-500">BENEFITS</span>
                          <span className="text-emerald-400 font-bold">{scheme.subsidy}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] text-slate-500">APPROVAL TIME</span>
                          <span className="text-slate-300 font-bold">{scheme.approvalTime}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Side by side Comparator */}
            <div className={`p-8 rounded-2xl border text-left ${
              theme === "dark" ? "bg-slate-900/60 border-white/5" :
              theme === "contrast" ? "bg-black border-white" :
              "bg-white border-slate-200"
            }`}>
              <h3 className="text-lg font-bold text-white mb-6">Compare Policy Benefits Side-by-Side</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Select Scheme A</label>
                  <select 
                    value={compareSchemeA}
                    onChange={(e) => setCompareSchemeA(e.target.value)}
                    className="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-white/10 text-slate-300"
                  >
                    {SCHEMES_DATABASE.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Select Scheme B</label>
                  <select 
                    value={compareSchemeB}
                    onChange={(e) => setCompareSchemeB(e.target.value)}
                    className="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-white/10 text-slate-300"
                  >
                    {SCHEMES_DATABASE.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
                {(() => {
                  const schemeA = SCHEMES_DATABASE.find(s => s.id === compareSchemeA);
                  if (!schemeA) return null;
                  return (
                    <div className="space-y-4">
                      <h4 className="text-base font-bold text-brand-primary">{schemeA.name}</h4>
                      <p className="text-xs text-slate-400">{schemeA.description}</p>
                      <div>
                        <span className="block text-[9px] text-slate-500 font-bold uppercase">Assistance Scale</span>
                        <span className="text-xs text-emerald-400 font-bold">{schemeA.subsidy}</span>
                      </div>
                    </div>
                  );
                })()}

                {(() => {
                  const schemeB = SCHEMES_DATABASE.find(s => s.id === compareSchemeB);
                  if (!schemeB) return null;
                  return (
                    <div className="space-y-4 border-l border-white/10 pl-6">
                      <h4 className="text-base font-bold text-brand-accent">{schemeB.name}</h4>
                      <p className="text-xs text-slate-400">{schemeB.description}</p>
                      <div>
                        <span className="block text-[9px] text-slate-500 font-bold uppercase">Assistance Scale</span>
                        <span className="text-xs text-emerald-400 font-bold">{schemeB.subsidy}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 4: ADMIN PANEL ==================== */}
        {activeTab === "admin" && (
          <div className="space-y-8 text-left max-w-4xl mx-auto">
            
            {!isAdminUnlocked ? (
              <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center max-w-md mx-auto space-y-6 bg-slate-900/40">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center mx-auto text-brand-accent">
                  <Key className="w-6 h-6" />
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-white">Admin Authentication Required</h3>
                  <p className="text-xs text-slate-400 mt-1">Please enter the security password to unlock diagnostics.</p>
                </div>

                {adminPasswordError && (
                  <p className="text-xs text-red-400 font-mono bg-red-500/10 p-2.5 rounded-lg border border-red-500/20 font-bold">
                    {adminPasswordError}
                  </p>
                )}

                <form onSubmit={handleAdminVerify} className="space-y-4">
                  <input 
                    type="password" 
                    placeholder="Enter Admin Password..." 
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-center font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary"
                    required
                  />
                  <button type="submit" className="w-full py-3 bg-brand-primary hover:bg-brand-primary/95 text-white text-xs font-bold rounded-xl transition-all">
                    Unlock System Panel
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white">Platform Usage & Moderator Desk</h3>
                    <p className="text-xs text-slate-400">Metrics, device request logs, and API health.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsAdminUnlocked(false);
                      setAdminPassword("");
                    }}
                    className="px-4 py-2 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-lg text-xs font-bold"
                  >
                    Lock Console
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="glass-panel p-5 rounded-xl border border-white/5">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">System Uptime</span>
                    <p className="text-2xl font-bold text-white mt-1">99.98%</p>
                  </div>
                  <div className="glass-panel p-5 rounded-xl border border-white/5">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Total API Calls</span>
                    <p className="text-2xl font-bold text-white mt-1">42,920</p>
                  </div>
                  <div className="glass-panel p-5 rounded-xl border border-white/5">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Active Live Sessions</span>
                    <p className="text-2xl font-bold text-white mt-1">1 Active</p>
                  </div>
                  <div className="glass-panel p-5 rounded-xl border border-white/5">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Moderation Status</span>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">SECURE</p>
                  </div>
                </div>

                {/* DEVICE LOGS - CUSTOM SPECIFIC TO USER DEVICE ONLY */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                    <h4 className="text-sm font-bold text-white">Active Session Device Diagnostics</h4>
                    <span className="text-[10px] text-brand-accent font-semibold px-2 py-0.5 bg-brand-primary/10 border border-brand-primary/20 rounded">
                      Local Log Match
                    </span>
                  </div>

                  <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{deviceInfo}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Authenticated Session started by user: **{userName}**</p>
                      </div>
                    </div>

                    <div className="text-right text-[10px] font-mono text-slate-500">
                      <p>IP Address: **127.0.0.1** (Localhost)</p>
                      <p className="mt-0.5">Logged: Just Now</p>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-slate-950 text-slate-300">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 font-mono text-xs">
                    <span className="text-brand-accent font-bold">Smart Bharat System Diagnostics</span>
                  </div>
                  <div className="space-y-2 font-mono text-xs leading-relaxed">
                    {adminLogs.map((log, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-slate-500">[{index + 1}]</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className={`border-t bg-black/40 py-12 text-left mt-24 ${
        theme === "dark" ? "border-white/10" : "border-slate-200"
      }`}>
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="font-bold text-white">Smart Bharat Platform</span>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-2">
              National hackathon submission implementing official design guidelines and advanced artificial intelligence connectivity.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Features</h4>
            <ul className="mt-2 space-y-1 text-xs text-slate-500">
              <li><button onClick={() => setActiveTab("assistant")} className="hover:underline text-left">AI Chat Desk</button></li>
              <li><button onClick={() => setActiveTab("schemes")} className="hover:underline text-left">Eligibility check</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">GDS Hubs</h4>
            <ul className="mt-2 space-y-1 text-xs text-slate-500">
              <li><a href="https://india.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">india.gov.in</a></li>
              <li><a href="https://cpgrams.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">cpgrams.gov.in</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Developer</h4>
            <p className="text-[11px] text-slate-500 mt-2">DEVENGERS PromptWars 2026 Submission Project</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
