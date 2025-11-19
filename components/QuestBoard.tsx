import React, { useEffect } from 'react';
import { useGameStore } from '../services/store';
import { Quest } from '../types';

const QuestBoard: React.FC = () => {
  const { quests, refreshQuests, claimQuest, checkQuestProgress } = useGameStore();

  useEffect(() => {
    if (quests.length === 0) {
      refreshQuests();
    }
    // Check progress periodically
    const interval = setInterval(() => {
        checkQuestProgress();
    }, 5000);
    return () => clearInterval(interval);
  }, [quests.length, refreshQuests, checkQuestProgress]);

  return (
    <div className="bg-black/60 backdrop-blur-md text-white p-3 rounded-xl border border-white/10 text-xs font-mono flex flex-col gap-2 w-56 pointer-events-auto">
      <h3 className="font-bold text-amber-400 uppercase tracking-widest mb-1 flex justify-between">
        <span>Daily Quests</span>
        <span className="text-[10px] opacity-50 cursor-pointer hover:opacity-100" onClick={refreshQuests}>↻</span>
      </h3>
      
      <div className="flex flex-col gap-2">
        {quests.map(quest => (
          <div key={quest.id} className={`relative p-2 rounded border ${quest.completed ? 'bg-green-900/30 border-green-500/50' : 'bg-slate-800/50 border-white/5'}`}>
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold text-slate-300 leading-tight">{quest.description}</span>
              {quest.completed && (
                <button 
                  onClick={() => claimQuest(quest.id)}
                  className="absolute right-2 top-2 bg-amber-500 text-white px-2 py-0.5 rounded shadow-lg animate-bounce font-bold"
                >
                  CLAIM
                </button>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${quest.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 mt-1">
               <span>{quest.progress} / {quest.target}</span>
               <span className="text-amber-400">+{quest.reward} Gems</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestBoard;
