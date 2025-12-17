import React, { useState, useEffect } from 'react';
import { EngineType, UserProfile } from '../types';
import { Check, X, Save, Zap, Flame, Award } from 'lucide-react';

interface CheckInProps {
    user: UserProfile;
}

const MOTIVATIONAL_QUOTES = [
  "Discipline is doing what you hate to do, but doing it like you love it.",
  "The pain of discipline is far less than the pain of regret.",
  "You do not rise to the level of your goals. You fall to the level of your systems.",
  "The only easy day was yesterday.",
  "Your body can stand almost anything. It’s your mind that you have to convince.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Do something today that your future self will thank you for.",
  "Motivation gets you going. Habit gets you there.",
  "The difference between who you are and who you want to be is what you do."
];

export const CheckIn: React.FC<CheckInProps> = ({ user }) => {
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [quote, setQuote] = useState('');
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // 1. Pick a random quote
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

    // 2. Fetch/Calculate Streak (Simple logic: check engine data)
    const storedEngines = localStorage.getItem('titan_engines');
    if (storedEngines) {
        const engines = JSON.parse(storedEngines);
        // Simple heuristic: Take the highest streak from any engine
        const maxStreak = Math.max(...engines.map((e: any) => e.streak || 0));
        setStreak(maxStreak);
    }
  }, []);

  const questions = [
    { id: EngineType.BODY, q: "Body: Did you move with intensity today?" },
    { id: EngineType.DIET, q: "Fuel: Did you strictly adhere to the meal plan?" },
    { id: EngineType.MIND, q: "Mind: Did you meditate or learn something new?" },
    { id: EngineType.DISCIPLINE, q: "Will: Did you wake up on time & avoid distractions?" },
    { id: EngineType.ACCOUNTABILITY, q: "Truth: Are you logging this accurately?" },
  ];

  const toggle = (id: string, val: boolean) => {
    setLogs(prev => ({ ...prev, [id]: val }));
  };

  const completedCount = Object.values(logs).filter(v => v === true).length;
  const progressPercent = (completedCount / 5) * 100;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
        // Reset Logic (Visual reset)
        // In a real app, you would navigate away or save to DB here
    }, 3000);
  };

  if (submitted) {
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-titan-success/20 to-transparent animate-pulse-slow"></div>
            <div className="relative z-10 animate-scale-in">
                <div className="w-24 h-24 bg-titan-success rounded-full flex items-center justify-center mb-6 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                    <Check size={48} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Protocol Saved</h2>
                <p className="text-titan-muted">Data synced to Titan Core.</p>
                <div className="mt-8 p-4 bg-titan-dark/50 rounded-xl border border-titan-gray inline-flex items-center gap-3">
                    <Flame className="text-orange-500 animate-pulse" size={20} />
                    <span className="font-mono text-sm">Streak Integrity Verified</span>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pt-6 pb-24 h-full overflow-y-auto no-scrollbar">
      
      {/* Header Section with Animation */}
      <div className="flex justify-between items-end animate-slide-up" style={{ animationDelay: '0ms' }}>
        <div>
            <div className="flex items-center gap-2 text-titan-accent mb-1">
                <Zap size={16} className="fill-current" />
                <span className="text-xs font-bold uppercase tracking-widest">System Check</span>
            </div>
            <h1 className="text-2xl font-bold">Evening Report</h1>
        </div>
        <div className="text-right">
             <div className="text-xs text-titan-muted mb-1">Current Streak</div>
             <div className="flex items-center justify-end gap-1 text-white font-mono font-bold">
                <Flame size={16} className="text-orange-500" />
                <span>{streak} Days</span>
             </div>
        </div>
      </div>

      {/* Quote Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-titan-dark to-titan-gray border border-titan-gray/50 p-6 shadow-xl animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
              <Award size={80} />
          </div>
          <p className="relative z-10 text-lg font-serif italic text-white/90 leading-relaxed">
            "{quote}"
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1 w-12 bg-titan-accent rounded-full"></div>
            <span className="text-xs text-titan-muted uppercase tracking-wide">Daily Intelligence</span>
          </div>
      </div>

      {/* Progress Bar */}
      <div className="py-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex justify-between text-xs text-titan-muted mb-2 font-mono">
              <span>Completion</span>
              <span>{completedCount}/5 Engines</span>
          </div>
          <div className="h-2 bg-titan-gray rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-titan-accent to-titan-success transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
          </div>
      </div>

      {/* Questions Grid */}
      <div className="space-y-3">
        {questions.map((item, index) => (
            <div 
                key={item.id} 
                className={`p-5 rounded-xl border transition-all duration-300 animate-slide-up flex flex-col gap-3 group
                    ${logs[item.id] === true 
                        ? 'bg-titan-success/10 border-titan-success/40 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                        : 'bg-titan-dark border-titan-gray'}`}
                style={{ animationDelay: `${300 + (index * 100)}ms` }}
            >
                <div className="flex justify-between items-start">
                    <span className={`font-medium text-sm leading-snug transition-colors ${logs[item.id] === true ? 'text-white' : 'text-gray-300'}`}>
                        {item.q}
                    </span>
                    {logs[item.id] === true && <Check size={16} className="text-titan-success" />}
                </div>

                <div className="flex gap-2 mt-1">
                    <button 
                         onClick={() => toggle(item.id, true)}
                        className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2
                            ${logs[item.id] === true 
                                ? 'bg-titan-success text-black shadow-lg shadow-green-900/20' 
                                : 'bg-titan-gray/50 text-titan-muted hover:bg-titan-gray'}`}
                    >
                        YES
                    </button>
                    <button 
                        onClick={() => toggle(item.id, false)}
                        className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2
                             ${logs[item.id] === false 
                                ? 'bg-titan-danger text-white shadow-lg shadow-red-900/20' 
                                : 'bg-titan-gray/50 text-titan-muted hover:bg-titan-gray'}`}
                    >
                        NO
                    </button>
                </div>
            </div>
        ))}
      </div>

      <div className="pt-4 animate-slide-up" style={{ animationDelay: '800ms' }}>
          <button 
            onClick={handleSubmit}
            disabled={Object.keys(logs).length < 5}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform duration-300 ${
                Object.keys(logs).length < 5 
                ? 'bg-titan-gray text-titan-muted opacity-50 cursor-not-allowed' 
                : 'bg-white text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.2)]'
            }`}
          >
            <Save size={20} />
            Commit to System
          </button>
      </div>
    </div>
  );
};