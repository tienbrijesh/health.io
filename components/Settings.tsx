import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { ArrowLeft, CheckSquare, Sun, Activity, AlertTriangle, Bell, X, Lock, RefreshCw, Settings as SettingsIcon } from 'lucide-react';

interface SettingsProps {
  user: UserProfile;
  onBack: () => void;
  onUpdateUser: (user: UserProfile) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onBack, onUpdateUser }) => {
  // Initialize state from user profile, default to true if undefined
  const [prefs, setPrefs] = useState(user.notifications || {
    dailyCheckIn: false,
    morningBrief: true,
    workoutReminders: true
  });

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showFixModal, setShowFixModal] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<keyof typeof prefs | null>(null);

  // Sync state with prop updates (if parent updates user)
  useEffect(() => {
    if (user.notifications) {
      setPrefs(user.notifications);
    }
  }, [user.notifications]);

  // Synchronize permissions on mount and visibility change
  useEffect(() => {
    const syncPermissions = () => {
      if (typeof Notification === 'undefined') return;
      
      const currentPerm = Notification.permission;
      setPermissionStatus(currentPerm);

      // If system permissions are denied, force all toggles off to reflect reality
      if (currentPerm === 'denied') {
        const isAnyEnabled = Object.values(prefs).some(Boolean);
        if (isAnyEnabled) {
          const disabledPrefs = {
            dailyCheckIn: false,
            morningBrief: false,
            workoutReminders: false
          };
          setPrefs(disabledPrefs);
          onUpdateUser({ ...user, notifications: disabledPrefs });
        }
      }
    };

    syncPermissions();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncPermissions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [prefs, user, onUpdateUser]);

  const updatePrefs = (key: keyof typeof prefs, value: boolean) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    onUpdateUser({ ...user, notifications: newPrefs });
  };

  const handleToggle = async (key: keyof typeof prefs) => {
    const willEnable = !prefs[key];

    if (willEnable) {
      if (typeof Notification === 'undefined') {
        alert("This device does not support notifications.");
        return;
      }

      if (permissionStatus === 'granted') {
        updatePrefs(key, true);
      } else if (permissionStatus === 'denied') {
        setShowFixModal(true);
      } else {
        // Permission is 'default' - show explanation first
        setPendingToggle(key);
        setShowPermissionModal(true);
      }
    } else {
      // Always allow disabling
      updatePrefs(key, false);
    }
  };

  const confirmPermissionRequest = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermissionStatus(result);
      if (result === 'granted' && pendingToggle) {
        updatePrefs(pendingToggle, true);
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    } finally {
      setShowPermissionModal(false);
      setPendingToggle(null);
    }
  };

  const cancelPermissionRequest = () => {
    setShowPermissionModal(false);
    setPendingToggle(null);
  };

  return (
    <div className="p-4 pt-8 h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 relative">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-titan-gray rounded-full text-white hover:bg-titan-gray/80 active:scale-95 transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="space-y-6">
        <h2 className="text-sm font-bold uppercase text-titan-muted tracking-wider">Notifications</h2>
        
        {permissionStatus === 'denied' && (
          <div className="relative overflow-hidden rounded-xl bg-titan-danger/10 border border-titan-danger p-4 shadow-lg shadow-red-900/10 animate-in slide-in-from-bottom-2 duration-500">
              <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
              <div className="relative">
                  <div className="flex items-center gap-3 text-titan-danger mb-2">
                      <AlertTriangle size={24} strokeWidth={2.5} />
                      <h3 className="font-bold text-lg tracking-tight">System Alert</h3>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-4">
                      Critical Error: Notification permissions are blocked at the browser level. Accountability protocols are suspended.
                  </p>
                  <button 
                      onClick={() => setShowFixModal(true)}
                      className="w-full py-3 bg-titan-danger text-white font-bold rounded-lg hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                      <Lock size={16} />
                      Restore Access
                  </button>
              </div>
          </div>
        )}

        {/* Staggered animation for rows */}
        <div className="p-4 bg-titan-dark border border-titan-gray rounded-xl transition-colors hover:border-titan-gray/80 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100 fill-mode-forwards">
           <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
                      <Sun size={20} />
                  </div>
                  <h3 className="font-bold text-white">Morning Brief</h3>
               </div>
               <Toggle value={prefs.morningBrief} onToggle={() => handleToggle('morningBrief')} disabled={permissionStatus === 'denied'} />
           </div>
           <p className={`text-xs ml-12 leading-relaxed transition-opacity duration-300 ${prefs.morningBrief ? 'text-titan-muted opacity-100' : 'text-titan-muted opacity-40'}`}>
              Receive a strategic overview of your daily targets at 6:00 AM. Includes specific meal prep instructions and workout focus areas.
           </p>
        </div>

        <div className="p-4 bg-titan-dark border border-titan-gray rounded-xl transition-colors hover:border-titan-gray/80 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200 fill-mode-forwards">
           <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500">
                      <Activity size={20} />
                  </div>
                  <h3 className="font-bold text-white">Workout Reminders</h3>
               </div>
               <Toggle value={prefs.workoutReminders} onToggle={() => handleToggle('workoutReminders')} disabled={permissionStatus === 'denied'} />
           </div>
           <p className={`text-xs ml-12 leading-relaxed transition-opacity duration-300 ${prefs.workoutReminders ? 'text-titan-muted opacity-100' : 'text-titan-muted opacity-40'}`}>
              High-priority alerts to trigger your scheduled physical training session. Essential for maintaining your body composition goals.
           </p>
        </div>

        <div className="p-4 bg-titan-dark border border-titan-gray rounded-xl transition-colors hover:border-titan-gray/80 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300 fill-mode-forwards">
           <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-500">
                      <CheckSquare size={20} />
                  </div>
                  <h3 className="font-bold text-white">Daily Check-In</h3>
               </div>
               <Toggle value={prefs.dailyCheckIn} onToggle={() => handleToggle('dailyCheckIn')} disabled={permissionStatus === 'denied'} />
           </div>
           <p className={`text-xs ml-12 leading-relaxed transition-opacity duration-300 ${prefs.dailyCheckIn ? 'text-titan-muted opacity-100' : 'text-titan-muted opacity-40'}`}>
              An accountability summons at 9:00 PM. Requires you to honestly report your diet, workout, and mindset adherence to update your scores.
           </p>
        </div>
      </div>
      
      <div className="mt-auto p-4 rounded-xl bg-titan-gray/50 text-xs text-titan-muted text-center mb-4 animate-in fade-in duration-700 delay-500">
        Titan OS v1.0.1 <br/>
        {permissionStatus === 'granted' ? 'System notifications active.' : 'Notifications require system permission.'}
      </div>

      {/* Permission Modal Overlay */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-titan-dark border border-titan-gray w-full max-w-sm rounded-2xl p-6 shadow-2xl transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-titan-accent/20 rounded-full text-titan-accent">
                <Bell size={24} />
              </div>
              <button 
                onClick={cancelPermissionRequest}
                className="text-titan-muted hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Enable Notifications?</h3>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Titan OS needs your permission to send accountability reminders and daily briefings. We respect your attention and only send high-priority alerts.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={cancelPermissionRequest}
                className="flex-1 py-3 rounded-xl font-medium text-titan-muted hover:bg-titan-gray transition-colors"
              >
                Not Now
              </button>
              <button 
                onClick={confirmPermissionRequest}
                className="flex-1 py-3 bg-titan-accent text-white rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
              >
                Allow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fix Instructions Modal */}
      {showFixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
             <div className="bg-titan-dark border border-titan-gray w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-8 duration-300">
                <button 
                    onClick={() => setShowFixModal(false)}
                    className="absolute top-4 right-4 text-titan-muted hover:text-white p-2"
                >
                    <X size={20} />
                </button>
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-titan-danger/20 rounded-full text-titan-danger mb-2 ring-1 ring-titan-danger/50">
                        <Lock size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Unlock Protocols</h3>
                    <p className="text-sm text-titan-muted px-2">
                        Your browser is blocking Titan OS. To receive alerts, you must manually enable permissions.
                    </p>
                    
                    <div className="w-full text-left bg-titan-black/50 p-4 rounded-xl space-y-4 text-sm border border-titan-gray/50">
                        <div className="flex gap-3 items-start">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-titan-gray flex items-center justify-center text-[10px] font-bold mt-0.5">1</span>
                            <span className="text-gray-300">Tap the <Lock size={12} className="inline mx-1" /> icon in your address bar.</span>
                        </div>
                         <div className="flex gap-3 items-start">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-titan-gray flex items-center justify-center text-[10px] font-bold mt-0.5">2</span>
                            <span className="text-gray-300">Select <strong>Permissions</strong> or <strong>Site Settings</strong>.</span>
                        </div>
                         <div className="flex gap-3 items-start">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-titan-gray flex items-center justify-center text-[10px] font-bold mt-0.5">3</span>
                            <span className="text-gray-300">Set Notifications to <span className="text-titan-success font-bold">Allow</span>.</span>
                        </div>
                        
                        <div className="border-t border-titan-gray/30 pt-3 mt-1">
                             <button 
                                onClick={() => alert("Instruction:\n1. Open your phone's 'Settings' app.\n2. Tap 'Apps' or 'Notifications'.\n3. Find this browser (Chrome/Safari).\n4. Enable Notifications.")}
                                className="flex items-center gap-2 text-titan-accent hover:text-blue-300 transition-colors w-full"
                             >
                                <SettingsIcon size={16} />
                                <span className="font-bold">Open Device Settings</span>
                                <span className="ml-auto text-xs opacity-70">↗</span>
                             </button>
                        </div>
                    </div>

                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors mt-2 flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={18} />
                        Reload System
                    </button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

const Toggle = ({ value, onToggle, disabled }: { value: boolean, onToggle: () => void, disabled?: boolean }) => (
    <button 
        onClick={onToggle}
        disabled={disabled}
        className={`w-12 h-6 rounded-full p-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] relative 
            ${value ? 'bg-titan-success shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-titan-gray'} 
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
    >
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] absolute top-1 left-1 ${value ? 'translate-x-6 scale-110' : 'translate-x-0 scale-100'}`} />
    </button>
);