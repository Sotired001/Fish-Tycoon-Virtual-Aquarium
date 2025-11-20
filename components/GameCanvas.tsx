import React, { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../services/store';
import { EntityFish, EntityFood, EntityCoin, EntityParticle, FishSpecies, EntityDecoration, SkillId, FishDiet, FishPersonality } from '../types';
import { FISH_SPECIES, GAME_CONFIG, UPGRADES, DECORATIONS, BIOMES, SKILLS } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { soundManager } from '../services/SoundManager';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const autoFeederTimerRef = useRef<number>(0);
  const waterUpdateTimerRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const isRainingRef = useRef<boolean>(false);
  const rainTimerRef = useRef<number>(0);

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
    updateWaterParams,
    timeOfDay,
    setTimeOfDay
  } = useGameStore();

  // Use refs for high-frequency game entities to avoid React re-renders
  const fishRef = useRef<EntityFish[]>([]);
  const decorationsRef = useRef<EntityDecoration[]>([]);
  const foodRef = useRef<EntityFood[]>([]);
  const coinsRef = useRef<EntityCoin[]>([]);
  const particlesRef = useRef<EntityParticle[]>([]);
  const waterParamsRef = useRef({ ...waterParams }); // Local ref for simulation
  const timeOfDayRef = useRef(timeOfDay);

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
    timeOfDayRef.current = timeOfDay;
  }, [upgrades, skills, currentBiomeId, isSellMode, timeOfDay]);

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

  const spawnParticle = (x: number, y: number, type: 'BUBBLE' | 'SPARKLE' | 'LEAF' | 'BONE' | 'RAIN' | 'GLOW') => {
    particlesRef.current.push({
      id: uuidv4(),
      x, y,
      vx: (Math.random() - 0.5) * 1,
      vy: type === 'BUBBLE' ? -2 : type === 'LEAF' || type === 'BONE' ? 0.5 : -1,
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

  const handleMouseMove = (e: MouseEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0 to 1
      const y = (e.clientY - rect.top) / rect.height;
      mousePosRef.current = { x: (x - 0.5) * 2, y: (y - 0.5) * 2 }; // -1 to 1
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    soundManager.init(); // Ensure audio context is ready
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
        soundManager.playSFX('SELL');
        spawnParticle(clickedFish.x, clickedFish.y, 'SPARKLE');
      }
      return;
    }

    // Scrub Algae?
    if (waterParamsRef.current.algae > 0) {
      // Reduce algae
      waterParamsRef.current.algae = Math.max(0, waterParamsRef.current.algae - 5);
      updateWaterParams(waterParamsRef.current);
      soundManager.playSFX('BUBBLE');
      spawnParticle(x, y, 'BUBBLE');
      return;
    }

    // Normal Mode: Feed
    dropFood(x, y);
    soundManager.playSFX('BUBBLE');
    spawnParticle(x, y, 'BUBBLE');
  };

  const drawFish = (ctx: CanvasRenderingContext2D, f: EntityFish, species: FishSpecies, time: number) => {
    // Rare Fish Glow
    if (species.rarity !== 'COMMON') {
         ctx.save();
         ctx.translate(f.x, f.y);
         const glowSize = 40 * f.scale;
         const glowColor = species.rarity === 'LEGENDARY' ? 'rgba(255, 215, 0, 0.3)' :
                           species.rarity === 'EPIC' ? 'rgba(148, 0, 211, 0.3)' :
                           'rgba(0, 191, 255, 0.2)'; // Rare

         const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, glowSize);
         grad.addColorStop(0, glowColor);
         grad.addColorStop(1, 'rgba(0,0,0,0)');
         ctx.fillStyle = grad;
         ctx.beginPath();
         ctx.arc(0, 0, glowSize, 0, Math.PI*2);
         ctx.fill();
         ctx.restore();
    }

    ctx.save();
    ctx.translate(f.x, f.y);

    // Fish Aging: Grow slightly with age
    const ageFactor = Math.min(1.2, 1.0 + ((f.age || 0) / 100000)); // Grow up to 20% larger
    const scale = f.scale * (species.baseGenes?.scale || 1) * ageFactor;

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

    // Hunting/Fleeing Indicator
    if (f.currentAction === 'HUNTING') {
      ctx.fillStyle = 'red';
      ctx.font = '16px Arial';
      ctx.fillText('⚔️', -8, -30);
    } else if (f.currentAction === 'FLEEING') {
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText('💨', -8, -30);
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

      // 1. Clear & Draw Background (Biome) with Parallax
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

      // Draw Parallax Layers (Seabed/Rocks)
      const mx = mousePosRef.current.x * 20; // Max 20px shift
      const my = mousePosRef.current.y * 10;

      // Far Layer
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height - 100 + my * 0.5);
      for (let i = 0; i <= width; i += 50) {
         ctx.lineTo(i, height - 100 + Math.sin(i * 0.01) * 20 + my * 0.5 + (mx * 0.5));
      }
      ctx.lineTo(width, height);
      ctx.fill();

      // Mid Layer
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height - 60 + my * 0.8);
      for (let i = 0; i <= width; i += 60) {
         ctx.lineTo(i, height - 60 + Math.sin(i * 0.02 + 2) * 30 + my * 0.8 + (mx * 0.8));
      }
      ctx.lineTo(width, height);
      ctx.fill();

      // Near Layer
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height - 30 + my);
      for (let i = 0; i <= width; i += 80) {
         ctx.lineTo(i, height - 30 + Math.sin(i * 0.03 + 4) * 40 + my + mx);
      }
      ctx.lineTo(width, height);
      ctx.fill();


      // 1.1 Draw Biome Water Overlay
      ctx.fillStyle = currentBiome.waterColor;
      ctx.fillRect(0, 0, width, height);

      // 1.15 Draw Algae Overlay
      if (waterParamsRef.current.algae > 0) {
         ctx.fillStyle = `rgba(34, 139, 34, ${waterParamsRef.current.algae / 200})`; // Max 0.5 alpha
         ctx.fillRect(0, 0, width, height);
      }

      // 1.2 Draw Day/Night Cycle & Dynamic Lighting
      const time = timeOfDayRef.current;
      let darkness = 0.0;
      let sunColor = 'transparent';

      // Night is 20:00 to 06:00
      // Twilight 06:00-08:00 and 18:00-20:00
      if (time >= 6 && time < 8) {
         // Dawn
         darkness = 0.5 - ((time - 6) / 2) * 0.5;
         sunColor = 'rgba(255, 200, 100, 0.1)';
      } else if (time >= 8 && time < 18) {
         // Day
         darkness = 0;
         sunColor = 'rgba(255, 255, 200, 0.05)'; // Light shafts
      } else if (time >= 18 && time < 20) {
         // Dusk
         darkness = (time - 18) / 2 * 0.5;
         sunColor = 'rgba(255, 100, 100, 0.1)';
      } else {
         // Night
         darkness = 0.6; // Darker night
      }

      // Draw Sun Shafts
      if (time >= 6 && time <= 20) {
        ctx.save();
        ctx.translate(width / 2, -100);
        ctx.rotate(Math.sin(timestamp * 0.0005) * 0.1); // Slowly sway
        const sunGrad = ctx.createLinearGradient(-200, 0, 200, height);
        sunGrad.addColorStop(0, sunColor);
        sunGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.moveTo(-200, 0);
        ctx.lineTo(200, 0);
        ctx.lineTo(400, height * 1.5);
        ctx.lineTo(-400, height * 1.5);
        ctx.fill();
        ctx.restore();
      }

      // Darkness Overlay
      if (darkness > 0) {
         ctx.fillStyle = `rgba(0, 0, 20, ${darkness})`;
         ctx.fillRect(0, 0, width, height);

         // Spotlight Effect (Mouse) at night
         if (darkness > 0.3) {
             ctx.globalCompositeOperation = 'destination-out';
             const grad = ctx.createRadialGradient(
                 width / 2 + (mousePosRef.current.x * width / 2),
                 height / 2 + (mousePosRef.current.y * height / 2),
                 50,
                 width / 2 + (mousePosRef.current.x * width / 2),
                 height / 2 + (mousePosRef.current.y * height / 2),
                 300
             );
             grad.addColorStop(0, 'rgba(0,0,0,1)');
             grad.addColorStop(1, 'rgba(0,0,0,0)');
             ctx.fillStyle = grad;
             ctx.beginPath();
             ctx.arc(width / 2 + (mousePosRef.current.x * width / 2), height / 2 + (mousePosRef.current.y * height / 2), 300, 0, Math.PI*2);
             ctx.fill();
             ctx.globalCompositeOperation = 'source-over';
         }
      }

      // 1.5 Draw Decorations (Background)
      decorationsRef.current.forEach(dec => {
        const item = DECORATIONS.find(d => d.id === dec.itemId);
        if (item) {
          // Plant Growth Logic
          if (item.type === 'PLANT' && dec.growth !== undefined && dec.growth < 1.0) {
             // Grow only during day (08:00 - 18:00)
             const t = timeOfDayRef.current;
             if (t >= 8 && t <= 18) {
                // Apply Light Upgrade
                const lightLvl = upgradesRef.current['lights'] || 0;
                const growthMult = UPGRADES['lights'].effect(lightLvl);
                dec.growth += 0.0001 * growthMult; // Accelerated growth
             }
          }

          const growthScale = dec.growth !== undefined ? 0.5 + (dec.growth * 0.5) : 1;
          const size = 40 * dec.scale * growthScale;

          ctx.font = `${size}px serif`;
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

      // 3. Update Water Params & Time
      waterUpdateTimerRef.current += deltaTime;
      if (waterUpdateTimerRef.current > 1000) { // Every second
        waterUpdateTimerRef.current = 0;

        // Update Time (1 hour per 5 seconds -> 24 hours in 2 minutes)
        // So 1 hour is 0.2 hours per second.
        timeOfDayRef.current = (timeOfDayRef.current + 0.2) % 24;
        setTimeOfDay(timeOfDayRef.current);

        // --- Temperature Fluctuation ---
        // Night (20-06): Drops to 20
        // Day (06-20): Rises to 25
        let targetTemp = 25;
        if (timeOfDayRef.current >= 20 || timeOfDayRef.current < 6) {
          targetTemp = 20;
        }

        // Apply Heater Logic
        const heaterLvl = upgradesRef.current['heater'] || 0;
        const heaterEffect = UPGRADES['heater'].effect(heaterLvl); // 0 to 1.0 resistance

        // If it's getting cold, heater resists the drop
        let tempChangeSpeed = 0.01;
        if (targetTemp < waterParamsRef.current.temperature) {
           tempChangeSpeed *= (1 - heaterEffect); // Reduce drop speed
        }

        // Move towards target
        if (waterParamsRef.current.temperature < targetTemp) {
          waterParamsRef.current.temperature += tempChangeSpeed;
        } else if (waterParamsRef.current.temperature > targetTemp) {
           waterParamsRef.current.temperature -= tempChangeSpeed;
        }

        // --- Water Chemistry ---

        // Ammonia increases by fish count
        const pollution = fishRef.current.length * 0.005;

        // Ammonia reduction from decorations
        let reduction = decorationsRef.current.reduce((acc, dec) => {
          const item = DECORATIONS.find(d => d.id === dec.itemId);
          let val = (item?.effect?.type === 'AMMONIA_REDUCTION' ? (item.effect.value || 0) : 0);

          // Scale effect by growth for plants
          if (item?.type === 'PLANT' && dec.growth !== undefined) {
             val *= dec.growth;
          }
          return acc + val;
        }, 0);

        // Apply Filter Upgrade
        const filterLvl = upgradesRef.current['filter'] || 0;
        const filterReduction = UPGRADES['filter'].effect(filterLvl);
        reduction += filterReduction;

        waterParamsRef.current.ammonia = Math.min(10, Math.max(0, waterParamsRef.current.ammonia + pollution - reduction));

        // Algae Growth
        // Grows if ammonia > 1 and day time (8-18)
        const time = timeOfDayRef.current;
        if (waterParamsRef.current.ammonia > 1 && time >= 8 && time <= 18) {
           waterParamsRef.current.algae = Math.min(100, waterParamsRef.current.algae + 0.1);
        }

        // Sync back to store (debounced)
        updateWaterParams(waterParamsRef.current);
      }

      // 3a. Weather Logic (Rain)
      rainTimerRef.current += deltaTime;
      if (rainTimerRef.current > 10000) { // Check every 10s
        rainTimerRef.current = 0;
        if (Math.random() < 0.1) { // 10% chance to toggle rain
             isRainingRef.current = !isRainingRef.current;
        }
      }

      if (isRainingRef.current) {
          // Spawn rain particles
          for(let i=0; i<2; i++) {
              particlesRef.current.push({
                  id: uuidv4(),
                  x: Math.random() * width,
                  y: -10,
                  vx: (Math.random() - 0.5) * 1,
                  vy: 10 + Math.random() * 5,
                  life: 1,
                  size: 2 + Math.random() * 15, // Length of drop
                  type: 'RAIN'
              });
          }

          // Draw Rain Overlay (Darken sky)
          ctx.fillStyle = 'rgba(0, 0, 20, 0.1)';
          ctx.fillRect(0,0,width,height);
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
        } else if (p.type === 'LEAF') {
          ctx.fillStyle = '#4ade80';
          ctx.font = `${p.size * 2}px serif`;
          ctx.fillText('🍂', p.x, p.y);
        } else if (p.type === 'RAIN') {
          ctx.strokeStyle = 'rgba(200, 200, 255, 0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx, p.y + p.size);
          ctx.stroke();
        } else if (p.type === 'GLOW') {
             const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
             grad.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
             grad.addColorStop(1, 'rgba(255, 255, 200, 0)');
             ctx.fillStyle = grad;
             ctx.beginPath();
             ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
             ctx.fill();
        } else if (p.type === 'BONE') {
          ctx.fillStyle = '#e5e7eb'; // Gray-200
          ctx.font = `${p.size * 2}px serif`;
          ctx.fillText('🦴', p.x, p.y);
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
            f.currentAction = 'HUNTING';
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
              f.currentAction = 'NONE';
              soundManager.playSFX('EAT');
              spawnParticle(f.x, f.y, 'BONE');
              spawnParticle(f.x, f.y, 'BUBBLE');
              incrementStat('fishFedCount'); // Counts as feeding? Sure.
            }
          }
        }

        // --- Phase 2: Fleeing Logic (Prey Avoidance) ---
        let fleeing = false;
        if (!hunting) {
            f.currentAction = 'NONE'; // Reset if not hunting
            // Look for predators nearby
            fishRef.current.forEach(p => {
               const predatorSpecies = FISH_SPECIES.find(s => s.id === p.speciesId);
               if (predatorSpecies?.diet === FishDiet.CARNIVORE && predatorSpecies.preySpecies?.includes(f.speciesId)) {
                   const dist = Math.hypot(p.x - f.x, p.y - f.y);
                   if (dist < 200) { // Fear radius
                       fleeing = true;
                       f.state = 'FLEEING';
                       f.currentAction = 'FLEEING';
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

              soundManager.playSFX('EAT');
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

        // --- Personality Traits Influence ---
        if (f.personality === FishPersonality.HYPER) {
           ax *= 1.5;
           ay *= 1.5;
           if (Math.random() < 0.05) { // Erratic movements
             ax += (Math.random() - 0.5) * 0.5;
             ay += (Math.random() - 0.5) * 0.5;
           }
        } else if (f.personality === FishPersonality.RELAXED) {
           ax *= 0.7;
           ay *= 0.7;
        } else if (f.personality === FishPersonality.SHY) {
           // Avoid center
           const centerX = width / 2;
           const centerY = height / 2;
           const distToCenter = Math.hypot(f.x - centerX, f.y - centerY);
           if (distToCenter < 200) {
              ax += (f.x - centerX) * 0.0005; // Push away from center
              ay += (f.y - centerY) * 0.0005;
           }
        }

        // Apply Acceleration
        f.vx += ax;
        f.vy += ay;

        // Limit Speed
        const speed = Math.hypot(f.vx, f.vy);
        let maxSpeed = ((f.state === 'SEEKING_FOOD' || f.state === 'FLEEING') ? species.speed * 2 : species.speed);

        if (f.personality === FishPersonality.HYPER) maxSpeed *= 1.3;
        if (f.personality === FishPersonality.RELAXED) maxSpeed *= 0.8;

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
          soundManager.playSFX('COIN');
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
  }, [addMoney, incrementStat, sellFish, removeFish, updateWaterParams, setTimeOfDay]); // Removed unstable dependencies

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`absolute top-0 left-0 w-full h-full touch-none ${isSellMode ? 'cursor-crosshair' : 'cursor-default'}`}
        onMouseDown={handleCanvasClick}
        onTouchStart={handleCanvasClick}
      />
      <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none select-none text-white/80 text-2xl font-bold drop-shadow-lg z-0">
        ⏰ {Math.floor(timeOfDayRef.current || 12)}:00
      </div>
    </>
  );
};

export default GameCanvas;