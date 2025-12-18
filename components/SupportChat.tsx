import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, LifeBuoy, Sparkles } from 'lucide-react';
import { askSupportAI } from '../services/geminiService';
import { SystemConfig } from '../types';

interface SupportChatProps {
  config: SystemConfig;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const SupportChat: React.FC<SupportChatProps> = ({ config }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: 'Olá! Eu sou a Nova, a inteligência da Inovati. 🤖✨ Como posso ajudar você a dominar o sistema hoje?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Convert current state messages to simple history for the API
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      
      const responseText = await askSupportAI(userMsg.text, history);
      
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: 'Desculpe, tive um problema de conexão. Tente novamente.' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] max-w-[90vw] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 pointer-events-auto animate-fade-in flex flex-col h-[500px] max-h-[70vh] transition-colors">
          {/* Header */}
          <div className={`bg-gray-900 dark:bg-black p-4 flex justify-between items-center border-b-2 border-${config.themeColor}-500`}>
            <div className="flex items-center gap-2 text-white">
              <div className={`bg-${config.themeColor}-600 p-1.5 rounded-lg`}>
                <Sparkles className="text-white" size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Nova</h3>
                <p className="text-[10px] text-gray-400">IA da Inovati</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? `bg-${config.themeColor}-600 text-white rounded-tr-none` 
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start w-full">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                    <div className={`w-2 h-2 bg-${config.themeColor}-500 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                    <div className={`w-2 h-2 bg-${config.themeColor}-500 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                    <div className={`w-2 h-2 bg-${config.themeColor}-500 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte à Nova..."
              className={`flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-${config.themeColor}-500 border border-transparent placeholder-gray-500 dark:placeholder-gray-400`}
              autoFocus
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-full bg-${config.themeColor}-600 text-white hover:bg-${config.themeColor}-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm`}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button with Custom Brand Logo */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-transparent hover:border-${config.themeColor}-200 ${isOpen ? 'bg-gray-800 text-white rotate-90' : 'bg-white'}`}
        title="Falar com a Nova"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <div className="w-10 h-10 relative">
             <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                 <path 
                    d="M 50 15 A 35 35 0 1 0 85 50" 
                    fill="none" 
                    stroke="#EA580C" 
                    strokeWidth="12" 
                    strokeLinecap="round"
                    transform="rotate(-45 50 50)"
                 />
                 <rect x="42" y="15" width="16" height="16" fill="black" rx="2" />
            </svg>
          </div>
        )}
      </button>

    </div>
  );
};

export default SupportChat;