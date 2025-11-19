import React from 'react';
import { useGameStore } from '../services/store';
import { SKILLS } from '../constants';
import { SkillId } from '../types';

interface SkillTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SkillTreeModal: React.FC<SkillTreeModalProps> = ({ isOpen, onClose }) => {
  const { gems, skills, buySkill } = useGameStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-amber-500/30 relative">
        
        {/* Background Decor */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none" />

        {/* Header */}
        <div className="p-6 bg-slate-950 text-white flex justify-between items-center border-b border-white/10 z-10">
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-600">Research Lab</h2>
            <p className="text-sm text-slate-400">Spend Gems to unlock permanent buffs.</p>
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
        <div className="flex-1 overflow-y-auto p-8 z-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.values(SKILLS).map(skill => {
                  const currentLevel = skills[skill.id] || 0;
                  const isMaxed = currentLevel >= skill.maxLevel;
                  const nextCost = skill.cost(currentLevel);
                  const canAfford = gems >= nextCost;

                  return (
                      <div key={skill.id} className="bg-slate-800/50 border border-white/5 p-6 rounded-xl relative group hover:border-amber-500/30 transition-all">
                          <div className="flex justify-between items-start mb-4">
                              <div>
                                  <h3 className="text-xl font-bold text-slate-200 group-hover:text-amber-400 transition-colors">{skill.name}</h3>
                                  <p className="text-slate-400 text-sm mt-1">{skill.description}</p>
                              </div>
                              <div className="text-right">
                                  <span className="block text-xs text-slate-500 uppercase tracking-widest">Level</span>
                                  <span className="text-2xl font-mono font-bold text-slate-300">{currentLevel} / {skill.maxLevel}</span>
                              </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-2 bg-slate-700 rounded-full mb-6 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                                style={{ width: `${(currentLevel / skill.maxLevel) * 100}%` }}
                              />
                          </div>

                          <div className="flex justify-between items-center">
                              <div className="text-xs text-slate-500">
                                  Current Effect: <span className="text-green-400">{(skill.effect(currentLevel) % 1 === 0 ? skill.effect(currentLevel) + 'x' : ((skill.effect(currentLevel) - 1) * 100).toFixed(0) + '%')}</span>
                                  {!isMaxed && (
                                      <span className="ml-2 opacity-50">
                                          Next: {(skill.effect(currentLevel + 1) % 1 === 0 ? skill.effect(currentLevel + 1) + 'x' : ((skill.effect(currentLevel + 1) - 1) * 100).toFixed(0) + '%')}
                                      </span>
                                  )}
                              </div>

                              <button 
                                onClick={() => buySkill(skill.id as SkillId)}
                                disabled={isMaxed || !canAfford}
                                className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                                    isMaxed 
                                    ? 'bg-green-900/30 text-green-500 cursor-default' 
                                    : canAfford 
                                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20' 
                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                  {isMaxed ? (
                                      <span>MAXED</span>
                                  ) : (
                                      <>
                                        <span>Research</span>
                                        <div className="bg-black/20 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                                            💎 {nextCost}
                                        </div>
                                      </>
                                  )}
                              </button>
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

export default SkillTreeModal;
