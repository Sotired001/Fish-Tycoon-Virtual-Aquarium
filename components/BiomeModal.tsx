import React from 'react';
import { useGameStore } from '../services/store';
import { BIOMES } from '../constants';

interface BiomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BiomeModal: React.FC<BiomeModalProps> = ({ isOpen, onClose }) => {
  const { gems, unlockedBiomeIds, currentBiomeId, buyBiome, setBiome } = useGameStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
      <div className="bg-slate-900 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-cyan-500/30 relative pointer-events-auto">
        
        {/* Header */}
        <div className="p-6 bg-slate-950 text-white flex justify-between items-center border-b border-white/10 z-10">
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-600">Themes & Biomes</h2>
            <p className="text-sm text-slate-400">Customize your aquarium environment.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-slate-800 px-4 py-2 rounded-full flex items-center gap-2 border border-amber-500/50">
                <span className="text-xl">💎</span>
                <span className="font-mono font-bold text-amber-400 text-xl">{gems}</span>
             </div>
             <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl">&times;</button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 z-10 bg-slate-900">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {BIOMES.map(biome => {
                  const isUnlocked = unlockedBiomeIds.includes(biome.id);
                  const isEquipped = currentBiomeId === biome.id;
                  const canAfford = gems >= biome.cost;

                  return (
                      <div key={biome.id} className={`relative border p-6 rounded-xl overflow-hidden transition-all group ${isEquipped ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-white/5 hover:border-white/20'}`}>
                          
                          {/* Preview Background */}
                          <div 
                            className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity"
                            style={{ background: `linear-gradient(to bottom, ${biome.backgroundGradient[0]}, ${biome.backgroundGradient[1]})` }}
                          />
                          
                          <div className="relative z-10 flex justify-between items-start mb-4">
                              <div>
                                  <h3 className="text-2xl font-bold text-white drop-shadow-md">{biome.name} {isEquipped && <span className="text-xs align-middle bg-cyan-500 text-black px-2 py-0.5 rounded-full ml-2">ACTIVE</span>}</h3>
                                  <p className="text-slate-200 text-sm mt-1 drop-shadow-sm h-10">{biome.description}</p>
                              </div>
                          </div>

                          <div className="relative z-10 flex justify-between items-center mt-8">
                              <div className="flex items-center gap-2">
                                  <span className="text-xs uppercase tracking-wider text-slate-300 bg-black/30 px-2 py-1 rounded">
                                    Particle: {biome.particleType}
                                  </span>
                              </div>

                              {isUnlocked ? (
                                  <button 
                                    onClick={() => setBiome(biome.id)}
                                    disabled={isEquipped}
                                    className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all pointer-events-auto ${
                                        isEquipped 
                                        ? 'bg-cyan-900/50 text-cyan-500 cursor-default' 
                                        : 'bg-white text-slate-900 hover:bg-cyan-50 hover:text-cyan-700 shadow-lg'
                                    }`}
                                  >
                                      {isEquipped ? 'Equipped' : 'Select'}
                                  </button>
                              ) : (
                                  <button 
                                    onClick={() => buyBiome(biome.id)}
                                    disabled={!canAfford}
                                    className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all pointer-events-auto ${
                                        canAfford 
                                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20' 
                                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    }`}
                                  >
                                      <span>Unlock</span>
                                      <div className="bg-black/20 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                                          💎 {biome.cost}
                                      </div>
                                  </button>
                              )}
                          </div>
                      </div>
                  );
              })}
           </div>
        </div>
      </div>
    </div>
  );
};

export default BiomeModal;