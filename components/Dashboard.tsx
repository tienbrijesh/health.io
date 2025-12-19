import React, { useEffect, useState } from 'react';
import { UserProfile, EngineStatus, EngineType } from '../types.ts';
import { EngineCard } from './EngineCard.tsx';
import { INITIAL_ENGINES } from '../constants.ts';
import { generateDailyPlan } from '../services/geminiService.ts';
import ReactMarkdown from 'react-markdown';
import { RefreshCw, Zap, Save, Check } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [engines, setEngines] = useState<EngineStatus[]>([]);
  const [dailyBrief, setDailyBrief] = useState<string>('');
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedEngines = localStorage.getItem('titan_engines');
    
    if (storedEngines) {
      const parsedData = JSON.parse(storedEngines);
      const migratedEngines = parsedData.map((storedEngine: any) => {
        const config = INITIAL_ENGINES.find(e => e.type === storedEngine.type);
        return {
          ...storedEngine,
          displayName: config?.displayName || storedEngine.type,
          description: config?.description || ''
        };
      });
      setEngines(migratedEngines);
    } else {
      const init = INITIAL_ENGINES.map(e => ({
        type: e.type,
        displayName: e.displayName,
        description: e.description,
        score: Math.floor(Math.random() * 40) + 50,
        streak: 0,
        dailyTask: e.defaultTask,
        isComplete: false,
        color: e.color,
        icon: e.iconName
      }));
      setEngines(init);
      localStorage.setItem('titan_engines', JSON.stringify(init));
    }

    loadBrief(false);
  }, []);

  const loadBrief = async (force: boolean = false) => {
    setLoadingBrief(true);
    const today = new Date().toDateString();
    const key = `titan_brief_${today}`;
    const storedBrief = localStorage.getItem(key);
    
    if (!force && storedBrief) {
        setDailyBrief(storedBrief);
        setLoadingBrief(false);
    } else {
        const brief = await generateDailyPlan(user);
        setDailyBrief(brief);
        localStorage.setItem(key, brief);
        setLoadingBrief(false);
        setSaved(false);
    }
  };

  const handleSave = () => {
    const today = new Date().toDateString();
    localStorage.setItem(`titan_brief_${today}`, dailyBrief);
    
    navigator.clipboard.writeText(dailyBrief).then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }).catch(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    });
  };

  const toggleEngine = (type: EngineType) => {
    const newEngines = engines.map(e => {
      if (e.type === type) {
        return { ...e, isComplete: !e.isComplete, streak: !e.isComplete ? e.streak + 1 : e.streak - 1 };
      }
      return e;
    });
    setEngines(newEngines);
    localStorage.setItem('titan_engines', JSON.stringify(newEngines));
  };

  const completedCount = engines.filter(e => e.isComplete).length;
  const progress = (completedCount / 5) * 100;

  return (
    <div className="space-y-6 pt-4">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Protocol Active</h1>
          <p className="text-sm text-titan-muted">Day 1 • {user.primaryGoal}</p>
        </div>
        <div className="flex flex-col items-end">
           <div className="text-xl font-mono font-bold text-titan-accent">{progress.toFixed(0)}%</div>
           <div className="text-xs text-titan-muted">Daily Readiness</div>
        </div>
      </header>

      <div className="bg-gradient-to-br from-titan-gray to-titan-dark p-5 rounded-xl border border-titan-gray/50 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={64} />
        </div>
        <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-titan-success rounded-full animate-pulse"></span>
                Daily Intelligence
            </h2>
            <div className="flex items-center gap-3">
                <button 
                    onClick={handleSave} 
                    className="text-titan-muted hover:text-white p-1 transition-colors"
                >
                    {saved ? <Check size={18} className="text-titan-success" /> : <Save size={18} />}
                </button>
                <button 
                    onClick={() => loadBrief(true)} 
                    className="text-titan-muted hover:text-white p-1 transition-colors"
                    disabled={loadingBrief}
                >
                    <RefreshCw size={18} className={loadingBrief ? 'animate-spin' : ''} />
                </button>
            </div>
        </div>
        <div className="text-sm text-gray-300 leading-relaxed min-h-[80px]">
             {loadingBrief ? (
                 <div className="space-y-2 animate-pulse">
                     <div className="h-4 bg-titan-gray rounded w-3/4"></div>
                     <div className="h-4 bg-titan-gray rounded w-full"></div>
                     <div className="h-4 bg-titan-gray rounded w-5/6"></div>
                 </div>
             ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{dailyBrief}</ReactMarkdown>
                </div>
             )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-titan-muted mb-2">System Engines</h3>
        {engines.map((engine) => (
          <EngineCard 
            key={engine.type} 
            status={engine} 
            onToggle={toggleEngine} 
          />
        ))}
      </div>
      
      <div className="h-20"></div>
    </div>
  );
};