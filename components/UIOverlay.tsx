import React, { useEffect, useState } from 'react';
import { useGameStore } from '../services/store';
import { ACHIEVEMENTS } from '../constants';
import BreedingTankModal from './BreedingTankModal';
import WaterMonitor from './WaterMonitor';
import QuestBoard from './QuestBoard';
import SkillTreeModal from './SkillTreeModal';
import BiomeModal from './BiomeModal';
import PrestigeModal from './PrestigeModal';
import LeaderboardModal from './LeaderboardModal';
import StatsModal from './StatsModal';
import FishLogModal from './FishLogModal';
import EventLogModal from './EventLogModal';
import { soundManager } from '../services/SoundManager';

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
  const [isPrestigeModalOpen, setIsPrestigeModalOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);
  const [isFishLogOpen, setIsFishLogOpen] = useState<boolean>(false);
  const [isEventLogOpen, setIsEventLogOpen] = useState<boolean>(false);

  const toggleBreedingModal = () => {
    soundManager.playSFX('UI_CLICK');
    setIsBreedingModalOpen(!isBreedingModalOpen);
  };

  const toggleLeaderboard = () => {
    soundManager.playSFX('UI_CLICK');
    setIsLeaderboardOpen(!isLeaderboardOpen);
  };
  
  const toggleStatsModal = () => {
    soundManager.playSFX('UI_CLICK');
    setIsStatsModalOpen(!isStatsModalOpen);
  };

  const toggleFishLog = () => {
    soundManager.playSFX('UI_CLICK');
    setIsFishLogOpen(!isFishLogOpen);
  };

  const toggleEventLog = () => {
    soundManager.playSFX('UI_CLICK');
    setIsEventLogOpen(!isEventLogOpen);
  };

  const toggleSkillModal = () => {
    soundManager.playSFX('UI_CLICK');
    setIsSkillModalOpen(!isSkillModalOpen);
  };

  const toggleBiomeModal = () => {
    soundManager.playSFX('UI_CLICK');
    setIsBiomeModalOpen(!isBiomeModalOpen);
  };

  const togglePrestigeModal = () => {
    soundManager.playSFX('UI_CLICK');
    setIsPrestigeModalOpen(!isPrestigeModalOpen);
  };

  const handleShopToggle = () => {
      soundManager.playSFX('UI_CLICK');
      toggleShop();
  };

  const handleSellToggle = () => {
      soundManager.playSFX('UI_CLICK');
      toggleSellMode();
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

  const prestigeMultiplier = (1 + (prestige * 0.1)).toFixed(1);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6">

      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Money Badge */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/20 flex items-center gap-3 hover:scale-105 transition-transform duration-200">
            <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full animate-pulse-glow">
              <span className="text-2xl">🪙</span>
            </div>
            <div key={money} className="animate-pop-in">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Balance</p>
              <p className="text-xl sm:text-2xl font-mono font-black text-slate-800 dark:text-amber-400">
                ${money.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Stats / Prestige */}
          <div className="bg-black/40 backdrop-blur text-white text-xs p-2 rounded-lg inline-block mb-2">
            <p>Prestige Multiplier: <span className="text-amber-400 font-bold">x{prestigeMultiplier}</span></p>
            <p>Fish Fed: {stats.fishFedCount}</p>
          </div>

          {/* Water Monitor */}
          <WaterMonitor />

          {/* Quest Board */}
          <QuestBoard />
        </div>

        <div className="flex flex-col gap-3 pointer-events-auto mt-16 sm:mt-0">
          {/* Menu Buttons Group */}
          <div className="flex flex-col gap-2">
             <button
                onClick={handleShopToggle}
                className="group relative w-16 h-16 bg-slate-900/80 rounded-2xl border border-blue-500/50 hover:border-blue-400 hover:bg-blue-600/20 transition-all active:scale-95 flex flex-col items-center justify-center shadow-lg shadow-black/50 backdrop-blur-md"
                title="Shop"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">🏪</div>
                <span className="text-[10px] font-bold text-blue-200 mt-1">SHOP</span>
              </button>

              <button
                onClick={toggleBreedingModal}
                className="group relative w-16 h-16 bg-slate-900/80 rounded-2xl border border-green-500/50 hover:border-green-400 hover:bg-green-600/20 transition-all active:scale-95 flex flex-col items-center justify-center shadow-lg shadow-black/50 backdrop-blur-md"
                title="Breeding"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">🧬</div>
                <span className="text-[10px] font-bold text-green-200 mt-1">BREED</span>
              </button>

              <button
                onClick={toggleSkillModal}
                className="group relative w-16 h-16 bg-slate-900/80 rounded-2xl border border-purple-500/50 hover:border-purple-400 hover:bg-purple-600/20 transition-all active:scale-95 flex flex-col items-center justify-center shadow-lg shadow-black/50 backdrop-blur-md"
                title="Research Lab"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">🧪</div>
                <span className="text-[10px] font-bold text-purple-200 mt-1">LAB</span>
              </button>

              <button
                onClick={toggleBiomeModal}
                className="group relative w-16 h-16 bg-slate-900/80 rounded-2xl border border-cyan-500/50 hover:border-cyan-400 hover:bg-cyan-600/20 transition-all active:scale-95 flex flex-col items-center justify-center shadow-lg shadow-black/50 backdrop-blur-md"
                title="Themes"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">🌊</div>
                <span className="text-[10px] font-bold text-cyan-200 mt-1">THEME</span>
              </button>

              <button
                onClick={toggleStatsModal}
                className="group relative w-16 h-16 bg-slate-900/80 rounded-2xl border border-blue-500/50 hover:border-blue-400 hover:bg-blue-600/20 transition-all active:scale-95 flex flex-col items-center justify-center shadow-lg shadow-black/50 backdrop-blur-md"
                title="Statistics"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">📊</div>
                <span className="text-[10px] font-bold text-blue-200 mt-1">STATS</span>
              </button>

              <button
                onClick={toggleFishLog}
                className="group relative w-16 h-16 bg-slate-900/80 rounded-2xl border border-cyan-500/50 hover:border-cyan-400 hover:bg-cyan-600/20 transition-all active:scale-95 flex flex-col items-center justify-center shadow-lg shadow-black/50 backdrop-blur-md"
                title="Fish Log"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">📖</div>
                <span className="text-[10px] font-bold text-cyan-200 mt-1">LOG</span>
              </button>

              <button
                onClick={toggleEventLog}
                className="group relative w-16 h-16 bg-slate-900/80 rounded-2xl border border-red-500/50 hover:border-red-400 hover:bg-red-600/20 transition-all active:scale-95 flex flex-col items-center justify-center shadow-lg shadow-black/50 backdrop-blur-md"
                title="Event Log"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">📜</div>
                <span className="text-[10px] font-bold text-red-200 mt-1">EVENTS</span>
              </button>

              <button
                onClick={handleSellToggle}
                className={`group relative w-16 h-16 rounded-2xl border transition-all active:scale-95 flex flex-col items-center justify-center shadow-lg shadow-black/50 backdrop-blur-md
                  ${isSellMode 
                    ? 'bg-red-500/80 border-red-400 animate-pulse shadow-red-500/50' 
                    : 'bg-slate-900/80 border-amber-500/50 hover:border-amber-400 hover:bg-amber-600/20'
                  }`}
                title="Sell Mode"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">{isSellMode ? '🚫' : '💰'}</div>
                <span className={`text-[10px] font-bold mt-1 ${isSellMode ? 'text-white' : 'text-amber-200'}`}>{isSellMode ? 'CANCEL' : 'SELL'}</span>
              </button>

              <button
                onClick={toggleLeaderboard}
                className="group relative w-16 h-16 bg-slate-900/80 rounded-2xl border border-yellow-500/50 hover:border-yellow-400 hover:bg-yellow-600/20 transition-all active:scale-95 flex flex-col items-center justify-center shadow-lg shadow-black/50 backdrop-blur-md"
                title="Leaderboard"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">🏆</div>
                <span className="text-[10px] font-bold text-yellow-200 mt-1">TOP</span>
              </button>

              <button
                onClick={togglePrestigeModal}
                className="group relative w-16 h-16 bg-slate-900/80 rounded-2xl border border-fuchsia-500/50 hover:border-fuchsia-400 hover:bg-fuchsia-600/20 transition-all active:scale-95 flex flex-col items-center justify-center shadow-lg shadow-black/50 backdrop-blur-md"
                title="Prestige"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">✨</div>
                <span className="text-[10px] font-bold text-fuchsia-200 mt-1">RANK</span>
              </button>

              {/* Dev Button */}
              <button
                onClick={() => useGameStore.getState().addMoney(20000)}
                className="group relative w-16 h-16 bg-black/80 rounded-2xl border border-gray-500/50 hover:border-white hover:bg-gray-800 transition-all active:scale-95 flex flex-col items-center justify-center shadow-lg shadow-black/50 backdrop-blur-md"
                title="Add 20k Cash"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">🔧</div>
                <span className="text-[10px] font-bold text-gray-200 mt-1">DEV</span>
              </button>
          </div>
        </div>
      </div>

      {/* Achievement Toast */}
      {lastAchievement && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full shadow-xl font-bold animate-pop-in border-2 border-white flex items-center gap-2 pointer-events-auto">
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
      <PrestigeModal isOpen={isPrestigeModalOpen} onClose={togglePrestigeModal} />
      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={toggleLeaderboard} />
      <StatsModal isOpen={isStatsModalOpen} onClose={toggleStatsModal} />
      <FishLogModal isOpen={isFishLogOpen} onClose={toggleFishLog} />
      <EventLogModal isOpen={isEventLogOpen} onClose={toggleEventLog} />
    </div>
  );
};

export default UIOverlay;