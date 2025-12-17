import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { sendMessageToGemini, initChat } from '../services/geminiService';
import { Send, User, Bot, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatProps {
  user: UserProfile;
}

export const Chat: React.FC<ChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      initChat(user);
    } catch (e) {
      console.error("Failed to init chat:", e);
      setMessages([{
        id: 'error-init',
        role: 'model',
        text: `**SYSTEM FAILURE**: API Configuration missing. Check API_KEY.`,
        timestamp: Date.now()
      }]);
      return;
    }

    // Add welcome message if empty
    if (messages.length === 0) {
      setMessages([{
        id: 'init',
        role: 'model',
        text: `Titan Systems Online. I am ready to optimize your ${user.primaryGoal}. What is your status?`,
        timestamp: Date.now()
      }]);
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getErrorMessage = (error: any): string => {
    const msg = error?.message || '';
    if (msg.includes('429')) return "Traffic Limit Exceeded. Cooling down systems. Please wait 60s.";
    if (msg.includes('503') || msg.includes('500')) return "Central Core maintenance. Brief standby required.";
    if (msg.includes('SAFETY') || msg.includes('blocked')) return "Safety protocols engaged. Query rejected.";
    if (msg.includes('fetch') || msg.includes('network') || msg.includes('Network')) return "Network uplinks offline. Check your internet connection.";
    if (msg.includes('Empty response')) return "Signal received but empty. Please rephrase.";
    if (msg.includes('Chat session')) return "Neural link unstable. Re-initializing...";
    return "Unknown system failure. Maintain discipline and retry.";
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(input);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      const errorText = getErrorMessage(error);
      
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `⚠️ **SYSTEM ALERT**: ${errorText}`,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMsg]);

      // Attempt self-correction if session is dead
      if (error?.message?.includes('Chat session')) {
        try { initChat(user); } catch(e) {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 no-scrollbar">
        {messages.map((msg) => {
          const isError = msg.text.includes('SYSTEM ALERT') || msg.text.includes('SYSTEM FAILURE');
          
          return (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-titan-gray' : isError ? 'bg-titan-danger' : 'bg-titan-accent'}`}>
                  {msg.role === 'user' ? <User size={14} /> : isError ? <AlertCircle size={14} /> : <Bot size={14} />}
                </div>
                
                <div 
                  className={`p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-titan-gray text-white rounded-tr-none' 
                    : isError 
                      ? 'bg-titan-danger/10 border border-titan-danger/50 text-titan-danger rounded-tl-none'
                      : 'bg-titan-dark border border-titan-gray/50 text-gray-200 rounded-tl-none'
                  }`}
                >
                  <div className="prose prose-invert prose-sm">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
             <div className="max-w-[85%] flex gap-3">
                <div className="w-8 h-8 rounded-full bg-titan-accent flex items-center justify-center flex-shrink-0">
                    <Bot size={14} />
                </div>
                <div className="bg-titan-dark border border-titan-gray/50 p-4 rounded-2xl rounded-tl-none flex items-center">
                    <Loader2 size={16} className="animate-spin text-titan-accent" />
                    <span className="ml-2 text-xs text-titan-muted">Analyzing...</span>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-20 left-0 w-full px-4 pt-2 pb-4 bg-gradient-to-t from-titan-black via-titan-black to-transparent">
        <div className="flex items-center gap-2 bg-titan-dark border border-titan-gray rounded-full px-4 py-2 shadow-xl">
          <input
            type="text"
            className="flex-1 bg-transparent text-white placeholder-titan-muted outline-none py-2"
            placeholder="Ask Titan..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`p-2 rounded-full transition-colors ${input.trim() ? 'bg-titan-accent text-white' : 'bg-titan-gray text-titan-muted'}`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};