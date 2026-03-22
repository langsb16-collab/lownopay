/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { translations, faqData } from "./i18n";
import { analyzeLegalCase } from "./services/geminiService";
import { 
  Scale, 
  MessageSquare, 
  HelpCircle, 
  Globe, 
  Upload, 
  Send, 
  FileText, 
  UserCheck, 
  AlertTriangle,
  ChevronRight,
  X,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [lang, setLang] = useState("ko");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [files, setFiles] = useState<{ data: string, mimeType: string, name: string }[]>([]);
  
  const t = (key: string) => translations[lang]?.[key] || translations["en"][key] || key;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      setFiles(prev => [...prev, { data: base64, mimeType: file.type, name: file.name }]);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!input.trim() && files.length === 0) return;
    setLoading(true);
    try {
      const analysis = await analyzeLegalCase(input, lang, files);
      setResult(analysis);
      // Scroll to result
      setTimeout(() => {
        window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-white selection:bg-gold/30">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <Scale className="text-gold w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="font-bold text-xl tracking-tighter">JustiTalk</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
              <a href="#" className="hover:text-gold transition-colors">{t("chatBtn")}</a>
              <a href="#" className="hover:text-gold transition-colors">{t("faqBtn")}</a>
            </div>
            
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Globe size={14} className="text-gray-500" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer appearance-none pr-1"
              >
                {Object.keys(translations).map(l => (
                  <option key={l} value={l} className="bg-secondary">{translations[l].name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-gold/5 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto text-center animate-fade-up">
          <h1 className="text-5xl md:text-8xl font-serif font-bold tracking-tight mb-4 leading-[0.9] text-white">
            {t("headline")}
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-light leading-tight">
            {t("slogan")}
          </p>

          {/* Premium Input Box */}
          <div className="glass p-1.5 rounded-2xl shadow-2xl max-w-3xl mx-auto">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("inputPlaceholder")}
                className="w-full h-40 p-5 bg-transparent outline-none text-lg placeholder:text-gray-700 resize-none leading-snug"
              />
              
              <div className="flex items-center justify-between p-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer transition-all text-[10px] uppercase tracking-widest font-black border border-white/5">
                    <Upload size={12} className="text-gold" />
                    {t("uploadHint")}
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                  {files.length > 0 && (
                    <div className="flex gap-1">
                      {files.map((f, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                      ))}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={handleAnalyze}
                  disabled={loading || (!input.trim() && files.length === 0)}
                  className="premium-gradient premium-shadow px-6 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                  {t("consultBtn")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Result Section */}
      <main className="max-w-6xl mx-auto px-6 pb-24">
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Result Header */}
              <div className="flex items-center justify-between glass p-5 rounded-2xl border-l-2 border-l-gold">
                <div>
                  <h3 className="text-xl font-bold mb-0.5 tracking-tight">{t("resultTitle")}</h3>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{result.category}</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest text-gold font-black mb-0.5">{t("winProbability")}</div>
                  <div className="text-3xl font-black tracking-tighter">{result.winProbability}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Main Analysis */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="glass p-6 rounded-3xl">
                    <h4 className="text-sm font-black uppercase tracking-widest mb-3 flex items-center gap-2 text-gold">
                      <FileText size={16} />
                      {t("summary")}
                    </h4>
                    <p className="text-gray-300 leading-snug text-base font-light">
                      {result.summary}
                    </p>
                  </div>

                  <div className="glass p-6 rounded-3xl">
                    <h4 className="text-sm font-black uppercase tracking-widest mb-3 flex items-center gap-2 text-gold">
                      <AlertTriangle size={16} />
                      {t("legalIssues")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.legalIssues.map((issue: string, i: number) => (
                        <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-3">
                          <div className="w-1 h-1 rounded-full bg-gold mt-1.5 shrink-0" />
                          <span className="text-xs text-gray-400 leading-tight">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar Analysis */}
                <div className="space-y-4">
                  <div className="glass p-6 rounded-3xl bg-accent/5">
                    <h4 className="text-sm font-black uppercase tracking-widest mb-3 flex items-center gap-2 text-gold">
                      <UserCheck size={16} />
                      {t("strategy")}
                    </h4>
                    <div className="space-y-3">
                      {result.strategy.map((s: string, i: number) => (
                        <div key={i} className="relative pl-4 border-l border-white/10 pb-3 last:pb-0">
                          <div className="absolute left-[-3px] top-0 w-1.5 h-1.5 rounded-full bg-gold" />
                          <p className="text-xs text-gray-400 leading-tight">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass p-6 rounded-3xl">
                    <h4 className="text-sm font-black uppercase tracking-widest mb-3 text-gold">{t("documents")}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.documents.map((doc: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-white/5 rounded text-[10px] font-black uppercase tracking-wider border border-white/10 text-gray-400">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="glass p-6 rounded-3xl">
                <h4 className="text-sm font-black uppercase tracking-widest mb-6 text-center">{t("nextSteps")}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {result.nextSteps.map((step: string, i: number) => (
                    <div key={i} className="text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center text-lg font-black mx-auto">
                        {i + 1}
                      </div>
                      <p className="text-xs text-gray-400 px-2 leading-tight">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Buttons */}
      <div className="fixed bottom-8 left-8 flex flex-col gap-4 z-40">
        <button 
          onClick={() => setFaqOpen(true)}
          className="w-14 h-14 bg-gold text-black rounded-full gold-shadow flex items-center justify-center hover:scale-110 transition-transform"
        >
          <HelpCircle size={24} strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => setChatOpen(true)}
          className="w-14 h-14 bg-accent-light text-white rounded-full premium-shadow flex items-center justify-center hover:scale-110 transition-transform"
        >
          <MessageSquare size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Chat Modal */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-28 left-8 w-96 h-[500px] glass-dark shadow-2xl z-50 flex flex-col rounded-3xl overflow-hidden border border-white/10"
          >
            <div className="bg-white/5 p-4 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-bold text-sm tracking-widest uppercase">{t("chatBtn")}</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 max-w-[85%]">
                <p className="text-sm text-gray-300 leading-relaxed">Welcome to JustiTalk Global Defense. How can our AI legal engine assist you today?</p>
              </div>
            </div>

            <div className="p-4 bg-white/5 border-t border-white/5 flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Message..." 
                className="flex-1 bg-transparent border-none px-2 py-1 text-sm focus:outline-none"
              />
              <button className="p-2 text-gold hover:scale-110 transition-transform"><Send size={18} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ Modal */}
      <AnimatePresence>
        {faqOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg/80 backdrop-blur-md z-[60] flex items-center justify-center p-6"
          >
            <div className="bg-secondary w-full max-w-2xl rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
              <div className="p-8 flex justify-between items-center border-b border-white/5">
                <h3 className="text-2xl font-bold tracking-tight">{t("faqBtn")}</h3>
                <button onClick={() => setFaqOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
                {(faqData[lang] || faqData["en"]).map((item, i) => (
                  <details key={i} className="group glass-dark rounded-2xl overflow-hidden">
                    <summary className="p-5 cursor-pointer font-bold flex justify-between items-center list-none hover:bg-white/5 transition-colors">
                      {item.q}
                      <ChevronRight size={18} className="group-open:rotate-90 transition-transform text-gold" />
                    </summary>
                    <div className="p-5 text-gray-400 border-t border-white/5 leading-relaxed">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
