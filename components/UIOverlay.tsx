import React, { useEffect, useState } from 'react';
import { useGameStore } from '../services/store';
import { ACHIEVEMENTS } from '../constants';
import BreedingTankModal from './BreedingTankModal';
import WaterMonitor from './WaterMonitor';
import QuestBoard from './QuestBoard';
import SkillTreeModal from './SkillTreeModal';
import BiomeModal from './BiomeModal';

const UIOverlay: React.FC = () => {
  const {
    money,
    toggleShop,
    stats,
    achievements,
    prestige,
    prestigeReset,
    isSellMode,
    toggleSellMode
  } = useGameStore();

  const [lastAchievement, setLastAchievement] = useState<string | null>(null);
  const [isBreedingModalOpen, setIsBreedingModalOpen] = useState<boolean>(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState<boolean>(false);
  const [isBiomeModalOpen, setIsBiomeModalOpen] = useState<boolean>(false);

  const toggleBreedingModal = () => {
    setIsBreedingModalOpen(!isBreedingModalOpen);
  };

  const toggleSkillModal = () => {
    setIsSkillModalOpen(!isSkillModalOpen);
  };

  const toggleBiomeModal = () => {
    setIsBiomeModalOpen(!isBiomeModalOpen);
  };

  useEffect(() => {
    if (achievements.length > 0) {
      const lastId = achievements[achievements.length - 1];
      const ach = ACHIEVEMENTS.find(a => a.id === lastId);
      if (ach) {
        setLastAchievement(ach.name);
        const timer = setTimeout(() => setLastAchievement(null), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [achievements]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6">

      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Money Badge */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/20 flex items-center gap-3 animate-bounce-sm">
            <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full">
              <span className="text-2xl">🪙</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Balance</p>
              <p className="text-xl sm:text-2xl font-mono font-black text-slate-800 dark:text-amber-400">
                ${money.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Stats / Prestige */}
          <div className="bg-black/40 backdrop-blur text-white text-xs p-2 rounded-lg inline-block mb-2">
            <p>Prestige Multiplier: <span className="text-amber-400 font-bold">x{prestige.toFixed(1)}</span></p>
            <p>Fish Fed: {stats.fishFedCount}</p>
          </div>

          {/* Water Monitor */}
          <WaterMonitor />

          {/* Quest Board */}
          <QuestBoard />
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={toggleShop}
            className="bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-transform active:scale-95 flex flex-col items-center justify-center min-w-[80px]"
          >
            <span className="text-2xl mb-1">🏪</span>
            <span className="text-xs font-bold">SHOP</span>
          </button>

          <button
            onClick={toggleBreedingModal}
            className="bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white p-4 rounded-2xl shadow-lg shadow-green-500/30 transition-transform active:scale-95 flex flex-col items-center justify-center min-w-[80px]"
          >
            <span className="text-2xl mb-1">🧬</span>
            <span className="text-xs font-bold">BREED</span>
          </button>

          <button
            onClick={toggleSkillModal}
            className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white p-4 rounded-2xl shadow-lg shadow-purple-500/30 transition-transform active:scale-95 flex flex-col items-center justify-center min-w-[80px]"
          >
            <span className="text-2xl mb-1">🧪</span>
            <span className="text-xs font-bold">LAB</span>
          </button>

          <button
            onClick={toggleBiomeModal}
            className="bg-gradient-to-b from-cyan-500 to-cyan-700 hover:from-cyan-400 hover:to-cyan-600 text-white p-4 rounded-2xl shadow-lg shadow-cyan-500/30 transition-transform active:scale-95 flex flex-col items-center justify-center min-w-[80px]"
          >
            <span className="text-2xl mb-1">🌊</span>
            <span className="text-xs font-bold">THEMES</span>
          </button>

          <button
            onClick={toggleSellMode}
            className={`p-4 rounded-2xl shadow-lg transition-transform active:scale-95 flex flex-col items-center justify-center min-w-[80px] ${isSellMode
              ? 'bg-red-500 text-white shadow-red-500/30 animate-pulse'
              : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur'
              }`}
          >
            <span className="text-2xl mb-1">{isSellMode ? '🚫' : '💰'}</span>
            <span className="text-xs font-bold">{isSellMode ? 'CANCEL' : 'SELL'}</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm("Reset progress for Prestige bonus?")) prestigeReset();
            }}
            className="bg-purple-600/80 hover:bg-purple-600 text-white p-2 rounded-xl text-xs font-bold backdrop-blur"
          >
            Prestige
          </button>
        </div>
      </div>

      {/* Achievement Toast */}
      {lastAchievement && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full shadow-xl font-bold animate-bounce border-2 border-white flex items-center gap-2 pointer-events-auto">
          <span>🏆</span> Achievement Unlocked: {lastAchievement}
        </div>
      )}

      {/* Bottom Tutorial / Controls */}
      <div className="text-center pointer-events-none pb-4 opacity-70">
        <p className="text-white drop-shadow-md text-sm font-medium bg-black/20 inline-block px-4 py-1 rounded-full backdrop-blur">
          Tap to Feed • Collect Coins
        </p>
      </div>
      <BreedingTankModal isOpen={isBreedingModalOpen} onClose={toggleBreedingModal} />
      <SkillTreeModal isOpen={isSkillModalOpen} onClose={toggleSkillModal} />
      <BiomeModal isOpen={isBiomeModalOpen} onClose={toggleBiomeModal} />
    </div>
  );
};

export default UIOverlay;