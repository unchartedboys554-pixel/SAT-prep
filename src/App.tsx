import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  Settings, 
  Terminal, 
  BookOpen, 
  Calculator, 
  Calendar, 
  ChevronRight, 
  TrendingUp, 
  PlayCircle,
  Clock,
  Menu,
  Send,
  Zap,
  Target
} from 'lucide-react';
import { AgentType, Message, AppStats } from './types';
import { AGENT_CONFIGS } from './constants';
import { getChatResponse } from './services/geminiService';
import { cn } from './lib/utils';

export default function App() {
  const [currentAgent, setCurrentAgent] = useState<AgentType>('diagnostic');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Record<AgentType, Message[]>>({
    diagnostic: [],
    practice: [],
    vocabulary: [],
    planning: [],
    daily: [],
    reading: [],
    youtube: [],
    progress: []
  });
  const [stats, setStats] = useState<AppStats>({
    math: 0,
    reading: 0,
    writing: 0,
    vocab: 0,
    passages: 0,
    streak: 1,
    score: '—',
    weak: ''
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentAgent]);

  useEffect(() => {
    // Auto-greet if no messages
    if (messages[currentAgent].length === 0) {
      const greetings: Record<AgentType, string> = {
        diagnostic: `👋 Welcome to **SAT Prep Pro**! I'm your Diagnostic Agent. I'll ask you 5 quick calibration questions to figure out where you're strongest — and where we should focus. Ready to begin?`,
        practice: `🔢 Practice Agent online. Tell me which area you want to drill — Math, Reading, or Writing — and I'll fire up your first question!`,
        vocabulary: `📚 Vocabulary Agent here! I'll teach you 10 SAT words today with definitions, examples, and quizzes. Let's build that word bank!`,
        planning: `🗓️ Planning Agent ready. Tell me: **When is your SAT?** And how many days per week / hours per day can you study? I'll build your perfect schedule.`,
        daily: `📅 Daily Assignment Agent online. First question: **How much time do you have today?** (e.g., 30 min, 1 hour, 2 hours)`,
        reading: `📖 Reading Agent activated. I'll assign you a short passage and ask 3-5 SAT-style questions. Which genre do you prefer?`,
        youtube: `🎥 YouTube Resource Agent ready. Tell me what topic you're struggling with and I'll find you the best free videos!`,
        progress: `📈 Progress Tracker online. I'll give you a full summary of your performance. Ready to see how you're doing?`
      };
      
      setMessages(prev => ({
        ...prev,
        [currentAgent]: [{ role: 'assistant', content: greetings[currentAgent] }]
      }));
    }
  }, [currentAgent]);

  const parseState = (text: string) => {
    const stateMatch = text.match(/---STATE---([\s\S]*?)---END STATE---/);
    if (!stateMatch) return;

    const stateBlock = stateMatch[1];
    const newStats = { ...stats };

    const mathMatch = stateBlock.match(/math:\s*(\d+)/);
    if (mathMatch) newStats.math = parseInt(mathMatch[1]);

    const readingMatch = stateBlock.match(/reading:\s*(\d+)/);
    if (readingMatch) newStats.reading = parseInt(readingMatch[1]);

    const writingMatch = stateBlock.match(/writing:\s*(\d+)/);
    if (writingMatch) newStats.writing = parseInt(writingMatch[1]);

    const vocabMatch = stateBlock.match(/vocab_learned:\s*(\d+)/);
    if (vocabMatch) newStats.vocab = parseInt(vocabMatch[1]);

    const passageMatch = stateBlock.match(/passages_completed:\s*(\d+)/);
    if (passageMatch) newStats.passages = parseInt(passageMatch[1]);

    const streakMatch = stateBlock.match(/streak:\s*(\d+)/);
    if (streakMatch) newStats.streak = parseInt(streakMatch[1]);

    const weakMatch = stateBlock.match(/weak_areas:\s*(.+)/);
    if (weakMatch) newStats.weak = weakMatch[1].trim();

    setStats(newStats);
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    const currentAgentHistory = messages[currentAgent];

    setMessages(prev => ({
      ...prev,
      [currentAgent]: [...prev[currentAgent], userMessage]
    }));
    setInput('');
    setIsLoading(true);

    const responseText = await getChatResponse(
      AGENT_CONFIGS[currentAgent].systemPrompt,
      currentAgentHistory,
      text
    );

    const assistantMessage: Message = { role: 'assistant', content: responseText };
    setMessages(prev => ({
      ...prev,
      [currentAgent]: [...prev[currentAgent], assistantMessage]
    }));
    
    parseState(responseText);
    setIsLoading(false);
  };

  const navItems = [
    { id: 'diagnostic' as AgentType, label: 'DIAGNOSTICS', icon: Terminal },
    { id: 'practice' as AgentType, label: 'PRACTICE', icon: Calculator },
    { id: 'vocabulary' as AgentType, label: 'VOCABULARY', icon: BookOpen },
    { id: 'planning' as AgentType, label: 'PLANNING', icon: Calendar },
    { id: 'daily' as AgentType, label: 'DAILY TASK', icon: Clock },
    { id: 'reading' as AgentType, label: 'READING', icon: BookOpen },
    { id: 'youtube' as AgentType, label: 'RESOURCES', icon: PlayCircle },
    { id: 'progress' as AgentType, label: 'PROGRESS', icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-deep text-text-main">
      {/* Header */}
      <header className="h-14 flex items-center px-6 gap-4 bg-bg-panel border-b border-border-main z-50">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-text-main rounded flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-bg-deep rounded-full"></div>
          </div>
          <div className="font-display font-black text-sm tracking-widest text-text-main">
            SAT PREP PRO
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 font-mono text-[10px] text-text-muted">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          <span className="uppercase tracking-[0.2em]">{AGENT_CONFIGS[currentAgent].name}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.aside 
          initial={false}
          animate={{ width: isSidebarOpen ? 220 : 64 }}
          className="bg-bg-panel border-r border-border-main flex flex-col items-center py-4 gap-1 relative flex-shrink-0 z-40"
        >
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-3 -right-3 w-6 h-6 rounded-full bg-bg-panel border border-border-main flex items-center justify-center text-text-main text-xs hover:border-text-muted transition-all z-50 cursor-pointer shadow-xl"
          >
            {isSidebarOpen ? '‹' : '›'}
          </button>
          
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentAgent(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-3 transition-all duration-200 group relative",
                currentAgent === item.id 
                  ? "text-text-main bg-bg-sub border-l-2 border-text-main" 
                  : "text-text-muted hover:text-text-main hover:bg-bg-sub/50"
              )}
            >
              <item.icon className={cn("w-4 h-4 flex-shrink-0", currentAgent === item.id ? "text-text-main" : "text-text-muted opacity-50 group-hover:opacity-100")} />
              {isSidebarOpen && (
                <span className="text-xs font-semibold tracking-widest whitespace-nowrap overflow-hidden uppercase">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 flex min-w-0">
          <div className="flex-1 flex flex-col min-w-0 bg-bg-deep">
            {/* Sub-header / Status */}
            <div className="h-10 border-b border-border-main flex items-center px-6 gap-6 bg-bg-sub">
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-text-muted flex items-center gap-2">
                <span className="text-text-main">01</span> MISSION ACTIVE
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-text-muted flex items-center gap-2 opacity-50">
                <span>02</span> LOGS
              </div>
            </div>

            <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto messages space-y-6 pr-2">
                <AnimatePresence initial={false}>
                  {messages[currentAgent].map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        msg.role === 'user' 
                          ? "bg-bg-sub border border-border-main rounded-lg px-4 py-3 max-w-[70%] text-text-main text-sm font-mono italic"
                          : "msg-ai w-full max-w-[90%]"
                      )}>
                        {msg.role === 'assistant' ? (
                          <div className="holo-card">
                            <div className="markdown-body">
                              <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-strong:text-cyan-accent prose-em:text-magenta-accent prose-headings:font-display prose-headings:text-text-main prose-headings:tracking-widest prose-li:my-1 opacity-90">
                                <Markdown>
                                  {msg.content}
                                </Markdown>
                              </div>
                            </div>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <div className="flex gap-1.5 py-3 px-1">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="w-1 h-1 rounded-full bg-text-muted"
                      />
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="mt-auto space-y-4">
                <div className="flex flex-wrap gap-2">
                  {AGENT_CONFIGS[currentAgent].suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSend(suggestion)}
                      className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold border border-border-main bg-bg-sub text-text-muted hover:text-text-main hover:border-text-muted transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                <div className="pt-6 border-t border-border-main bg-bg-sub -mx-6 px-6 pb-6">
                  <div className="max-w-2xl mx-auto flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-text-muted">Response input</label>
                      <span className="text-[9px] text-text-muted/40 font-mono">READY // SYSTEM_OK</span>
                    </div>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Brief summary of your response..."
                        className="flex-1 bg-transparent border-b border-border-focus py-2 text-lg font-serif italic text-text-main focus:outline-none focus:border-text-main transition-colors placeholder:text-text-muted/20"
                      />
                      <button
                        disabled={isLoading}
                        onClick={() => handleSend()}
                        className="bg-text-main hover:bg-white text-bg-deep px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30"
                      >
                        SEND
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="hidden lg:flex w-72 bg-bg-sub border-l border-border-main p-6 flex-col gap-6 overflow-y-auto">
            <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted mb-2">
              Telemetry Data
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-text-muted/60 mb-2 font-bold italic">Session Intensity</div>
                <div className="bg-bg-panel border border-border-main rounded p-4">
                  <div className="font-mono text-3xl font-black text-magenta-accent tracking-tighter">
                    {stats.streak}D
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-text-muted mt-1 font-bold">Consecutive Days</div>
                </div>
              </div>

              <div>
                <div className="text-[9px] uppercase tracking-widest text-text-muted/60 mb-2 font-bold italic">Skill Matrix</div>
                <div className="space-y-4">
                  <SkillBar label="Math" value={stats.math} />
                  <SkillBar label="Reading" value={stats.reading} />
                  <SkillBar label="Writing" value={stats.writing} />
                  <SkillBar label="Vocab" value={stats.vocab * 2} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg-panel border border-border-main rounded p-3">
                  <div className="text-[8px] uppercase tracking-widest text-text-muted mb-1 font-bold">Vocab</div>
                  <div className="font-mono text-lg text-cyan-accent">{stats.vocab}</div>
                </div>
                <div className="bg-bg-panel border border-border-main rounded p-3">
                  <div className="text-[8px] uppercase tracking-widest text-text-muted mb-1 font-bold">Passages</div>
                  <div className="font-mono text-lg text-cyan-accent">{stats.passages}</div>
                </div>
              </div>

              {stats.weak && (
                <div className="border-t border-border-main pt-6">
                  <div className="text-[9px] uppercase tracking-widest text-magenta-accent mb-2 font-bold italic">Weakness Analysis</div>
                  <div className="p-4 bg-magenta-accent/[0.03] border border-magenta-accent/20 rounded font-mono text-[10px] text-text-main leading-relaxed">
                    {stats.weak}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-auto pt-6 border-t border-border-main">
              <div className="flex items-center justify-between">
                <span className="text-[8px] uppercase tracking-widest text-text-muted/40 font-bold">v1.0.4-BETA</span>
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-accent/40 animate-pulse" />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer Bar */}
      <footer className="h-8 bg-bg-footer border-t border-border-main flex items-center px-6 justify-between z-50">
        <div className="flex gap-6">
          <span className="text-[9px] uppercase tracking-widest text-text-muted/50 font-bold">Index: Ready</span>
          <span className="text-[9px] uppercase tracking-widest text-text-muted/50 font-bold">Sync: Stable</span>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-[9px] uppercase tracking-widest text-text-muted font-bold">SAT_CORE_OS</span>
        </div>
      </footer>
    </div>
  );
}

function SkillBar({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[8px] font-bold tracking-widest uppercase text-text-muted italic">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className="h-full bg-gradient-to-r from-cyan-accent to-magenta-accent"
        />
      </div>
    </div>
  );
}
