import React, { useState } from 'react';
import { useGameStore } from '../services/store';
import { EntityFish, SkillId } from '../types';
import { UPGRADES, GAME_CONFIG, SKILLS } from '../constants'; // Import UPGRADES, GAME_CONFIG, SKILLS

interface BreedingTankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BreedingTankModal: React.FC<BreedingTankModalProps> = ({ isOpen, onClose }) => {
  const allFish = useGameStore((state) => state.fish);
  const breedFishAction = useGameStore((state) => state.breedFish);
  const fishCount = useGameStore((state) => state.fish.length); // Get current fish count
  const tankSizeUpgrade = useGameStore((state) => state.upgrades.tankSize); // Get tank size upgrade
  const maxFish = UPGRADES.tankSize.effect(tankSizeUpgrade); // Calculate max fish
  
  // Get Skill Level
  const breedSkillLvl = useGameStore((state) => state.skills[SkillId.BETTER_BREEDING] || 0);
  const cooldownMult = SKILLS[SkillId.BETTER_BREEDING].effect(breedSkillLvl);
  const BREED_COOLDOWN_MS = GAME_CONFIG.BREED_COOLDOWN_MS * cooldownMult;

  const [selectedFish1Id, setSelectedFish1Id] = useState<string | null>(null);
  const [selectedFish2Id, setSelectedFish2Id] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); // State for feedback messages

  // Helper to determine if a fish is on cooldown and how much time is left
  const getFishBreedStatus = (fish: EntityFish) => {
    const now = Date.now();
    if (fish.lastBreedTime) {
      const timeElapsed = now - fish.lastBreedTime;
      const timeLeft = BREED_COOLDOWN_MS - timeElapsed;
      if (timeLeft > 0) {
        const minutesLeft = Math.ceil(timeLeft / (1000 * 60));
        return { isOnCooldown: true, timeLeft: minutesLeft, message: `On Cooldown (${minutesLeft}m)` };
      }
    }
    return { isOnCooldown: false, timeLeft: 0, message: '' };
  };

  if (!isOpen) {
    return null;
  }

  const handleBreed = () => {
    setMessage(null); // Clear previous messages

    const selectedFish1 = allFish.find(f => f.id === selectedFish1Id);
    const selectedFish2 = allFish.find(f => f.id === selectedFish2Id);

    if (!selectedFish1 || !selectedFish2) {
      setMessage('Please select two fish.');
      return;
    }

    if (selectedFish1Id === selectedFish2Id) {
      setMessage('Please select two *different* fish to breed.');
      return;
    }

    // Check cooldown for selected fish
    const status1 = getFishBreedStatus(selectedFish1);
    const status2 = getFishBreedStatus(selectedFish2);

    if (status1.isOnCooldown) {
      setMessage(`Parent 1 (${selectedFish1.speciesId}) is ${status1.message}.`);
      return;
    }
    if (status2.isOnCooldown) {
      setMessage(`Parent 2 (${selectedFish2.speciesId}) is ${status2.message}.`);
      return;
    }
    
    if (fishCount >= maxFish) {
      setMessage('Your tank is full! Sell some fish or upgrade your tank size.');
      return;
    }

    // Attempt to breed
    breedFishAction(selectedFish1Id, selectedFish2Id);
    setMessage('Breeding successful! A new fish has been added to your tank.');
    setSelectedFish1Id(null);
    setSelectedFish2Id(null);
    // Optionally close the modal after a delay or let the user close it
    // setTimeout(onClose, 2000); 
  };

  const availableFish = allFish.filter(f => f.age > 0); // Only allow adult fish to breed (or at least not newly spawned ones)

  const isBreedButtonDisabled = !selectedFish1Id || !selectedFish2Id || selectedFish1Id === selectedFish2Id || fishCount >= maxFish ||
                                (selectedFish1Id && getFishBreedStatus(allFish.find(f => f.id === selectedFish1Id)!).isOnCooldown) ||
                                (selectedFish2Id && getFishBreedStatus(allFish.find(f => f.id === selectedFish2Id)!).isOnCooldown);
  return (
    <div className="breeding-modal-overlay">
      <div className="breeding-modal-content">
        <h2>Breeding Tank</h2>

        {message && <div className="breeding-feedback-message">{message}</div>}

        <div className="fish-selection">
          <div>
            <h3>Parent 1</h3>
            <select
              value={selectedFish1Id || ''}
              onChange={(e) => setSelectedFish1Id(e.target.value)}
            >
              <option value="">Select Fish 1</option>
              {availableFish.map((fish) => {
                const { isOnCooldown, message } = getFishBreedStatus(fish);
                const isDisabled = fish.id === selectedFish2Id || isOnCooldown;
                return (
                  <option key={fish.id} value={fish.id} disabled={isDisabled}>
                    {fish.speciesId} (ID: {fish.id.substring(0, 4)}) {message && ` - ${message}`}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <h3>Parent 2</h3>
            <select
              value={selectedFish2Id || ''}
              onChange={(e) => setSelectedFish2Id(e.target.value)}
            >
              <option value="">Select Fish 2</option>
              {availableFish.map((fish) => {
                const { isOnCooldown, message } = getFishBreedStatus(fish);
                const isDisabled = fish.id === selectedFish1Id || isOnCooldown;
                return (
                  <option key={fish.id} value={fish.id} disabled={isDisabled}>
                    {fish.speciesId} (ID: {fish.id.substring(0, 4)}) {message && ` - ${message}`}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <button onClick={handleBreed} disabled={isBreedButtonDisabled}>
          Breed Fish
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default BreedingTankModal;