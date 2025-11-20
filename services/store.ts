import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FishSpecies, GameStats, Achievement, EntityFish, FishGenes, WaterParams, EntityDecoration, Quest, QuestType, SkillId, FishPersonality } from '../types';
import { UPGRADES, FISH_SPECIES, ACHIEVEMENTS, GAME_CONFIG, DECORATIONS, MEDICINES, SKILLS } from '../constants';
import { generateRandomGenes, generateOffspringGenes } from '../utils/genetics';

interface GameState {
  money: number;
  gems: number;
  prestige: number;
  startTime: number;

  fish: EntityFish[]; // Source of truth for all fish entities
  decorations: EntityDecoration[]; // Decorations placed in the tank
  waterParams: WaterParams; // Global water parameters
  quests: Quest[]; // Active quests
  skills: Record<string, number>; // skillId -> level
  discoveredSpecies: string[]; // IDs of species seen/owned
  timeOfDay: number; // 0-24

  upgrades: Record<string, number>; // upgradeId -> level
  achievements: string[]; // ids of unlocked achievements
  stats: GameStats;
  
  currentBiomeId: string;
  unlockedBiomeIds: string[];

  // UI State
  isShopOpen: boolean;
  isSettingsOpen: boolean;
  isSellMode: boolean;

  // Actions
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  addGem: (amount: number) => void;
  buyFish: (species: FishSpecies) => boolean;
  buyDecoration: (itemId: string) => boolean;
  buyUpgrade: (upgradeId: string) => boolean;
  buySkill: (skillId: SkillId) => boolean;
  buyBiome: (biomeId: string) => boolean;
  setBiome: (biomeId: string) => void;
  treatFish: (fishId: string, medicineId: string) => boolean;
  unlockAchievement: (id: string) => void;

  claimQuest: (questId: string) => void;
  refreshQuests: () => void; // Generate new ones
  checkQuestProgress: () => void; // Called periodically or on events


  incrementStat: (key: keyof GameStats, amount?: number) => void;
  toggleShop: () => void;
  toggleSettings: () => void;
  toggleSellMode: () => void;
  sellFish: (fishId: string) => void;
  removeFish: (fishId: string) => void;
  breedFish: (parent1Id: string, parent2Id: string) => void;
  updateWaterParams: (params: Partial<WaterParams>) => void;
  setTimeOfDay: (time: number) => void;
  prestigeReset: () => void;
  loadFromSave: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      money: 10000,
      gems: 0,
      prestige: 1,
      startTime: Date.now(),
      fish: [], // Initial fish will be added if empty
      decorations: [], // Initial decorations
      quests: [],
      skills: {}, // Initial skills
      timeOfDay: 12, // Start at noon
      currentBiomeId: 'default_biome',
      unlockedBiomeIds: ['default_biome'],
      waterParams: {
        ph: 7.0,
        temperature: 25,
        ammonia: 0,
        nitrites: 0,
        nitrates: 0,
        algae: 0
      },
      upgrades: {
        foodQuality: 0,
        autoFeeder: 0,
        magnet: 0,
        tankSize: 0,
        metabolism: 0,
        heater: 0,
        filter: 0,
        lights: 0,
      },
      achievements: [],
      stats: {
        totalCoinsEarned: 0,
        fishFedCount: 0,
        clicks: 0,
      },
      isShopOpen: false,
      isSettingsOpen: false,
      isSellMode: false,

