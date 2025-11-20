import React, { useState, useMemo } from 'react';
import { useGameStore } from '../services/store';
import { EntityFish, SkillId, FishGenes, FishRarity } from '../types';
import { UPGRADES, GAME_CONFIG, SKILLS, FISH_SPECIES } from '../constants';
import { generateOffspringGenes } from '../utils/genetics';
import FishVisual from './FishVisual';

interface BreedingTankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BreedingTankModal: React.FC<BreedingTankModalProps> = ({ isOpen, onClose }) => {
  const allFish = useGameStore((state) => state.fish);
  const breedFishAction = useGameStore((state) => state.breedFish);
  const upgrades = useGameStore((state) => state.upgrades);
  const skills = useGameStore((state) => state.skills);

  const [parent1Id, setParent1Id] = useState<string | null>(null);
  const [parent2Id, setParent2Id] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Derived State
  const maxFish = UPGRADES.tankSize.effect(upgrades.tankSize || 0);
  const currentFishCount = allFish.length;
  const isTankFull = currentFishCount >= maxFish;
  
  const breedSkillLvl = skills[SkillId.BETTER_BREEDING] || 0;
  const cooldownMult = SKILLS[SkillId.BETTER_BREEDING].effect(breedSkillLvl);
  const BREED_COOLDOWN_MS = GAME_CONFIG.BREED_COOLDOWN_MS * cooldownMult;

  const getCooldownStatus = (fish: EntityFish) => {
    if (!fish.lastBreedTime) return { ready: true, text: 'Ready' };
    const elapsed = Date.now() - fish.lastBreedTime;
    const remaining = BREED_COOLDOWN_MS - elapsed;
    if (remaining <= 0) return { ready: true, text: 'Ready' };
    const mins = Math.ceil(remaining / 60000);
    return { ready: false, text: `${mins}m`, percent: Math.min(100, (elapsed / BREED_COOLDOWN_MS) * 100) };
  };

  const parent1 = allFish.find(f => f.id === parent1Id);
  const parent2 = allFish.find(f => f.id === parent2Id);

  const potentialOffspring = useMemo(() => {
    if (!parent1 || !parent2) return [];
    // Simulate 5 babies
    return Array.from({ length: 5 }).map(() => generateOffspringGenes(parent1.genes, parent2.genes));
  }, [parent1, parent2]);

  const handleFishClick = (fishId: string) => {
    setFeedback(null);
    if (parent1Id === fishId) {
      setParent1Id(null);
      return;
    }
    if (parent2Id === fishId) {
      setParent2Id(null);
      return;
    }

    if (!parent1Id) setParent1Id(fishId);
    else if (!parent2Id) setParent2Id(fishId);
    else {
      // Both full, replace the one clicked? or just swap 1?
      // Let's replace P1 for now or just do nothing
      setParent1Id(fishId);
      setParent2Id(null);
    }
  };

