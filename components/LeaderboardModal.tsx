import React, { useMemo } from 'react';
import { useGameStore } from '../services/store';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAKE_NAMES = [
  "Captain Fin", "Shark Bait", "Bubbles", "Nemo_42", "Aquaman", 
  "Poseidon", "FishyMcFish", "Coral Queen", "Dr. Crab", "Salty Dog",
  "DeepDive", "GloopGloop", "Starfish_99", "The Kraken", "Sushi Chef",
  "Splash", "WetSocks", "HookLineSinker", "BetaFish", "GuppyKing"
];

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const { stats, prestige } = useGameStore();
  const playerScore = stats.totalCoinsEarned;

  // Generate leaderboard data memoized so it doesn't change on every render
  const leaderboardData = useMemo(() => {
    const data = [];
    
    // Add Player
    data.push({
      name: "YOU",
      score: Math.floor(playerScore),
      isPlayer: true,
      avatar: "👤"
    });

    // Add 9 Bots
    // 3 bots higher than player
    // 6 bots lower than player (or mixed)
    
    // Logic to generate scores around player score
    // Multiplier based on prestige to make numbers look big
    const baseScore = Math.max(1000, playerScore);
    
    for (let i = 0; i < 9; i++) {
      const name = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
      // Random factor: 0.5x to 5x of player score
      // If player is new (score 0), generate fake small scores
      const score = Math.floor(baseScore * (0.5 + Math.random() * 2)); 
      
      data.push({
        name,
        score,
        isPlayer: false,
        avatar: ["🐙", "🦀", "🐡", "🐠", "🦈", "🐳", "🦑", "🐢"][Math.floor(Math.random() * 8)]
      });
    }

    // Sort by score descending
    return data.sort((a, b) => b.score - a.score);
  }, [prestige]); // Regenerate only on prestige reset (or app load)

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 pointer-events-auto">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-amber-500/30 flex flex-col overflow-hidden pointer-events-auto max-h-[80vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-900/50 to-slate-900 border-b border-amber-500/20 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
              <span>🏆</span> Global Rankings
            </h2>
            <p className="text-slate-400 text-xs uppercase tracking-wider">Top Tycoons</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {leaderboardData.map((entry, index) => {
            const rank = index + 1;
            let rankStyle = "bg-slate-800 text-slate-400";
            let borderStyle = "border-slate-700";
            
            if (rank === 1) { rankStyle = "bg-yellow-500/20 text-yellow-400"; borderStyle = "border-yellow-500/50"; }
            if (rank === 2) { rankStyle = "bg-slate-300/20 text-slate-300"; borderStyle = "border-slate-400/50"; }
            if (rank === 3) { rankStyle = "bg-orange-700/20 text-orange-400"; borderStyle = "border-orange-700/50"; }
            if (entry.isPlayer) { borderStyle = "border-green-500"; rankStyle += " bg-green-500/10"; }

            return (
              <div 
                key={index} 
                className={`flex items-center p-3 rounded-xl border ${borderStyle} ${entry.isPlayer ? 'bg-green-900/20' : 'bg-slate-800/50'} transition-all hover:scale-[1.02]`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold mr-4 ${rankStyle}`}>
                  {rank}
                </div>
                <div className="mr-4 text-2xl">{entry.avatar}</div>
                <div className="flex-1">
                  <h3 className={`font-bold ${entry.isPlayer ? 'text-green-400' : 'text-white'}`}>
                    {entry.name} {entry.isPlayer && '(YOU)'}
                  </h3>
                </div>
                <div className="font-mono text-amber-400 font-bold">
                  ${entry.score.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 bg-slate-950 text-center text-xs text-slate-500">
          Rankings update daily (simulated)
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;