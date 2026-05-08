export type AgentType = 'diagnostic' | 'practice' | 'vocabulary' | 'planning' | 'daily' | 'reading' | 'youtube' | 'progress';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface AppStats {
  math: number;
  reading: number;
  writing: number;
  vocab: number;
  passages: number;
  streak: number;
  score: string;
  weak: string;
}

export interface AgentConfig {
  name: string;
  icon: string;
  systemPrompt: string;
  suggestions: string[];
}
