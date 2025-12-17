import React from 'react';
import { View } from '../types';
import { Home, MessageSquare, CheckSquare, User, Youtube } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setView: (view: View) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  return (
    <div className="flex flex-col h-screen bg-titan-black text-titan-text max-w-md mx-auto shadow-2xl overflow-hidden relative">
      {/* Top Status Bar Placeholder (Stylistic) */}
      <div className="h-1 w-full bg-gradient-to-r from-titan-accent to-purple-600"></div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-20 p-4 relative">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 w-full bg-titan-dark/95 backdrop-blur-md border-t border-titan-gray pb-safe">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => setView(View.DASHBOARD)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === View.DASHBOARD ? 'text-titan-accent' : 'text-titan-muted'}`}
          >
            <Home size={22} />
            <span className="text-[10px] font-medium">OS</span>
          </button>
          
          <button 
            onClick={() => setView(View.CHECKIN)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === View.CHECKIN ? 'text-titan-accent' : 'text-titan-muted'}`}
          >
            <CheckSquare size={22} />
            <span className="text-[10px] font-medium">Log</span>
          </button>

          {/* Center AI Button */}
          <div className="relative -top-5">
            <button 
              onClick={() => setView(View.CHAT)}
              className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg border-4 border-titan-black bg-gradient-to-br from-titan-accent to-blue-600 text-white transform transition-transform active:scale-95`}
            >
              <MessageSquare size={24} />
            </button>
          </div>

          <button 
            onClick={() => window.open('https://youtube.com', '_blank')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 text-titan-muted hover:text-red-500 transition-colors`}
          >
            <Youtube size={22} />
            <span className="text-[10px] font-medium">Learn</span>
          </button>

          <button 
            onClick={() => setView(View.PROFILE)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === View.PROFILE ? 'text-titan-accent' : 'text-titan-muted'}`}
          >
            <User size={22} />
            <span className="text-[10px] font-medium">You</span>
          </button>
        </div>
      </nav>
    </div>
  );
};