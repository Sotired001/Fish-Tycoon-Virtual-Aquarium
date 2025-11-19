import { FishRarity, FishSpecies, Upgrade, Achievement } from './types';

export const FISH_SPECIES: FishSpecies[] = [
  { id: 'goldfish', name: 'Goldie', emoji: '🐠', cost: 100, rarity: FishRarity.COMMON, baseValue: 10, speed: 1, description: "A classic starter fish." },
  { id: 'guppy', name: 'Guppy', emoji: '🐟', cost: 250, rarity: FishRarity.COMMON, baseValue: 25, speed: 1.5, description: "Small but fast." },
  { id: 'tropical', name: 'Tropical', emoji: '🐠', cost: 600, rarity: FishRarity.RARE, baseValue: 60, speed: 1.2, description: "Loves warm water." },
  { id: 'puffer', name: 'Puffer', emoji: '🐡', cost: 1500, rarity: FishRarity.RARE, baseValue: 150, speed: 0.8, description: "Don't touch the spikes!" },
  { id: 'squid', name: 'Squiddy', emoji: '🦑', cost: 4000, rarity: FishRarity.EPIC, baseValue: 400, speed: 2, description: "Very intelligent." },
  { id: 'shark', name: 'Jaws', emoji: '🦈', cost: 10000, rarity: FishRarity.LEGENDARY, baseValue: 1500, speed: 2.5, description: "The king of the tank." },
  { id: 'whale', name: 'Wailer', emoji: '🐳', cost: 50000, rarity: FishRarity.LEGENDARY, baseValue: 5000, speed: 0.5, description: "A massive investment." },
];

export const UPGRADES: Record<string, Upgrade> = {
  foodQuality: {
    id: 'foodQuality',
    name: 'Nutrient Pellets',
    description: 'Fish grow faster and drop more coins.',
    baseCost: 200,
    costMultiplier: 2.5,
    maxLevel: 10,
    effect: (lvl) => 1 + (lvl * 0.2) // Multiplier for coin value
  },
  autoFeeder: {
    id: 'autoFeeder',
    name: 'Auto Feeder',
    description: 'Automatically drops food every few seconds.',
    baseCost: 1000,
    costMultiplier: 2.0,
    maxLevel: 5,
    effect: (lvl) => Math.max(1, 6 - lvl) // Seconds between drops (5s down to 1s)
  },
  magnet: {
    id: 'magnet',
    name: 'Coin Magnet',
    description: 'Attracts coins to your cursor.',
    baseCost: 5000,
    costMultiplier: 3.0,
    maxLevel: 3,
    effect: (lvl) => lvl * 150 // Radius of attraction
  },
  tankSize: {
    id: 'tankSize',
    name: 'Tank Expansion',
    description: 'Increases max fish capacity.',
    baseCost: 500,
    costMultiplier: 2.0,
    maxLevel: 10,
    effect: (lvl) => 5 + (lvl * 2) // Max fish count
  },
  metabolism: {
    id: 'metabolism',
    name: 'Vitamin Mix',
    description: 'Fish digest faster and eat more often.',
    baseCost: 750,
    costMultiplier: 1.5,
    maxLevel: 5,
    effect: (lvl) => 1 + (lvl * 0.25) // Hunger decay multiplier (up to 2.25x faster)
  }
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'fed_100', name: 'Fish Mom', description: 'Feed fish 100 times', reward: 5, condition: (s) => s.fishFedCount >= 100 },
  { id: 'rich_10k', name: 'Tycoon', description: 'Earn 10,000 coins total', reward: 10, condition: (s) => s.totalCoinsEarned >= 10000 },
  { id: 'click_500', name: 'Tapper', description: 'Click 500 times', reward: 5, condition: (s) => s.clicks >= 500 },
];

export const GAME_CONFIG = {
  FPS: 60,
  GRAVITY: 0.05,
  WATER_DRAG: 0.98,
  FOOD_SINK_SPEED: 1.5,
  COIN_FLOAT_SPEED: 0.5,
  HUNGER_DECAY: 0.05, // Hunger lost per tick
  EAT_RADIUS: 30,
  FEEDING_FRENZY_DURATION: 30000,
};