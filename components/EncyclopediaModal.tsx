import React from 'react';
import { useGameStore } from '../services/store';
import { FISH_SPECIES } from '../constants';

interface EncyclopediaModalProps {
  onClose: () => void;
}

const EncyclopediaModal: React.FC<EncyclopediaModalProps> = ({ onClose }) => {
  const { discoveredSpecies } = useGameStore();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-lg border-2 border-cyan-500 max-w-2xl w-full max-h-[80vh] overflow-y-auto text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-cyan-300">Fish Encyclopedia</h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 text-xl font-bold">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FISH_SPECIES.map(species => {
            const isDiscovered = discoveredSpecies.includes(species.id);

            return (
              <div
                key={species.id}
                className={`p-4 rounded border ${isDiscovered ? 'bg-slate-700 border-slate-600' : 'bg-slate-900 border-slate-800'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">
                    {isDiscovered ? species.emoji : '❓'}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isDiscovered ? 'text-white' : 'text-slate-500'}`}>
                      {isDiscovered ? species.name : '???'}
                    </h3>
                    <p className="text-xs text-cyan-400">{isDiscovered ? species.rarity : ''}</p>
                  </div>
                </div>

                {isDiscovered && (
                  <div className="mt-3 text-sm text-slate-300 space-y-1">
                    <p className="italic">"{species.description}"</p>
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                       <span>Diet: {species.diet || 'Omnivore'}</span>
                       <span>Speed: {species.speed}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                        Prefers: pH {species.preferredWater?.phRange[0]}-{species.preferredWater?.phRange[1]} | {species.preferredWater?.tempRange[0]}-{species.preferredWater?.tempRange[1]}°C
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center text-slate-500 text-sm">
           Discovered: {discoveredSpecies.length} / {FISH_SPECIES.length}
        </div>
      </div>
    </div>
  );
};

export default EncyclopediaModal;