      addMoney: (amount) => set((state) => {
        const prestigeMult = 1 + (state.prestige * 0.1);
        // Skill Multiplier
        const skillLvl = state.skills[SkillId.GOLDEN_SCALES] || 0;
        const skillMult = SKILLS[SkillId.GOLDEN_SCALES].effect(skillLvl);

        const totalAmount = amount * prestigeMult * skillMult;

        const newTotal = state.stats.totalCoinsEarned + totalAmount;
        ACHIEVEMENTS.forEach(ach => {
          if (!state.achievements.includes(ach.id) && ach.condition({ ...state.stats, totalCoinsEarned: newTotal })) {
            get().unlockAchievement(ach.id);
          }
        });

        // Also check quest progress
        get().checkQuestProgress();

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

      buySkill: (skillId) => {
        const { gems, skills } = get();
        const skill = SKILLS[skillId];
        const currentLevel = skills[skillId] || 0;

        if (currentLevel >= skill.maxLevel) return false;

        const cost = skill.cost(currentLevel);

        if (gems >= cost) {
            set((state) => ({
                gems: state.gems - cost,
                skills: { ...state.skills, [skillId]: currentLevel + 1 }
            }));
            return true;
        }
        return false;
      },

      buyBiome: (biomeId) => {
        const { gems, unlockedBiomeIds } = get();
        const biome = BIOMES.find(b => b.id === biomeId);
        if (!biome || unlockedBiomeIds.includes(biomeId)) return false;

        if (gems >= biome.cost) {
            set(state => ({
                gems: state.gems - biome.cost,
                unlockedBiomeIds: [...state.unlockedBiomeIds, biomeId],
                currentBiomeId: biomeId // Auto-equip
            }));
            return true;
        }
        return false;
      },

      setBiome: (biomeId) => {
          if (get().unlockedBiomeIds.includes(biomeId)) {
              set({ currentBiomeId: biomeId });
          }
      },

      // Quest Actions
      refreshQuests: () => {
        const newQuests: Quest[] = [];
        // Generate 3 random quests
        for (let i = 0; i < 3; i++) {
            const type = Object.values(QuestType)[Math.floor(Math.random() * Object.values(QuestType).length)];
            let quest: Quest = {
                id: crypto.randomUUID(),
                type: type as QuestType,
                description: '',
                target: 10,
                progress: 0,
                reward: 5,
                completed: false
            };

            switch (type) {
                case QuestType.EARN_COINS:
                    quest.target = 500 + Math.floor(Math.random() * 1000);
                    quest.description = `Earn ${quest.target} coins`;
                    quest.reward = 5;
                    break;
                case QuestType.BREED_FISH:
                    quest.target = 1 + Math.floor(Math.random() * 3);
                    quest.description = `Breed ${quest.target} new fish`;
                    quest.reward = 10;
                    break;
                case QuestType.HAVE_FISH:
                    const species = FISH_SPECIES[Math.floor(Math.random() * FISH_SPECIES.length)];
                    quest.target = 3;
                    quest.targetSpeciesId = species.id;
                    quest.description = `Have 3 ${species.name} in your tank`;
                    quest.reward = 15;
                    break;
                case QuestType.CLEAN_TANK:
                    quest.target = 1;
                    quest.description = `Clean the tank (0 Ammonia)`;
                    quest.reward = 3;
                    break;
            }
            newQuests.push(quest);
        }
        set({ quests: newQuests });
      },

      claimQuest: (questId) => {
        set(state => {
            const quest = state.quests.find(q => q.id === questId);
            if (quest && quest.completed) {
                return {
                    gems: state.gems + quest.reward,
                    quests: state.quests.filter(q => q.id !== questId)
                };
            }
            return {};
        });
        // Refill if empty? No, let user wait or pay to refresh? For now, auto-refill if all empty
        if (get().quests.length === 0) get().refreshQuests();
      },

      checkQuestProgress: () => {
          set(state => {
              const { stats, fish, waterParams } = state;
              return {
                  quests: state.quests.map(q => {
                      if (q.completed) return q;
                      
                      let newProgress = q.progress;
                      
                      switch (q.type) {
                          case QuestType.EARN_COINS:
                              // This is tricky, we need "coins earned SINCE quest start".
                              // For prototype, let's just check TOTAL coins for now (simplification), 
                              // OR we need to store 'startValue' in quest.
                              // Let's assume 'target' is small enough that we can just check current money? No.
                              // Let's just skip EARN_COINS logic complexity for now or use stats.
                              // Let's use current money (Holding X amount).
                              // Wait, description was "Earn X". 
                              // Let's change it to "Have X coins".
                              if (state.money >= q.target) newProgress = q.target;
                              break;
                          case QuestType.HAVE_FISH:
                              if (q.targetSpeciesId) {
                                  const count = fish.filter(f => f.speciesId === q.targetSpeciesId).length;
                                  newProgress = count;
                              }
                              break;
                          case QuestType.CLEAN_TANK:
                              if (waterParams.ammonia === 0) newProgress = 1;
                              break;
                          // BREED_FISH needs to be handled in breed action
                      }
                      
                      return { ...q, progress: newProgress, completed: newProgress >= q.target };
                  })
              };
          });
      },

      buyFish: (species) => {
        const { money, fish, upgrades, skills } = get();
        const maxFish = UPGRADES.tankSize.effect(upgrades.tankSize);

        if (fish.length >= maxFish) return false;

        // Discount Skill
        const discountLvl = skills[SkillId.DISCOUNT_SHOP] || 0;
        const discountMult = SKILLS[SkillId.DISCOUNT_SHOP].effect(discountLvl);
        const finalCost = species.cost * discountMult;

        if (money >= finalCost) {
          set((state) => {
            const newFish: EntityFish = {
              id: crypto.randomUUID(),
              speciesId: species.id,
              x: Math.random() * 800,
              y: Math.random() * 600,
              vx: 0, vy: 0,
              scale: 1,
              hunger: 100,
              health: 100,
              maxHunger: 100,
              state: 'IDLE',
              targetId: null,
              personalityOffset: Math.random() * 1000,
              personality: Object.values(FishPersonality)[Math.floor(Math.random() * Object.values(FishPersonality).length)],
              genes: generateRandomGenes(species.id),
              age: 0,
              generation: 0
            };
            
            // Trigger quest check
            setTimeout(() => get().checkQuestProgress(), 0);

            return {
              money: state.money - finalCost,
              fish: [...state.fish, newFish]
            };
          });
          return true;
        }
        return false;
      },

      buyDecoration: (itemId) => {
        const { money, skills } = get();
        const decorationItem = DECORATIONS.find(d => d.id === itemId);
        if (!decorationItem) return false;

        // Discount Skill
        const discountLvl = skills[SkillId.DISCOUNT_SHOP] || 0;
        const discountMult = SKILLS[SkillId.DISCOUNT_SHOP].effect(discountLvl);
        const finalCost = decorationItem.cost * discountMult;

        if (money >= finalCost) {
          set((state) => {
            const newDecoration: EntityDecoration = {
              id: crypto.randomUUID(),
              itemId: itemId,
              x: 100 + Math.random() * 600, // Random placement for now
              y: 400 + Math.random() * 150, // Near bottom
              scale: 1.0,
              growth: decorationItem.type === 'PLANT' ? 0.1 : undefined // Plants start small
            };

            return {
              money: state.money - finalCost,
              decorations: [...state.decorations, newDecoration]
            };
          });
          return true;
        }
        return false;
      },

      buyUpgrade: (upgradeId) => {
        const { money, upgrades, skills } = get();
        const upgrade = UPGRADES[upgradeId];
        const currentLevel = upgrades[upgradeId] || 0;

        if (currentLevel >= upgrade.maxLevel) return false;

        const baseCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
        
        // Discount Skill
        const discountLvl = skills[SkillId.DISCOUNT_SHOP] || 0;
        const discountMult = SKILLS[SkillId.DISCOUNT_SHOP].effect(discountLvl);
        const finalCost = baseCost * discountMult;

        if (money >= finalCost) {
          set((state) => ({
            money: state.money - finalCost,
            upgrades: { ...state.upgrades, [upgradeId]: currentLevel + 1 }
          }));
          return true;
        }
        return false;
      },

      treatFish: (fishId, medicineId) => {
        const { money, fish } = get();
        const medicine = MEDICINES.find(m => m.id === medicineId);
        if (!medicine) return false;
        
        const targetFish = fish.find(f => f.id === fishId);
        if (!targetFish || !targetFish.disease) return false; // Only treat sick fish

        if (money >= medicine.cost) {
           set(state => ({
               money: state.money - medicine.cost,
               fish: state.fish.map(f => {
                   if (f.id === fishId) {
                       // Check if med cures this disease
                       if (medicine.cures.includes(f.disease!)) {
                           return { ...f, disease: undefined, health: Math.min(100, f.health + 20) };
                       }
                   }
                   return f;
               })
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
          ACHIEVEMENTS.forEach(ach => {
            if (!state.achievements.includes(ach.id) && ach.condition(newStats)) {
              setTimeout(() => get().unlockAchievement(ach.id), 0);
            }
          });
          return { stats: newStats };
        });
      },

      toggleShop: () => set((state) => ({ isShopOpen: !state.isShopOpen, isSettingsOpen: false, isSellMode: false })),
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen, isShopOpen: false, isSellMode: false })),
      toggleSellMode: () => set((state) => ({ isSellMode: !state.isSellMode, isShopOpen: false, isSettingsOpen: false })),

      sellFish: (fishId) => {
        set((state) => {
          const fishToSell = state.fish.find(f => f.id === fishId);
          if (!fishToSell) return {};

          const species = FISH_SPECIES.find(s => s.id === fishToSell.speciesId);
          const value = species ? species.cost * 0.5 : 0;

          return {
            money: state.money + value,
            fish: state.fish.filter(f => f.id !== fishId)
          };
        });
      },

      removeFish: (fishId) => {
        set((state) => ({
          fish: state.fish.filter(f => f.id !== fishId)
        }));
      },

      breedFish: (parent1Id, parent2Id) => {
        const { fish, upgrades, skills } = get();
        const maxFish = UPGRADES.tankSize.effect(upgrades.tankSize);
        if (fish.length >= maxFish) return;

        const p1 = fish.find(f => f.id === parent1Id);
        const p2 = fish.find(f => f.id === parent2Id);
        if (!p1 || !p2) return;

        const now = Date.now();
        
        // Apply Skill: Genetic Mastery
        const breedSkillLvl = skills[SkillId.BETTER_BREEDING] || 0;
        const cooldownMult = SKILLS[SkillId.BETTER_BREEDING].effect(breedSkillLvl);
        const BREED_COOLDOWN_MS = GAME_CONFIG.BREED_COOLDOWN_MS * cooldownMult;

        // Check cooldown for parent 1
        if (p1.lastBreedTime && (now - p1.lastBreedTime < BREED_COOLDOWN_MS)) {
          console.log(`Parent 1 (${p1.speciesId}) is on cooldown.`);
          return;
        }

        // Check cooldown for parent 2
        if (p2.lastBreedTime && (now - p2.lastBreedTime < BREED_COOLDOWN_MS)) {
          console.log(`Parent 2 (${p2.speciesId}) is on cooldown.`);
          return;
        }

        const childSpeciesId = Math.random() < 0.5 ? p1.speciesId : p2.speciesId;

        const newGenes = generateOffspringGenes(p1.genes, p2.genes);

        const child: EntityFish = {
          id: crypto.randomUUID(),
          speciesId: childSpeciesId,
          x: p1.x,
          y: p1.y,
          vx: 0, vy: 0,
          scale: 0.5, // Baby
          hunger: 100,
          health: 100,
          maxHunger: 100,
          state: 'IDLE',
          targetId: null,
          personalityOffset: Math.random() * 1000,
          personality: Math.random() < 0.5 ? p1.personality : p2.personality, // Inherit personality
          genes: newGenes,
          age: 0,
          generation: Math.max(p1.generation, p2.generation) + 1,
          parents: [p1.id, p2.id]
        };

        set(state => ({
          fish: state.fish.map(f => {
            if (f.id === p1.id || f.id === p2.id) {
              return { ...f, lastBreedTime: now };
            }
            return f;
          }).concat(child),
          // Update Quests
          quests: state.quests.map(q => {
              if (q.type === QuestType.BREED_FISH && !q.completed) {
                  return { ...q, progress: q.progress + 1, completed: q.progress + 1 >= q.target };
              }
              return q;
          })
        }));
      },

      updateWaterParams: (params) => {
        set(state => {
           const newState = { ...state, waterParams: { ...state.waterParams, ...params } };
           // Check Clean Tank quest
           if (params.ammonia !== undefined && params.ammonia === 0) {
               newState.quests = state.quests.map(q => {
                   if (q.type === QuestType.CLEAN_TANK && !q.completed) {
                       return { ...q, progress: 1, completed: true };
                   }
                   return q;
               });
           }
           return newState;
        });
      },

      setTimeOfDay: (time) => set({ timeOfDay: time }),

      prestigeReset: () => {
        const { stats, achievements, gems } = get();
        const bonusGems = Math.floor(stats.totalCoinsEarned / 10000);

        set({
          money: 0,
          fish: [],
          waterParams: { ph: 7.0, temperature: 25, ammonia: 0, nitrites: 0, nitrates: 0, algae: 0 },
          upgrades: { foodQuality: 0, autoFeeder: 0, magnet: 0, tankSize: 0, metabolism: 0, heater: 0, filter: 0, lights: 0 },
          prestige: get().prestige + 1,
          gems: gems + bonusGems,
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