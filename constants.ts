import { EngineType } from './types.ts';

export const INITIAL_ENGINES = [
  {
    type: EngineType.BODY,
    displayName: 'Physical Performance',
    description: 'Training standards and recovery.',
    color: 'bg-blue-500',
    iconName: 'Activity',
    defaultTask: '30 min Zone 2 Cardio'
  },
  {
    type: EngineType.DIET,
    displayName: 'Metabolic Fuel',
    description: 'Nutritional integrity.',
    color: 'bg-green-500',
    iconName: 'Apple',
    defaultTask: 'No sugar, hit protein'
  },
  {
    type: EngineType.MIND,
    displayName: 'Cognitive Engine',
    description: 'Mental clarity and focus.',
    color: 'bg-purple-500',
    iconName: 'Brain',
    defaultTask: '10 min meditation'
  },
  {
    type: EngineType.DISCIPLINE,
    displayName: 'Executive Control',
    description: 'Adherence to routine.',
    color: 'bg-yellow-500',
    iconName: 'Zap',
    defaultTask: 'Cold shower / Wake up'
  },
  {
    type: EngineType.ACCOUNTABILITY,
    displayName: 'System Integrity',
    description: 'Honesty in logging.',
    color: 'bg-red-500',
    iconName: 'Users',
    defaultTask: 'Log all meals'
  }
];

export const SYSTEM_INSTRUCTION = `
You are Titan, a strict, disciplined AI Health OS.
Guidelines:
1. Brevity: Under 3 sentences.
2. Indian Context: Suggest Indian foods.
3. No Fluff: Action-oriented advice only.
4. Next Step: End with an immediate task.
`;