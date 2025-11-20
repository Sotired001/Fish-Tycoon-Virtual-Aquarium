import React from 'react';
import { useGameStore } from '../services/store';
import { FISH_SPECIES } from '../constants';

interface FishLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FishLogModal: React.FC<FishLogModalProps> = ({ isOpen, onClose }) => {
  const discoveredSpecies = useGameStore((state) => state.discoveredSpecies) || [];
  const allSpecies = FISH_SPECIES;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 pointer-events-auto">
      <div className="bg-slate-900 w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl border border-cyan-500/30 flex flex-col overflow-hidden pointer-events-auto">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-cyan-900/50 to-slate-900 border-b border-cyan-500/20 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
              <span>📖</span> Fish Log
            </h2>
            <p className="text-slate-400 text-xs uppercase tracking-wider">Encyclopedia</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allSpecies.map(species => {
            // Check if species is unlocked (for now we assume all are visible but maybe locked state?)
            // Or check if we own/owned one.
            // Since discoveredSpecies logic isn't fully populated in store actions yet, we might just show all for now
            // or assume if you can buy it you can see it.
            // Let's mark them as "Undiscovered" if not in list, assuming we track it.
            
            // Actually, let's default to showing all but greying out locked ones if we had unlock logic.
            // For now, just show them all as a reference guide.
            
            return (
              <div key={species.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex gap-4 items-start">
                <div className="text-4xl p-3 bg-slate-700/50 rounded-full">{species.emoji}</div>
                <div>
                  <h3 className="font-bold text-white text-lg">{species.name}</h3>
                  <p className="text-xs text-cyan-300 font-bold mb-1">{species.rarity}</p>
                  <p className="text-xs text-slate-400 italic mb-2">{species.description}</p>
                  
                  <div className="text-xs text-slate-500 grid grid-cols-2 gap-x-4">
                    <span>Value: ${species.baseValue}</span>
                    <span>Speed: {species.speed}</span>
                    <span>Diet: {species.diet}</span>
                    {species.preySpecies && <span>Eats: {species.preySpecies.join(', ')}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 bg-slate-950 text-center text-xs text-slate-500">
          {allSpecies.length} Species Documented
        </div>
      </div>
    </div>
  );
};

export default FishLogModal;