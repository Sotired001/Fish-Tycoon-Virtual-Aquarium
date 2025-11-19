import React, { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../services/store';
import { EntityFish, EntityFood, EntityCoin, EntityParticle, FishSpecies, EntityDecoration, SkillId, FishDiet } from '../types';
import { FISH_SPECIES, GAME_CONFIG, UPGRADES, DECORATIONS, BIOMES, SKILLS } from '../constants';
import { v4 as uuidv4 } from 'uuid';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const autoFeederTimerRef = useRef<number>(0);
  const waterUpdateTimerRef = useRef<number>(0);

  const {
    fish: storeFish,
    decorations: storeDecorations,
    addMoney,
    upgrades,
    skills,
    currentBiomeId,
    incrementStat,
    isSellMode,
    sellFish,
    removeFish,
    waterParams,
    updateWaterParams
  } = useGameStore();

  // Use refs for high-frequency game entities to avoid React re-renders
  const fishRef = useRef<EntityFish[]>([]);
  const decorationsRef = useRef<EntityDecoration[]>([]);
  const foodRef = useRef<EntityFood[]>([]);
  const coinsRef = useRef<EntityCoin[]>([]);
  const particlesRef = useRef<EntityParticle[]>([]);
  const waterParamsRef = useRef({ ...waterParams }); // Local ref for simulation

  // Refs for store values to avoid restarting the loop
  const upgradesRef = useRef(upgrades);
  const skillsRef = useRef(skills);
  const currentBiomeIdRef = useRef(currentBiomeId);
  const isSellModeRef = useRef(isSellMode);

  // Sync refs with store values
  useEffect(() => {
    upgradesRef.current = upgrades;
    skillsRef.current = skills;
    currentBiomeIdRef.current = currentBiomeId;
    isSellModeRef.current = isSellMode;
  }, [upgrades, skills, currentBiomeId, isSellMode]);

  // Sync Ref with Store when Store updates (e.g. bought fish, cured disease)
  useEffect(() => {
    const storeMap = new Map(storeFish.map(f => [f.id, f]));

    // 1. Update existing fish & Remove deleted ones
    fishRef.current = fishRef.current.filter(simFish => {
      const storeFishVer = storeMap.get(simFish.id);
      if (storeFishVer) {
        // Update stats from store, keep physics from sim
        simFish.health = storeFishVer.health;
        simFish.hunger = storeFishVer.hunger;

        // Specific fix for Disease/Health from actions:
        if (simFish.disease !== storeFishVer.disease) {
          simFish.disease = storeFishVer.disease;
        }
        // If store health is suddenly higher (healing), take it.
        if (storeFishVer.health > simFish.health) {
          simFish.health = storeFishVer.health;
        }

        return true;
      }
      return false; // Remove if not in store
    });

    // 2. Add new fish
    const currentIds = new Set(fishRef.current.map(f => f.id));
    storeFish.forEach(f => {
      if (!currentIds.has(f.id)) {
        fishRef.current.push({ ...f });
      }
    });
  }, [storeFish]);

  // Sync Decorations
  useEffect(() => {
    decorationsRef.current = storeDecorations;
  }, [storeDecorations]);

  // Sync water params from store if changed externally (e.g. by user action)
  useEffect(() => {
    if (Math.abs(waterParams.ammonia - waterParamsRef.current.ammonia) > 0.1 ||
      waterParams.ph !== waterParamsRef.current.ph ||
      waterParams.temperature !== waterParamsRef.current.temperature) {
      waterParamsRef.current = { ...waterParams };
    }
  }, [waterParams]);

  const spawnCoin = (x: number, y: number, value: number) => {
    coinsRef.current.push({
      id: uuidv4(),
      x, y,
      vx: (Math.random() - 0.5) * 2,
      vy: -3,
      value,
      life: 1,
      collected: false
    });
  };

  const spawnParticle = (x: number, y: number, type: 'BUBBLE' | 'SPARKLE' | 'LEAF') => {
    particlesRef.current.push({
      id: uuidv4(),
      x, y,
      vx: (Math.random() - 0.5) * 1,
      vy: type === 'BUBBLE' ? -2 : type === 'LEAF' ? 0.5 : -1,
      life: 1,
      size: Math.random() * 5 + 2,
      type: type as any
    });
  };

  const dropFood = (x: number, y: number) => {
    const quality = upgradesRef.current.foodQuality || 0;
    foodRef.current.push({
      id: uuidv4(),
      x, y,
      vy: GAME_CONFIG.FOOD_SINK_SPEED,
      value: 10 + (quality * 5)
    });
  };

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
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

    if (isSellModeRef.current) {
      // Find clicked fish
      const clickedFish = fishRef.current.find(f => Math.hypot(f.x - x, f.y - y) < 30 * f.scale);
      if (clickedFish) {
        sellFish(clickedFish.id);
        spawnParticle(clickedFish.x, clickedFish.y, 'SPARKLE');
      }
      return;
    }

    // Normal Mode: Feed
    dropFood(x, y);
    spawnParticle(x, y, 'BUBBLE');
  };

  const drawFish = (ctx: CanvasRenderingContext2D, f: EntityFish, species: FishSpecies, time: number) => {
    ctx.save();
    ctx.translate(f.x, f.y);
    const scale = f.scale * (species.baseGenes?.scale || 1);
    ctx.scale(f.vx > 0 ? -scale : scale, scale); // Flip if moving right

    // Genes
    const bodyColor = f.genes?.bodyColor || species.baseGenes?.bodyColor || '#FFA500';
    const finColor = f.genes?.finColor || species.baseGenes?.finColor || '#FF4500';

    // Draw Body
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw Eye
    ctx.beginPath();
    ctx.arc(12, -4, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12, -4, 1, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();

    // Draw Fin (Side)
    ctx.beginPath();
    ctx.moveTo(5, 2);
    ctx.quadraticCurveTo(0, 10, -5, 2);
    ctx.fillStyle = finColor;
    ctx.fill();
    ctx.stroke();

    // Hunger indicator (if starving)
    if (f.hunger < 20) {
      ctx.fillStyle = 'red';
      ctx.font = '12px Arial';
      ctx.fillText('!', 0, -20);
    }

    // Health indicator (if sick)
    if (f.health < 50) {
      ctx.fillStyle = '#00FF00'; // Greenish tint for sick
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = 'lime';
      ctx.font = '12px Arial';
      ctx.fillText('Sick', -10, -25);
    }

    ctx.restore();
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

      // Get current biome
      const currentBiome = BIOMES.find(b => b.id === currentBiomeIdRef.current) || BIOMES[0];

      // 1. Clear & Draw Background (Biome)
      const gradient = ctx.createLinearGradient(0, 0, 0, height);

      // Change bg color based on water quality (Ammonia)
      const ammoniaLevel = waterParamsRef.current.ammonia;
      if (ammoniaLevel > 2) {
        gradient.addColorStop(0, '#0a1f0a'); // Murky green
        gradient.addColorStop(1, '#1a3f1a');
      } else {
        gradient.addColorStop(0, currentBiome.backgroundGradient[0]);
        gradient.addColorStop(1, currentBiome.backgroundGradient[1]);
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 1.1 Draw Biome Water Overlay
      ctx.fillStyle = currentBiome.waterColor;
      ctx.fillRect(0, 0, width, height);

      // 1.5 Draw Decorations (Background)
      decorationsRef.current.forEach(dec => {
        const item = DECORATIONS.find(d => d.id === dec.itemId);
        if (item) {
          ctx.font = "40px serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText(item.emoji, dec.x, dec.y);
        }
      });

      // 2. Handle Auto Feeder
      const autoFeederLevel = upgradesRef.current.autoFeeder || 0;
      if (autoFeederLevel > 0) {
        autoFeederTimerRef.current += deltaTime;
        const interval = UPGRADES.autoFeeder.effect(autoFeederLevel) * 1000;
        if (autoFeederTimerRef.current > interval) {
          autoFeederTimerRef.current = 0;
          dropFood(Math.random() * width, 20);
        }
      }

      // 3. Update Water Params (Ammonia build up)
      waterUpdateTimerRef.current += deltaTime;
      if (waterUpdateTimerRef.current > 1000) { // Every second
        waterUpdateTimerRef.current = 0;
        // Ammonia increases by fish count
        const pollution = fishRef.current.length * 0.005;

        // Ammonia reduction from decorations
        const reduction = decorationsRef.current.reduce((acc, dec) => {
          const item = DECORATIONS.find(d => d.id === dec.itemId);
          return acc + (item?.effect?.type === 'AMMONIA_REDUCTION' ? (item.effect.value || 0) : 0);
        }, 0);

        waterParamsRef.current.ammonia = Math.min(10, Math.max(0, waterParamsRef.current.ammonia + pollution - reduction));

        // Sync back to store (debounced)
        updateWaterParams(waterParamsRef.current);
      }

      // 3b. Update & Draw Particles
      if (Math.random() < 0.05) spawnParticle(Math.random() * width, height + 10, currentBiome.particleType);

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
        } else if (p.type === 'SPARKLE') {
          ctx.fillStyle = '#FFD700';
          ctx.font = `${p.size * 2}px serif`;
          ctx.fillText('✨', p.x, p.y);
        } else if ((p.type as any) === 'LEAF') {
          ctx.fillStyle = '#4ade80';
          ctx.font = `${p.size * 2}px serif`;
          ctx.fillText('🍂', p.x, p.y);
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

        ctx.beginPath();
        ctx.arc(f.x, f.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#8B4513'; // SaddleBrown
        ctx.fill();
        ctx.strokeStyle = '#5D4037';
        ctx.stroke();
      });

      // 5. Update & Draw Fish
      const magnetLvl = upgradesRef.current.magnet || 0;
      const metabolismLvl = upgradesRef.current.metabolism || 0;
      const hungerDecayMult = UPGRADES.metabolism.effect(metabolismLvl);

      // Skill: Hardy Fish (Iron Gills)
      const hardyLvl = skillsRef.current[SkillId.HARDY_FISH] || 0;
      const hardyMult = SKILLS[SkillId.HARDY_FISH].effect(hardyLvl);

      fishRef.current.forEach(f => {
        const species = FISH_SPECIES.find(s => s.id === f.speciesId);
        if (!species) return;

        // Water Chemistry Effects
        const prefs = species.preferredWater;
        let healthChange = 0.05; // Natural regen

        if (prefs) {
          const { tempRange, phRange } = prefs;
          const { temperature, ph, ammonia } = waterParamsRef.current;

          if (temperature < tempRange[0] || temperature > tempRange[1]) healthChange -= 0.1;
          if (ph < phRange[0] || ph > phRange[1]) healthChange -= 0.1;
        }

        // Ammonia is bad for everyone
        if (waterParamsRef.current.ammonia > 1.0) {
          healthChange -= (waterParamsRef.current.ammonia * 0.05);
        }

        // Disease Logic
        if (f.disease) {
          healthChange -= 0.2; // Disease drains health
        } else {
          // Chance to get sick if water is bad
          if (waterParamsRef.current.ammonia > 2.0 && Math.random() < 0.0005) {
            // TODO: Dispatch infect
          }
        }

        // Apply Iron Gills Resistance to negative health changes
        if (healthChange < 0) {
          healthChange = healthChange / hardyMult;
        }

        f.health = Math.min(100, Math.max(0, (f.health || 100) + healthChange));

        // Hunger Logic
        f.hunger = Math.max(0, f.hunger - (GAME_CONFIG.HUNGER_DECAY * hungerDecayMult));

        // Movement Logic
        let ax = 0;
        let ay = 0;

        // --- Phase 2: Schooling (Boids) ---
        if (species.schoolingFactor && species.schoolingFactor > 0) {
          const neighbors = fishRef.current.filter(other =>
            other.id !== f.id &&
            other.speciesId === f.speciesId &&
            Math.hypot(other.x - f.x, other.y - f.y) < (species.schoolingDistance || 50)
          );

          if (neighbors.length > 0) {
            let sepX = 0, sepY = 0;
            let alignX = 0, alignY = 0;
            let cohX = 0, cohY = 0;

            neighbors.forEach(n => {
              // Separation
              const dist = Math.hypot(n.x - f.x, n.y - f.y);
              if (dist < 20) {
                sepX += (f.x - n.x) / dist;
                sepY += (f.y - n.y) / dist;
              }
              // Alignment
              alignX += n.vx;
              alignY += n.vy;
              // Cohesion
              cohX += n.x;
              cohY += n.y;
            });

            // Average and weight
            const count = neighbors.length;
            const factor = species.schoolingFactor * 0.05;

            ax += (sepX / count) * factor * 2; // Strong separation
            ay += (sepY / count) * factor * 2;

            ax += ((alignX / count) - f.vx) * factor;
            ay += ((alignY / count) - f.vy) * factor;

            ax += ((cohX / count) - f.x) * factor * 0.5;
            ay += ((cohY / count) - f.y) * factor * 0.5;
          }
        }

        // --- Phase 2: Predation ---
        let hunting = false;
        if (species.diet === FishDiet.CARNIVORE && f.hunger < 60 && species.preySpecies) {
          // Find Prey
          let nearestPrey: EntityFish | null = null;
          let minPreyDist = Infinity;

          fishRef.current.forEach(p => {
            if (species.preySpecies?.includes(p.speciesId)) {
              const dist = Math.hypot(p.x - f.x, p.y - f.y);
              if (dist < minPreyDist && dist < 300) { // Vision range
                minPreyDist = dist;
                nearestPrey = p;
              }
            }
          });

          if (nearestPrey) {
            hunting = true;
            f.state = 'SEEKING_FOOD'; // Reuse state for animation speed
            const prey = nearestPrey as EntityFish;
            const angle = Math.atan2(prey.y - f.y, prey.x - f.x);
            ax += Math.cos(angle) * 0.3; // Chase fast
            ay += Math.sin(angle) * 0.3;

            // Eat Prey
            if (minPreyDist < GAME_CONFIG.EAT_RADIUS) {
              // Remove from store (no money for eaten fish)
              removeFish(prey.id);
              // Remove locally immediately to prevent double-eating
              const idx = fishRef.current.findIndex(fi => fi.id === prey.id);
              if (idx > -1) fishRef.current.splice(idx, 1);

              f.hunger = 100;
              spawnParticle(f.x, f.y, 'LEAF'); // Use LEAF as blood/mess for now, or maybe just bubbles
              spawnParticle(f.x, f.y, 'BUBBLE');
              incrementStat('fishFedCount'); // Counts as feeding? Sure.
            }
          }
        }

        // --- Phase 2: Fleeing Logic (Prey Avoidance) ---
        let fleeing = false;
        if (!hunting) {
            // Look for predators nearby
            fishRef.current.forEach(p => {
               const predatorSpecies = FISH_SPECIES.find(s => s.id === p.speciesId);
               if (predatorSpecies?.diet === FishDiet.CARNIVORE && predatorSpecies.preySpecies?.includes(f.speciesId)) {
                   const dist = Math.hypot(p.x - f.x, p.y - f.y);
                   if (dist < 200) { // Fear radius
                       fleeing = true;
                       f.state = 'FLEEING';
                       // Run away!
                       const angle = Math.atan2(p.y - f.y, p.x - f.x);
                       ax -= Math.cos(angle) * 0.4; // Flee fast
                       ay -= Math.sin(angle) * 0.4;
                   }
               }
            });
        }


        // A. Wall Avoidance
        const wallPad = 50;
        if (f.x < wallPad) ax += 0.05;
        if (f.x > width - wallPad) ax -= 0.05;
        if (f.y < wallPad) ay += 0.05;
        if (f.y > height - wallPad) ay -= 0.05;

        // B. Food Seeking (Only if not hunting prey)
        let nearestFood: EntityFood | null = null;
        let minDist = Infinity;

        if (!hunting && f.hunger < 80) {
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
            const foodIdx = foodRef.current.indexOf(nearestFood);
            if (foodIdx > -1) {
              foodRef.current.splice(foodIdx, 1);
              f.hunger = Math.min(100, f.hunger + nearestFood.value);
              // Eating causes poop/ammonia
              waterParamsRef.current.ammonia += 0.1;

              spawnCoin(f.x, f.y, species.baseValue);
              spawnParticle(f.x, f.y, 'BUBBLE');
              incrementStat('fishFedCount');
            }
          }
        } else {
          f.state = 'IDLE';
          ax += (Math.random() - 0.5) * 0.1;
          ay += (Math.random() - 0.5) * 0.1;
          ay += (height / 2 - f.y) * 0.0001;
        }

        // Apply Acceleration
        f.vx += ax;
        f.vy += ay;

        // Limit Speed
        const speed = Math.hypot(f.vx, f.vy);
        const maxSpeed = ((f.state === 'SEEKING_FOOD' || f.state === 'FLEEING') ? species.speed * 2 : species.speed);
        if (speed > maxSpeed) {
          f.vx = (f.vx / speed) * maxSpeed;
          f.vy = (f.vy / speed) * maxSpeed;
        }

        // Apply Velocity
        f.x += f.vx;
        f.y += f.vy;

        // Draw Fish
        drawFish(ctx, f, species, timestamp);
      });

      // Remove dead fish (health <= 0)
      const deadFish = fishRef.current.filter(f => f.health <= 0);
      if (deadFish.length > 0) {
        deadFish.forEach(f => removeFish(f.id)); // Dead fish give no money
      }

      // 6. Update & Draw Coins
      coinsRef.current = coinsRef.current.filter(c => !c.collected && c.y < height + 50);
      coinsRef.current.forEach(c => {
        if (magnetLvl > 0) {
          c.vy -= (magnetLvl * 0.05);
        } else {
          c.vy += GAME_CONFIG.GRAVITY * 0.5;
        }

        c.vy *= GAME_CONFIG.WATER_DRAG;
        c.x += c.vx;
        c.y += c.vy;

        if (c.y > height - 20) {
          c.y = height - 20;
          c.vy *= -0.5;
        }

        if (c.y < 0 && magnetLvl > 0) {
          c.collected = true;
          addMoney(c.value);
          spawnParticle(c.x, c.y, 'SPARKLE');
        }

        ctx.font = "24px serif";
        ctx.fillText('🪙', c.x, c.y);
      });

      // Sell Mode Overlay (Cursor)
      if (isSellModeRef.current) {
        // Maybe draw a target reticle at mouse pos? 
        // Hard to track mouse pos without state, but we can just rely on the cursor change in CSS or UIOverlay
      }

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
  }, [addMoney, incrementStat, sellFish, removeFish, updateWaterParams]); // Removed unstable dependencies

  return (
    <canvas
      ref={canvasRef}
      className={`absolute top-0 left-0 w-full h-full touch-none ${isSellMode ? 'cursor-crosshair' : 'cursor-default'}`}
      onMouseDown={handleCanvasClick}
      onTouchStart={handleCanvasClick}
    />
  );
};

export default GameCanvas;