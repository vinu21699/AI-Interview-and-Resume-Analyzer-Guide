import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { Bot, Send, User, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LearningAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'model',
      message: `Hello ${user?.name || 'there'}! I am your AI Career Coach powered by Google Gemini. Ask me anything about resume optimization, technical interview preparation, coding algorithms, behavioral STAR questions, or salary negotiation!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { addToast } = useNotification();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', message: userText }]);
    setLoading(true);

    try {
      const res = await api.post('/chatbot/chat', { message: userText });
      setMessages((prev) => [...prev, { role: 'model', message: res.data.reply }]);
    } catch (err) {
      addToast('Failed to send message to AI Assistant', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="space-y-2 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-400">
          <Sparkles className="w-3.5 h-3.5" /> Gemini 2.5 AI Assistant
        </div>
        <h1 className="text-3xl font-extrabold text-white">AI Career Learning Mentor</h1>
        <p className="text-sm text-slate-400">
          Real-time interactive career consultation, technical Q&A, system design guidance, and interview prep.
        </p>
      </div>

      <div className="glass-card border border-slate-800 rounded-2xl flex flex-col h-[550px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                  : 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`p-4 rounded-2xl max-w-xl text-xs leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                {msg.message}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" /> AI is formulating advice...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about resume tips, STAR behavioral questions, salary negotiation, system design..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="gradient-btn px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
