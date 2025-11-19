import React from 'react';
import { useGameStore } from '../services/store';

const WaterMonitor: React.FC = () => {
  const waterParams = useGameStore((state) => state.waterParams);
  const updateWaterParams = useGameStore((state) => state.updateWaterParams);

  if (!waterParams) return null;

  const { ph, temperature, ammonia } = waterParams;

  // Helper to determine status color
  const getStatusColor = (val: number, idealMin: number, idealMax: number, isLowBad: boolean = true) => {
    if (val >= idealMin && val <= idealMax) return 'text-green-400';
    // Warning range
    if (val < idealMin && val >= idealMin - 1) return 'text-yellow-400';
    if (val > idealMax && val <= idealMax + 1) return 'text-yellow-400';
    return 'text-red-500 animate-pulse';
  };

  const handleClean = () => {
     updateWaterParams({ ammonia: 0 });
  };

  return (
    <div className="bg-black/60 backdrop-blur-md text-white p-3 rounded-xl border border-white/10 text-xs font-mono flex flex-col gap-1 w-40">
      <h3 className="font-bold text-slate-400 uppercase tracking-widest mb-1">Water Chem</h3>
      
      <div className="flex justify-between">
        <span>pH</span>
        <span className={getStatusColor(ph, 6.5, 8.0)}>{ph.toFixed(1)}</span>
      </div>
      
      <div className="flex justify-between">
        <span>Temp</span>
        <span className={getStatusColor(temperature, 22, 28)}>{temperature.toFixed(1)}°C</span>
      </div>

      <div className="flex justify-between">
        <span>Ammonia</span>
        <span className={ammonia > 0.5 ? 'text-red-500 animate-pulse' : 'text-green-400'}>
          {ammonia.toFixed(2)} ppm
        </span>
      </div>

      {/* Quick Action: Clean Tank */}
      <button 
        onClick={handleClean}
        className="mt-2 bg-blue-600 hover:bg-blue-500 text-white py-1 px-2 rounded transition-colors text-[10px] font-bold uppercase"
      >
        Clean Tank
      </button>
    </div>
  );
};

export default WaterMonitor;
