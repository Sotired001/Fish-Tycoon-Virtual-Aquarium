import React from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import ShopModal from './components/ShopModal';
import FishDetailsModal from './components/FishDetailsModal';
import TutorialOverlay from './components/TutorialOverlay';
import { useGameStore } from './services/store';

function App() {
  const { isScreenshotMode } = useGameStore();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 font-sans select-none">
      <GameCanvas />
      {!isScreenshotMode && (
        <>
          <UIOverlay />
          <TutorialOverlay />
        </>
      )}
      <ShopModal />
      <FishDetailsModal />
      
      {/* Sound effects placeholder (invisible) */}
      {/* In a real app, use Howler.js */}
    </div>
  );
}

export default App;