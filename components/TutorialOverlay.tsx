import React from 'react';
import { useGameStore } from '../services/store';

const TutorialOverlay: React.FC = () => {
  const { tutorialStep, advanceTutorial, fish, money, isShopOpen } = useGameStore();

  // If tutorial is done (e.g. step > 4), don't render
  if (tutorialStep > 4) return null;

  let content = null;
  let positionClass = "bottom-24 left-1/2 -translate-x-1/2";
  let showNext = true;

  switch (tutorialStep) {
    case 1:
        content = (
            <>
                <h3 className="text-xl font-bold text-amber-300 mb-2">Welcome to Fish Tycoon!</h3>
                <p>Let's start by buying your first fish.</p>
                <p className="text-sm text-slate-300 mt-2">Open the Shop and buy a Goldfish.</p>
            </>
        );
        // Auto advance if shop is open or fish bought
        if (isShopOpen || fish.length > 0) {
             setTimeout(advanceTutorial, 500);
        }
        showNext = false; // Wait for user action
        break;
    case 2:
        // Wait for fish to be bought
        if (fish.length > 0) {
            content = (
                <>
                    <h3 className="text-xl font-bold text-green-300">Great Job!</h3>
                    <p>Now tap on the water to feed your fish.</p>
                    <p className="text-sm text-slate-300 mt-2">Hungry fish eat food and grow.</p>
                </>
            );
            showNext = true;
        } else {
             // Revert if they closed shop without buying?
             // Keep prompting
             content = (
                <>
                    <h3 className="text-xl font-bold text-amber-300">Buy a Fish!</h3>
                    <p>Open the Shop 🏪 and buy a Goldfish.</p>
                </>
             );
             showNext = false;
        }
        break;
    case 3:
        content = (
            <>
                <h3 className="text-xl font-bold text-yellow-300">Collecting Coins</h3>
                <p>When fish eat, they drop coins. 🪙</p>
                <p className="text-sm text-slate-300 mt-2">Wait for a coin and tap it to collect.</p>
            </>
        );
        positionClass = "top-24 left-1/2 -translate-x-1/2";
        break;
    case 4:
        content = (
            <>
                <h3 className="text-xl font-bold text-cyan-300">You're Ready!</h3>
                <p>Keep your fish happy, breed new species, and unlock upgrades.</p>
                <p className="text-sm text-slate-300 mt-2">Have fun!</p>
            </>
        );
        break;
  }

  return (
    <div className={`fixed ${positionClass} bg-slate-900/90 border-2 border-amber-500 p-6 rounded-2xl shadow-2xl text-white max-w-sm text-center animate-bounce-sm z-50`}>
      {content}
      {showNext && (
          <button
            onClick={advanceTutorial}
            className="mt-4 bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 px-6 rounded-full"
          >
            Next
          </button>
      )}
    </div>
  );
};

export default TutorialOverlay;
