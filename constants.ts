import { EngineType } from './types';
import { Activity, Apple, Brain, Zap, Users } from 'lucide-react';

export const INITIAL_ENGINES = [
  {
    type: EngineType.BODY,
    displayName: 'Physical Performance',
    description: 'Training standards, movement quality & recovery protocols.',
    color: 'bg-blue-500',
    iconName: 'Activity',
    defaultTask: '30 min Zone 2 Cardio'
  },
  {
    type: EngineType.DIET,
    displayName: 'Metabolic Fuel',
    description: 'Nutritional integrity, hydration & food quality control.',
    color: 'bg-green-500',
    iconName: 'Apple',
    defaultTask: 'No sugar, hit protein goal'
  },
  {
    type: EngineType.MIND,
    displayName: 'Cognitive Engine',
    description: 'Mental clarity, focus training & stress management.',
    color: 'bg-purple-500',
    iconName: 'Brain',
    defaultTask: '10 min meditation'
  },
  {
    type: EngineType.DISCIPLINE,
    displayName: 'Executive Control',
    description: 'Adherence to routine, wake-up times & behavioral hardness.',
    color: 'bg-yellow-500',
    iconName: 'Zap',
    defaultTask: 'Cold shower / Wake up on time'
  },
  {
    type: EngineType.ACCOUNTABILITY,
    displayName: 'System Integrity',
    description: 'Radical honesty in logging & maintaining streaks.',
    color: 'bg-red-500',
    iconName: 'Users',
    defaultTask: 'Log all meals'
  }
];

export const SYSTEM_INSTRUCTION = `
You are Titan, a strict, disciplined, but encouraging AI Health OS.
Your goal is to optimize the user's life across 5 engines: Body, Diet, Mind, Discipline, and Accountability.

KEY GUIDELINES:
1. **Brevity is King**: Keep responses short (under 3 sentences unless asked for a plan). Action-oriented.
2. **Indian Context**: The user is likely Indian. Suggest Indian foods (Dal, Roti, Sabzi, Paneer, Chicken Tikka, Curd/Yogurt). Understand Indian lifestyle constraints.
3. **No Fluff**: Do not use "I hope this helps". Just give the order/advice.
4. **Discipline First**: Emphasize consistency over intensity.
5. **Next Step**: Always end with a tiny, immediate next step.

When the user asks for a workout, give a concise list.
When the user asks for diet, give specific Indian meal examples fitting their goal.
`;