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
        text: `**SYSTEM FAILURE**: API Configuration missing. Check system credentials.`,
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
    const status = error?.status || error?.response?.status;
    const msg = (error?.message || '').toUpperCase();

    // 1. Rate Limiting (429)
    if (status === 429 || msg.includes('429') || msg.includes('TOO MANY REQUESTS')) {
      return "Neural processors are overloaded (Rate Limit). Please stand by for 60 seconds before your next transmission.";
    }

    // 2. Server Errors (500, 503, 504)
    if (status >= 500 || msg.includes('500') || msg.includes('503') || msg.includes('SERVICE UNAVAILABLE')) {
      return "The Central Intelligence Core is under maintenance or temporarily offline. Attempting to restore link... Please retry in a few moments.";
    }

    // 3. Safety Filters
    if (msg.includes('SAFETY') || msg.includes('BLOCKED') || msg.includes('CANDIDATE')) {
      return "Safety Protocol Violation: Your request was flagged and intercepted. Ensure your queries align with Titan guidelines (no medical diagnoses or prohibited content).";
    }

    // 4. API Key / Auth (401, 403)
    if (status === 401 || status === 403 || msg.includes('401') || msg.includes('403') || msg.includes('API_KEY')) {
      return "Authentication Failure: Your Titan Access Key is invalid or expired. Please verify your credentials in system environment.";
    }

    // 5. Network Issues
    if (msg.includes('FETCH') || msg.includes('NETWORK') || msg.includes('INTERNET') || msg.includes('CONNECTION')) {
      return "Uplink Severed: Unable to reach the Titan cloud. Verify your internet connection and try again.";
    }

    // 6. Quota Issues
    if (msg.includes('QUOTA') || msg.includes('EXCEEDED')) {
      return "Resource Depleted: Your daily AI quota has been exhausted. System reset will occur at midnight.";
    }

    // 7. Empty Responses
    if (msg.includes('EMPTY RESPONSE')) {
      return "Null Signal: The core processed your query but returned no data. Try rephrasing your request for better compatibility.";
    }

    // 8. Session Issues
    if (msg.includes('SESSION') || msg.includes('INITIALIZED')) {
      return "Neural Link Unstable: The current session has expired. Attempting automatic re-initialization... Please resend your last input.";
    }

    return "Critical System Fault: An unexpected error occurred. Maintain discipline and retry your transmission shortly.";
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

      // Attempt self-correction if session might be dead
      if (error?.message?.toUpperCase().includes('SESSION') || error?.message?.toUpperCase().includes('INITIALIZED')) {
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