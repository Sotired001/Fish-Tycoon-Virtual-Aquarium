export enum FishRarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export enum FishPersonality {
  RELAXED = 'RELAXED', // Slower, steady
  HYPER = 'HYPER',     // Fast, erratic
  SHY = 'SHY',         // Avoids others, hides near edges
  SOCIAL = 'SOCIAL',   // Stronger schooling
  AGGRESSIVE = 'AGGRESSIVE' // Chases others (even if not carnivorous)
}

export interface WaterParams {
  ph: number;        // 0-14, ideal usually 6.5-8.0
  temperature: number; // Celsius, ideal usually 22-28
  ammonia: number;   // ppm, 0 is best, > 1 is bad
  nitrites: number;  // ppm, 0 is best (not used yet, reserved)
  nitrates: number;  // ppm, < 40 is ok (not used yet, reserved)
  algae: number;     // 0-100 coverage
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
  health: number; // 0-100
  maxHunger: number;
  state: 'IDLE' | 'SEEKING_FOOD' | 'FLEEING';
  targetId: string | null;
  personalityOffset: number; // Random seed for movement variation
  personality: FishPersonality;
  genes: FishGenes;
  age: number; // Time alive
  generation: number; // 0 for shop bought, +1 for bred
  parents?: [string, string]; // IDs of parents
  lastBreedTime?: number; // Timestamp of last successful breeding
  disease?: 'ICH' | 'FUNGUS' | 'PARASITE'; // Disease type if infected
  currentAction?: 'HUNTING' | 'FLEEING' | 'NONE'; // Transient visual state
}

export interface MedicineItem {
  id: string;
  name: string;
  cost: number;
  description: string;
  cures: ('ICH' | 'FUNGUS' | 'PARASITE')[];
}

export enum QuestType {
  BREED_FISH = 'BREED_FISH',
  EARN_COINS = 'EARN_COINS',
  CLEAN_TANK = 'CLEAN_TANK',
  HAVE_FISH = 'HAVE_FISH'
}

export interface Quest {
  id: string;
  type: QuestType;
  description: string;
  target: number;
  progress: number;
  reward: number; // Gems
  completed: boolean;
  targetSpeciesId?: string; // For BREED/HAVE quests
}

export interface DecorationItem {
  id: string;
  name: string;
  type: 'PLANT' | 'STATUE' | 'ROCK' | 'BACKGROUND';
  cost: number;
  description: string;
  effect?: {
    type: 'AMMONIA_REDUCTION' | 'HAPPINESS' | 'COIN_MULTIPLIER';
    value: number;
  };
  emoji: string; // Using emoji for prototype
}

export interface EntityDecoration {
  id: string;
  itemId: string;
  x: number;
  y: number;
  scale: number;
  growth?: number; // 0-1 for Plants
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
  type: 'BUBBLE' | 'SPARKLE' | 'LEAF' | 'BONE';
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

export enum SkillId {
  BETTER_BREEDING = 'BETTER_BREEDING',
  GOLDEN_SCALES = 'GOLDEN_SCALES',
  HARDY_FISH = 'HARDY_FISH',
  DISCOUNT_SHOP = 'DISCOUNT_SHOP'
}

export interface Skill {
  id: SkillId;
  name: string;
  description: string;
  maxLevel: number;
  cost: (level: number) => number; // Gems
  effect: (level: number) => number; // Multiplier or value
}

export interface FishGenes {
  bodyColor: string; // Hex code
  finColor: string; // Hex code
  pattern: 'SOLID' | 'STRIPED' | 'SPOTTED';
  patternColor: string;
  scale: number; // Size multiplier (0.8 - 1.5)
  finShape: 'TRIANGLE' | 'ROUND' | 'FORKED';
}

export enum FishDiet {
  HERBIVORE = 'HERBIVORE',
  CARNIVORE = 'CARNIVORE',
  OMNIVORE = 'OMNIVORE'
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
  baseGenes?: Partial<FishGenes>; // Default genes for this species
  preferredWater?: {
    tempRange: [number, number]; // min, max
    phRange: [number, number];   // min, max
    hardiness: number;           // 0-1, higher is more resistant to bad water
  };

  // Phase 2: Predation & Schooling
  diet?: FishDiet;
  preySpecies?: string[]; // IDs of species this fish eats
  schoolingDistance?: number; // How close they want to be to friends
  schoolingFactor?: number; // How strongly they align
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

export interface Biome {
  id: string;
  name: string;
  description: string;
  cost: number; // Gems
  unlockRequirement?: number; // Prestige level
  backgroundGradient: [string, string]; // Top color, Bottom color
  waterColor: string; // Overlay color for water "feel"
  particleType: 'BUBBLE' | 'SPARKLE' | 'LEAF'; // Ambient particles
}