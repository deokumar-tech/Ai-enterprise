import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Loader2, RefreshCw, AlertCircle, Lightbulb } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { useAuth } from '../context/AuthContext';

export default function ChatInterface() {
  const { api } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const samplePrompts = [
    "How do I request parental leave?",
    "Please open a request for my parental leave starting next Monday.",
    "My laptop screen is flickering and broken, I need it repaired.",
    "The air conditioning in the 3rd floor meeting room is leaking.",
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Fetch previous chat history
  const loadHistory = async () => {
    setFetchingHistory(true);
    setError('');
    try {
      const res = await api.get('/chat/history');
      if (res.data?.success && Array.isArray(res.data.history)) {
        if (res.data.history.length === 0) {
          // Add default welcome message
          setMessages([
            {
              role: 'model',
              message: "Hello! I am NexusAI, your Enterprise Assistant. You can ask me questions about enterprise policies, or simply tell me to create an IT, HR, or Facilities ticket (e.g., 'Please request 3 days of PTO next week'). How may I help you today?",
              created_at: new Date().toISOString(),
            },
          ]);
        } else {
          setMessages(res.data.history);
        }
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      setError('Could not load previous chat history. Ready for new questions.');
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setError('');
    const userMsg = {
      role: 'user',
      message: trimmed,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: trimmed });
      if (res.data?.success) {
        const aiMsg = {
          role: 'model',
          message: res.data.message,
          created_at: new Date().toISOString(),
          ticket: res.data.ticket || null,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setError(res.data?.error || 'Failed to get response from NexusAI.');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = err.response?.data?.error || 'Network error communicating with NexusAI server.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (promptText) => {
    setInput(promptText);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Chat Header Bar */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-200">
              Enterprise Knowledge & Intake Assistant
            </h2>
            <p className="text-xs text-slate-400">
              Powered by Google Gemini • RLS User Isolated
            </p>
          </div>
        </div>

        <button
          onClick={loadHistory}
          disabled={fetchingHistory}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          title="Reload History"
        >
          <RefreshCw className={`w-4 h-4 ${fetchingHistory ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="m-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {fetchingHistory ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span>Loading enterprise chat session...</span>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id || idx}
              message={msg.message}
              role={msg.role}
              createdAt={msg.created_at}
              ticket={msg.ticket}
            />
          ))
        )}

        {loading && (
          <div className="flex gap-3 my-4 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400 mt-1">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl rounded-tl-none border border-slate-700/60 text-slate-400 text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>Analyzing policy & workflow triggers...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-900/40">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Try these enterprise workflow actions:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handlePromptClick(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Field */}
      <form onSubmit={handleSend} className="p-4 bg-slate-900/90 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a policy question or request an action (e.g. 'Request PTO for next Friday')..."
          disabled={loading}
          maxLength={1000}
          className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Send</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

