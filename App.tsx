import React, { useState, useEffect, Component, ReactNode } from 'react';
import { Layout } from './components/Layout';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { Chat } from './components/Chat';
import { CheckIn } from './components/CheckIn';
import { Settings } from './components/Settings';
import { UserProfile, View } from './types';
import { ShieldAlert, Trophy, Settings as SettingsIcon, Lock, ChevronRight, Bell, AlertTriangle, CheckCircle, RefreshCcw } from 'lucide-react';

// Error Boundary for Production Stability
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-titan-black flex flex-col items-center justify-center p-8 text-center">
          <div className="p-6 bg-titan-danger/10 rounded-full text-titan-danger mb-6 ring-2 ring-titan-danger/20">
            <AlertTriangle size={48} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">SYSTEM CRITICAL ERROR</h1>
          <p className="text-titan-muted text-sm mb-8 leading-relaxed max-w-xs">
            The Titan OS kernel encountered an unexpected fault. Neural link severed.
            <br/><span className="text-[10px] mt-2 block opacity-50">{this.state.error?.message}</span>
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-white text-black font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-transform"
          >
            <RefreshCcw size={18} />
            Reboot System
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent = () => {
  const [currentView, setCurrentView] = useState<View>(View.ONBOARDING);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('titan_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (!parsedUser.hasConsented) {
        setShowDisclaimer(true);
      } else {
        setCurrentView(View.DASHBOARD);
      }
    } else {
      setShowDisclaimer(true);
    }
  }, []);

  const handleDisclaimerAccept = () => {
    if (user) {
      const updatedUser = { ...user, hasConsented: true };
      setUser(updatedUser);
      localStorage.setItem('titan_user', JSON.stringify(updatedUser));
      setShowDisclaimer(false);
    } else {
      setShowDisclaimer(false);
      setCurrentView(View.ONBOARDING);
    }
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    const userWithDefaults = {
      ...profile,
      hasConsented: true,
      notifications: {
        dailyCheckIn: false,
        morningBrief: true,
        workoutReminders: true
      }
    };
    setUser(userWithDefaults);
    localStorage.setItem('titan_user', JSON.stringify(userWithDefaults));
    setCurrentView(View.DASHBOARD);
  };

  const updateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem('titan_user', JSON.stringify(updatedUser));
  };

  const renderContent = () => {
    if (!user && currentView !== View.ONBOARDING) return <Onboarding onComplete={handleOnboardingComplete} />;
    if (currentView === View.ONBOARDING) return <Onboarding onComplete={handleOnboardingComplete} />;
    if (!user) return <Onboarding onComplete={handleOnboardingComplete} />;

    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard user={user} />;
      case View.CHAT:
        return <Chat user={user} />;
      case View.CHECKIN:
        return <CheckIn user={user} />;
      case View.PROFILE:
        return <ProfileView user={user} setView={setCurrentView} />;
      case View.SETTINGS:
        return <Settings user={user} onBack={() => setCurrentView(View.PROFILE)} onUpdateUser={updateUser} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  if (showDisclaimer) {
    return (
      <div className="h-screen bg-black flex items-center justify-center p-6 z-50 fixed inset-0">
        <div className="bg-titan-dark border border-titan-gray rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-titan-warning/10 rounded-full text-titan-warning ring-1 ring-titan-warning/30">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wide">Legal Disclaimer</h2>
            <div className="text-left bg-titan-black/50 p-4 rounded-xl text-xs text-gray-300 border border-titan-gray/50 space-y-3 leading-relaxed max-h-[40vh] overflow-y-auto">
              <p><strong>Titan Health OS</strong> is an AI-powered lifestyle optimization tool. It is <span className="text-titan-danger font-bold">NOT</span> a medical device.</p>
              <p>The workout routines and diet plans generated are for informational purposes only.</p>
              <p><strong>Agreement:</strong> By clicking "I Understand", you acknowledge you are using this app at your own risk. Consult a physician before starting any program.</p>
            </div>
            <button 
              onClick={handleDisclaimerAccept}
              className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              I Understand & Agree
            </button>
            <p className="text-[10px] text-titan-muted">v1.0.2 Deployment Ready</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === View.ONBOARDING) {
      return <div className="h-screen bg-titan-black text-white max-w-md mx-auto overflow-hidden">{renderContent()}</div>;
  }

  if (currentView === View.SETTINGS) {
    return <div className="h-screen bg-titan-black text-titan-text max-w-md mx-auto shadow-2xl overflow-hidden relative">{renderContent()}</div>;
  }

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

const App = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);

interface ProfileViewProps {
  user: UserProfile;
  setView: (view: View) => void;
}

const ProfileView = ({ user, setView }: ProfileViewProps) => (
    <div className="p-4 space-y-8 pt-8 animate-fade-in">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-titan-accent to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                {(user.name || 'T').charAt(0).toUpperCase()}
            </div>
            <div>
                <h2 className="text-xl font-bold">{user.name || 'Titan User'}</h2>
                <span className="text-xs bg-titan-gray px-2 py-1 rounded text-titan-muted">Free Plan</span>
            </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-600/30 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <Trophy size={80} className="text-yellow-500" />
            </div>
            <h3 className="text-lg font-bold text-yellow-500 mb-2">Upgrade to Titan Pro</h3>
            <p className="text-sm text-gray-300 mb-4">Unlock advanced specific diet plans and unlimited AI coaching.</p>
            <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-colors">
                Subscribe ₹199/mo
            </button>
        </div>

        <div className="space-y-3">
            <button onClick={() => setView(View.SETTINGS)} className="w-full p-4 bg-titan-dark rounded-xl flex items-center justify-between border border-titan-gray hover:bg-titan-gray/50 transition-colors group">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-titan-gray rounded-lg group-hover:bg-titan-dark transition-colors"><Bell size={20} className="text-titan-text" /></div>
                    <span className="font-medium">Notification Settings</span>
                </div>
                <ChevronRight size={20} className="text-titan-muted" />
            </button>
             <button className="w-full p-4 bg-titan-dark rounded-xl flex items-center justify-between border border-titan-gray">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-titan-gray rounded-lg"><ShieldAlert size={20} className="text-titan-danger" /></div>
                    <span>Emergency Mode</span>
                </div>
                <div className="w-8 h-4 bg-titan-gray rounded-full relative"></div>
            </button>
        </div>
        <div className="text-center text-xs text-titan-muted pt-8">Titan OS v1.0.2</div>
    </div>
);

export default App;