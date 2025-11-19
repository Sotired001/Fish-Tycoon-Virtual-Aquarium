import { FishRarity, FishSpecies, Upgrade, Achievement, DecorationItem, MedicineItem, Skill, SkillId, Biome, FishDiet } from './types';

export const BIOMES: Biome[] = [
  {
    id: 'default_biome',
    name: 'Deep Blue',
    description: 'A classic deep ocean environment.',
    cost: 0,
    backgroundGradient: ['#0f172a', '#1e3a8a'],
    waterColor: 'rgba(0, 0, 50, 0.1)',
    particleType: 'BUBBLE'
  },
  {
    id: 'tropical_shallows',
    name: 'Tropical Shallows',
    description: 'Warm, bright waters perfect for tropical fish.',
    cost: 100,
    backgroundGradient: ['#06b6d4', '#3b82f6'],
    waterColor: 'rgba(0, 255, 255, 0.05)',
    particleType: 'SPARKLE'
  },
  {
    id: 'murky_swamp',
    name: 'Murky Swamp',
    description: 'Dark and mysterious.',
    cost: 250,
    backgroundGradient: ['#1a2e05', '#3f6212'],
    waterColor: 'rgba(50, 100, 0, 0.2)',
    particleType: 'LEAF'
  },
  {
    id: 'volcanic_vents',
    name: 'Volcanic Vents',
    description: 'Hot and dangerous waters.',
    cost: 1000,
    backgroundGradient: ['#450a0a', '#7f1d1d'],
    waterColor: 'rgba(255, 50, 0, 0.1)',
    particleType: 'BUBBLE'
  }
];

export const SKILLS: Record<SkillId, Skill> = {
  [SkillId.BETTER_BREEDING]: {
    id: SkillId.BETTER_BREEDING,
    name: 'Genetic Mastery',
    description: 'Reduces breeding cooldown.',
    maxLevel: 5,
    cost: (lvl) => 10 + (lvl * 5),
    effect: (lvl) => 1 - (lvl * 0.1) // 10% reduction per level
  },
  [SkillId.GOLDEN_SCALES]: {
    id: SkillId.GOLDEN_SCALES,
    name: 'Golden Scales',
    description: 'Increases coin drop value.',
    maxLevel: 10,
    cost: (lvl) => 5 + (lvl * 2),
    effect: (lvl) => 1 + (lvl * 0.1) // 10% bonus per level
  },
  [SkillId.HARDY_FISH]: {
    id: SkillId.HARDY_FISH,
    name: 'Iron Gills',
    description: 'Fish are more resistant to disease and bad water.',
    maxLevel: 5,
    cost: (lvl) => 15 + (lvl * 5),
    effect: (lvl) => 1 + (lvl * 0.2) // 20% more health/resistance
  },
  [SkillId.DISCOUNT_SHOP]: {
    id: SkillId.DISCOUNT_SHOP,
    name: 'Charisma',
    description: 'Shop items are cheaper.',
    maxLevel: 3,
    cost: (lvl) => 50 + (lvl * 25),
    effect: (lvl) => 1 - (lvl * 0.05) // 5% discount per level
  }
};

export const MEDICINES: MedicineItem[] = [
  {
    id: 'med_general',
    name: 'General Cure',
    cost: 100,
    description: 'Cures most common ailments.',
    cures: ['ICH', 'FUNGUS']
  },
  {
    id: 'med_potent',
    name: 'Super Meds',
    cost: 500,
    description: 'Cures everything.',
    cures: ['ICH', 'FUNGUS', 'PARASITE']
  }
];

export const DECORATIONS: DecorationItem[] = [
  {
    id: 'plant_fern',
    name: 'Java Fern',
    type: 'PLANT',
    cost: 200,
    description: 'Helps reduce ammonia slightly.',
    emoji: '🌿',
    effect: { type: 'AMMONIA_REDUCTION', value: 0.001 }
  },
  {
    id: 'rock_grey',
    name: 'Grey Rock',
    type: 'ROCK',
    cost: 50,
    description: 'Just a rock.',
    emoji: '🪨'
  },
  {
    id: 'statue_moai',
    name: 'Moai Statue',
    type: 'STATUE',
    cost: 1000,
    description: 'Ancient vibes.',
    emoji: '🗿',
    effect: { type: 'HAPPINESS', value: 1.1 }
  },
  {
    id: 'castle',
    name: 'Castle',
    type: 'STATUE',
    cost: 500,
    description: 'A home for your fish.',
    emoji: '🏰'
  }
];

