import React, { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../services/store';
import { EntityFish, EntityFood, EntityCoin, EntityParticle, FishSpecies } from '../types';
import { FISH_SPECIES, GAME_CONFIG, UPGRADES } from '../constants';
import { v4 as uuidv4 } from 'uuid';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const autoFeederTimerRef = useRef<number>(0);

  // Use refs for high-frequency game entities to avoid React re-renders
  const fishRef = useRef<EntityFish[]>([]);
  const foodRef = useRef<EntityFood[]>([]);
  const coinsRef = useRef<EntityCoin[]>([]);
  const particlesRef = useRef<EntityParticle[]>([]);
  
  // Access store state
  const { 
    ownedFish, 
    upgrades, 
    addMoney, 
    incrementStat,
    isShopOpen
  } = useGameStore();

  // Sync React state fish to Canvas entity fish
  useEffect(() => {
    const currentFishEntities = fishRef.current;
    const newFishEntities: EntityFish[] = [];

    ownedFish.forEach((owned) => {
      const species = FISH_SPECIES.find(s => s.id === owned.speciesId);
      if (!species) return;

      // Count how many of this species we already have spawned
      const existingCount = currentFishEntities.filter(f => f.speciesId === owned.speciesId).length;
      
      // Keep existing ones
      const existingOfSpecies = currentFishEntities.filter(f => f.speciesId === owned.speciesId);
      newFishEntities.push(...existingOfSpecies);

      // Spawn new ones if needed
      for (let i = existingCount; i < owned.count; i++) {
        const x = Math.random() * (canvasRef.current?.width || 800);
        const y = Math.random() * (canvasRef.current?.height || 600);
        newFishEntities.push({
          id: uuidv4(),
          speciesId: owned.speciesId,
          x,
          y,
          vx: (Math.random() - 0.5) * species.speed,
          vy: (Math.random() - 0.5) * species.speed,
          scale: 0.5 + Math.random() * 0.5,
          hunger: 50 + Math.random() * 50,
          maxHunger: 100,
          state: 'IDLE',
          targetId: null,
          personalityOffset: Math.random() * 1000
        });
      }
    });

    fishRef.current = newFishEntities;
  }, [ownedFish]);

  // Spawn Bubble/Particle
  const spawnParticle = (x: number, y: number, type: 'BUBBLE' | 'SPARKLE') => {
    particlesRef.current.push({
      id: uuidv4(),
      x, y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: type === 'BUBBLE' ? -0.5 - Math.random() : -0.5 + Math.random(),
      life: 1.0,
      size: type === 'BUBBLE' ? 2 + Math.random() * 4 : 5 + Math.random() * 5,
      type
    });
  };

  // Drop Food
  const dropFood = useCallback((x: number, y: number) => {
    const qualityLevel = upgrades.foodQuality || 0;
    const valueMultiplier = UPGRADES.foodQuality.effect(qualityLevel);
    
    foodRef.current.push({
      id: uuidv4(),
      x, y,
      vy: GAME_CONFIG.FOOD_SINK_SPEED,
      value: 20 * valueMultiplier // Base nutrition
    });
  }, [upgrades.foodQuality]);

  // Spawn Coin
  const spawnCoin = (x: number, y: number, fishValue: number) => {
    const qualityLevel = upgrades.foodQuality || 0;
    const valueMultiplier = UPGRADES.foodQuality.effect(qualityLevel);
    const value = Math.ceil(fishValue * valueMultiplier);

    coinsRef.current.push({
      id: uuidv4(),
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: -2, // Pop up initially
      value,
      life: 1000, // Frames? or check bounds
      collected: false
    });
    spawnParticle(x, y, 'SPARKLE');
  };

  // Input handling
  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (isShopOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    incrementStat('clicks');

    // Check if clicked a coin
    let clickedCoin = false;
    const magnetRadius = 40; // Click radius
    
    coinsRef.current.forEach(coin => {
      const dx = coin.x - x;
      const dy = coin.y - y;
      if (Math.sqrt(dx*dx + dy*dy) < magnetRadius && !coin.collected) {
        coin.collected = true;
        addMoney(coin.value);
        spawnParticle(coin.x, coin.y, 'SPARKLE');
        clickedCoin = true;
      }
    });

    if (!clickedCoin) {
      dropFood(x, y);
      // Interact with fish (make them dart away or perform action)
      fishRef.current.forEach(f => {
         const dx = f.x - x;
         const dy = f.y - y;
         if (Math.sqrt(dx*dx + dy*dy) < 50) {
           f.vx += dx * 0.1;
           f.vy += dy * 0.1;
           spawnParticle(f.x, f.y, 'BUBBLE');
         }
      });
    }
  };

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const loop = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      if (!canvas) return;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear & Draw Background
      // Gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0f172a'); // Deep dark blue
      gradient.addColorStop(1, '#1e3a8a'); // Lighter blue
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Handle Auto Feeder
      const autoFeederLevel = upgrades.autoFeeder || 0;
      if (autoFeederLevel > 0) {
        autoFeederTimerRef.current += deltaTime;
        const interval = UPGRADES.autoFeeder.effect(autoFeederLevel) * 1000;
        if (autoFeederTimerRef.current > interval) {
          autoFeederTimerRef.current = 0;
          // Feed random location
          dropFood(Math.random() * width, 20);
        }
      }

      // 3. Update & Draw Particles (Background layer)
      // Randomly spawn background bubbles
      if (Math.random() < 0.05) spawnParticle(Math.random() * width, height + 10, 'BUBBLE');

      ctx.save();
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => {
        p.life -= 0.01;
        p.x += p.vx;
        p.y += p.vy;
        
        ctx.globalAlpha = p.life;
        if (p.type === 'BUBBLE') {
           ctx.beginPath();
           ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
           ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
           ctx.fill();
        } else {
           ctx.fillStyle = '#FFD700';
           ctx.font = `${p.size * 2}px serif`;
           ctx.fillText('✨', p.x, p.y);
        }
      });
      ctx.restore();

      // 4. Update & Draw Food
      ctx.font = "20px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      foodRef.current = foodRef.current.filter(f => f.y < height);
      foodRef.current.forEach(f => {
        f.y += f.vy; // Gravity
        f.x += Math.sin(timestamp / 200) * 0.5; // Wobble
        ctx.fillText('🟤', f.x, f.y);
      });

      // 5. Update & Draw Fish
      const magnetLvl = upgrades.magnet || 0;
      const metabolismLvl = upgrades.metabolism || 0;
      const hungerDecayMult = UPGRADES.metabolism.effect(metabolismLvl);
      
      fishRef.current.forEach(f => {
        const species = FISH_SPECIES.find(s => s.id === f.speciesId);
        if (!species) return;

        // Hunger Logic
        f.hunger = Math.max(0, f.hunger - (GAME_CONFIG.HUNGER_DECAY * hungerDecayMult));
        
        // Movement Logic
        let ax = 0;
        let ay = 0;

        // A. Wall Avoidance
        const wallPad = 50;
        if (f.x < wallPad) ax += 0.05;
        if (f.x > width - wallPad) ax -= 0.05;
        if (f.y < wallPad) ay += 0.05;
        if (f.y > height - wallPad) ay -= 0.05;

        // B. Food Seeking
        let nearestFood: EntityFood | null = null;
        let minDist = Infinity;
        
        if (f.hunger < 80) { // Only eat if somewhat hungry
          foodRef.current.forEach(food => {
            const dist = Math.hypot(food.x - f.x, food.y - f.y);
            if (dist < minDist) {
              minDist = dist;
              nearestFood = food;
            }
          });
        }

        if (nearestFood) {
           f.state = 'SEEKING_FOOD';
           const angle = Math.atan2(nearestFood.y - f.y, nearestFood.x - f.x);
           ax += Math.cos(angle) * 0.2;
           ay += Math.sin(angle) * 0.2;

           // Eat Check
           if (minDist < GAME_CONFIG.EAT_RADIUS) {
             // Remove food
             const foodIdx = foodRef.current.indexOf(nearestFood);
             if (foodIdx > -1) {
               foodRef.current.splice(foodIdx, 1);
               f.hunger = Math.min(100, f.hunger + nearestFood.value);
               spawnCoin(f.x, f.y, species.baseValue);
               spawnParticle(f.x, f.y, 'BUBBLE');
               incrementStat('fishFedCount');
             }
           }
        } else {
          f.state = 'IDLE';
          // Random wandering using Perlin-ish noise (sine waves)
          ax += (Math.random() - 0.5) * 0.1;
          ay += (Math.random() - 0.5) * 0.1;
          
          // Vertical drift correction
          ay += (height/2 - f.y) * 0.0001; 
        }

        // Apply Acceleration
        f.vx += ax;
        f.vy += ay;

        // Limit Speed
        const speed = Math.hypot(f.vx, f.vy);
        const maxSpeed = (f.state === 'SEEKING_FOOD' ? species.speed * 2 : species.speed);
        if (speed > maxSpeed) {
          f.vx = (f.vx / speed) * maxSpeed;
          f.vy = (f.vy / speed) * maxSpeed;
        }

        // Apply Velocity
        f.x += f.vx;
        f.y += f.vy;

        // Draw Fish
        ctx.save();
        ctx.translate(f.x, f.y);
        
        // Flip sprite based on direction
        if (f.vx < 0) ctx.scale(-1, 1);
        
        // Scale based on hunger (shrink slightly if starving)
        const hungerScale = 0.8 + (f.hunger / 100) * 0.2;
        ctx.scale(hungerScale, hungerScale);

        ctx.font = "40px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Color filter for hunger (visual trick: draw semi-transparent grey on top if implemented, 
        // but here we'll just change opacity/color later. For emojis, we can use filter)
        if (f.hunger < 20) {
          ctx.filter = "grayscale(80%)";
        }

        ctx.fillText(species.emoji, 0, 0);
        
        // Draw Name if hovered? (Omitted for perf, maybe add later)
        
        ctx.restore();
      });

      // 6. Update & Draw Coins
      const magnetRadius = UPGRADES.magnet.effect(magnetLvl);
      // Assume mouse pos is tracked globally if we want true magnet to mouse, 
      // for now let's make magnet collect automatically if high level or drift to bottom
      
      coinsRef.current = coinsRef.current.filter(c => !c.collected && c.y < height + 50);
      coinsRef.current.forEach(c => {
        // Magnet effect (auto collect if upgraded enough)
        if (magnetLvl > 0) {
           // Simply slowly drift towards center top (imaginary collector) or auto collect
           // Let's do auto-collect radius logic
           /* Simplified for gameplay: Magnet just slowly pulls coins up */
           c.vy -= (magnetLvl * 0.05);
        } else {
           c.vy += GAME_CONFIG.GRAVITY * 0.5; // Sinks slowly
        }

        c.vy *= GAME_CONFIG.WATER_DRAG;
        c.x += c.vx;
        c.y += c.vy;

        // Bounce off floor
        if (c.y > height - 20) {
          c.y = height - 20;
          c.vy *= -0.5;
        }
        
        // Auto collect if it hits top with magnet
        if (c.y < 0 && magnetLvl > 0) {
          c.collected = true;
          addMoney(c.value);
          spawnParticle(c.x, c.y, 'SPARKLE');
        }

        ctx.font = "24px serif";
        ctx.fillText('🪙', c.x, c.y);
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    // Resize handler
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // init

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [upgrades, addMoney, incrementStat, ownedFish]); // Re-bind loop if core dependencies change substantially

  return (
    <canvas 
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full touch-none cursor-crosshair"
      onMouseDown={handleCanvasClick}
      onTouchStart={handleCanvasClick}
    />
  );
};

export default GameCanvas;