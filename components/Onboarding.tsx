import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ArrowRight, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    isOnboarded: true,
    isPro: false,
    dietPreference: 'Non-Veg',
    primaryGoal: 'Muscle Gain'
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      // Ensure name is present, fallback to "Titan User"
      const finalProfile = { 
        ...profile, 
        name: profile.name && profile.name.trim() !== '' ? profile.name : 'Titan User' 
      };
      onComplete(finalProfile as UserProfile);
    }
  };

  const steps = [
    {
      title: "Welcome to Titan OS",
      subtitle: "Optimize your biology. Master your mind.",
      content: (
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Your Name" 
            className="w-full bg-titan-gray border-none rounded-xl p-4 text-white focus:ring-2 focus:ring-titan-accent outline-none"
            value={profile.name || ''}
            onChange={(e) => setProfile({...profile, name: e.target.value})}
          />
          <div className="flex gap-4">
             <input 
              type="number" 
              placeholder="Age" 
              className="w-1/2 bg-titan-gray rounded-xl p-4 text-white outline-none"
              onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
            />
            <input 
              type="text" 
              placeholder="Wake Up (e.g. 6:00)" 
              className="w-1/2 bg-titan-gray rounded-xl p-4 text-white outline-none"
              onChange={(e) => setProfile({...profile, wakeUpTime: e.target.value})}
            />
          </div>
        </div>
      )
    },
    {
      title: "Dietary Engine",
      subtitle: "Fuel for the machine. We prioritize Indian nutrition.",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {['Veg', 'Non-Veg', 'Vegan', 'Eggetarian'].map((opt) => (
            <button
              key={opt}
              onClick={() => setProfile({...profile, dietPreference: opt as any})}
              className={`p-4 rounded-xl border-2 transition-all text-sm font-bold ${profile.dietPreference === opt ? 'border-titan-accent bg-titan-accent/20 text-white' : 'border-titan-gray text-titan-muted hover:border-white'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Primary Mission",
      subtitle: "What is the main objective?",
      content: (
        <div className="space-y-3">
          {['Muscle Gain', 'Fat Loss', 'Mental Clarity', 'Endurance'].map((opt) => (
            <button
              key={opt}
              onClick={() => setProfile({...profile, primaryGoal: opt as any})}
              className={`w-full p-4 rounded-xl border-2 transition-all flex justify-between items-center ${profile.primaryGoal === opt ? 'border-titan-success bg-titan-success/20 text-white' : 'border-titan-gray text-titan-muted hover:border-white'}`}
            >
              <span className="font-bold">{opt}</span>
              {profile.primaryGoal === opt && <Check size={18} />}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Commitment",
      subtitle: "This OS requires discipline. Are you ready?",
      content: (
        <div className="text-center space-y-6 py-8">
            <div className="w-24 h-24 mx-auto bg-titan-gray rounded-full flex items-center justify-center animate-pulse">
                <span className="text-4xl">🔥</span>
            </div>
            <p className="text-titan-muted text-sm px-8">
                By entering Titan OS, you agree to track your metrics daily and follow the AI coach's guidance.
            </p>
        </div>
      )
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="h-full flex flex-col justify-between p-6 pt-12">
      <div className="space-y-2">
        <div className="flex gap-2 mb-8">
          {[1,2,3,4].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-titan-accent' : 'bg-titan-gray'}`} />
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">{currentStep.title}</h1>
        <p className="text-titan-muted">{currentStep.subtitle}</p>
      </div>

      <div className="flex-1 py-8">
        {currentStep.content}
      </div>

      <button
        onClick={handleNext}
        className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        {step === 4 ? "Initialize System" : "Next"}
        <ArrowRight size={20} />
      </button>
    </div>
  );
};