export const FISH_SPECIES: FishSpecies[] = [
  {
    id: 'goldfish',
    name: 'Goldie',
    emoji: '🐠',
    cost: 100,
    rarity: FishRarity.COMMON,
    baseValue: 10,
    speed: 1,
    description: "A classic starter fish.",
    preferredWater: {
      tempRange: [20, 25],
      phRange: [6.8, 7.6],
      hardiness: 0.8
    },
    diet: FishDiet.OMNIVORE,
    schoolingFactor: 0.3,
    schoolingDistance: 60
  },
  {
    id: 'guppy',
    name: 'Guppy',
    emoji: '🐟',
    cost: 250,
    rarity: FishRarity.COMMON,
    baseValue: 25,
    speed: 1.5,
    description: "Small but fast.",
    preferredWater: {
      tempRange: [22, 28],
      phRange: [7.0, 8.0],
      hardiness: 0.6
    },
    diet: FishDiet.OMNIVORE,
    schoolingFactor: 0.8,
    schoolingDistance: 40
  },
  {
    id: 'tropical',
    name: 'Tropical',
    emoji: '🐠',
    cost: 600,
    rarity: FishRarity.RARE,
    baseValue: 60,
    speed: 1.2,
    description: "Loves warm water.",
    preferredWater: {
      tempRange: [24, 29],
      phRange: [6.0, 7.5],
      hardiness: 0.5
    },
    diet: FishDiet.HERBIVORE,
    schoolingFactor: 0.5,
    schoolingDistance: 50
  },
  {
    id: 'puffer',
    name: 'Puffer',
    emoji: '🐡',
    cost: 1500,
    rarity: FishRarity.RARE,
    baseValue: 150,
    speed: 0.8,
    description: "Don't touch the spikes!",
    preferredWater: {
      tempRange: [24, 28],
      phRange: [7.5, 8.5],
      hardiness: 0.7
    },
    diet: FishDiet.CARNIVORE,
    schoolingFactor: 0.1,
    schoolingDistance: 100
  },
  {
    id: 'squid',
    name: 'Squiddy',
    emoji: '🦑',
    cost: 4000,
    rarity: FishRarity.EPIC,
    baseValue: 400,
    speed: 2,
    description: "Very intelligent.",
    preferredWater: {
      tempRange: [15, 25],
      phRange: [7.0, 8.5],
      hardiness: 0.9
    },
    diet: FishDiet.CARNIVORE,
    schoolingFactor: 0.2,
    schoolingDistance: 80
  },
  {
    id: 'shark',
    name: 'Jaws',
    emoji: '🦈',
    cost: 10000,
    rarity: FishRarity.LEGENDARY,
    baseValue: 1500,
    speed: 2.5,
    description: "The king of the tank.",
    preferredWater: {
      tempRange: [20, 28],
      phRange: [6.5, 8.0],
      hardiness: 1.0
    },
    diet: FishDiet.CARNIVORE,
    preySpecies: ['goldfish', 'guppy', 'tropical'],
    schoolingFactor: 0,
    schoolingDistance: 0
  },
  {
    id: 'whale',
    name: 'Wailer',
    emoji: '🐳',
    cost: 50000,
    rarity: FishRarity.LEGENDARY,
    baseValue: 5000,
    speed: 0.5,
    description: "A massive investment.",
    preferredWater: {
      tempRange: [10, 25],
      phRange: [7.0, 9.0],
      hardiness: 1.0
    },
    diet: FishDiet.OMNIVORE,
    schoolingFactor: 0.1,
    schoolingDistance: 200
  },
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
  BREED_COOLDOWN_MS: 300000, // 5 minutes
};