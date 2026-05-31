import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useCVStore } from '../store/cvStore';
import { Send, FileText, Download, User, Bot, AlertCircle, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function ChatCV() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReadyToGenerate, setIsReadyToGenerate] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const { sessionId, setSessionId, cvData, setCvData, completenessScore, setCompletenessScore } = useCVStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isReadyToGenerate]);

  useEffect(() => {
    if (messages.length === 0 && !loading) {
        setMessages([{ role: 'ai', content: 'Halo! Saya recruiter virtual kamu. Mari kita buat CV yang menarik bersama. Bisa mulai dengan nama lengkap dan sedikit perkenalan tentang diri kamu?' }]);
    }
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        session_id: sessionId,
        message: userMessage
      });

      if (!sessionId && response.data.session_id) {
          setSessionId(response.data.session_id);
      }

      setMessages(prev => [...prev, { role: 'ai', content: response.data.reply }]);

      if (response.data.cv_json) {
          setCvData(response.data.cv_json);
      }

      setCompletenessScore(response.data.completeness_score);
      setIsReadyToGenerate(response.data.is_ready_to_generate);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Maaf, terjadi kesalahan. Bisa ulangi pesan terakhir?' }]);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!cvData) return;
    setGeneratingPdf(true);
    try {
      const response = await axios.post(`${API_URL}/export`, {
        cv_json: cvData
      }, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const resetSession = () => {
    if(confirm('Are you sure you want to start over? Current progress will be lost.')) {
      setMessages([
        {
          role: 'ai',
          content: 'Halo! Saya recruiter virtual kamu. Mari kita buat CV yang menarik bersama. Bisa mulai dengan nama lengkap dan sedikit perkenalan tentang diri kamu?',
        },
      ]);
      setSessionId(null);
      setIsReadyToGenerate(false);
      setCvData(null);
      setCompletenessScore(0);
      setPdfUrl(null);
    }
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-bg text-text">
      {/* Sidebar - Progress & CV Data */}
      <div className="w-full md:w-80 lg:w-96 bg-surface border-r border-border flex flex-col shrink-0 transition-all duration-300">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold text-text mb-4">Profile Completeness</h2>

          <div className="mb-2 flex justify-between items-center">
             <span className="text-sm font-medium text-muted">Status</span>
             <span className="text-sm font-bold text-accent">{completenessScore || 0}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="bg-accent h-2 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(completenessScore || 0, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 hidden md:block">
          <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-4 border-b border-border pb-2">Live Extraction</h3>
          <div className="bg-slate-50 border border-border rounded-lg p-4 h-[calc(100%-2rem)] overflow-y-auto">
            {cvData ? (
              <pre className="text-xs font-mono text-muted whitespace-pre-wrap break-words">
                {JSON.stringify(cvData, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-muted italic">Data will appear here as we chat...</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border bg-surface flex flex-col gap-2">
            <button
                onClick={generatePDF}
                disabled={generatingPdf || !isReadyToGenerate}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all shadow-sm ${
                isReadyToGenerate
                    ? 'bg-text text-white hover:bg-slate-800 hover:shadow-md cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
            >
                <FileText size={18} />
                {generatingPdf ? 'Generating...' : 'Generate CV'}
            </button>
            <a
                href={pdfUrl || '#'}
                download="my-cv.pdf"
                onClick={(e) => {
                    if (!pdfUrl) {
                        e.preventDefault();
                    }
                }}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all shadow-sm ${pdfUrl ? 'bg-accent text-white hover:bg-indigo-700 shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'}`}
            >
                <Download size={18} />
                Download PDF
            </a>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-bg">
        {/* Header */}
        <div className="p-4 bg-surface/80 backdrop-blur-md border-b border-border z-10 flex justify-between items-center shadow-sm shrink-0">
           <h2 className="text-sm font-bold text-text">AI Copilot</h2>
           <button onClick={resetSession} className="text-xs flex items-center gap-1 text-muted hover:text-danger transition-colors font-medium">
             <RefreshCw size={14} /> Reset Session
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
              <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-indigo-100 text-accent'}`}>
                  {msg.role === 'user' ? <User size={16} className="text-slate-600" /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-text text-white rounded-tr-sm'
                    : msg.isError
                      ? 'bg-red-50 text-danger border border-red-100 rounded-tl-sm'
                      : 'bg-surface border border-border text-text rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start fade-in">
              <div className="flex gap-3 max-w-[85%] flex-row">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-100 text-accent">
                  <Bot size={16} />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-sm bg-surface border border-border flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 bg-accent rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-accent rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-accent rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-surface border-t border-border shrink-0">
          <form onSubmit={sendMessage} className="max-w-4xl mx-auto relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer..."
              className="w-full bg-surface border border-border text-text placeholder-muted px-6 py-4 pr-16 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all shadow-saas"
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 bg-accent text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-accent transition-colors shadow-sm"
            >
              <Send size={18} className={loading ? 'opacity-0' : 'opacity-100'} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatCV;
