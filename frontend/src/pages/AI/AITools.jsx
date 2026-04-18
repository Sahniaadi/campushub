import React, { useState, useRef, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Bot, Sparkles, Code2, HelpCircle, Send, Copy, RefreshCw, Zap } from 'lucide-react';

const TOOLS = [
  { id: 'chat',     icon: Bot,       label: 'AI Chatbot',       desc: 'Chat with your campus AI assistant', color: 'from-violet-500 to-purple-600' },
  { id: 'summarize',icon: Sparkles,  label: 'Notes Summarizer', desc: 'Paste notes, get a concise summary', color: 'from-blue-500 to-cyan-500' },
  { id: 'code',     icon: Code2,     label: 'Code Generator',   desc: 'Describe code and get it generated', color: 'from-emerald-500 to-teal-500' },
  { id: 'doubt',    icon: HelpCircle,label: 'Doubt Solver',     desc: 'Get step-by-step explanations',      color: 'from-amber-500 to-orange-500' },
];

const LANGUAGES = ['python','javascript','java','c','c++','c#','typescript','sql','html','css','bash','rust','go'];

// ── Chatbot Component ────────────────────────────────────────────────────────
function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm CampusBot 🎓 Ask me anything about your studies, career, or college life!" }
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const history = messages.filter(m => m.role !== 'bot' || messages.indexOf(m) > 0).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
      const { data } = await API.post('/ai/chat', { message: userMsg, history });
      setMessages((prev) => [...prev, { role: 'bot', text: data.data.reply }]);
    } catch { setMessages((prev) => [...prev, { role: 'bot', text: '⚠️ Error — please try again.' }]); }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[540px]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {m.role === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">AI</div>
            )}
            <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">AI</div>
            <div className="chat-bubble-bot flex gap-1 items-center px-5 py-4">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="flex gap-3 p-4 border-t border-gray-100 dark:border-gray-800">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything…" className="input flex-1" disabled={loading} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send(e)} />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-4 py-2.5">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

// ── Summarizer Component ─────────────────────────────────────────────────────
function Summarizer() {
  const [text, setText]     = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const summarize = async () => {
    if (!text.trim()) return toast.error('Paste your notes first.');
    setLoading(true);
    try {
      const { data } = await API.post('/ai/summarize', { text });
      setSummary(data.data.summary);
    } catch { toast.error('Summarization failed.'); }
    setLoading(false);
  };

  const copy = () => { navigator.clipboard.writeText(summary); toast.success('Copied!'); };

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="label">Paste your notes here</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste lecture notes, textbook content, or any study material here…" className="input resize-none" rows={7} />
        <p className="text-xs text-gray-400 mt-1">{text.length} characters</p>
      </div>
      <button onClick={summarize} disabled={loading || !text.trim()} className="btn-primary flex items-center gap-2">
        {loading ? <><div className="spinner w-4 h-4" />Summarizing…</> : <><Sparkles size={16} />Generate Summary</>}
      </button>
      {summary && (
        <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2"><Sparkles size={15} />Summary</h3>
            <div className="flex gap-2">
              <button onClick={copy} className="btn-ghost text-xs py-1 px-2"><Copy size={13} /> Copy</button>
              <button onClick={() => setSummary('')} className="btn-ghost text-xs py-1 px-2"><RefreshCw size={13} /></button>
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{summary}</p>
        </div>
      )}
    </div>
  );
}

