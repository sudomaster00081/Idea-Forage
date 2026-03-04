import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  TrendingUp, 
  Users, 
  Cpu, 
  DollarSign, 
  Target, 
  ShieldAlert, 
  Download, 
  Loader2,
  ChevronRight,
  MessageSquare,
  BarChart3,
  Lightbulb,
  Settings,
  X,
  Globe,
  Zap,
  WifiOff,
  Key
} from 'lucide-react';
import Markdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { analyzeIdea, AnalysisResult, AIProvider, AIConfig } from './services/aiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // AI Configuration
  const [config, setConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem('ideaforge_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old or missing model names to the most stable alias
      if (parsed.provider === 'gemini' && (!parsed.model || parsed.model.includes('gemini-2.0') || parsed.model.includes('gemini-3'))) {
        parsed.model = 'gemini-flash-latest';
      }
      return parsed;
    }
    return { provider: 'gemini', model: 'gemini-flash-latest' };
  });

  useEffect(() => {
    localStorage.setItem('ideaforge_config', JSON.stringify(config));
  }, [config]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await analyzeIdea(idea, config);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze idea. Please check your API keys and try again.');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    doc.setFontSize(22);
    doc.text('IdeaForge AI: Business Analysis', margin, y);
    y += 15;

    doc.setFontSize(12);
    doc.text(`Idea: ${idea}`, margin, y);
    doc.text(`Provider: ${config.provider.toUpperCase()}`, margin, y + 7);
    y += 17;

    const sections = [
      { title: 'Market Demand', content: result.marketDemand },
      { title: 'Competitor Landscape', content: result.competitorLandscape },
      { title: 'Tech Feasibility', content: result.techFeasibility },
      { title: 'Cost Estimation', content: result.costEstimation },
      { title: 'Monetization Strategy', content: result.monetizationStrategy },
      { title: 'MVP Roadmap', content: result.mvpRoadmap },
      { title: 'Debate Summary', content: result.debateSummary },
    ];

    sections.forEach(section => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(16);
      doc.text(section.title, margin, y);
      y += 7;
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(section.content, 170);
      doc.text(splitText, margin, y);
      y += (splitText.length * 5) + 10;
    });

    doc.save(`IdeaForge_Analysis_${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Rocket className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">IdeaForge AI</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-full transition-colors relative"
            >
              <Settings className="w-5 h-5" />
              {config.provider !== 'gemini' && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            {result && (
              <button 
                onClick={generatePDF}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {!result ? (
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight leading-tight">
                Turn your <span className="italic text-zinc-400">vision</span> into a <span className="underline decoration-zinc-300 underline-offset-8">strategy</span>.
              </h1>
              <p className="text-zinc-500 text-lg max-w-xl mx-auto">
                IdeaForge AI uses advanced multi-agent analysis to validate your business ideas. 
                <span className="block mt-2 text-sm font-medium text-zinc-400">
                  Currently using: <span className="text-zinc-600 capitalize">{config.provider}</span>
                </span>
              </p>
            </motion.div>

            <form onSubmit={handleAnalyze} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-zinc-200 to-zinc-100 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-white rounded-2xl border border-zinc-200 p-2 shadow-sm">
                <div className="pl-4 text-zinc-400">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <input
                  type="text"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="I want to build a subscription box for urban gardeners..."
                  className="flex-1 px-4 py-4 bg-transparent outline-none text-lg placeholder:text-zinc-300"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !idea.trim()}
                  className="bg-black text-white px-8 py-4 rounded-xl font-medium hover:bg-zinc-800 disabled:bg-zinc-200 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                  {loading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              {[
                { label: 'Market Demand', icon: TrendingUp },
                { label: 'Competitors', icon: Users },
                { label: 'Feasibility', icon: Cpu },
                { label: 'Roadmap', icon: Target }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-zinc-100 flex flex-col items-center gap-2">
                  <item.icon className="w-5 h-5 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Results Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200">
              <div className="space-y-2">
                <button 
                  onClick={() => setResult(null)}
                  className="text-sm text-zinc-400 hover:text-black flex items-center gap-1 mb-4"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  New Analysis
                </button>
                <h2 className="text-4xl font-serif font-medium">{idea}</h2>
                <p className="text-zinc-500">Comprehensive Business Strategy & Validation (via {config.provider})</p>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-mono font-medium">{result.confidenceScore}%</div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Confidence Score</div>
                </div>
                <div className="h-12 w-px bg-zinc-200"></div>
                <div className="text-center">
                  <div className="text-3xl font-mono font-medium">Ready</div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Status</div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Core Analysis */}
              <div className="lg:col-span-2 space-y-8">
                <Section 
                  title="Market Demand" 
                  icon={TrendingUp} 
                  content={result.marketDemand} 
                />
                <Section 
                  title="Competitor Landscape" 
                  icon={Users} 
                  content={result.competitorLandscape} 
                />
                <Section 
                  title="MVP Roadmap" 
                  icon={Target} 
                  content={result.mvpRoadmap} 
                />
                
                {/* Multi-Agent Debate */}
                <div className="p-8 rounded-3xl bg-zinc-900 text-white space-y-6">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-zinc-400" />
                    <h3 className="text-xl font-medium">Multi-Agent Debate Summary</h3>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <Markdown>{result.debateSummary}</Markdown>
                  </div>
                </div>
              </div>

              {/* Right Column: Stats & SWOT */}
              <div className="space-y-8">
                <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-zinc-400" />
                    <h3 className="font-bold uppercase tracking-wider text-xs">SWOT Analysis</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <SWOTList title="Strengths" items={result.swot.strengths} color="text-emerald-600" />
                    <SWOTList title="Weaknesses" items={result.swot.weaknesses} color="text-amber-600" />
                    <SWOTList title="Opportunities" items={result.swot.opportunities} color="text-blue-600" />
                    <SWOTList title="Threats" items={result.swot.threats} color="text-rose-600" />
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-zinc-400" />
                    <h3 className="font-bold uppercase tracking-wider text-xs">Tech Feasibility</h3>
                  </div>
                  <div className="text-sm text-zinc-600 leading-relaxed">
                    {result.techFeasibility}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-zinc-400" />
                    <h3 className="font-bold uppercase tracking-wider text-xs">Financial Outlook</h3>
                  </div>
                  <div className="text-sm text-zinc-600 leading-relaxed">
                    {result.costEstimation}
                  </div>
                  <div className="pt-4 border-t border-zinc-100">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2">Monetization</div>
                    <div className="text-sm font-medium">{result.monetizationStrategy}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="font-bold text-lg">AI Provider Settings</h3>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Select Provider</label>
                  <div className="grid grid-cols-2 gap-2">
                    <ProviderButton 
                      active={config.provider === 'gemini'} 
                      onClick={() => setConfig({ ...config, provider: 'gemini' })}
                      icon={Globe}
                      label="Gemini"
                      sub="Default (Free)"
                    />
                    <ProviderButton 
                      active={config.provider === 'openai'} 
                      onClick={() => setConfig({ ...config, provider: 'openai', model: 'gpt-4o' })}
                      icon={Zap}
                      label="OpenAI"
                      sub="BYO Key"
                    />
                    <ProviderButton 
                      active={config.provider === 'anthropic'} 
                      onClick={() => setConfig({ ...config, provider: 'anthropic', model: 'claude-3-5-sonnet-20240620' })}
                      icon={Zap}
                      label="Anthropic"
                      sub="BYO Key"
                    />
                    <ProviderButton 
                      active={config.provider === 'ollama'} 
                      onClick={() => setConfig({ ...config, provider: 'ollama', model: 'llama3', baseUrl: 'http://localhost:11434' })}
                      icon={Cpu}
                      label="Ollama"
                      sub="Local"
                    />
                    <ProviderButton 
                      active={config.provider === 'offline'} 
                      onClick={() => setConfig({ ...config, provider: 'offline' })}
                      icon={WifiOff}
                      label="Offline"
                      sub="Simulated"
                    />
                  </div>
                </div>

                {config.provider !== 'offline' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-4 border-t border-zinc-100"
                  >
                    {config.provider !== 'ollama' && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                          <Key className="w-3 h-3" />
                          API Key {config.provider === 'gemini' && '(Optional Override)'}
                        </label>
                        <input 
                          type="password"
                          value={config.apiKey || ''}
                          onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                          placeholder={config.provider === 'gemini' ? 'Enter custom Gemini key' : `Enter your ${config.provider} key`}
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                        />
                      </div>
                    )}

                    {config.provider === 'ollama' && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Base URL</label>
                        <input 
                          type="text"
                          value={config.baseUrl || 'http://localhost:11434'}
                          onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                          placeholder="http://localhost:11434"
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Model</label>
                      {config.provider === 'ollama' ? (
                        <input 
                          type="text"
                          value={config.model || 'llama3'}
                          onChange={(e) => setConfig({ ...config, model: e.target.value })}
                          placeholder="llama3, mistral, etc."
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                        />
                      ) : (
                        <select 
                          value={config.model || ''}
                          onChange={(e) => setConfig({ ...config, model: e.target.value })}
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none"
                        >
                          {config.provider === 'openai' ? (
                            <>
                              <option value="gpt-4o">GPT-4o</option>
                              <option value="gpt-4o-mini">GPT-4o Mini</option>
                              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            </>
                          ) : config.provider === 'anthropic' ? (
                            <>
                              <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
                              <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                              <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                            </>
                          ) : (
                            <>
                              <option value="gemini-flash-latest">Gemini Flash (Recommended)</option>
                              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
                              <option value="gemini-3-flash-preview">Gemini 3 Flash</option>
                            </>
                          )}
                        </select>
                      )}
                    </div>
                  </motion.div>
                )}

                {config.provider === 'gemini' && !config.apiKey && (
                  <div className="p-4 bg-blue-50 rounded-2xl text-xs text-blue-600 leading-relaxed">
                    Using the built-in Gemini API key. You can override it above if you have your own.
                  </div>
                )}
                
                {config.provider === 'offline' && (
                  <div className="p-4 bg-zinc-50 rounded-2xl text-xs text-zinc-500 leading-relaxed">
                    Offline mode uses a simulated analysis engine. Great for testing UI without API costs.
                  </div>
                )}
              </div>

              <div className="p-6 bg-zinc-50 border-t border-zinc-100">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
                >
                  Save Configuration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-rose-50 border border-rose-200 text-rose-600 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-[110]">
          <ShieldAlert className="w-5 h-5" />
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError(null)} className="ml-2 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, content }: { title: string, icon: any, content: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-8 rounded-3xl bg-white border border-zinc-200 space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-zinc-50 rounded-lg">
          <Icon className="w-5 h-5 text-zinc-600" />
        </div>
        <h3 className="text-xl font-medium">{title}</h3>
      </div>
      <div className="prose prose-zinc max-w-none">
        <Markdown>{content}</Markdown>
      </div>
    </motion.div>
  );
}

function SWOTList({ title, items, color }: { title: string, items: string[], color: string }) {
  return (
    <div className="space-y-2">
      <div className={cn("text-[10px] uppercase tracking-widest font-bold", color)}>{title}</div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-zinc-500 flex items-start gap-2">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-zinc-300 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProviderButton({ active, onClick, icon: Icon, label, sub }: { active: boolean, onClick: () => void, icon: any, label: string, sub: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-4 rounded-2xl border text-left transition-all",
        active ? "bg-black border-black text-white shadow-lg" : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"
      )}
    >
      <Icon className={cn("w-5 h-5 mb-2", active ? "text-white" : "text-zinc-400")} />
      <div className="font-bold text-sm">{label}</div>
      <div className={cn("text-[10px] uppercase tracking-widest font-bold opacity-60")}>{sub}</div>
    </button>
  );
}
