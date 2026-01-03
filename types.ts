export type ResourceMode = 'diy' | 'pro' | '3dprint' | 'bait' | 'normal';

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  pressure: number;
  condition: string;
}

export interface InventionParams {
  challenge: string;
  environment: string;
  resourceMode: ResourceMode;
  availableSupplies?: string;
  weather?: WeatherData;
}

export interface InventionIdea {
  name: string;
  tagline: string;
  description: string;
  mechanism: string;
  materials: string[];
  visualPrompt: string;
  feasibilityScore: number; // 1-100
  feasibilityAnalysis?: string; // Analysis explaining the score
  instructions?: string[]; // Step-by-step guide (Build steps, Recipe, Assembly)
  pros: string[];
  cons: string[];
}

export interface GeneratedInvention extends InventionIdea {
  id: string;
  imageUrl?: string;
  timestamp: number;
  originalParams?: InventionParams; // Optional to support backward compatibility with older saves
}

export enum GenerationState {
  IDLE,
  BRAINSTORMING, // Text generation
  VISUALIZING,   // Image generation
  COMPLETE,
  ERROR
}