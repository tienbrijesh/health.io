import React from 'react';
import { EngineStatus, EngineType } from '../types';
import { Activity, Apple, Brain, Zap, Users, CheckCircle, Circle } from 'lucide-react';

interface EngineCardProps {
  status: EngineStatus;
  onToggle: (type: EngineType) => void;
}

const Icons: Record<string, React.FC<any>> = {
  Activity, Apple, Brain, Zap, Users
};

export const EngineCard: React.FC<EngineCardProps> = ({ status, onToggle }) => {
  const Icon = Icons[status.icon] || Activity;

  return (
    <div 
      className={`relative overflow-hidden rounded-xl p-4 border border-titan-gray transition-all duration-300 ${status.isComplete ? 'bg-titan-dark/80 border-titan-success/30' : 'bg-titan-dark'}`}
      onClick={() => onToggle(status.type)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${status.color} bg-opacity-20 mt-1`}>
            <Icon size={20} className={status.isComplete ? 'text-titan-success' : 'text-titan-text'} />
          </div>
          <div>
              <h3 className="font-bold text-lg text-white leading-tight">{status.displayName}</h3>
              <p className="text-[11px] text-titan-muted/80 leading-tight mt-1 mb-2">{status.description}</p>
          </div>
        </div>
        <div className="mt-1">
          {status.isComplete ? (
            <CheckCircle className="text-titan-success" size={24} />
          ) : (
            <Circle className="text-titan-muted" size={24} />
          )}
        </div>
      </div>
      
      <div className={`mt-2 p-3 rounded-lg border border-dashed border-titan-gray/50 ${status.isComplete ? 'bg-titan-success/5' : 'bg-titan-black/30'}`}>
          <p className={`text-sm font-medium ${status.isComplete ? 'text-titan-muted line-through' : 'text-white'}`}>
            {status.dailyTask}
          </p>
      </div>

      <div className="flex items-center justify-between text-xs text-titan-muted mt-3">
        <span className="font-mono">Streak: {status.streak}</span>
        <div className="flex items-center gap-2">
            <span className="text-[10px]">Efficiency</span>
            <div className="h-1 w-16 bg-titan-gray rounded-full overflow-hidden">
            <div 
                className={`h-full ${status.color}`} 
                style={{ width: `${status.score}%` }}
            />
            </div>
        </div>
      </div>
    </div>
  );
};