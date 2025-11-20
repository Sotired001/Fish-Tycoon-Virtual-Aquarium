import React from 'react';
import { useGameStore } from '../services/store';
import { FISH_SPECIES } from '../constants';

const FishDetailsModal: React.FC = () => {
  const { selectedFishId, fish: allFish, selectFish, toggleFavorite, sellFish } = useGameStore();

  if (!selectedFishId) return null;

  const fish = allFish.find(f => f.id === selectedFishId);

  // Close if fish not found (e.g. sold)
  if (!fish) {
      selectFish(null);
      return null;
  }

  const species = FISH_SPECIES.find(s => s.id === fish.speciesId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => selectFish(null)}>
      <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-600 relative" onClick={e => e.stopPropagation()}>
        <button
            onClick={() => selectFish(null)}
            className="absolute top-2 right-2 text-slate-400 hover:text-white"
        >
            ✕
        </button>

        <div className="flex flex-col items-center">
            <div className="text-6xl mb-4 bg-slate-700 rounded-full p-4 shadow-inner">
                {species?.emoji}
            </div>

            <h2 className="text-2xl font-bold text-cyan-300 mb-1">{fish.name || species?.name}</h2>
            <p className="text-sm text-slate-400 mb-4">{species?.name} • Gen {fish.generation}</p>

            <div className="w-full space-y-3 bg-slate-900/50 p-4 rounded-xl">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Health</span>
                    <span className={fish.health < 50 ? 'text-red-400' : 'text-green-400'}>{Math.round(fish.health)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Hunger</span>
                    <span className={fish.hunger < 50 ? 'text-green-400' : 'text-red-400'}>{Math.round(fish.hunger)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Age</span>
                    <span className="text-slate-200">{Math.floor(fish.age / 1000)}s</span>
                </div>
                 {fish.disease && (
                    <div className="flex justify-between text-sm text-red-400 font-bold">
                        <span>Infection</span>
                        <span>{fish.disease}</span>
                    </div>
                )}
            </div>

            <div className="flex gap-2 mt-6 w-full">
                <button
                    onClick={() => toggleFavorite(fish.id)}
                    className={`flex-1 py-2 rounded-lg font-bold transition-colors ${fish.isFavorite ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-slate-600 hover:bg-slate-500 text-white'}`}
                >
                    {fish.isFavorite ? '★ Favorite' : '☆ Favorite'}
                </button>

                <button
                    onClick={() => {
                        if (fish.isFavorite) return;
                        sellFish(fish.id);
                        selectFish(null);
                    }}
                    disabled={!!fish.isFavorite}
                    className={`flex-1 py-2 rounded-lg font-bold transition-colors ${fish.isFavorite ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 text-white'}`}
                >
                    Sell
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FishDetailsModal;