// ── Code Generator Component ─────────────────────────────────────────────────
function CodeGen() {
  const [prompt, setPrompt] = useState('');
  const [lang, setLang]     = useState('python');
  const [code, setCode]     = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return toast.error('Describe what code you need.');
    setLoading(true);
    try {
      const { data } = await API.post('/ai/generate-code', { prompt, language: lang });
      setCode(data.data.code);
    } catch { toast.error('Code generation failed.'); }
    setLoading(false);
  };

  const copy = () => { navigator.clipboard.writeText(code); toast.success('Code copied!'); };

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="label">What code do you need?</label>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g. Binary search function with explanation…" className="input resize-none" rows={3} />
      </div>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="label">Language</label>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="input">
            {LANGUAGES.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
          </select>
        </div>
        <button onClick={generate} disabled={loading || !prompt.trim()} className="btn-primary flex items-center gap-2 h-[46px]">
          {loading ? <><div className="spinner w-4 h-4" />Generating…</> : <><Code2 size={16} />Generate</>}
        </button>
      </div>
      {code && (
        <div className="relative animate-fade-in">
          <div className="flex items-center justify-between bg-gray-800 dark:bg-gray-950 rounded-t-xl px-4 py-2">
            <span className="text-xs text-gray-400 font-mono">{lang}</span>
            <button onClick={copy} className="text-gray-400 hover:text-white text-xs flex items-center gap-1"><Copy size={12} />Copy</button>
          </div>
          <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 text-sm p-4 rounded-b-xl overflow-x-auto max-h-80 leading-relaxed font-mono">{code}</pre>
        </div>
      )}
    </div>
  );
}

// ── Doubt Solver Component ───────────────────────────────────────────────────
function DoubtSolver() {
  const [doubt, setDoubt]   = useState('');
  const [subject, setSubject] = useState('general');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const SUBJECTS = ['general','mathematics','physics','chemistry','computer science','biology','economics','history','english'];

  const solve = async () => {
    if (!doubt.trim()) return toast.error('Enter your doubt first.');
    setLoading(true);
    try {
      const { data } = await API.post('/ai/solve-doubt', { doubt, subject });
      setAnswer(data.data.answer);
    } catch { toast.error('Solver failed. Try again.'); }
    setLoading(false);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="label">Your doubt or question</label>
          <textarea value={doubt} onChange={(e) => setDoubt(e.target.value)} placeholder="e.g. Explain Newton's second law with examples…" className="input resize-none" rows={3} />
        </div>
        <div>
          <label className="label">Subject</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input h-[104px]">
            {SUBJECTS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <button onClick={solve} disabled={loading || !doubt.trim()} className="btn-primary flex items-center gap-2">
        {loading ? <><div className="spinner w-4 h-4" />Solving…</> : <><HelpCircle size={16} />Solve Doubt</>}
      </button>
      {answer && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 animate-fade-in">
          <h3 className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3">
            <HelpCircle size={15} /> Answer
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

// ── Main AI Tools Page ───────────────────────────────────────────────────────
export default function AITools() {
  const [active, setActive] = useState('chat');
  const tool = TOOLS.find((t) => t.id === active);

  const COMPONENTS = { chat: Chatbot, summarize: Summarizer, code: CodeGen, doubt: DoubtSolver };
  const ActiveComponent = COMPONENTS[active];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="page-title flex items-center gap-2"><Bot size={24} className="text-violet-600" /> AI Tools</h1>
        <p className="page-subtitle">Powered by AI to supercharge your studies</p>
      </div>

      {/* Tool selector cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {TOOLS.map((t) => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className={`p-4 rounded-2xl text-left transition-all duration-200 border-2
              ${active === t.id
                ? 'border-transparent bg-gradient-to-br ' + t.color + ' text-white shadow-glow'
                : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
          >
            <t.icon size={22} className={active === t.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
            <p className={`font-semibold text-sm mt-2 ${active === t.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{t.label}</p>
            <p className={`text-xs mt-0.5 ${active === t.id ? 'text-white/80' : 'text-gray-400'}`}>{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Active tool panel */}
      <div className="card p-0 overflow-hidden">
        <div className={`bg-gradient-to-r ${tool.color} px-6 py-4 flex items-center gap-3`}>
          <tool.icon size={20} className="text-white" />
          <div>
            <h2 className="font-bold text-white">{tool.label}</h2>
            <p className="text-white/80 text-xs">{tool.desc}</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
            <Zap size={12} className="text-white" />
            <span className="text-white text-xs font-medium">AI Powered</span>
          </div>
        </div>
        <ActiveComponent />
      </div>
    </div>
  );
}
