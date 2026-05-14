import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useCVStore } from '../store/cvStore';
import { Send, FileText, Download } from 'lucide-react';

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

  return (
    <div className="flex flex-col h-screen bg-bg">
      <div className="flex-1 flex flex-col border-r border-border h-full relative">
        <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
            <div className="flex-1">
                <div className="text-sm text-muted mb-1 flex justify-between uppercase retro-text">
                    <span>Extraction Progress</span>
                    <span>{completenessScore}%</span>
                </div>
                <div className="w-full bg-border h-2">
                    <div className="bg-accent h-2 transition-all duration-500" style={{ width: `${Math.min(completenessScore, 100)}%` }}></div>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 border ${msg.role === 'user' ? 'border-accent text-accent' : 'border-border text-text'}`}>
                {msg.role === 'user' ? '> ' : 'SYSTEM: '}{msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="border border-border text-muted p-3 blink">PROCESSING...</div>
            </div>
          )}

          {isReadyToGenerate && (
             <div className="flex flex-col items-center mt-6 mb-4 p-4 border border-accent bg-surface">
                 <div className="text-accent mb-4 text-center blink">
                    [ SYSTEM NOTIFICATION: CV DATA COMPLETE ]
                 </div>
                 <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button
                        onClick={generatePDF}
                        disabled={generatingPdf}
                        className="px-6 py-3 border border-accent text-accent hover:bg-accent hover:text-bg font-bold retro-text transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                        <FileText className="mr-2" size={18} />
                        {generatingPdf ? 'GENERATING...' : 'GENERATE CV'}
                    </button>
                    <a
                        href={pdfUrl || '#'}
                        download="my-cv.pdf"
                        onClick={(e) => {
                            if (!pdfUrl) {
                                e.preventDefault();
                            }
                        }}
                        className={`px-6 py-3 border border-accent font-bold retro-text transition-colors flex items-center justify-center ${pdfUrl ? 'bg-accent text-bg hover:opacity-90' : 'text-muted border-muted cursor-not-allowed opacity-50'}`}
                    >
                        <Download className="mr-2" size={18} />
                        DOWNLOAD PDF
                    </a>
                 </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 bg-surface border-t border-border flex gap-2">
          <span className="text-accent flex items-center">{'>'}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 bg-transparent border-b border-border px-4 py-2 text-text font-mono focus:outline-none focus:border-accent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="text-accent p-2 disabled:opacity-50 hover:bg-opacity-90"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatCV;
