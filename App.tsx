import React from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import ShopModal from './components/ShopModal';

function App() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 font-sans select-none">
      <GameCanvas />
      <UIOverlay />
      <ShopModal />
      
      {/* Sound effects placeholder (invisible) */}
      {/* In a real app, use Howler.js */}
    </div>
  );
}

export default App;