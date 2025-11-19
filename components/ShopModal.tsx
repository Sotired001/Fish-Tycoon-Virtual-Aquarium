import React, { useState } from 'react';
import { useGameStore } from '../services/store';
import { FISH_SPECIES, UPGRADES, DECORATIONS } from '../constants';
import { FishRarity } from '../types';

const ShopModal: React.FC = () => {
  const {
    money,
    upgrades,
    buyFish,
    buyUpgrade,
    buyDecoration,
    fish: ownedFish,
    toggleShop,
    isShopOpen,
    treatFish,
    sellFish
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'FISH' | 'UPGRADES' | 'DECOR' | 'MY_TANK'>('FISH');

  if (!isShopOpen) return null;

  const tankLevel = upgrades.tankSize || 0;
  const maxFish = UPGRADES.tankSize.effect(tankLevel);
  const currentFishCount = ownedFish.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/90 dark:bg-slate-800/90 w-full max-w-3xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20">

        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-amber-400">Aquarium Shop</h2>
            <p className="text-sm text-slate-400">Balance: <span className="text-amber-400 font-mono text-lg">${money.toLocaleString()}</span></p>
          </div>
          <button onClick={toggleShop} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 text-xs md:text-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('FISH')}
            className={`flex-1 p-4 font-bold transition-colors whitespace-nowrap ${activeTab === 'FISH' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:bg-slate-800/50'}`}
          >
            Buy Fish
          </button>
          <button
            onClick={() => setActiveTab('DECOR')}
            className={`flex-1 p-4 font-bold transition-colors whitespace-nowrap ${activeTab === 'DECOR' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:bg-slate-800/50'}`}
          >
            Decorations
          </button>
          <button
            onClick={() => setActiveTab('UPGRADES')}
            className={`flex-1 p-4 font-bold transition-colors whitespace-nowrap ${activeTab === 'UPGRADES' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:bg-slate-800/50'}`}
          >
            Equipment
          </button>
          <button
            onClick={() => setActiveTab('MY_TANK')}
            className={`flex-1 p-4 font-bold transition-colors whitespace-nowrap ${activeTab === 'MY_TANK' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:bg-slate-800/50'}`}
          >
            My Tank ({currentFishCount}/{maxFish})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-900/50">

          {activeTab === 'MY_TANK' && (
            <div className="grid grid-cols-1 gap-4">
              {ownedFish.length === 0 && <p className="text-slate-500 text-center py-10">Your tank is empty. Go buy some fish!</p>}
              {ownedFish.map(fish => {
                const species = FISH_SPECIES.find(s => s.id === fish.speciesId);
                const isSick = !!fish.disease;

                return (
                  <div key={fish.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{species?.emoji}</div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">{species?.name} <span className="text-xs text-slate-500">({fish.id.substring(0, 4)})</span></h3>
                        <div className="flex gap-2 text-xs">
                          <span className={`${fish.health < 50 ? 'text-red-500' : 'text-green-500'}`}>HP: {Math.round(fish.health)}%</span>
                          <span className={`${fish.hunger < 50 ? 'text-green-500' : 'text-red-500'}`}>Hunger: {Math.round(fish.hunger)}%</span>
                          {isSick && <span className="text-red-500 font-bold animate-pulse">INFECTED: {fish.disease}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isSick && (
                        <button
                          onClick={() => treatFish(fish.id, 'med_general')}
                          disabled={money < 100}
                          className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs font-bold"
                        >
                          Cure ($100)
                        </button>
                      )}
                      <button
                        onClick={() => sellFish(fish.id)}
                        className="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded text-xs font-bold"
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'FISH' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FISH_SPECIES.map(fish => {
                const ownedCount = ownedFish.filter(f => f.speciesId === fish.id).length;
                const canAfford = money >= fish.cost;
                const isFull = currentFishCount >= maxFish;

                let bgGradient = 'bg-white dark:bg-slate-800';
                if (fish.rarity === FishRarity.LEGENDARY) bgGradient = 'bg-gradient-to-br from-amber-900/20 to-slate-800';
                if (fish.rarity === FishRarity.EPIC) bgGradient = 'bg-gradient-to-br from-purple-900/20 to-slate-800';

                return (
                  <div key={fish.id} className={`${bgGradient} p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm`}>
                    <div className="text-4xl p-2 bg-slate-200 dark:bg-slate-700 rounded-full w-16 h-16 flex items-center justify-center">
                      {fish.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className={`font-bold ${fish.rarity === FishRarity.LEGENDARY ? 'text-amber-500' :
                            fish.rarity === FishRarity.EPIC ? 'text-purple-400' : 'text-slate-800 dark:text-white'
                          }`}>{fish.name}</h3>
                        <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">Owned: {ownedCount}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{fish.description}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Earns: ~{fish.baseValue} coins</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-mono font-bold text-green-600">${fish.cost.toLocaleString()}</span>
                        <button
                          onClick={() => buyFish(fish)}
                          disabled={!canAfford || isFull}
                          className={`px-4 py-1 rounded-lg text-sm font-bold ${!canAfford || isFull
                              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                              : 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20'
                            }`}
                        >
                          {isFull ? 'Tank Full' : 'Buy'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'DECOR' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DECORATIONS.map(item => {
                const canAfford = money >= item.cost;

                return (
                  <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
                    <div className="text-4xl p-2 bg-slate-200 dark:bg-slate-700 rounded-full w-16 h-16 flex items-center justify-center">
                      {item.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-slate-800 dark:text-white">{item.name}</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{item.type}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{item.description}</p>
                      {item.effect && (
                        <p className="text-xs text-green-500 mb-2">
                          Effect: {item.effect.type} (+{item.effect.value})
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-mono font-bold text-green-600">${item.cost.toLocaleString()}</span>
                        <button
                          onClick={() => buyDecoration(item.id)}
                          disabled={!canAfford}
                          className={`px-4 py-1 rounded-lg text-sm font-bold ${!canAfford
                              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                              : 'bg-purple-500 hover:bg-purple-400 text-white shadow-lg shadow-purple-500/20'
                            }`}
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'UPGRADES' && (
            <div className="grid grid-cols-1 gap-4">
              {Object.values(UPGRADES).map(upgrade => {
                const currentLevel = upgrades[upgrade.id] || 0;
                const isMaxed = currentLevel >= upgrade.maxLevel;
                const nextCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
                const canAfford = money >= nextCost;

                return (
                  <div key={upgrade.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-sm">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 dark:text-white">{upgrade.name}</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Lvl {currentLevel} / {upgrade.maxLevel}</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{upgrade.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {!isMaxed && <span className="font-mono font-bold text-green-600">${nextCost.toLocaleString()}</span>}
                      <button
                        onClick={() => buyUpgrade(upgrade.id)}
                        disabled={isMaxed || !canAfford}
                        className={`px-4 py-2 rounded-lg text-sm font-bold min-w-[100px] ${isMaxed
                            ? 'bg-green-500/20 text-green-600'
                            : (!canAfford ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white')
                          }`}
                      >
                        {isMaxed ? 'MAXED' : 'Upgrade'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopModal;