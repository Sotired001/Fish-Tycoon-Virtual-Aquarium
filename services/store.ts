import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FishSpecies, GameStats, Achievement, EntityFish } from '../types';
import { UPGRADES, FISH_SPECIES, ACHIEVEMENTS } from '../constants';

interface GameState {
  money: number;
  gems: number;
  prestige: number;
  startTime: number;
  ownedFish: { speciesId: string, count: number }[];
  upgrades: Record<string, number>; // upgradeId -> level
  achievements: string[]; // ids of unlocked achievements
  stats: GameStats;
  
  // UI State
  isShopOpen: boolean;
  isSettingsOpen: boolean;
  
  // Actions
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  addGem: (amount: number) => void;
  buyFish: (species: FishSpecies) => boolean;
  buyUpgrade: (upgradeId: string) => boolean;
  unlockAchievement: (id: string) => void;
  incrementStat: (key: keyof GameStats, amount?: number) => void;
  toggleShop: () => void;
  toggleSettings: () => void;
  prestigeReset: () => void;
  loadFromSave: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      money: 10000, // Start with some money for testing
      gems: 0,
      prestige: 1,
      startTime: Date.now(),
      ownedFish: [{ speciesId: 'goldfish', count: 2 }],
      upgrades: {
        foodQuality: 0,
        autoFeeder: 0,
        magnet: 0,
        tankSize: 0,
        metabolism: 0,
      },
      achievements: [],
      stats: {
        totalCoinsEarned: 0,
        fishFedCount: 0,
        clicks: 0,
      },
      isShopOpen: false,
      isSettingsOpen: false,

      addMoney: (amount) => set((state) => {
        const prestigeMult = 1 + (state.prestige * 0.1);
        const totalAmount = amount * prestigeMult;
        
        // Check achievements
        const newTotal = state.stats.totalCoinsEarned + totalAmount;
        ACHIEVEMENTS.forEach(ach => {
          if (!state.achievements.includes(ach.id) && ach.condition({ ...state.stats, totalCoinsEarned: newTotal })) {
            get().unlockAchievement(ach.id);
          }
        });

        return { 
          money: state.money + totalAmount,
          stats: { ...state.stats, totalCoinsEarned: newTotal }
        };
      }),

      spendMoney: (amount) => {
        const { money } = get();
        if (money >= amount) {
          set({ money: money - amount });
          return true;
        }
        return false;
      },

      addGem: (amount) => set((state) => ({ gems: state.gems + amount })),

      buyFish: (species) => {
        const { money, ownedFish, upgrades } = get();
        const maxFish = UPGRADES.tankSize.effect(upgrades.tankSize);
        const currentFishCount = ownedFish.reduce((acc, f) => acc + f.count, 0);

        if (currentFishCount >= maxFish) return false;
        if (money >= species.cost) {
          set((state) => {
            const existing = state.ownedFish.find(f => f.speciesId === species.id);
            const newOwned = existing 
              ? state.ownedFish.map(f => f.speciesId === species.id ? { ...f, count: f.count + 1 } : f)
              : [...state.ownedFish, { speciesId: species.id, count: 1 }];
            
            return {
              money: state.money - species.cost,
              ownedFish: newOwned
            };
          });
          return true;
        }
        return false;
      },

      buyUpgrade: (upgradeId) => {
        const { money, upgrades } = get();
        const upgrade = UPGRADES[upgradeId];
        const currentLevel = upgrades[upgradeId] || 0;
        
        if (currentLevel >= upgrade.maxLevel) return false;

        const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
        
        if (money >= cost) {
          set((state) => ({
            money: state.money - cost,
            upgrades: { ...state.upgrades, [upgradeId]: currentLevel + 1 }
          }));
          return true;
        }
        return false;
      },

      unlockAchievement: (id) => {
        const ach = ACHIEVEMENTS.find(a => a.id === id);
        if (ach) {
          set((state) => ({ 
            achievements: [...state.achievements, id],
            gems: state.gems + ach.reward
          }));
        }
      },

      incrementStat: (key, amount = 1) => {
        set((state) => {
          const newStats = { ...state.stats, [key]: state.stats[key] + amount };
          // Check achievements
          ACHIEVEMENTS.forEach(ach => {
            if (!state.achievements.includes(ach.id) && ach.condition(newStats)) {
               // Use a timeout to avoid state update during render cycle issues if called from canvas
               setTimeout(() => get().unlockAchievement(ach.id), 0);
            }
          });
          return { stats: newStats };
        });
      },

      toggleShop: () => set((state) => ({ isShopOpen: !state.isShopOpen, isSettingsOpen: false })),
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen, isShopOpen: false })),

      prestigeReset: () => {
        const { stats, achievements, gems } = get();
        // Calculate bonus gems based on lifetime earnings
        const bonusGems = Math.floor(stats.totalCoinsEarned / 10000);
        
        set({
          money: 0,
          ownedFish: [{ speciesId: 'goldfish', count: 2 }],
          upgrades: { foodQuality: 0, autoFeeder: 0, magnet: 0, tankSize: 0, metabolism: 0 },
          prestige: get().prestige + 1,
          gems: gems + bonusGems,
          // Keep achievements and stats
        });
      },

      loadFromSave: () => {
        // handled by persist middleware automatically
      }
    }),
    {
      name: 'fish-tycoon-storage',
    }
  )
);