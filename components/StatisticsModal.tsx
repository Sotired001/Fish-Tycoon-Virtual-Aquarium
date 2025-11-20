import React from 'react';
import { useGameStore } from '../services/store';

interface StatisticsModalProps {
  onClose: () => void;
}

const StatisticsModal: React.FC<StatisticsModalProps> = ({ onClose }) => {
  const { stats, fish, money, gems, prestige, startTime } = useGameStore();

  const formatTime = (ms: number) => {
      const seconds = Math.floor((Date.now() - ms) / 1000);
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}h ${m}m`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-lg border-2 border-yellow-500 max-w-md w-full text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-300">Statistics</h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 text-xl font-bold">✕</button>
        </div>

        <div className="space-y-4">
            <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Time Played</span>
                <span className="font-mono">{formatTime(startTime)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Current Money</span>
                <span className="font-mono text-green-400">${Math.floor(money)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Total Earned</span>
                <span className="font-mono text-yellow-400">${Math.floor(stats.totalCoinsEarned)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Gems</span>
                <span className="font-mono text-purple-400">💎 {gems}</span>
            </div>
            <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Prestige Level</span>
                <span className="font-mono text-cyan-400">⭐ {prestige}</span>
            </div>
            <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Fish Owned</span>
                <span className="font-mono">{fish.length}</span>
            </div>
            <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Fish Fed</span>
                <span className="font-mono">{stats.fishFedCount} times</span>
            </div>
            <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Clicks</span>
                <span className="font-mono">{stats.clicks}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsModal;
