export enum FishRarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export interface FishSpecies {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  rarity: FishRarity;
  baseValue: number; // How much money they drop
  speed: number;
  description: string;
  unlockRequirement?: number; // Prestige level or money earned
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  effect: (level: number) => number; // returns the value of the effect
}

// Simulation Entities (managed by Canvas Ref, not React State for perf)
export interface EntityFish {
  id: string;
  speciesId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  hunger: number; // 0-100
  maxHunger: number;
  state: 'IDLE' | 'SEEKING_FOOD' | 'FLEEING';
  targetId: string | null;
  personalityOffset: number; // Random seed for movement variation
}

export interface EntityFood {
  id: string;
  x: number;
  y: number;
  vy: number;
  value: number; // Nutrition value
}

export interface EntityCoin {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
  life: number;
  collected: boolean;
}

export interface EntityParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0-1
  size: number;
  type: 'BUBBLE' | 'SPARKLE';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (stats: GameStats) => boolean;
  reward: number; // Gems
}

export interface GameStats {
  totalCoinsEarned: number;
  fishFedCount: number;
  clicks: number;
}