  const handleBreed = () => {
    if (!parent1Id || !parent2Id) return;
    if (isTankFull) {
      setFeedback("Tank is full! Upgrade tank or sell fish.");
      return;
    }
    breedFishAction(parent1Id, parent2Id);
    setFeedback("Breeding successful! Baby fish added.");
    setParent1Id(null);
    setParent2Id(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 pointer-events-auto">
      <div className="bg-slate-900 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700 pointer-events-auto">
        
        {/* Header */}
        <div className="p-4 md:p-6 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-pink-500 flex items-center gap-2">
              <span>🧬</span> Genetic Lab
            </h2>
            <p className="text-slate-400 text-sm">Combine DNA to create new species variants.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl">&times;</button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* LEFT PANEL: Breeding Chamber */}
          <div className="w-full md:w-1/3 bg-slate-900 p-6 flex flex-col gap-6 border-r border-slate-800 overflow-y-auto">
            
            {/* Slots */}
            <div className="flex gap-4 justify-center items-center">
              {/* Parent 1 Slot */}
              <div 
                className={`w-32 h-40 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${parent1 ? 'border-pink-500 bg-pink-500/10' : 'border-slate-700 hover:border-slate-500 border-dashed'}`}
                onClick={() => parent1Id && setParent1Id(null)}
              >
                {parent1 ? (
                  <>
                    <FishVisual genes={parent1.genes} size={80} />
                    <span className="mt-2 font-bold text-white text-sm">{FISH_SPECIES.find(s => s.id === parent1.speciesId)?.name}</span>
                    <span className="text-xs text-slate-400">Parent A</span>
                  </>
                ) : (
                  <span className="text-slate-600 text-4xl">+</span>
                )}
              </div>

              <span className="text-2xl text-slate-500">❤️</span>

              {/* Parent 2 Slot */}
              <div 
                className={`w-32 h-40 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${parent2 ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500 border-dashed'}`}
                onClick={() => parent2Id && setParent2Id(null)}
              >
                {parent2 ? (
                  <>
                    <FishVisual genes={parent2.genes} size={80} />
                    <span className="mt-2 font-bold text-white text-sm">{FISH_SPECIES.find(s => s.id === parent2.speciesId)?.name}</span>
                    <span className="text-xs text-slate-400">Parent B</span>
                  </>
                ) : (
                  <span className="text-slate-600 text-4xl">+</span>
                )}
              </div>
            </div>

            {/* Action & Feedback */}
            <div className="text-center">
               <button
                 onClick={handleBreed}
                 disabled={!parent1 || !parent2 || isTankFull}
                 className={`w-full py-3 rounded-xl font-bold text-lg shadow-lg transition-all ${
                   !parent1 || !parent2 || isTankFull
                     ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                     : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-105 hover:shadow-pink-500/25'
                 }`}
               >
                 {isTankFull ? 'Tank Full' : 'Breed Now'}
               </button>
               {feedback && <p className="mt-3 text-sm font-bold text-yellow-400 animate-pulse">{feedback}</p>}
            </div>

            {/* Simulation / Preview */}
            {parent1 && parent2 && (
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                <h3 className="text-slate-400 text-xs uppercase font-bold mb-3 tracking-wider">Projected Outcomes</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {potentialOffspring.map((genes, i) => (
                    <div key={i} className="bg-slate-900 p-2 rounded border border-slate-800" title="Possible baby">
                      <FishVisual genes={genes} size={40} />
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs text-slate-600 mt-2 italic">Simulation only. Actual results may vary due to mutation.</p>
              </div>
            )}
            
            <div className="bg-slate-800/50 p-4 rounded-lg text-xs text-slate-400">
              <h4 className="font-bold text-slate-300 mb-1">Stats</h4>
              <div className="flex justify-between">
                <span>Skill:</span>
                <span className="text-white">Lvl {breedSkillLvl} ({(cooldownMult * 100).toFixed(0)}% Time)</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Tank Capacity:</span>
                <span className={`${isTankFull ? 'text-red-400' : 'text-white'}`}>{currentFishCount} / {maxFish}</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Fish Selector */}
          <div className="flex-1 bg-slate-950 p-6 overflow-y-auto">
            <h3 className="text-white font-bold mb-4 flex justify-between items-center">
              <span>Select Parents</span>
              <span className="text-xs font-normal text-slate-500">{allFish.filter(f => f.age > 0).length} eligible fish</span>
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {allFish.filter(f => f.age >= 0).map(fish => {
                const species = FISH_SPECIES.find(s => s.id === fish.speciesId);
                const isSelected = parent1Id === fish.id || parent2Id === fish.id;
                const { ready, text, percent } = getCooldownStatus(fish);
                const rarityColor = species?.rarity === FishRarity.LEGENDARY ? 'text-amber-500' : 
                                  species?.rarity === FishRarity.EPIC ? 'text-purple-500' : 
                                  species?.rarity === FishRarity.RARE ? 'text-blue-400' : 'text-slate-300';

                return (
                  <div 
                    key={fish.id}
                    onClick={() => ready && handleFishClick(fish.id)}
                    className={`relative bg-slate-900 rounded-xl p-3 border-2 transition-all cursor-pointer group
                      ${isSelected ? 'border-green-500 ring-2 ring-green-500/30 bg-green-500/5' : 
                        !ready ? 'border-slate-800 opacity-60 cursor-wait' : 'border-slate-800 hover:border-slate-600 hover:bg-slate-800'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span className={`text-xs font-bold ${rarityColor}`}>{species?.name}</span>
                       <span className="text-[10px] font-mono text-slate-600">#{fish.id.substring(0,4)}</span>
                    </div>
                    
                    <div className="flex justify-center py-2 group-hover:scale-110 transition-transform">
                      <FishVisual genes={fish.genes} size={60} />
                    </div>

                    {/* Cooldown Bar */}
                    {!ready && (
                      <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-600" style={{ width: `${percent}%` }} />
                      </div>
                    )}
                    
                    <div className="mt-2 flex justify-between items-center">
                       <span className="text-[10px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded">Gen {fish.generation}</span>
                       <span className={`text-[10px] font-bold ${ready ? 'text-green-500' : 'text-slate-500'}`}>{text}</span>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-slate-900 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow-lg">
                        {parent1Id === fish.id ? 'A' : 'B'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {allFish.length === 0 && (
               <div className="text-center text-slate-500 mt-20">
                 <p className="text-4xl mb-2">🕸️</p>
                 <p>Your tank is empty.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreedingTankModal;