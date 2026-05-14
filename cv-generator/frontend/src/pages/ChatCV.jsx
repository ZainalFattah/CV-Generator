import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCVStore } from '../store/cvStore';
import { Send, FileText } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'; // In production, this should be relative or env var

function ChatCV() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState('general');
  const [generating, setGenerating] = useState(false);

  const { sessionId, setSessionId, setCvData, completenessScore, setCompletenessScore } = useCVStore();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial greeting if no messages
    if (messages.length === 0 && !loading) {
        setMessages([{ role: 'ai', content: 'Halo! Saya Kai, recruiter virtual kamu. Mari kita buat CV yang menarik bersama. Bisa mulai dengan nama lengkap dan sedikit perkenalan tentang diri kamu?' }]);
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

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Maaf, terjadi kesalahan. Bisa ulangi pesan terakhir?' }]);
    } finally {
      setLoading(false);
    }
  };

  const generateCV = async () => {
    setGenerating(true);
    try {
        const response = await axios.post(`${API_URL}/cv/generate`, {
            session_id: sessionId,
            variant: selectedVariant
        });

        if (response.data.cv_id) {
            navigate(`/preview/${response.data.cv_id}`);
        }
    } catch (error) {
        console.error("Generate error:", error);
        alert("Gagal men-generate CV.");
    } finally {
        setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-bg">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col border-r border-border h-full relative">
        {/* Progress Bar */}
        <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
            <div className="flex-1 mr-4">
                <div className="text-sm text-muted mb-1 flex justify-between">
                    <span>CV Completeness</span>
                    <span>{completenessScore}%</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(completenessScore, 100)}%` }}></div>
                </div>
            </div>
            {completenessScore >= 70 && (
                <button
                    onClick={() => setShowVariants(true)}
                    className="bg-accent-2 text-surface px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 flex items-center gap-2"
                >
                    <FileText size={18} /> Generate
                </button>
            )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-accent text-white rounded-br-none' : 'bg-surface text-text rounded-bl-none border border-border'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="bg-surface text-muted p-3 rounded-2xl rounded-bl-none border border-border">Kai is typing...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 bg-surface border-t border-border flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 bg-bg border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-accent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-accent text-white p-2 rounded-lg disabled:opacity-50 hover:bg-opacity-90"
          >
            <Send size={20} />
          </button>
        </form>

        {/* Variant Modal */}
        {showVariants && (
            <div className="absolute inset-0 bg-bg bg-opacity-90 flex items-center justify-center p-4 z-50">
                <div className="bg-surface border border-border p-6 rounded-xl max-w-md w-full">
                    <h3 className="text-xl font-bold mb-4">Choose CV Variant</h3>
                    <div className="space-y-2 mb-6">
                        {['general', 'internship', 'corporate', 'startup', 'scholarship'].map(v => (
                            <label key={v} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-accent">
                                <input
                                    type="radio"
                                    name="variant"
                                    value={v}
                                    checked={selectedVariant === v}
                                    onChange={(e) => setSelectedVariant(e.target.value)}
                                    className="text-accent"
                                />
                                <span className="capitalize">{v}</span>
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setShowVariants(false)} className="px-4 py-2 text-muted hover:text-text">Cancel</button>
                        <button
                            onClick={generateCV}
                            disabled={generating}
                            className="bg-accent text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50"
                        >
                            {generating ? 'Generating...' : 'Confirm'}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Real-time Preview Sidebar (Optional visual feedback) */}
      <div className="hidden md:flex w-1/3 bg-surface border-l border-border flex-col p-6 items-center justify-center text-center">
         <FileText size={64} className="text-muted opacity-20 mb-4" />
         <h3 className="text-xl font-bold text-muted opacity-50">Live Preview Data</h3>
         <p className="text-sm text-muted opacity-50 mt-2">Data CV kamu sedang dikumpulkan oleh Kai.</p>
         <p className="text-xs text-muted opacity-30 mt-4">Score: {completenessScore}%</p>
      </div>
    </div>
  );
}

export default ChatCV;
