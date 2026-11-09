import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { Bot, Send, User, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LearningAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'model',
      message: `Hello ${user?.name || 'there'}. I am your career assistant. Ask me questions about technical preparation, system design concepts, STAR behavioral structuring, or resume bullet quantification.`
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
      addToast('Failed to retrieve response.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <Bot className="w-3.5 h-3.5" />
          <span>Interactive Assistant</span>
        </div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Technical career mentor</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Ask specific questions regarding algorithm tradeoffs, behavioral STAR responses, or system architecture.
        </p>
      </div>

      <div className="bg-[#19191b] border border-white/[0.08] rounded-xl flex flex-col h-[560px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className="w-7 h-7 rounded-md bg-[#232325] border border-white/[0.08] flex items-center justify-center text-xs shrink-0 text-slate-300">
                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-emerald-400" />}
              </div>

              <div className={`p-3 rounded-lg max-w-xl text-xs leading-relaxed whitespace-pre-wrap border ${
                msg.role === 'user'
                  ? 'bg-[#232325] border-white/20 text-white'
                  : 'bg-[#141415] border-white/[0.08] text-slate-200'
              }`}>
                {msg.message}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-[#232325] border border-white/[0.08] flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="bg-[#141415] border border-white/[0.08] p-3 rounded-lg text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Formulating response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-white/[0.08] bg-[#141415] flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about system design, STAR answers, or technical concepts..."
            className="flex-1 bg-[#19191b] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/20"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-graphite-950 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="sr-only sm:not-sr-only">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
