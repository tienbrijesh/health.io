export enum View {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  CHECKIN = 'CHECKIN',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS'
}

export enum EngineType {
  BODY = 'Body',
  DIET = 'Diet',
  MIND = 'Mind',
  DISCIPLINE = 'Discipline',
  ACCOUNTABILITY = 'Accountability'
}

export interface NotificationConfig {
  dailyCheckIn: boolean;
  morningBrief: boolean;
  workoutReminders: boolean;
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  dietPreference: 'Veg' | 'Non-Veg' | 'Vegan' | 'Eggetarian';
  primaryGoal: 'Muscle Gain' | 'Fat Loss' | 'Mental Clarity' | 'Endurance';
  wakeUpTime: string;
  isOnboarded: boolean;
  isPro: boolean;
  notifications?: NotificationConfig;
  hasConsented?: boolean; // Legal consent flag
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface DailyLog {
  date: string;
  engines: {
    [key in EngineType]: boolean; // Completed or not
  };
  notes?: string;
}

export interface EngineStatus {
  type: EngineType;
  displayName: string;
  description: string;
  score: number; // 0-100
  streak: number;
  dailyTask: string;
  isComplete: boolean;
  color: string;
  icon: string;
}