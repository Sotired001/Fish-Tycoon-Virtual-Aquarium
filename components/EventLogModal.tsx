import React from 'react';
import { useGameStore } from '../services/store';

interface EventLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EventLogModal: React.FC<EventLogModalProps> = ({ isOpen, onClose }) => {
  const eventLog = useGameStore((state) => state.eventLog);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 pointer-events-auto">
      <div className="bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-red-500/30 flex flex-col overflow-hidden pointer-events-auto max-h-[80vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-red-900/50 to-slate-900 border-b border-red-500/20 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-red-400 flex items-center gap-2">
              <span>📜</span> Event Log
            </h2>
            <p className="text-slate-400 text-xs uppercase tracking-wider">History of the Tank</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {eventLog.length === 0 && (
            <p className="text-center text-slate-500 italic">No major events recorded yet.</p>
          )}
          {[...eventLog].reverse().map((event, index) => (
            <div key={index} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex gap-3 items-start">
              <div className="text-xl">
                {event.type === 'DEATH' ? '💀' : event.type === 'SICKNESS' ? '🦠' : 'ℹ️'}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </p>
                <p className="text-slate-200 text-sm">{event.message}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-slate-950 text-center text-xs text-slate-500">
          Logs are cleared on page refresh.
        </div>
      </div>
    </div>
  );
};

export default EventLogModal;