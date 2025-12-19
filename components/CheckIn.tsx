import React, { useState, useEffect } from 'react';
import { EngineType, UserProfile } from '../types.ts';
import { Check, Save, Zap, Flame, Award } from 'lucide-react';

interface CheckInProps {
    user: UserProfile;
}

const MOTIVATIONAL_QUOTES = [
  "Discipline is doing what you hate to do, but doing it like you love it.",
  "The pain of discipline is far less than the pain of regret.",
  "Motivation gets you going. Habit gets you there."
];

export const CheckIn: React.FC<CheckInProps> = ({ user }) => {
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [quote, setQuote] = useState('');
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
    const storedEngines = localStorage.getItem('titan_engines');
    if (storedEngines) {
        const engines = JSON.parse(storedEngines);
        const maxStreak = Math.max(...engines.map((e: any) => e.streak || 0));
        setStreak(maxStreak);
    }
  }, []);

  const questions = [
    { id: EngineType.BODY, q: "Body: Did you move with intensity today?" },
    { id: EngineType.DIET, q: "Fuel: Did you strictly adhere to the meal plan?" },
    { id: EngineType.MIND, q: "Mind: Did you meditate or learn something new?" },
    { id: EngineType.DISCIPLINE, q: "Will: Did you wake up on time?" },
    { id: EngineType.ACCOUNTABILITY, q: "Truth: Are you logging this accurately?" },
  ];

  const toggle = (id: string, val: boolean) => {
    setLogs(prev => ({ ...prev, [id]: val }));
  };

  const completedCount = Object.values(logs).filter(v => v === true).length;
  const progressPercent = (completedCount / 5) * 100;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-24 h-24 bg-titan-success rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                <Check size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Protocol Saved</h2>
            <p className="text-titan-muted">Data synced to Titan Core.</p>
        </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pt-6 pb-24 h-full overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-end">
        <div>
            <div className="flex items-center gap-2 text-titan-accent mb-1">
                <Zap size={16} className="fill-current" />
                <span className="text-xs font-bold uppercase tracking-widest">System Check</span>
            </div>
            <h1 className="text-2xl font-bold">Evening Report</h1>
        </div>
        <div className="flex items-center gap-1 text-white font-mono font-bold">
            <Flame size={16} className="text-orange-500" />
            <span>{streak}d</span>
        </div>
      </div>

      <div className="bg-titan-dark border border-titan-gray/50 p-6 rounded-2xl">
          <p className="text-lg font-serif italic text-white/90">"{quote}"</p>
      </div>

      <div className="py-2">
          <div className="h-2 bg-titan-gray rounded-full overflow-hidden">
              <div className="h-full bg-titan-accent transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
      </div>

      <div className="space-y-3">
        {questions.map((item) => (
            <div key={item.id} className={`p-4 rounded-xl border ${logs[item.id] === true ? 'bg-titan-success/10 border-titan-success/40' : 'bg-titan-dark border-titan-gray'}`}>
                <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium">{item.q}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => toggle(item.id, true)} className={`flex-1 py-2 rounded-lg text-xs font-bold ${logs[item.id] === true ? 'bg-titan-success text-black' : 'bg-titan-gray/50 text-titan-muted'}`}>YES</button>
                    <button onClick={() => toggle(item.id, false)} className={`flex-1 py-2 rounded-lg text-xs font-bold ${logs[item.id] === false ? 'bg-titan-danger text-white' : 'bg-titan-gray/50 text-titan-muted'}`}>NO</button>
                </div>
            </div>
        ))}
      </div>

      <button onClick={handleSubmit} disabled={Object.keys(logs).length < 5} className="w-full py-4 bg-white text-black font-bold rounded-xl disabled:opacity-50">
        Commit Report
      </button>
    </div>
  );
};